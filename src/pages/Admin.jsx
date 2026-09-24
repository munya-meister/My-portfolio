import { useEffect, useState } from "react";
import "./Admin.css";
import {
  adminLogin,
  adminLogout,
  getAdminToken,
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

const emptyAboutForm = {
  heading: "",
  bio1: "",
  bio2: "",
  cvUrl: "",
  socials: "",
  profilePicFile: null,
};

const emptyCertForm = {
  title: "",
  platform: "",
  date: "",
  category: "",
  skills: "",
  technologies: "",
  url: "",
  verifyUrl: "",
  imageUrl: "",
  file: null,
};

const emptyProjectForm = {
  title: "",
  description: "",
  technologies: "",
  demo: "",
  github: "",
  image_url: "",
  file_url: "",
  category: "Web Development",
  image: null,
  file: null,
};

function normalizeCertificates(data) {
  const list = Array.isArray(data)
    ? data
    : data?.certificates || [];

  return list.map((certificate) => ({
    ...certificate,
    title: certificate?.title || "",
    platform: certificate?.platform || "",
    date: certificate?.date || "",
    category: certificate?.category || "",
    skills: Array.isArray(certificate?.skills)
      ? certificate.skills
      : typeof certificate?.skills === "string"
        ? certificate.skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    technologies: Array.isArray(certificate?.technologies)
      ? certificate.technologies
      : typeof certificate?.technologies === "string"
        ? certificate.technologies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    url: certificate?.url || "",
    verify_url: certificate?.verify_url || "",
    image_url: certificate?.image_url || "",
    file_url: certificate?.file_url || "",
  }));
}

function normalizeProjects(data) {
  const list = Array.isArray(data)
    ? data
    : data?.projects || [];

  return list.map((project) => ({
    ...project,
    title: project?.title || "",
    description: project?.description || "",
    technologies: Array.isArray(project?.technologies)
      ? project.technologies
      : typeof project?.technologies === "string"
        ? project.technologies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    demo: project?.demo || "",
    github: project?.github || "",
    image_url: project?.image_url || "",
    file_url: project?.file_url || "",
    category: project?.category || "Web Development",
  }));
}

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(getAdminToken())
  );

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(
    () => Boolean(getAdminToken())
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("about");

  const [about, setAbout] = useState({});
  const [aboutForm, setAboutForm] = useState(emptyAboutForm);

  const [certificates, setCertificates] = useState([]);
  const [certForm, setCertForm] = useState(emptyCertForm);
  const [editingCertId, setEditingCertId] = useState(null);

  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [editingProjectId, setEditingProjectId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

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
          cvUrl: aboutData?.cv_url || "",
          socials: aboutData?.socials
            ? JSON.stringify(aboutData.socials)
            : "",
          profilePicFile: null,
        });

        setCertificates(normalizeCertificates(certData));
        setProjects(normalizeProjects(projData));
      } catch (err) {
        console.error("Admin load error:", err);

        if (active) {
          setError(
            err?.message || "Unable to connect to backend."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  function showSuccess(message) {
    setSuccess(message);
    setError("");

    window.setTimeout(() => {
      setSuccess("");
    }, 4000);
  }

  function showError(message) {
    setError(message);
    setSuccess("");
  }

  async function handleLogin(event) {
    event.preventDefault();

    if (!password.trim()) {
      showError("Please enter the admin password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await adminLogin(password);

      setPassword("");
      setIsAuthenticated(true);
      showSuccess("Login successful.");
    } catch (err) {
      console.error("Login error:", err);
      showError(err?.message || "Invalid password.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    adminLogout();
    setIsAuthenticated(false);
    setAbout({});
    setCertificates([]);
    setProjects([]);
    setError("");
    setSuccess("");
  }

  function handleAboutChange(event) {
    const { name, value } = event.target;

    setAboutForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleCertificateChange(event) {
    const { name, value, files } = event.target;

    setCertForm((previous) => ({
      ...previous,
      [name]: files ? files[0] || null : value,
    }));
  }

  function handleProjectChange(event) {
    const { name, value, files } = event.target;

    setProjectForm((previous) => ({
      ...previous,
      [name]: files ? files[0] || null : value,
    }));
  }

  async function handleAboutSubmit(event) {
    event.preventDefault();

    if (!aboutForm.heading.trim()) {
      showError("Heading is required.");
      return;
    }

    if (!aboutForm.bio1.trim()) {
      showError("Bio 1 is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = new FormData();

      payload.append(
        "heading",
        aboutForm.heading.trim()
      );

      payload.append(
        "bio1",
        aboutForm.bio1.trim()
      );

      payload.append(
        "bio2",
        aboutForm.bio2.trim()
      );

      payload.append(
        "cv_url",
        aboutForm.cvUrl.trim()
      );

      if (aboutForm.socials.trim()) {
        payload.append(
          "socials",
          aboutForm.socials.trim()
        );
      }

      if (aboutForm.profilePicFile) {
        payload.append(
          "profile_pic",
          aboutForm.profilePicFile
        );
      }

      const updated = await updateAbout(payload);

      setAbout(updated || {});

      setAboutForm((previous) => ({
        ...previous,
        profilePicFile: null,
      }));

      showSuccess("About information updated successfully.");
    } catch (err) {
      console.error("About update error:", err);
      showError(
        err?.message || "Unable to update About information."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEditCertificate(certificate) {
    setEditingCertId(certificate.id);

    setCertForm({
      title: certificate?.title || "",
      platform: certificate?.platform || "",
      date: certificate?.date || "",
      category: certificate?.category || "",
      skills: Array.isArray(certificate?.skills)
        ? certificate.skills.join(", ")
        : certificate?.skills || "",
      technologies: Array.isArray(certificate?.technologies)
        ? certificate.technologies.join(", ")
        : certificate?.technologies || "",
      url: certificate?.url || "",
      verifyUrl: certificate?.verify_url || "",
      imageUrl: certificate?.image_url || "",
      file: null,
    });

    setActiveTab("certificates");
    setError("");
    setSuccess("");
  }

  function resetCertificateForm() {
    setEditingCertId(null);
    setCertForm({ ...emptyCertForm });
  }

  async function handleCertificateSubmit(event) {
    event.preventDefault();

    if (!certForm.title.trim()) {
      showError("Certificate title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = new FormData();

      payload.append(
        "title",
        certForm.title.trim()
      );

      payload.append(
        "platform",
        certForm.platform.trim()
      );

      payload.append(
        "date",
        certForm.date.trim()
      );

      payload.append(
        "category",
        certForm.category.trim()
      );

      payload.append(
        "skills",
        certForm.skills.trim()
      );

      payload.append(
        "technologies",
        certForm.technologies.trim()
      );

      payload.append(
        "url",
        certForm.url.trim()
      );

      payload.append(
        "verify_url",
        certForm.verifyUrl.trim()
      );

      payload.append(
        "image_url",
        certForm.imageUrl.trim()
      );

      if (certForm.file) {
        payload.append("file", certForm.file);
      }

      if (editingCertId) {
        await updateCertificate(
          editingCertId,
          payload
        );

        showSuccess(
          "Certificate updated successfully."
        );
      } else {
        await createCertificate(payload);

        showSuccess(
          "Certificate created successfully."
        );
      }

      const refreshed = await fetchCertificates();

      setCertificates(
        normalizeCertificates(refreshed)
      );

      resetCertificateForm();
    } catch (err) {
      console.error(
        "Certificate save error:",
        err
      );

      showError(
        err?.message ||
          "Unable to save certificate."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCertificate(id) {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this certificate?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      await deleteCertificate(id);

      setCertificates((previous) =>
        previous.filter(
          (certificate) =>
            certificate.id !== id
        )
      );

      if (editingCertId === id) {
        resetCertificateForm();
      }

      showSuccess(
        "Certificate deleted successfully."
      );
    } catch (err) {
      console.error(
        "Certificate delete error:",
        err
      );

      showError(
        err?.message ||
          "Unable to delete certificate."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEditProject(project) {
    setEditingProjectId(project.id);

    setProjectForm({
      title: project?.title || "",
      description: project?.description || "",
      technologies: Array.isArray(project?.technologies)
        ? project.technologies.join(", ")
        : project?.technologies || "",
      demo: project?.demo || "",
      github: project?.github || "",
      image_url: project?.image_url || "",
      file_url: project?.file_url || "",
      category:
        project?.category || "Web Development",
      image: null,
      file: null,
    });

    setActiveTab("projects");
    setError("");
    setSuccess("");
  }

  function resetProjectForm() {
    setEditingProjectId(null);
    setProjectForm({ ...emptyProjectForm });
  }

  async function handleProjectSubmit(event) {
    event.preventDefault();

    if (!projectForm.title.trim()) {
      showError("Project title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = new FormData();

      payload.append(
        "title",
        projectForm.title.trim()
      );

      payload.append(
        "description",
        projectForm.description.trim()
      );

      payload.append(
        "technologies",
        projectForm.technologies.trim()
      );

      payload.append(
        "demo",
        projectForm.demo.trim()
      );

      payload.append(
        "github",
        projectForm.github.trim()
      );

      payload.append(
        "image_url",
        projectForm.image_url.trim()
      );

      payload.append(
        "file_url",
        projectForm.file_url.trim()
      );

      payload.append(
        "category",
        projectForm.category.trim()
      );

      if (projectForm.image) {
        payload.append(
          "image",
          projectForm.image
        );
      }

      if (projectForm.file) {
        payload.append(
          "file",
          projectForm.file
        );
      }

      if (editingProjectId) {
        await updateProject(
          editingProjectId,
          payload
        );

        showSuccess(
          "Project updated successfully."
        );
      } else {
        await createProject(payload);

        showSuccess(
          "Project created successfully."
        );
      }

      const refreshed = await fetchProjects();

      setProjects(
        normalizeProjects(refreshed)
      );

      resetProjectForm();
    } catch (err) {
      console.error(
        "Project save error:",
        err
      );

      showError(
        err?.message ||
          "Unable to save project."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProject(id) {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      await deleteProject(id);

      setProjects((previous) =>
        previous.filter(
          (project) =>
            project.id !== id
        )
      );

      if (editingProjectId === id) {
        resetProjectForm();
      }

      showSuccess(
        "Project deleted successfully."
      );
    } catch (err) {
      console.error(
        "Project delete error:",
        err
      );

      showError(
        err?.message ||
          "Unable to delete project."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="admin-page">
        <div className="admin-login">
          <div className="admin-login-card">
            <h1>ADMIN LOGIN</h1>

            <p>
              Sign in to manage your portfolio
              content.
            </p>

            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}

            {success && (
              <div className="admin-success">
                {success}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <label htmlFor="admin-password">
                Password
              </label>

              <input
                id="admin-password"
                className="admin-input"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter admin password"
                autoComplete="current-password"
              />

              <button
                className="admin-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "SIGNING IN..."
                  : "SIGN IN"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">
              PORTFOLIO ADMIN
            </p>

            <h1>ADMIN DASHBOARD</h1>

            <p>
              Manage your portfolio content,
              certificates and projects.
            </p>
          </div>

          <button
            className="admin-button admin-button-secondary"
            type="button"
            onClick={handleLogout}
          >
            LOG OUT
          </button>
        </header>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-success">
            {success}
          </div>
        )}

        <nav className="admin-tabs">
          <button
            type="button"
            className={
              activeTab === "about"
                ? "admin-tab active"
                : "admin-tab"
            }
            onClick={() => {
              setActiveTab("about");
              setError("");
              setSuccess("");
            }}
          >
            ABOUT
          </button>

          <button
            type="button"
            className={
              activeTab === "certificates"
                ? "admin-tab active"
                : "admin-tab"
            }
            onClick={() => {
              setActiveTab("certificates");
              setError("");
              setSuccess("");
            }}
          >
            CERTIFICATES
          </button>

          <button
            type="button"
            className={
              activeTab === "projects"
                ? "admin-tab active"
                : "admin-tab"
            }
            onClick={() => {
              setActiveTab("projects");
              setError("");
              setSuccess("");
            }}
          >
            PROJECTS
          </button>
        </nav>

        {loading ? (
          <div className="admin-loading">
            Loading admin data...
          </div>
        ) : (
          <>
            {activeTab === "about" && (
              <section className="admin-section">
                <div className="admin-section-header">
                  <div>
                    <h2>ABOUT INFORMATION</h2>
                    <p>
                      Update the information displayed
                      in your About section.
                    </p>
                  </div>
                </div>

                <form
                  className="admin-form"
                  onSubmit={handleAboutSubmit}
                >
                  <div className="admin-field">
                    <label htmlFor="heading">
                      Heading
                    </label>

                    <input
                      id="heading"
                      className="admin-input"
                      name="heading"
                      value={aboutForm.heading}
                      onChange={handleAboutChange}
                      placeholder="Passionate About Building Brands, Websites & Creative Experiences."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="bio1">
                      Bio 1
                    </label>

                    <textarea
                      id="bio1"
                      className="admin-textarea"
                      name="bio1"
                      rows="6"
                      value={aboutForm.bio1}
                      onChange={handleAboutChange}
                      placeholder="First paragraph..."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="bio2">
                      Bio 2
                    </label>

                    <textarea
                      id="bio2"
                      className="admin-textarea"
                      name="bio2"
                      rows="6"
                      value={aboutForm.bio2}
                      onChange={handleAboutChange}
                      placeholder="Second paragraph..."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="cvUrl">
                      CV URL
                    </label>

                    <input
                      id="cvUrl"
                      className="admin-input"
                      name="cvUrl"
                      value={aboutForm.cvUrl}
                      onChange={handleAboutChange}
                      placeholder="/cv.pdf"
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="socials">
                      Socials JSON
                    </label>

                    <textarea
                      id="socials"
                      className="admin-textarea"
                      name="socials"
                      rows="5"
                      value={aboutForm.socials}
                      onChange={handleAboutChange}
                      placeholder='{"linkedin":"https://linkedin.com/in/...", "github":"https://github.com/..."}'
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="profilePicFile">
                      Profile Picture
                    </label>

                    <input
                      id="profilePicFile"
                      className="admin-input"
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setAboutForm(
                          (previous) => ({
                            ...previous,
                            profilePicFile:
                              event.target.files?.[0] ||
                              null,
                          })
                        )
                      }
                    />

                    {(about?.profile_pic ||
                      about?.profilePic) && (
                      <div className="admin-preview">
                        <img
                          src={
                            about.profile_pic ||
                            about.profilePic
                          }
                          alt="Current profile"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    className="admin-button"
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "SAVING..."
                      : "SAVE ABOUT"}
                  </button>
                </form>
              </section>
            )}

            {activeTab === "certificates" && (
              <section className="admin-section">
                <div className="admin-section-header">
                  <div>
                    <h2>
                      {editingCertId
                        ? "EDIT CERTIFICATE"
                        : "ADD CERTIFICATE"}
                    </h2>

                    <p>
                      Add or update your
                      professional certificates.
                    </p>
                  </div>

                  {editingCertId && (
                    <button
                      type="button"
                      className="admin-button admin-button-secondary"
                      onClick={
                        resetCertificateForm
                      }
                    >
                      CANCEL EDIT
                    </button>
                  )}
                </div>

                <form
                  className="admin-form"
                  onSubmit={
                    handleCertificateSubmit
                  }
                >
                  <div className="admin-grid">
                    <div className="admin-field">
                      <label htmlFor="cert-title">
                        Title
                      </label>

                      <input
                        id="cert-title"
                        className="admin-input"
                        name="title"
                        value={certForm.title}
                        onChange={
                          handleCertificateChange
                        }
                        placeholder="Certificate title"
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="cert-platform">
                        Platform
                      </label>

                      <input
                        id="cert-platform"
                        className="admin-input"
                        name="platform"
                        value={certForm.platform}
                        onChange={
                          handleCertificateChange
                        }
                        placeholder="Coursera"
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="cert-date">
                        Date
                      </label>

                      <input
                        id="cert-date"
                        className="admin-input"
                        name="date"
                        value={certForm.date}
                        onChange={
                          handleCertificateChange
                        }
                        placeholder="July 2026"
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="cert-category">
                        Category
                      </label>

                      <input
                        id="cert-category"
                        className="admin-input"
                        name="category"
                        value={certForm.category}
                        onChange={
                          handleCertificateChange
                        }
                        placeholder="Digital Marketing"
                      />
                    </div>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="cert-skills">
                      Skills
                    </label>

                    <input
                      id="cert-skills"
                      className="admin-input"
                      name="skills"
                      value={certForm.skills}
                      onChange={
                        handleCertificateChange
                      }
                      placeholder="Brand Awareness, Social Media Marketing"
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="cert-technologies">
                      Technologies
                    </label>

                    <input
                      id="cert-technologies"
                      className="admin-input"
                      name="technologies"
                      value={
                        certForm.technologies
                      }
                      onChange={
                        handleCertificateChange
                      }
                      placeholder="Canva, ChatGPT"
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="cert-url">
                      Certificate URL
                    </label>

                    <input
                      id="cert-url"
                      className="admin-input"
                      name="url"
                      value={certForm.url}
                      onChange={
                        handleCertificateChange
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="cert-verify">
                      Verification URL
                    </label>

                    <input
                      id="cert-verify"
                      className="admin-input"
                      name="verifyUrl"
                      value={certForm.verifyUrl}
                      onChange={
                        handleCertificateChange
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="cert-image-url">
                      Image URL
                    </label>

                    <input
                      id="cert-image-url"
                      className="admin-input"
                      name="imageUrl"
                      value={certForm.imageUrl}
                      onChange={
                        handleCertificateChange
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="cert-file">
                      Certificate File
                    </label>

                    <input
                      id="cert-file"
                      className="admin-input"
                      type="file"
                      accept=".pdf,image/*"
                      name="file"
                      onChange={
                        handleCertificateChange
                      }
                    />
                  </div>

                  <button
                    className="admin-button"
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "SAVING..."
                      : editingCertId
                        ? "UPDATE CERTIFICATE"
                        : "ADD CERTIFICATE"}
                  </button>
                </form>

                <div className="admin-list">
                  <h3>
                    EXISTING CERTIFICATES (
                    {certificates.length})
                  </h3>

                  {certificates.length === 0 ? (
                    <p className="admin-empty">
                      No certificates found.
                    </p>
                  ) : (
                    certificates.map(
                      (certificate) => (
                        <article
                          className="admin-list-item"
                          key={certificate.id}
                        >
                          <div>
                            <h4>
                              {
                                certificate.title
                              }
                            </h4>

                            <p>
                              {
                                certificate.platform
                              }
                              {certificate.date
                                ? ` • ${certificate.date}`
                                : ""}
                            </p>
                          </div>

                          <div className="admin-actions">
                            <button
                              type="button"
                              className="admin-button admin-button-small"
                              onClick={() =>
                                startEditCertificate(
                                  certificate
                                )
                              }
                            >
                              EDIT
                            </button>

                            <button
                              type="button"
                              className="admin-button admin-button-small admin-danger"
                              onClick={() =>
                                handleDeleteCertificate(
                                  certificate.id
                                )
                              }
                              disabled={saving}
                            >
                              DELETE
                            </button>
                          </div>
                        </article>
                      )
                    )
                  )}
                </div>
              </section>
            )}

            {activeTab === "projects" && (
              <section className="admin-section">
                <div className="admin-section-header">
                  <div>
                    <h2>
                      {editingProjectId
                        ? "EDIT PROJECT"
                        : "ADD PROJECT"}
                    </h2>

                    <p>
                      Manage the projects displayed
                      in your portfolio.
                    </p>
                  </div>

                  {editingProjectId && (
                    <button
                      type="button"
                      className="admin-button admin-button-secondary"
                      onClick={
                        resetProjectForm
                      }
                    >
                      CANCEL EDIT
                    </button>
                  )}
                </div>

                <form
                  className="admin-form"
                  onSubmit={
                    handleProjectSubmit
                  }
                >
                  <div className="admin-grid">
                    <div className="admin-field">
                      <label htmlFor="project-title">
                        Title
                      </label>

                      <input
                        id="project-title"
                        className="admin-input"
                        name="title"
                        value={
                          projectForm.title
                        }
                        onChange={
                          handleProjectChange
                        }
                        placeholder="Project title"
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="project-category">
                        Category
                      </label>

                      <input
                        id="project-category"
                        className="admin-input"
                        name="category"
                        value={
                          projectForm.category
                        }
                        onChange={
                          handleProjectChange
                        }
                        placeholder="Web Development"
                      />
                    </div>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="project-description">
                      Description
                    </label>

                    <textarea
                      id="project-description"
                      className="admin-textarea"
                      name="description"
                      rows="6"
                      value={
                        projectForm.description
                      }
                      onChange={
                        handleProjectChange
                      }
                      placeholder="Describe the project..."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="project-technologies">
                      Technologies
                    </label>

                    <input
                      id="project-technologies"
                      className="admin-input"
                      name="technologies"
                      value={
                        projectForm.technologies
                      }
                      onChange={
                        handleProjectChange
                      }
                      placeholder="React, Vite, Supabase"
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="project-demo">
                      Demo URL
                    </label>

                    <input
                      id="project-demo"
                      className="admin-input"
                      name="demo"
                      value={projectForm.demo}
                      onChange={
                        handleProjectChange
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="project-github">
                      GitHub URL
                    </label>

                    <input
                      id="project-github"
                      className="admin-input"
                      name="github"
                      value={
                        projectForm.github
                      }
                      onChange={
                        handleProjectChange
                      }
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="project-image-url">
                      Image URL
                    </label>

                    <input
                      id="project-image-url"
                      className="admin-input"
                      name="image_url"
                      value={
                        projectForm.image_url
                      }
                      onChange={
                        handleProjectChange
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="project-file-url">
                      File URL
                    </label>

                    <input
                      id="project-file-url"
                      className="admin-input"
                      name="file_url"
                      value={
                        projectForm.file_url
                      }
                      onChange={
                        handleProjectChange
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="project-image">
                      Project Image
                    </label>

                    <input
                      id="project-image"
                      className="admin-input"
                      type="file"
                      accept="image/*"
                      name="image"
                      onChange={
                        handleProjectChange
                      }
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="project-file">
                      Project File
                    </label>

                    <input
                      id="project-file"
                      className="admin-input"
                      type="file"
                      name="file"
                      onChange={
                        handleProjectChange
                      }
                    />
                  </div>

                  <button
                    className="admin-button"
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "SAVING..."
                      : editingProjectId
                        ? "UPDATE PROJECT"
                        : "ADD PROJECT"}
                  </button>
                </form>

                <div className="admin-list">
                  <h3>
                    EXISTING PROJECTS (
                    {projects.length})
                  </h3>

                  {projects.length === 0 ? (
                    <p className="admin-empty">
                      No projects found.
                    </p>
                  ) : (
                    projects.map((project) => (
                      <article
                        className="admin-list-item"
                        key={project.id}
                      >
                        <div>
                          <h4>
                            {project.title}
                          </h4>

                          <p>
                            {project.category}
                          </p>
                        </div>

                        <div className="admin-actions">
                          <button
                            type="button"
                            className="admin-button admin-button-small"
                            onClick={() =>
                              startEditProject(
                                project
                              )
                            }
                          >
                            EDIT
                          </button>

                          <button
                            type="button"
                            className="admin-button admin-button-small admin-danger"
                            onClick={() =>
                              handleDeleteProject(
                                project.id
                              )
                            }
                            disabled={saving}
                          >
                            DELETE
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default Admin;