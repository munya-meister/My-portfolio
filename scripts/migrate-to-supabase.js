import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

const dbPath = path.resolve(process.cwd(), "server/data/db.json");
const uploadsRoot = path.resolve(process.cwd(), "server/uploads");

const BUCKETS = {
  certificates: "certificates",
  projects: "projects",
  profile: "profile",
};

const failures = [];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  const types = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
  };

  return types[ext] || "application/octet-stream";
}

function getLocalFilename(value, folder) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/\\/g, "/");

  const marker = `/uploads/${folder}/`;
  const index = normalized.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(
    normalized.substring(index + marker.length)
  );
}

async function uploadFileToStorage(
  filePath,
  bucket,
  folder,
  originalName
) {
  const buffer = await fs.readFile(filePath);

  const safeName = path.basename(originalName || filePath);

  const storagePath = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  console.log(`   📤 Uploading: ${safeName}`);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: getMimeType(filePath),
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);

  console.log(`   ✅ Uploaded successfully`);

  return data.publicUrl;
}


/* =========================================================
   CERTIFICATES
========================================================= */

async function migrateCertificates(certificates = []) {
  console.log("\n📋 Migrating certificates...");

  const { data: existingRows, error } = await supabase
    .from("certificates")
    .select("id,file_url");

  if (error) {
    throw error;
  }

  const existingMap = new Map(
    (existingRows || []).map((row) => [String(row.id), row])
  );

  let migrated = 0;
  let updated = 0;
  let skipped = 0;

  for (const certificate of certificates) {
    try {
      const id = certificate.id;
      const existing = existingMap.get(String(id));

      let fileUrl =
        certificate.fileUrl ||
        certificate.file_url ||
        null;

      /*
       * Try to locate the original local certificate file.
       */
      const localFilename =
        getLocalFilename(certificate.fileUrl, "certificates") ||
        getLocalFilename(certificate.file_url, "certificates");

      if (localFilename) {
        const localPath = path.join(
          uploadsRoot,
          "certificates",
          localFilename
        );

        if (await fileExists(localPath)) {
          /*
           * Upload even if the database record already exists.
           * This fixes the previous failed migration.
           */
          fileUrl = await uploadFileToStorage(
            localPath,
            BUCKETS.certificates,
            "certificates",
            localFilename
          );
        }
      }

      if (existing) {
        /*
         * Update existing record if we now have a Supabase URL.
         */
        if (
          fileUrl &&
          fileUrl !== existing.file_url
        ) {
          const { error: updateError } = await supabase
            .from("certificates")
            .update({
              file_url: fileUrl,
            })
            .eq("id", id);

          if (updateError) {
            throw updateError;
          }

          console.log(
            `   🔄 Updated certificate: ${certificate.title}`
          );

          updated++;
        } else {
          skipped++;
        }

        continue;
      }

      /*
       * New certificate.
       */
      const { error: insertError } = await supabase
        .from("certificates")
        .insert({
          id: certificate.id,
          title: certificate.title,
          issuer: certificate.issuer,
          date: certificate.date,
          description: certificate.description,
          skills: certificate.skills,
          category: certificate.category,
          file_url: fileUrl,
        });

      if (insertError) {
        throw insertError;
      }

      console.log(
        `   ✅ Migrated certificate: ${certificate.title}`
      );

      migrated++;

    } catch (err) {
      console.error(
        `   ❌ Failed certificate: ${certificate.title || "Unknown"}`
      );

      console.error(`      ${err.message}`);

      failures.push({
        type: "certificate",
        name: certificate.title,
        error: err.message,
      });
    }
  }

  console.log(
    `📊 Certificates: ${migrated} migrated, ${updated} updated, ${skipped} skipped`
  );
}


/* =========================================================
   PROJECTS
========================================================= */

