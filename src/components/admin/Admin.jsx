import "./admin.css";
import { useEffect, useMemo, useState } from "react";
import {
  fetchCertificates,
  createCertificate,
  fetchProjects,
  createProject,
} from "../../api";

function SkillsInput({ value, onChange }) {
  return (
    <input
      className="admin-input"
      name="skills"
      value={value}
      onChange={onChange}
      placeholder="Figma, React, Node.js"
    />
  );
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [certificates, setCertificates] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState("");

  const [certForm, setCertForm] = useState({
    title: "",
    platform: "",
    date: "",
    category: "",
    skills: "",
    url: "",
    verifyUrl: "",
    file: null,
  });

  const [projForm, setProjForm] = useState({
    title: "",
    description: "",
    technologies: "",
    demo: "",
    github: "",
    file: null,
  });

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function load() {
      try {
        setLoading(true);

        const [certs, projs] = await Promise.all([
          fetchCertificates(),
          fetchProjects(),
        ]);

        setCertificates(certs || []);
        setProjects(projs || []);
      } catch (err) {
        console.error(err);
        setError("Unable to connect to backend.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isAuthenticated]);

  // =======================
  // LOGIN
  // =======================

  const handleLogin = (e) => {
    e.preventDefault();

    console.clear();

    console.log("Typed Password:");
    console.log(password);

    console.log("VITE_ADMIN_PASSWORD:");
    console.log(import.meta.env.VITE_ADMIN_PASSWORD);

    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      console.log("LOGIN SUCCESS");

      sessionStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      console.log("LOGIN FAILED");

      setLoginError("Incorrect password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
  };

  const canSubmitCert = useMemo(
    () => certForm.title.trim() && certForm.platform.trim(),
    [certForm],
  );

  const canSubmitProj = useMemo(() => projForm.title.trim(), [projForm]);

  const handleCertChange = (e) => {
    const { name, value } = e.target;
    setCertForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjChange = (e) => {
    const { name, value } = e.target;
    setProjForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCertSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(certForm).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      setSubmitting("certificate");

      const created = await createCertificate(formData);

      setCertificates([created, ...certificates]);

      setCertForm({
        title: "",
        platform: "",
        date: "",
        category: "",
        skills: "",
        url: "",
        verifyUrl: "",
        file: null,
      });
    } catch (err) {
      console.error(err);
      setError("Could not upload certificate.");
    } finally {
      setSubmitting("");
    }
  };

  const handleProjSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(projForm).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      setSubmitting("project");

      const created = await createProject(formData);

      setProjects([created, ...projects]);

      setProjForm({
        title: "",
        description: "",
        technologies: "",
        demo: "",
        github: "",
        file: null,
      });
    } catch (err) {
      console.error(err);
      setError("Could not upload project.");
    } finally {
      setSubmitting("");
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="admin-section">
        <div className="admin-container">
          <div
            className="admin-card"
            style={{ maxWidth: 450, margin: "100px auto" }}
          >
            <h2>Admin Login</h2>

            <form className="admin-form" onSubmit={handleLogin}>
              <label>
                Password
                <input
                  className="admin-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {loginError && <p className="admin-error">{loginError}</p>}

              <button className="admin-btn">Login</button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-section">
      <div className="admin-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 30,
          }}
        >
          <h2>Portfolio Admin</h2>

          <button className="admin-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-grid">
          <div className="admin-card">
            <h3>Certificate</h3>

            <form className="admin-form" onSubmit={handleCertSubmit}>
              <input
                className="admin-input"
                placeholder="Title"
                name="title"
                value={certForm.title}
                onChange={handleCertChange}
              />

              <input
                className="admin-input"
                placeholder="Platform"
                name="platform"
                value={certForm.platform}
                onChange={handleCertChange}
              />

              <SkillsInput
                value={certForm.skills}
                onChange={handleCertChange}
              />

              <input
                className="admin-input"
                type="file"
                onChange={(e) =>
                  setCertForm({
                    ...certForm,
                    file: e.target.files[0],
                  })
                }
              />

              <button className="admin-btn" disabled={!canSubmitCert}>
                {submitting === "certificate"
                  ? "Uploading..."
                  : "Upload Certificate"}
              </button>
            </form>
          </div>

          <div className="admin-card">
            <h3>Project</h3>

            <form className="admin-form" onSubmit={handleProjSubmit}>
              <input
                className="admin-input"
                placeholder="Project Title"
                name="title"
                value={projForm.title}
                onChange={handleProjChange}
              />

              <textarea
                className="admin-input"
                placeholder="Description"
                name="description"
                value={projForm.description}
                onChange={handleProjChange}
              />

              <input
                className="admin-input"
                placeholder="React, Node..."
                name="technologies"
                value={projForm.technologies}
                onChange={handleProjChange}
              />

              <input
                className="admin-input"
                type="file"
                onChange={(e) =>
                  setProjForm({
                    ...projForm,
                    file: e.target.files[0],
                  })
                }
              />

              <button className="admin-btn" disabled={!canSubmitProj}>
                {submitting === "project" ? "Uploading..." : "Upload Project"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
