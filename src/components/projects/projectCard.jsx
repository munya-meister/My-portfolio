import "./projects.css";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function resolveImage(src) {
  if (!src) return "";
  if (src.startsWith("/uploads/")) {
    return `${API_BASE}${src}`;
  }
  if (src.startsWith("http")) {
    return src;
  }
  if (src.startsWith("/images/")) {
    return src;
  }
  // Handle local file uploads and other paths
  return src;
}

function ProjectCard({ project, onViewProject }) {
  const imageSrc = resolveImage(project.imageUrl || project.image || project.fileUrl || "");
  const displayDescription = project.shortDescription || project.description;

  return (
    <div className="project-card">

      <div className="project-image-wrapper">
        <img
          src={imageSrc}
          alt={project.title}
          className="project-image"
        />
      </div>

      <div className="project-content">

        {project.category && (
          <span className="project-category">{project.category}</span>
        )}

        <h3 className="project-title">
          {project.title}
        </h3>

        <p className="project-description">
          {displayDescription}
        </p>

        <div className="project-tech">
          {project.technologies.map((tech, index) => (
            <span
              className="tech-tag"
              key={index}
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="project-links">

          <button
            onClick={() => onViewProject(project)}
            className="btn-primary btn-with-icon"
          >
            View Project →
          </button>

          {project.demo && project.demo !== "#" && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary btn-with-icon"
            >
              <FaExternalLinkAlt />
              Live Demo
            </a>
          )}

          {project.github && project.github !== "#" && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary btn-with-icon"
            >
              <FaGithub />
              Source Code
            </a>
          )}

        </div>

      </div>

    </div>
  );
}

export default ProjectCard;