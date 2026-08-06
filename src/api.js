console.log(import.meta.env.VITE_API_BASE_URL);
const DEFAULT_BASE_URL = "";
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request(path, options = {}) {
  const url = buildUrl(path);

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

export function sendContactMessage(payload) {
  return request("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function fetchAbout() {
  return request("/api/about");
}

export function updateAbout(formData) {
  return request("/api/about", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${ADMIN_PASSWORD}`,
    },
    body: formData,
  });
}

export function fetchCertificates() {
  return request("/api/certificates");
}

export function fetchProjects() {
  return request("/api/projects");
}

export function createCertificate(formData) {
  return request("/api/certificates", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ADMIN_PASSWORD}`,
    },
    body: formData,
  });
}

export function updateCertificate(id, formData) {
  return request(`/api/certificates/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${ADMIN_PASSWORD}`,
    },
    body: formData,
  });
}

export function deleteCertificate(id) {
  return request(`/api/certificates/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${ADMIN_PASSWORD}`,
    },
  });
}

export function createProject(formData) {
  return request("/api/projects", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ADMIN_PASSWORD}`,
    },
    body: formData,
  });
}

export function updateProject(id, formData) {
  return request(`/api/projects/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${ADMIN_PASSWORD}`,
    },
    body: formData,
  });
}

export function deleteProject(id) {
  return request(`/api/projects/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${ADMIN_PASSWORD}`,
    },
  });
}
