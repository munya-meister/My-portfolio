import "./projects.css";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

function resolveImage(project) {
  const src = project.local_image || project.localImage || project.image_url || project.imageUrl || project.image || project.file_url || project.fileUrl;
  if (!src) return null;
  // Only deployable project-local assets are accepted for portfolio imagery.
  return src.startsWith("/images/") ? src : null;
}

function ProjectCard({ project, onViewProject }) {
  const imageSrc = resolveImage(project);
  const displayDescription = project.shortDescription || project.description;

  return (
    <div className="project-card">

      <div className="project-image-wrapper">
        {imageSrc ? (
          <img src={imageSrc} alt={project.title} className="project-image" />
        ) : (
          <div className="project-image project-image-placeholder" aria-hidden="true" />
        )}
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