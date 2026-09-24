import "./projects.css";
import { motion, AnimatePresence } from "framer-motion";
import { FaExternalLinkAlt, FaGithub, FaTimes } from "react-icons/fa";

function ProjectModal({ project, onClose }) {
  if (!project) return null;

  const imageSrc =
    project.local_image ||
    project.localImage ||
    project.image_url ||
    project.imageUrl ||
    project.image ||
    project.file_url ||
    project.fileUrl;
  const localImageSrc = imageSrc?.startsWith("/images/") ? imageSrc : null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>

          <div className="modal-header">
            <div className="modal-image-wrapper">
              {localImageSrc ? (
                <img src={localImageSrc} alt={project.title} className="modal-image" />
              ) : (
                <div className="modal-image modal-image-placeholder" aria-hidden="true" />
              )}
            </div>
            <div className="modal-title-section">
              <span className="modal-category">{project.category}</span>
              <h2 className="modal-title">{project.title}</h2>
              <p className="modal-role">{project.role}</p>
            </div>
          </div>

          <div className="modal-body">
            <div className="modal-section">
              <h3 className="modal-section-title">Overview</h3>
              <p className="modal-text">{project.overview}</p>
            </div>

            <div className="modal-section">
              <h3 className="modal-section-title">The Challenge</h3>
              <p className="modal-text">{project.challenge}</p>
            </div>

            <div className="modal-section">
              <h3 className="modal-section-title">My Approach</h3>
              <p className="modal-text">{project.approach}</p>
            </div>

            <div className="modal-section">
              <h3 className="modal-section-title">My Role</h3>
              <p className="modal-text">{project.role}</p>
            </div>

            {project.process && project.process.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-section-title">Process</h3>
                <div className="process-steps">
                  {project.process.map((step, index) => (
                    <div key={index} className="process-step">
                      <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
                      <span className="step-text">{step}</span>
                      {index < project.process.length - 1 && <span className="step-arrow">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-section">
              <h3 className="modal-section-title">Tools & Technologies</h3>
              <div className="modal-tech">
                {project.technologies.map((tech, index) => (
                  <span key={index} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {project.keyFeatures && project.keyFeatures.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-section-title">Key Features / Deliverables</h3>
                <ul className="feature-list">
                  {project.keyFeatures.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-bullet">→</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="modal-section">
              <h3 className="modal-section-title">Outcome</h3>
              <p className="modal-text">{project.outcome}</p>
            </div>
          </div>

          <div className="modal-footer">
            <div className="modal-links">
              {project.demo && project.demo !== "#" && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary btn-with-icon"
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProjectModal;