import "../components/admin/admin.css";
import { useEffect, useMemo, useState } from "react";
import {
  fetchAbout,
  updateAbout,
  fetchCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../api";

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

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [about, setAbout] = useState({
    profilePic: "",
    heading: "",
    bio1: "",
    bio2: "",
    cvUrl: "",
    socials: {},
  });
  const [aboutForm, setAboutForm] = useState({
    heading: "",
    bio1: "",
    bio2: "",
    cvUrl: "",
    socials: "",
    profilePicFile: null,
  });
  const [aboutSubmitting, setAboutSubmitting] = useState(false);

  const [certificates, setCertificates] = useState([]);
  const [projects, setProjects] = useState([]);

  const [certForm, setCertForm] = useState({
    title: "",
    platform: "",
    date: "",
    category: "",
    skills: "",
    url: "",
    verifyUrl: "",
    imageUrl: "",
    file: null,
  });

  const [projForm, setProjForm] = useState({
    title: "",
    description: "",
    technologies: "",
    demo: "",
    github: "",
    imageUrl: "",
    file: null,
  });

  const [editingCertId, setEditingCertId] = useState(null);
  const [editingProjId, setEditingProjId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState("");

  useEffect(() => {
    const auth = sessionStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [aboutData, certData, projData] = await Promise.all([
          fetchAbout(),
          fetchCertificates(),
          fetchProjects(),
        ]);
        if (!active) return;

        setAbout(aboutData || {});
        setAboutForm({
          heading: aboutData?.heading || "",
          bio1: aboutData?.bio1 || "",
          bio2: aboutData?.bio2 || "",
          cvUrl: aboutData?.cvUrl || "",
          socials: aboutData?.socials ? JSON.stringify(aboutData.socials) : "",
          profilePicFile: null,
        });
        setCertificates(Array.isArray(certData) ? certData : []);
        setProjects(Array.isArray(projData) ? projData : []);
      } catch (err) {
        console.error(err);
        if (active) setError("Unable to connect to backend.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Incorrect password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
  };

  const canSubmitCert = useMemo(() => certForm.title.trim() && certForm.platform.trim(), [certForm]);
  const canSubmitProj = useMemo(() => projForm.title.trim(), [projForm]);
  const canSubmitAbout = useMemo(() => aboutForm.heading.trim() && aboutForm.bio1.trim(), [aboutForm]);

  const handleCertChange = (e) => {
    const { name, value } = e.target;
    setCertForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjChange = (e) => {
    const { name, value } = e.target;
    setProjForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAboutChange = (e) => {
    const { name, value } = e.target;
    setAboutForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCertFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setCertForm((prev) => ({ ...prev, file }));
  };

  const handleProjFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProjForm((prev) => ({ ...prev, file }));
  };

  const handleAboutFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAboutForm((prev) => ({ ...prev, profilePicFile: file }));
  };

  const handleAboutSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmitAbout) return;

    const payload = new FormData();
    payload.append("heading", aboutForm.heading.trim());
    payload.append("bio1", aboutForm.bio1.trim());
    payload.append("bio2", aboutForm.bio2.trim());
    payload.append("cvUrl", aboutForm.cvUrl.trim());
    if (aboutForm.socials.trim()) {
      payload.append("socials", aboutForm.socials.trim());
    }
    if (aboutForm.profilePicFile) {
      payload.append("file", aboutForm.profilePicFile);
    }

    try {
      setAboutSubmitting(true);
      setError("");
      const updated = await updateAbout(payload);
      setAbout(updated || {});
      setAboutForm((prev) => ({ ...prev, profilePicFile: null }));
    } catch (err) {
      setError("Could not save About Me.");
    } finally {
      setAboutSubmitting(false);
    }
  };

  const handleCertSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmitCert) return;

    const payload = new FormData();
    payload.append("title", certForm.title.trim());
    payload.append("platform", certForm.platform.trim());
    payload.append("date", certForm.date.trim() || "Recently completed");
    payload.append("category", certForm.category.trim() || "General");
    payload.append("skills", certForm.skills.trim());
    payload.append("url", certForm.url.trim());
    payload.append("verifyUrl", certForm.verifyUrl.trim());
    payload.append("imageUrl", certForm.imageUrl.trim());
    if (certForm.file) payload.append("file", certForm.file);

    try {
      setError("");
      setSubmitting("certificate");

      if (editingCertId) {
        const updated = await updateCertificate(editingCertId, payload);
        setCertificates((current) =>
          current.map((c) => (c.id === editingCertId ? updated : c))
        );
        setEditingCertId(null);
      } else {
        const created = await createCertificate(payload);
        setCertificates((current) => [
          {
            ...created,
            image: created.imageUrl || created.fileUrl || created.image,
            skills: Array.isArray(created.skills)
              ? created.skills
              : typeof created.skills === "string"
                ? created.skills.split(",").map((s) => s.trim()).filter(Boolean)
                : [],
          },
          ...current,
        ]);
      }

      setCertForm({
        title: "",
        platform: "",
        date: "",
        category: "",
        skills: "",
        url: "",
        verifyUrl: "",
        imageUrl: "",
        file: null,
      });
    } catch (e2) {
      setError(editingCertId ? "Could not update certificate." : "Could not save certificate to backend.");
    } finally {
      setSubmitting("");
    }
  };

  const handleProjSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmitProj) return;

    const payload = new FormData();
    payload.append("title", projForm.title.trim() || "Untitled Project");
    payload.append("description", projForm.description.trim());
    payload.append("technologies", projForm.technologies.trim());
    payload.append("demo", projForm.demo.trim());
    payload.append("github", projForm.github.trim());
    payload.append("imageUrl", projForm.imageUrl.trim());
    if (projForm.file) payload.append("file", projForm.file);

    try {
      setError("");
      setSubmitting("project");

      if (editingProjId) {
        const updated = await updateProject(editingProjId, payload);
        setProjects((current) =>
          current.map((p) => (p.id === editingProjId ? updated : p))
        );
        setEditingProjId(null);
      } else {
        const created = await createProject(payload);
        setProjects((current) => [
          {
            ...created,
            image: created.imageUrl || created.fileUrl || created.image,
            technologies: Array.isArray(created.technologies)
              ? created.technologies
              : typeof created.technologies === "string"
                ? created.technologies.split(",").map((t) => t.trim()).filter(Boolean)
                : [],
          },
          ...current,
        ]);
      }

      setProjForm({
        title: "",
        description: "",
        technologies: "",
        demo: "",
        github: "",
        imageUrl: "",
        file: null,
      });
    } catch (e2) {
      setError(editingProjId ? "Could not update project." : "Could not save project to backend.");
    } finally {
      setSubmitting("");
    }
  };

  const startEditCert = (cert) => {
    setEditingCertId(cert.id);
    setCertForm({
      title: cert.title || "",
      platform: cert.platform || "",
      date: cert.date || "",
      category: cert.category || "",
      skills: Array.isArray(cert.skills) ? cert.skills.join(", ") : (cert.skills || ""),
      url: cert.url || "",
      verifyUrl: cert.verifyUrl || "",
      imageUrl: cert.imageUrl || "",
      file: null,
    });
  };

  const startEditProj = (proj) => {
    setEditingProjId(proj.id);
    setProjForm({
      title: proj.title || "",
      description: proj.description || "",
      technologies: Array.isArray(proj.technologies) ? proj.technologies.join(", ") : (proj.technologies || ""),
      demo: proj.demo || "",
      github: proj.github || "",
      imageUrl: proj.imageUrl || "",
      file: null,
    });
  };

  const cancelEditCert = () => {
    setEditingCertId(null);
    setCertForm({
      title: "",
      platform: "",
      date: "",
      category: "",
      skills: "",
      url: "",
      verifyUrl: "",
      imageUrl: "",
      file: null,
    });
  };

  const cancelEditProj = () => {
    setEditingProjId(null);
    setProjForm({
      title: "",
      description: "",
      technologies: "",
      demo: "",
      github: "",
      imageUrl: "",
      file: null,
    });
  };

  const handleDeleteCert = async (id) => {
    if (!confirm("Delete this certificate?")) return;
    try {
      await deleteCertificate(id);
      setCertificates((current) => current.filter((c) => c.id !== id));
      if (editingCertId === id) cancelEditCert();
    } catch (err) {
      setError("Could not delete certificate.");
    }
  };

  const handleDeleteProj = async (id) => {
    if (!confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      setProjects((current) => current.filter((p) => p.id !== id));
      if (editingProjId === id) cancelEditProj();
    } catch (err) {
      setError("Could not delete project.");
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="admin-section">
        <div className="container admin-container">
          <div className="admin-card" style={{ maxWidth: "400px", margin: "0 auto" }}>
            <h2>Admin Login</h2>
            <form className="admin-form" onSubmit={handleLogin}>
              <label>
                Password
                <input
                  className="admin-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              {loginError && <p className="admin-error">{loginError}</p>}
              <button className="admin-btn" type="submit">
                Login
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-section">
      <div className="container admin-container">
        <header className="admin-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2>Portfolio Admin</h2>
              <p>Manage your portfolio content below.</p>
            </div>
            <button className="admin-btn" onClick={handleLogout} style={{ padding: "8px 16px" }}>
              Logout
            </button>
          </div>
        </header>

        {loading && <p className="admin-muted">Loading…</p>}
        {error && <p className="admin-error">{error}</p>}

        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3>About Me</h3>
          <form className="admin-form" onSubmit={handleAboutSubmit}>
            <label>
              Heading
              <input
                className="admin-input"
                name="heading"
                value={aboutForm.heading}
                onChange={handleAboutChange}
                placeholder="Your headline"
                required
              />
            </label>
            <label>
              Bio (first paragraph)
              <textarea
                className="admin-input"
                name="bio1"
                value={aboutForm.bio1}
                onChange={handleAboutChange}
                placeholder="Tell visitors who you are"
                rows={3}
                required
              />
            </label>
            <label>
              Bio (second paragraph)
              <textarea
                className="admin-input"
                name="bio2"
                value={aboutForm.bio2}
                onChange={handleAboutChange}
                placeholder="Additional background"
                rows={3}
              />
            </label>
            <label>
              CV URL
              <input
                className="admin-input"
                name="cvUrl"
                value={aboutForm.cvUrl}
                onChange={handleAboutChange}
                placeholder="/cv.pdf"
              />
            </label>
            <label>
              Profile picture
              <input
                className="admin-input"
                type="file"
                accept="image/*"
                onChange={handleAboutFileChange}
              />
              {about.profilePic && !aboutForm.profilePicFile && (
                <span style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: 4 }}>
                  Current: {about.profilePic}
                </span>
              )}
            </label>

            <button className="admin-btn" type="submit" disabled={!canSubmitAbout || aboutSubmitting}>
              {aboutSubmitting ? "Saving…" : "Save About Me"}
            </button>
          </form>
        </div>

        <div className="admin-grid">
          <div className="admin-card">
            <h3>{editingCertId ? "Update Certificate" : "Upload Certificate"}</h3>
            <form className="admin-form" onSubmit={handleCertSubmit}>
              <input
                className="admin-input"
                placeholder="Title"
                name="title"
                value={certForm.title}
                onChange={handleCertChange}
                required
              />
              <input
                className="admin-input"
                placeholder="Platform"
                name="platform"
                value={certForm.platform}
                onChange={handleCertChange}
                required
              />
              <input
                className="admin-input"
                placeholder="Completion date"
                name="date"
                value={certForm.date}
                onChange={handleCertChange}
              />
              <input
                className="admin-input"
                placeholder="Category"
                name="category"
                value={certForm.category}
                onChange={handleCertChange}
              />
              <SkillsInput
                value={certForm.skills}
                onChange={handleCertChange}
              />
              <input
                className="admin-input"
                placeholder="Certificate URL"
                name="url"
                value={certForm.url}
                onChange={handleCertChange}
              />
              <input
                className="admin-input"
                placeholder="Verification URL"
                name="verifyUrl"
                value={certForm.verifyUrl}
                onChange={handleCertChange}
              />
              <input
                className="admin-input"
                placeholder="Image URL"
                name="imageUrl"
                value={certForm.imageUrl}
                onChange={handleCertChange}
              />
              <input
                className="admin-input"
                type="file"
                accept="image/*,.pdf"
                onChange={handleCertFileChange}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <button className="admin-btn" type="submit" disabled={!canSubmitCert || submitting === "certificate"}>
                  {submitting === "certificate" ? "Saving…" : editingCertId ? "Update Certificate" : "Save Certificate"}
                </button>
                {editingCertId && (
                  <button type="button" className="admin-btn" style={{ background: "#555", color: "#fff" }} onClick={cancelEditCert}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-card">
            <h3>{editingProjId ? "Update Project" : "Upload Project"}</h3>
            <form className="admin-form" onSubmit={handleProjSubmit}>
              <input
                className="admin-input"
                placeholder="Project title"
                name="title"
                value={projForm.title}
                onChange={handleProjChange}
                required
              />
              <textarea
                className="admin-input"
                placeholder="Description"
                name="description"
                value={projForm.description}
                onChange={handleProjChange}
                rows={3}
              />
              <input
                className="admin-input"
                placeholder="Technologies (comma separated)"
                name="technologies"
                value={projForm.technologies}
                onChange={handleProjChange}
              />
              <input
                className="admin-input"
                placeholder="Demo URL"
                name="demo"
                value={projForm.demo}
                onChange={handleProjChange}
              />
              <input
                className="admin-input"
                placeholder="GitHub URL"
                name="github"
                value={projForm.github}
                onChange={handleProjChange}
              />
              <input
                className="admin-input"
                placeholder="Image URL"
                name="imageUrl"
                value={projForm.imageUrl}
                onChange={handleProjChange}
              />
              <input
                className="admin-input"
                type="file"
                accept="image/*"
                onChange={handleProjFileChange}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <button className="admin-btn" type="submit" disabled={!canSubmitProj || submitting === "project"}>
                  {submitting === "project" ? "Saving…" : editingProjId ? "Update Project" : "Save Project"}
                </button>
                {editingProjId && (
                  <button type="button" className="admin-btn" style={{ background: "#555", color: "#fff" }} onClick={cancelEditProj}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="admin-preview">
          <div className="admin-preview-col">
            <h3>Certificates ({certificates.length})</h3>
            <div className="admin-list">
              {certificates.length === 0 ? (
                <p className="admin-muted">No certificates uploaded yet.</p>
              ) : (
                certificates.map((c) => (
                  <div key={c.id} className="admin-list-item">
                    <div className="admin-list-title">{c.title}</div>
                    <div className="admin-list-sub">{c.platform} · {c.date}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        className="admin-btn"
                        style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                        onClick={() => startEditCert(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-btn"
                        style={{ padding: "6px 12px", fontSize: "0.85rem", background: "#b91c1c", color: "#fff" }}
                        onClick={() => handleDeleteCert(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="admin-preview-col">
            <h3>Projects ({projects.length})</h3>
            <div className="admin-list">
              {projects.length === 0 ? (
                <p className="admin-muted">No projects uploaded yet.</p>
              ) : (
                projects.map((p) => (
                  <div key={p.id} className="admin-list-item">
                    <div className="admin-list-title">{p.title}</div>
                    <div className="admin-list-sub">
                      {Array.isArray(p.technologies) ? p.technologies.slice(0, 3).join(", ") : ""}
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        className="admin-btn"
                        style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                        onClick={() => startEditProj(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-btn"
                        style={{ padding: "6px 12px", fontSize: "0.85rem", background: "#b91c1c", color: "#fff" }}
                        onClick={() => handleDeleteProj(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Admin;
