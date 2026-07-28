import "./projects.css";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function resolveImage(src) {
  if (!src) return "";
  return src.startsWith("/uploads/") ? `${API_BASE}${src}` : src;
}

function ProjectCard({ project }) {
  const imageSrc = resolveImage(project.imageUrl || project.image || project.fileUrl || "");

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

        <h3 className="project-title">
          {project.title}
        </h3>

        <p className="project-description">
          {project.description}
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

          <a
            href={project.demo}
            target="_blank"
            rel="noreferrer"
            className="project-btn primary-btn"
          >
            <FaExternalLinkAlt />
            Live Demo
          </a>

          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="project-btn secondary-btn"
          >
            <FaGithub />
            Source Code
          </a>

        </div>

      </div>

    </div>
  );
}

export default ProjectCard;