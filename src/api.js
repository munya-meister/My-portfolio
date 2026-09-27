function buildUrl(path) {
  // Use same-origin API requests in production
  // Use local development API when specified
  const devApiUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (devApiUrl && devApiUrl.startsWith('http')) {
    const baseUrl = devApiUrl.replace(/\/$/, "");
    return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  }
  
  // Production: use same-origin
  return path;
}

// Admin authentication functions
export function adminLogin(password) {
  return request("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  }).then((data) => {
    if (data.success && data.token) {
      sessionStorage.setItem("adminToken", data.token);
      return data;
    }
    throw new Error(data.message || "Login failed");
  });
}

export function adminLogout() {
  sessionStorage.removeItem("adminToken");
}

export function getAdminToken() {
  return sessionStorage.getItem("adminToken");
}

async function request(path, options = {}) {
  const url = buildUrl(path);

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - clear token
        sessionStorage.removeItem("adminToken");
      }
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

export function updateAbout(payload) {
  const token = getAdminToken();
  const isFormData = payload instanceof FormData;
  return request("/api/about", {
    method: "PUT",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    },
    body: isFormData ? payload : JSON.stringify(payload),
  });
}

export function fetchCertificates() {
  return request("/api/certificates");
}

export function fetchProjects() {
  return request("/api/projects");
}

export function createCertificate(formData) {
  const token = getAdminToken();
  return request("/api/certificates", {
    method: "POST",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    body: formData,
  });
}

export function updateCertificate(id, formData) {
  const token = getAdminToken();
  return request(`/api/certificates/${id}`, {
    method: "PUT",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    body: formData,
  });
}

export function deleteCertificate(id) {
  const token = getAdminToken();
  return request(`/api/certificates/${id}`, {
    method: "DELETE",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });
}

export function createProject(formData) {
  const token = getAdminToken();
  return request("/api/projects", {
    method: "POST",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    body: formData,
  });
}

export function updateProject(id, formData) {
  const token = getAdminToken();
  return request(`/api/projects/${id}`, {
    method: "PUT",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    body: formData,
  });
}

export function deleteProject(id) {
  const token = getAdminToken();
  return request(`/api/projects/${id}`, {
    method: "DELETE",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });
}
