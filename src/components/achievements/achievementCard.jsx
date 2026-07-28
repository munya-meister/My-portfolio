import "./achievements.css";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function resolveImage(src) {
  if (!src) return "";
  return src.startsWith("/uploads/") ? `${API_BASE}${src}` : src;
}

function AchievementCard({ certificate, index }) {
  const handleOpenLink = (url, event) => {
    event.preventDefault();
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const imageSrc = resolveImage(certificate.imageUrl || certificate.image);

  return (
    <motion.article
      className="achievement-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.06 }}
      whileHover={{ y: -8, scale: 1.01 }}
    >
      <div className="achievement-image-wrap">
        <motion.img
          className="achievement-image"
          src={imageSrc}
          alt={certificate.title}
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="achievement-content">
        <div className="achievement-platform">{certificate.platform}</div>
        <h3 className="achievement-title">{certificate.title}</h3>
        <p className="achievement-date">Completed {certificate.date}</p>

        <div className="achievement-skills">
          {certificate.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>

        <div className="achievement-actions">
          <a
            className="view-btn"
            href={certificate.url}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => handleOpenLink(certificate.url, event)}
          >
            View Certificate
          </a>
          {certificate.verifyUrl && (
            <a
              className="verify-btn"
              href={certificate.verifyUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => handleOpenLink(certificate.verifyUrl, event)}
            >
              Verify Credential
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default AchievementCard;