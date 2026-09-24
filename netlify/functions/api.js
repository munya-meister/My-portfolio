import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import Busboy from "busboy";

/* -------------------------------------------------------------------------- */
/* ENVIRONMENT                                                                */
/* -------------------------------------------------------------------------- */

const supabaseUrl = process.env.SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

const TOKEN_EXPIRY_SECONDS = 60 * 60 * 12;

/* -------------------------------------------------------------------------- */
/* CORS                                                                       */
/* -------------------------------------------------------------------------- */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Methods":
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

/* -------------------------------------------------------------------------- */
/* RESPONSE HELPERS                                                           */
/* -------------------------------------------------------------------------- */

function jsonResponse(
  status,
  data,
  extraHeaders = {}
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        ...extraHeaders,
      },
    }
  );
}

/* -------------------------------------------------------------------------- */
/* REQUEST HELPERS                                                            */
/* -------------------------------------------------------------------------- */

function getPath(request) {
  const url = new URL(request.url);

  let path = url.pathname;

  console.log("DEBUG request URL:", request.url);
  console.log(
    "DEBUG request pathname:",
    path
  );

  path = path.replace(
    /^\/\.netlify\/functions\/api/,
    ""
  );

  path = path.replace(/^\/api/, "");

  if (!path) {
    path = "/";
  }

  console.log(
    "DEBUG final API path:",
    path
  );

  return path;
}

function getMethod(request) {
  return request.method.toUpperCase();
}

function getAuthorizationToken(request) {
  const authorization =
    request.headers.get("authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization
    .slice(7)
    .trim();
}

/*
 * Parse JSON request bodies using the native Web Request API.
 */
async function getJsonBody(request) {
  try {
    return await request.json();
  } catch (error) {
    console.error("JSON body parsing error:", error);
    return {};
  }
}

/* -------------------------------------------------------------------------- */
/* ADMIN AUTH                                                                 */
/* -------------------------------------------------------------------------- */

function createAdminToken() {
  const password =
    process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD is not configured."
    );
  }

  const expiresAt =
    Math.floor(Date.now() / 1000) +
    TOKEN_EXPIRY_SECONDS;

  const payload =
    `admin:${expiresAt}`;

  const signature =
    crypto
      .createHmac(
        "sha256",
        password
      )
      .update(payload)
      .digest("hex");

  return `${payload}:${signature}`;
}

function verifyAdminToken(token) {
  const password =
    process.env.ADMIN_PASSWORD;

  if (!password || !token) {
    return false;
  }

  const parts = token.split(":");

  if (parts.length !== 3) {
    return false;
  }

  const [
    role,
    expiresAtString,
    signature,
  ] = parts;

  if (role !== "admin") {
    return false;
  }

  const expiresAt =
    Number(expiresAtString);

  if (!Number.isFinite(expiresAt)) {
    return false;
  }

  if (
    Math.floor(Date.now() / 1000) >=
    expiresAt
  ) {
    return false;
  }

  const payload =
    `${role}:${expiresAtString}`;

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        password
      )
      .update(payload)
      .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

function requireAdmin(request) {
  const token =
    getAuthorizationToken(request);

  if (!verifyAdminToken(token)) {
    return jsonResponse(401, {
      success: false,
      message: "Unauthorized",
    });
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* ARRAY HELPERS                                                              */
/* -------------------------------------------------------------------------- */

function parseArrayField(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed =
      JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Continue with comma-separated values.
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* MULTIPART FORM                                                             */
/* -------------------------------------------------------------------------- */

async function parseMultipart(request) {
  const contentType =
    request.headers.get("content-type") ||
    "";

  if (
    !contentType.includes(
      "multipart/form-data"
    )
  ) {
    throw new Error(
      "Request is not multipart/form-data."
    );
  }

  const body = Buffer.from(
    await request.arrayBuffer()
  );

  return new Promise(
    (resolve, reject) => {
      const busboy = Busboy({
        headers: {
          "content-type":
            contentType,
        },
      });

      const fields = {};
      const files = [];

      busboy.on(
        "field",
        (fieldname, value) => {
          fields[fieldname] = value;
        }
      );

      busboy.on(
        "file",
        (
          fieldname,
          file,
          info
        ) => {
          const {
            filename,
            mimeType,
          } = info;

          const chunks = [];

          file.on(
            "data",
            (chunk) => {
              chunks.push(chunk);
            }
          );

          file.on(
            "end",
            () => {
              files.push({
                fieldname,
                filename,
                mimeType,
                buffer:
                  Buffer.concat(
                    chunks
                  ),
              });
            }
          );
        }
      );

      busboy.on(
        "error",
        reject
      );

      busboy.on(
        "finish",
        () => {
          resolve({
            fields,
            files,
          });
        }
      );

      busboy.end(body);
    }
  );
}

/* -------------------------------------------------------------------------- */
/* STORAGE                                                                    */
/* -------------------------------------------------------------------------- */

function sanitizeFilename(
  filename
) {
  return filename
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );
}

async function uploadFile(
  file,
  bucket
) {
  if (
    !file ||
    !file.buffer ||
    !file.buffer.length
  ) {
    return null;
  }

  const safeFilename =
    sanitizeFilename(
      file.filename
    );

  const filePath =
    `${Date.now()}-${crypto
      .randomBytes(8)
      .toString("hex")}-${safeFilename}`;

  const { error } =
    await supabase.storage
      .from(bucket)
      .upload(
        filePath,
        file.buffer,
        {
          contentType:
            file.mimeType ||
            "application/octet-stream",
          upsert: true,
        }
      );

  if (error) {
    console.error(
      `Upload error (${bucket}):`,
      error
    );

    throw new Error(
      `Failed to upload file: ${error.message}`
    );
  }

  const { data } =
    supabase.storage
      .from(bucket)
      .getPublicUrl(
        filePath
      );

  return data.publicUrl;
}

async function deleteStorageFile(
  bucket,
  publicUrl
) {
  if (!publicUrl) {
    return;
  }

  try {
    const marker =
      `/storage/v1/object/public/${bucket}/`;

    const index =
      publicUrl.indexOf(
        marker
      );

    if (index === -1) {
      return;
    }

    const filePath =
      decodeURIComponent(
        publicUrl.substring(
          index +
            marker.length
        )
      );

    if (!filePath) {
      return;
    }

    const { error } =
      await supabase.storage
        .from(bucket)
        .remove([filePath]);

    if (error) {
      console.error(
        "Storage deletion error:",
        error
      );
    }
  } catch (error) {
    console.error(
      "Storage deletion error:",
      error
    );
  }
}

/* -------------------------------------------------------------------------- */
/* MAIN FUNCTION                                                              */
/* -------------------------------------------------------------------------- */

export default async function handler(
  request
) {
  try {
    const method =
      getMethod(request);

    const path =
      getPath(request);

    console.log(
      `${method} ${path}`
    );

    /* ---------------------------------------------------------------------- */
    /* CORS                                                                    */
    /* ---------------------------------------------------------------------- */

    if (method === "OPTIONS") {
      return new Response(
        null,
        {
          status: 204,
          headers:
            corsHeaders,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* HEALTH                                                                  */
    /* ---------------------------------------------------------------------- */

    if (
      method === "GET" &&
      path === "/health"
    ) {
      return jsonResponse(
        200,
        {
          success: true,
          message:
            "API is running",
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ADMIN LOGIN                                                             */
    /* ---------------------------------------------------------------------- */

    if (
      method === "POST" &&
      path === "/admin/login"
    ) {
      console.log("LOGIN DEBUG:", {
        contentType: request.headers.get("content-type"),
        bodyUsed: request.bodyUsed,
      });

      const body =
        await getJsonBody(
          request
        );

      console.log(
        "Admin login body received:",
        {
          hasPassword:
            Boolean(
              body.password
            ),
          bodyKeys: Object.keys(body),
        }
      );

      const password =
        body.password;

      if (!password) {
        return jsonResponse(
          400,
          {
            success: false,
            message:
              "Password is required.",
          }
        );
      }

      const adminPassword =
        process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Admin authentication is not configured.",
          }
        );
      }

      if (
        password !==
        adminPassword
      ) {
        return jsonResponse(
          401,
          {
            success: false,
            message:
              "Invalid password.",
          }
        );
      }

      const token =
        createAdminToken();

      return jsonResponse(
        200,
        {
          success: true,
          token,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ABOUT - GET                                                             */
    /* ---------------------------------------------------------------------- */

    if (
      method === "GET" &&
      path === "/about"
    ) {
      const { data, error } =
        await supabase
          .from("about")
          .select("*")
          .order(
            "created_at",
            {
              ascending: true,
            }
          )
          .limit(1)
          .maybeSingle();

      if (error) {
        console.error(
          "About fetch error:",
          error
        );

        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to fetch about information.",
            error:
              error.message,
          }
        );
      }

      return jsonResponse(
        200,
        data || null
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ABOUT - UPDATE                                                          */
    /* ---------------------------------------------------------------------- */

    if (
      method === "PUT" &&
      path === "/about"
    ) {
      const unauthorized =
        requireAdmin(
          request
        );

      if (unauthorized) {
        return unauthorized;
      }

      let fields = {};
      let files = [];

      const contentType =
        request.headers.get(
          "content-type"
        ) || "";

      if (
        contentType.includes(
          "multipart/form-data"
        )
      ) {
        const parsed =
          await parseMultipart(
            request
          );

        fields =
          parsed.fields;

        files =
          parsed.files;
      } else {
        fields =
          await getJsonBody(
            request
          );
      }

      const { data: existing } =
        await supabase
          .from("about")
          .select("*")
          .order(
            "created_at",
            {
              ascending: true,
            }
          )
          .limit(1)
          .maybeSingle();

      let profilePic =
        existing?.profile_pic ||
        null;

      const profileFile =
        files.find(
          (file) =>
            file.fieldname ===
              "profile" ||
            file.fieldname ===
              "profile_pic" ||
            file.fieldname ===
              "profilePic"
        );

      if (profileFile) {
        profilePic =
          await uploadFile(
            profileFile,
            "profile"
          );

        if (
          existing?.profile_pic
        ) {
          await deleteStorageFile(
            "profile",
            existing.profile_pic
          );
        }
      }

      let socials =
        existing?.socials ||
        {};

      if (
        fields.socials !==
        undefined
      ) {
        try {
          socials =
            typeof fields.socials ===
            "string"
              ? JSON.parse(
                  fields.socials
                )
              : fields.socials;
        } catch {
          socials = {};
        }
      }

      const aboutData = {
        profile_pic:
          profilePic ||
          fields.profile_pic ||
          fields.profilePic ||
          null,

        heading:
          fields.heading !==
          undefined
            ? fields.heading
            : existing?.heading ||
              "",

        bio1:
          fields.bio1 !==
          undefined
            ? fields.bio1
            : existing?.bio1 ||
              "",

        bio2:
          fields.bio2 !==
          undefined
            ? fields.bio2
            : existing?.bio2 ||
              null,

        cv_url:
          fields.cv_url !==
          undefined
            ? fields.cv_url
            : existing?.cv_url ||
              null,

        socials,
      };

      let result;

      if (existing?.id) {
        result =
          await supabase
            .from("about")
            .update(
              aboutData
            )
            .eq(
              "id",
              existing.id
            )
            .select()
            .single();
      } else {
        result =
          await supabase
            .from("about")
            .insert(
              aboutData
            )
            .select()
            .single();
      }

      if (result.error) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to update about information.",
            error:
              result.error.message,
          }
        );
      }

      return jsonResponse(
        200,
        {
          success: true,
          data: result.data,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* PROJECTS - GET                                                          */
    /* ---------------------------------------------------------------------- */

    if (
      method === "GET" &&
      path === "/projects"
    ) {
      const { data, error } =
        await supabase
          .from("projects")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (error) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to fetch projects.",
            error:
              error.message,
          }
        );
      }

      return jsonResponse(
        200,
        data || []
      );
    }

    /* ---------------------------------------------------------------------- */
    /* PROJECTS - CREATE                                                       */
    /* ---------------------------------------------------------------------- */

    if (
      method === "POST" &&
      path === "/projects"
    ) {
      const unauthorized =
        requireAdmin(
          request
        );

      if (unauthorized) {
        return unauthorized;
      }

      let fields = {};
      let files = [];

      const contentType =
        request.headers.get(
          "content-type"
        ) || "";

      if (
        contentType.includes(
          "multipart/form-data"
        )
      ) {
        const parsed =
          await parseMultipart(
            request
          );

        fields =
          parsed.fields;

        files =
          parsed.files;
      } else {
        fields =
          await getJsonBody(
            request
          );
      }

      let imageUrl =
        fields.image_url ||
        null;

      let fileUrl =
        fields.file_url ||
        null;

      const imageFile =
        files.find(
          (file) =>
            file.fieldname ===
              "image" ||
            file.fieldname ===
              "project_image"
        );

      const documentFile =
        files.find(
          (file) =>
            file.fieldname ===
              "file" ||
            file.fieldname ===
              "document" ||
            file.fieldname ===
              "project_file"
        );

      if (imageFile) {
        imageUrl =
          await uploadFile(
            imageFile,
            "projects"
          );
      }

      if (documentFile) {
        fileUrl =
          await uploadFile(
            documentFile,
            "documents"
          );
      }

      const projectData = {
        title:
          fields.title || "",

        description:
          fields.description ||
          null,

        category:
          fields.category ||
          "Web Development",

        technologies:
          parseArrayField(
            fields.technologies
          ),

        demo:
          fields.demo || null,

        github:
          fields.github || null,

        image_url:
          imageUrl,

        file_url:
          fileUrl,
      };

      const { data, error } =
        await supabase
          .from("projects")
          .insert(
            projectData
          )
          .select()
          .single();

      if (error) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to create project.",
            error:
              error.message,
          }
        );
      }

      return jsonResponse(
        201,
        {
          success: true,
          data,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* PROJECTS - UPDATE                                                       */
    /* ---------------------------------------------------------------------- */

    if (
      (method === "PUT" ||
        method === "PATCH") &&
      path.startsWith(
        "/projects/"
      )
    ) {
      const unauthorized =
        requireAdmin(
          request
        );

      if (unauthorized) {
        return unauthorized;
      }

      const id =
        path.split("/").pop();

      const {
        data: existing,
        error:
          existingError,
      } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (existingError) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to fetch project.",
            error:
              existingError.message,
          }
        );
      }

      if (!existing) {
        return jsonResponse(
          404,
          {
            success: false,
            message:
              "Project not found.",
          }
        );
      }

      let fields = {};
      let files = [];

      const contentType =
        request.headers.get(
          "content-type"
        ) || "";

      if (
        contentType.includes(
          "multipart/form-data"
        )
      ) {
        const parsed =
          await parseMultipart(
            request
          );

        fields =
          parsed.fields;

        files =
          parsed.files;
      } else {
        fields =
          await getJsonBody(
            request
          );
      }

      let imageUrl =
        fields.image_url !==
        undefined
          ? fields.image_url
          : existing.image_url;

      let fileUrl =
        fields.file_url !==
        undefined
          ? fields.file_url
          : existing.file_url;

      const imageFile =
        files.find(
          (file) =>
            file.fieldname ===
              "image" ||
            file.fieldname ===
              "project_image"
        );

      const documentFile =
        files.find(
          (file) =>
            file.fieldname ===
              "file" ||
            file.fieldname ===
              "document" ||
            file.fieldname ===
              "project_file"
        );

      if (imageFile) {
        imageUrl =
          await uploadFile(
            imageFile,
            "projects"
          );

        if (
          existing.image_url
        ) {
          await deleteStorageFile(
            "projects",
            existing.image_url
          );
        }
      }

      if (documentFile) {
        fileUrl =
          await uploadFile(
            documentFile,
            "documents"
          );

        if (
          existing.file_url
        ) {
          await deleteStorageFile(
            "documents",
            existing.file_url
          );
        }
      }

      const updateData = {};

      if (
        fields.title !==
        undefined
      ) {
        updateData.title =
          fields.title;
      }

      if (
        fields.description !==
        undefined
      ) {
        updateData.description =
          fields.description;
      }

      if (
        fields.category !==
        undefined
      ) {
        updateData.category =
          fields.category;
      }

      if (
        fields.technologies !==
        undefined
      ) {
        updateData.technologies =
          parseArrayField(
            fields.technologies
          );
      }

      if (
        fields.demo !==
        undefined
      ) {
        updateData.demo =
          fields.demo;
      }

      if (
        fields.github !==
        undefined
      ) {
        updateData.github =
          fields.github;
      }

      updateData.image_url =
        imageUrl;

      updateData.file_url =
        fileUrl;

      const { data, error } =
        await supabase
          .from("projects")
          .update(
            updateData
          )
          .eq("id", id)
          .select()
          .single();

      if (error) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to update project.",
            error:
              error.message,
          }
        );
      }

      return jsonResponse(
        200,
        {
          success: true,
          data,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* PROJECTS - DELETE                                                       */
    /* ---------------------------------------------------------------------- */

    if (
      method === "DELETE" &&
      path.startsWith(
        "/projects/"
      )
    ) {
      const unauthorized =
        requireAdmin(
          request
        );

      if (unauthorized) {
        return unauthorized;
      }

      const id =
        path.split("/").pop();

      const {
        data: existing,
      } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!existing) {
        return jsonResponse(
          404,
          {
            success: false,
            message:
              "Project not found.",
          }
        );
      }

      if (existing.image_url) {
        await deleteStorageFile(
          "projects",
          existing.image_url
        );
      }

      if (existing.file_url) {
        await deleteStorageFile(
          "documents",
          existing.file_url
        );
      }

      const { error } =
        await supabase
          .from("projects")
          .delete()
          .eq("id", id);

      if (error) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to delete project.",
            error:
              error.message,
          }
        );
      }

      return jsonResponse(
        200,
        {
          success: true,
          message:
            "Project deleted successfully.",
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* CERTIFICATES - GET                                                      */
    /* ---------------------------------------------------------------------- */

    if (
      method === "GET" &&
      path === "/certificates"
    ) {
      const { data, error } =
        await supabase
          .from("certificates")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (error) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to fetch certificates.",
            error:
              error.message,
          }
        );
      }

      return jsonResponse(
        200,
        data || []
      );
    }

    /* ---------------------------------------------------------------------- */
    /* CERTIFICATES - CREATE                                                   */
    /* ---------------------------------------------------------------------- */

    if (
      method === "POST" &&
      path === "/certificates"
    ) {
      const unauthorized =
        requireAdmin(
          request
        );

      if (unauthorized) {
        return unauthorized;
      }

      let fields = {};
      let files = [];

      const contentType =
        request.headers.get(
          "content-type"
        ) || "";

      if (
        contentType.includes(
          "multipart/form-data"
        )
      ) {
        const parsed =
          await parseMultipart(
            request
          );

        fields =
          parsed.fields;

        files =
          parsed.files;
      } else {
        fields =
          await getJsonBody(
            request
          );
      }

      let imageUrl =
        fields.image_url ||
        null;

      let fileUrl =
        fields.file_url ||
        null;

      const imageFile =
        files.find(
          (file) =>
            file.fieldname ===
              "image" ||
            file.fieldname ===
              "certificate_image"
        );

      const documentFile =
        files.find(
          (file) =>
            file.fieldname ===
              "file" ||
            file.fieldname ===
              "certificate_file" ||
            file.fieldname ===
              "document"
        );

      if (imageFile) {
        imageUrl =
          await uploadFile(
            imageFile,
            "certificates"
          );
      }

      if (documentFile) {
        fileUrl =
          await uploadFile(
            documentFile,
            "documents"
          );
      }

      const certificateData = {
        title:
          fields.title || "",

        description:
          fields.description ||
          null,

        platform:
          fields.platform ||
          null,

        category:
          fields.category ||
          null,

        date:
          fields.date ||
          null,

        skills:
          parseArrayField(
            fields.skills
          ),

        technologies:
          parseArrayField(
            fields.technologies
          ),

        demo:
          fields.demo || null,

        github:
          fields.github || null,

        url:
          fields.url || null,

        verify_url:
          fields.verify_url ||
          null,

        image_url:
          imageUrl,

        file_url:
          fileUrl,
      };

      const { data, error } =
        await supabase
          .from("certificates")
          .insert(
            certificateData
          )
          .select()
          .single();

      if (error) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to create certificate.",
            error:
              error.message,
          }
        );
      }

      return jsonResponse(
        201,
        {
          success: true,
          data,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* CERTIFICATES - UPDATE                                                   */
    /* ---------------------------------------------------------------------- */

    if (
      (method === "PUT" ||
        method === "PATCH") &&
      path.startsWith(
        "/certificates/"
      )
    ) {
      const unauthorized =
        requireAdmin(
          request
        );

      if (unauthorized) {
        return unauthorized;
      }

      const id =
        path.split("/").pop();

      const {
        data: existing,
        error:
          existingError,
      } = await supabase
        .from("certificates")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (existingError) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to fetch certificate.",
            error:
              existingError.message,
          }
        );
      }

      if (!existing) {
        return jsonResponse(
          404,
          {
            success: false,
            message:
              "Certificate not found.",
          }
        );
      }

      let fields = {};
      let files = [];

      const contentType =
        request.headers.get(
          "content-type"
        ) || "";

      if (
        contentType.includes(
          "multipart/form-data"
        )
      ) {
        const parsed =
          await parseMultipart(
            request
          );

        fields =
          parsed.fields;

        files =
          parsed.files;
      } else {
        fields =
          await getJsonBody(
            request
          );
      }

      let imageUrl =
        fields.image_url !==
        undefined
          ? fields.image_url
          : existing.image_url;

      let fileUrl =
        fields.file_url !==
        undefined
          ? fields.file_url
          : existing.file_url;

      const imageFile =
        files.find(
          (file) =>
            file.fieldname ===
              "image" ||
            file.fieldname ===
              "certificate_image"
        );

      const documentFile =
        files.find(
          (file) =>
            file.fieldname ===
              "file" ||
            file.fieldname ===
              "certificate_file" ||
            file.fieldname ===
              "document"
        );

      if (imageFile) {
        imageUrl =
          await uploadFile(
            imageFile,
            "certificates"
          );

        if (
          existing.image_url
        ) {
          await deleteStorageFile(
            "certificates",
            existing.image_url
          );
        }
      }

      if (documentFile) {
        fileUrl =
          await uploadFile(
            documentFile,
            "documents"
          );

        if (
          existing.file_url
        ) {
          await deleteStorageFile(
            "documents",
            existing.file_url
          );
        }
      }

      const updateData = {};

      if (
        fields.title !==
        undefined
      ) {
        updateData.title =
          fields.title;
      }

      if (
        fields.description !==
        undefined
      ) {
        updateData.description =
          fields.description;
      }

      if (
        fields.platform !==
        undefined
      ) {
        updateData.platform =
          fields.platform;
      }

      if (
        fields.category !==
        undefined
      ) {
        updateData.category =
          fields.category;
      }

      if (
        fields.date !==
        undefined
      ) {
        updateData.date =
          fields.date;
      }

      if (
        fields.skills !==
        undefined
      ) {
        updateData.skills =
          parseArrayField(
            fields.skills
          );
      }

      if (
        fields.technologies !==
        undefined
      ) {
        updateData.technologies =
          parseArrayField(
            fields.technologies
          );
      }

      if (
        fields.demo !==
        undefined
      ) {
        updateData.demo =
          fields.demo;
      }

      if (
        fields.github !==
        undefined
      ) {
        updateData.github =
          fields.github;
      }

      if (
        fields.url !==
        undefined
      ) {
        updateData.url =
          fields.url;
      }

      if (
        fields.verify_url !==
        undefined
      ) {
        updateData.verify_url =
          fields.verify_url;
      }

      updateData.image_url =
        imageUrl;

      updateData.file_url =
        fileUrl;

      const { data, error } =
        await supabase
          .from("certificates")
          .update(
            updateData
          )
          .eq("id", id)
          .select()
          .single();

      if (error) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to update certificate.",
            error:
              error.message,
          }
        );
      }

      return jsonResponse(
        200,
        {
          success: true,
          data,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* CERTIFICATES - DELETE                                                   */
    /* ---------------------------------------------------------------------- */

    if (
      method === "DELETE" &&
      path.startsWith(
        "/certificates/"
      )
    ) {
      const unauthorized =
        requireAdmin(
          request
        );

      if (unauthorized) {
        return unauthorized;
      }

      const id =
        path.split("/").pop();

      const {
        data: existing,
      } = await supabase
        .from("certificates")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!existing) {
        return jsonResponse(
          404,
          {
            success: false,
            message:
              "Certificate not found.",
          }
        );
      }

      if (
        existing.image_url
      ) {
        await deleteStorageFile(
          "certificates",
          existing.image_url
        );
      }

      if (
        existing.file_url
      ) {
        await deleteStorageFile(
          "documents",
          existing.file_url
        );
      }

      const { error } =
        await supabase
          .from("certificates")
          .delete()
          .eq("id", id);

      if (error) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Failed to delete certificate.",
            error:
              error.message,
          }
        );
      }

      return jsonResponse(
        200,
        {
          success: true,
          message:
            "Certificate deleted successfully.",
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* CONTACT                                                                 */
    /* ---------------------------------------------------------------------- */

    if (
      method === "POST" &&
      path === "/contact"
    ) {
      const body =
        await getJsonBody(
          request
        );

      const name =
        String(
          body.name || ""
        ).trim();

      const email =
        String(
          body.email || ""
        ).trim();

      const subject =
        String(
          body.subject || ""
        ).trim();

      const message =
        String(
          body.message || ""
        ).trim();

      if (
        !name ||
        !email ||
        !subject ||
        !message
      ) {
        return jsonResponse(
          400,
          {
            success: false,
            message:
              "All contact fields are required.",
          }
        );
      }

      let emailStatus =
        "queued";

      let emailError =
        null;

      const resendApiKey =
        process.env.RESEND_API_KEY;

      const contactEmail =
        process.env.CONTACT_EMAIL;

      if (
        resendApiKey &&
        contactEmail
      ) {
        try {
          const resendResponse =
            await fetch(
              "https://api.resend.com/emails",
              {
                method: "POST",

                headers: {
                  Authorization:
                    `Bearer ${resendApiKey}`,

                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    from:
                      "Portfolio Contact <onboarding@resend.dev>",

                    to: [
                      contactEmail,
                    ],

                    reply_to:
                      email,

                    subject:
                      `Portfolio Contact: ${subject}`,

                    text: [
                      `Name: ${name}`,
                      `Email: ${email}`,
                      `Subject: ${subject}`,
                      "",
                      message,
                    ].join("\n"),
                  }),
              }
            );

          if (
            !resendResponse.ok
          ) {
            const errorText =
              await resendResponse.text();

            throw new Error(
              `Resend returned ${resendResponse.status}: ${errorText}`
            );
          }

          emailStatus =
            "sent";
        } catch (error) {
          console.error(
            "Resend error:",
            error
          );

          emailStatus =
            "failed";

          emailError =
            error.message;
        }
      }

      const { data, error } =
        await supabase
          .from(
            "contact_messages"
          )
          .insert({
            name,
            email,
            subject,
            message,
            status:
              emailStatus,
            source:
              "portfolio",
            error:
              emailError,
          })
          .select()
          .single();

      if (error) {
        return jsonResponse(
          500,
          {
            success: false,
            message:
              "Message could not be saved.",
            error:
              error.message,
          }
        );
      }

      return jsonResponse(
        200,
        {
          success: true,

          message:
            emailStatus ===
            "sent"
              ? "Message sent successfully."
              : "Message received successfully.",

          data,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* 404                                                                     */
    /* ---------------------------------------------------------------------- */

    return jsonResponse(
      404,
      {
        success: false,
        message:
          "API route not found.",
        path,
        method,
      }
    );
  } catch (error) {
    console.error(
      "Unhandled API error:",
      error
    );

    return jsonResponse(
      500,
      {
        success: false,
        message:
          "Internal server error.",
        error:
          error.message,
      }
    );
  }
}