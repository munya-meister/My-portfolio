import "./projects.css";
import { useEffect, useState } from "react";
import initialProjects from "./ProjectsData";
import ProjectCard from "./projectCard";
import ProjectModal from "./ProjectModal";
import { fetchProjects, createProject } from "../../api";

function Projects() {
  const [projects, setProjects] = useState(initialProjects);
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
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
              id: item.id || item._id,
              image: item.imageUrl || item.fileUrl || item.image || "",
              category: item.category || "Web Development",
              technologies: Array.isArray(item.technologies)
                ? item.technologies
                : typeof item.technologies === "string"
                  ? item.technologies
                      .split(",")
                      .map((tech) => tech.trim())
                      .filter(Boolean)
                  : [],
            })),
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

  const categories = [
    "All",
    "Digital Marketing",
    "Web Development",
    "UX/UI",
    "Creative Design",
  ];

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  const visibleProjects = filteredProjects.slice(
    currentIndex,
    currentIndex + 3,
  );

  const nextSlide = () => {
    if (currentIndex < filteredProjects.length - 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

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
          image: created.imageUrl || created.fileUrl || created.image || "",
          technologies: Array.isArray(created.technologies)
            ? created.technologies
            : typeof created.technologies === "string"
              ? created.technologies
                  .split(",")
                  .map((tech) => tech.trim())
                  .filter(Boolean)
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
    <section className="projects" id="projects">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">SELECTED WORK</span>
          <h2>Projects</h2>
        </div>

        <div className="filter-bar">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-chip ${activeFilter === category ? "active" : ""}`}
              onClick={() => {
                setActiveFilter(category);
                setCurrentIndex(0);
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="carousel-container">
          <button
            className="carousel-nav prev"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            aria-label="Previous projects"
          >
            ←
          </button>

          <div className="carousel-track">
            {visibleProjects.map((project, index) => (
              <ProjectCard
                key={project.id || `${currentIndex}-${index}`}
                project={project}
                onViewProject={handleViewProject}
              />
            ))}
          </div>

          <button
            className="carousel-nav next"
            onClick={nextSlide}
            disabled={currentIndex >= filteredProjects.length - 3}
            aria-label="Next projects"
          >
            →
          </button>
        </div>

        <div className="carousel-indicators">
          {filteredProjects.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={handleCloseModal} />
      )}
    </section>
  );
}

export default Projects;