async function migrateProjects(projects = []) {
  console.log("\n📋 Migrating projects...");

  const { data: existingRows, error } = await supabase
    .from("projects")
    .select("id,file_url");

  if (error) {
    throw error;
  }

  const existingMap = new Map(
    (existingRows || []).map((row) => [String(row.id), row])
  );

  let migrated = 0;
  let updated = 0;
  let skipped = 0;

  for (const project of projects) {
    try {
      const id = project.id;
      const existing = existingMap.get(String(id));

      let fileUrl =
        project.fileUrl ||
        project.file_url ||
        null;

      const localFilename =
        getLocalFilename(project.fileUrl, "projects") ||
        getLocalFilename(project.file_url, "projects");

      if (localFilename) {
        const localPath = path.join(
          uploadsRoot,
          "projects",
          localFilename
        );

        if (await fileExists(localPath)) {
          fileUrl = await uploadFileToStorage(
            localPath,
            BUCKETS.projects,
            "projects",
            localFilename
          );
        }
      }

      if (existing) {
        if (
          fileUrl &&
          fileUrl !== existing.file_url
        ) {
          const { error: updateError } = await supabase
            .from("projects")
            .update({
              file_url: fileUrl,
            })
            .eq("id", id);

          if (updateError) {
            throw updateError;
          }

          console.log(
            `   🔄 Updated project: ${project.title}`
          );

          updated++;
        } else {
          skipped++;
        }

        continue;
      }

      const { error: insertError } = await supabase
        .from("projects")
        .insert({
          id: project.id,
          title: project.title,
          description: project.description,
          category: project.category,
          technologies: project.technologies,
          url: project.url,
          github_url:
            project.githubUrl ||
            project.github_url ||
            null,
          file_url: fileUrl,
        });

      if (insertError) {
        throw insertError;
      }

      console.log(
        `   ✅ Migrated project: ${project.title}`
      );

      migrated++;

    } catch (err) {
      console.error(
        `   ❌ Failed project: ${project.title || "Unknown"}`
      );

      console.error(`      ${err.message}`);

      failures.push({
        type: "project",
        name: project.title,
        error: err.message,
      });
    }
  }

  console.log(
    `📊 Projects: ${migrated} migrated, ${updated} updated, ${skipped} skipped`
  );
}


/* =========================================================
   ABOUT / PROFILE
========================================================= */

async function migrateAbout(about) {
  console.log("\n📋 Migrating about information...");

  if (!about) {
    console.log("⚠️ No about information found.");
    return;
  }

  try {
    let profileImageUrl =
      about.profileImageUrl ||
      about.profile_image_url ||
      null;

    const localFilename =
      getLocalFilename(
        about.profileImageUrl,
        "about"
      ) ||
      getLocalFilename(
        about.profile_image_url,
        "about"
      );

    if (localFilename) {
      const localPath = path.join(
        uploadsRoot,
        "about",
        localFilename
      );

      if (await fileExists(localPath)) {
        profileImageUrl = await uploadFileToStorage(
          localPath,
          BUCKETS.profile,
          "profile",
          localFilename
        );
      }
    }

    const { data: existing, error: fetchError } =
      await supabase
        .from("about")
        .select("id")
        .limit(1);

    if (fetchError) {
      throw fetchError;
    }

    const aboutData = {
      profile_pic: profileImageUrl,
      heading: about.heading,
      bio1: about.bio1,
      bio2: about.bio2,
      cv_url: about.cvUrl || about.cv_url || null,
      socials: about.socials || {},
    };

    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase
        .from("about")
        .update(aboutData)
        .eq("id", existing[0].id);

      if (updateError) {
        throw updateError;
      }

      console.log("   🔄 Updated about information");

    } else {
      const { error: insertError } = await supabase
        .from("about")
        .insert(aboutData);

      if (insertError) {
        throw insertError;
      }

      console.log("   ✅ Created about information");
    }

  } catch (err) {
    console.error("   ❌ Failed about migration");
    console.error(`      ${err.message}`);

    failures.push({
      type: "about",
      name: "About information",
      error: err.message,
    });
  }
}


/* =========================================================
   MAIN MIGRATION
========================================================= */

async function runMigration() {
  console.log("🚀 Starting Supabase migration...\n");

  const raw = await fs.readFile(dbPath, "utf8");
  const db = JSON.parse(raw);

  console.log("✅ Loaded existing data from db.json");

  await migrateCertificates(
    db.certificates || []
  );

  await migrateProjects(
    db.projects || []
  );

  await migrateAbout(
    db.about
  );

  console.log("\n======================================");
  console.log("        MIGRATION SUMMARY");
  console.log("======================================");

  if (failures.length === 0) {
    console.log("✅ Migration completed successfully!");
  } else {
    console.log(
      `⚠️ Migration completed with ${failures.length} failure(s).`
    );

    for (const failure of failures) {
      console.log(
        `❌ ${failure.type}: ${failure.name}`
      );
      console.log(
        `   ${failure.error}`
      );
    }

    process.exitCode = 1;
  }

  console.log("\n⚠️ Original db.json and uploads were preserved.");
}

runMigration().catch((error) => {
  console.error("\n❌ Migration failed completely:");
  console.error(error);
  process.exitCode = 1;
});