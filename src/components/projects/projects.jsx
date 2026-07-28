import "./projects.css";
import projectsBg from "../../assets/heroe.png";
import { useEffect, useState } from "react";
import initialProjects from "./ProjectsData";
import ProjectCard from "./projectCard";
import { fetchProjects, createProject } from "../../api";

function Projects() {
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    demo: "",
    github: "",
    file: null,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchProjects()
      .then((data) => {
        if (!active || !Array.isArray(data)) return;
        if (data.length > 0) {
          setProjects(
            data.map((item) => ({
              ...item,
              image: item.fileUrl || item.image || "",
              technologies: Array.isArray(item.technologies)
                ? item.technologies
                : typeof item.technologies === "string"
                ? item.technologies.split(",").map((tech) => tech.trim()).filter(Boolean)
                : [],
            }))
          );
        }
      })
      .catch(() => {
        setError("Unable to load backend projects. Showing local projects.");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setFormData((current) => ({ ...current, file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = new FormData();
    payload.append("title", formData.title.trim() || "Untitled Project");
    payload.append("description", formData.description.trim());
    payload.append("technologies", formData.technologies.trim());
    payload.append("demo", formData.demo.trim());
    payload.append("github", formData.github.trim());
    if (formData.file) {
      payload.append("file", formData.file);
    }

    try {
      const created = await createProject(payload);
      setProjects((current) => [
        {
          ...created,
          image: created.fileUrl || created.image || "",
          technologies: Array.isArray(created.technologies)
            ? created.technologies
            : typeof created.technologies === "string"
            ? created.technologies.split(",").map((tech) => tech.trim()).filter(Boolean)
            : [],
        },
        ...current,
      ]);
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        technologies: "",
        demo: "",
        github: "",
        file: null,
      });
    } catch (err) {
      setError("Could not save project to backend.");
    }
  };

  return (
    <section className="projects" id="projects" style={{
        backgroundImage: `
          linear-gradient(rgba(8, 8, 8, 0.88), rgba(8, 8, 8, 0.92)),
          url(${projectsBg})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container">

      <div className="projects-heading">
        <p>SELECTED WORK</p>
        <h2>Projects That Tell a Story</h2>
        <span>
          Every project represents a challenge solved through creativity,
          technology and strategy.
        </span>
      </div>

      <div className="add-certificate-wrap" />


      {error && <p className="error-message">{error}</p>}

      {/* THIS CLASS NAME IS IMPORTANT */}
      <div className="projects-grid">
        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            project={project}
          />
        ))}
      </div>
      </div>
    </section>
  );
}

export default Projects;