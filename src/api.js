const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

async function request(path, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, options);

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
