import "./achievements.css";
import initialCertifications from "./certificationsData";
import { useEffect, useState } from "react";
import { fetchCertificates } from "../../api";

function Achievements() {
  const [certificates, setCertificates] = useState(initialCertifications);
  const [activeFilter, setActiveFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchCertificates()
      .then((data) => {
        if (!active) return;

        if (Array.isArray(data) && data.length > 0) {
          setCertificates(
            data.map((certificate) => ({
              ...certificate,
              image:
                certificate.imageUrl ||
                certificate.fileUrl ||
                certificate.image ||
                "",
              skills: Array.isArray(certificate.skills)
                ? certificate.skills
                : typeof certificate.skills === "string"
                ? certificate.skills
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                : [],
            }))
          );
        }
      })
      .catch(() => {
        setError("Unable to load certificates.");
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = [
    "All",
    ...new Set(
      certificates
        .map((certificate) => certificate.category)
        .filter(Boolean)
    ),
  ];

  const filteredCertificates =
    activeFilter === "All"
      ? certificates
      : certificates.filter(
          (certificate) => certificate.category === activeFilter
        );

  return (
    <section className="achievements" id="certifications">
      <div className="achievements-container">

        {/* HEADER */}
        <div className="achievements-header">
          <h2 className="achievements-title">
            Certificates
          </h2>

          <p className="achievements-description">
            A collection of certifications and continuous learning
            across marketing, design, technology and digital skills.
          </p>
        </div>

        {/* FILTERS */}
        {categories.length > 1 && (
          <div className="certificate-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`certificate-filter ${
                  activeFilter === category ? "active" : ""
                }`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="certificate-error">
            {error}
          </p>
        )}

        {/* CERTIFICATE STRIP */}
        <div className="certificate-strip">
          {filteredCertificates.map((certificate, index) => (
            <figure
              key={certificate.id || index}
              className={`certificate-item ${
                index % 2 === 0
                  ? "certificate-large"
                  : "certificate-small"
              }`}
            >
              {/* IMAGE */}
              <div className="certificate-image-wrap">
                {certificate.url ? (
                  <a
                    href={certificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${certificate.title} certificate`}
                  >
                    <img
                      src={certificate.image}
                      alt={`${certificate.platform || "Certificate"} certificate: ${certificate.title}`}
                      loading="lazy"
                      className="certificate-image"
                    />
                  </a>
                ) : (
                  <img
                    src={certificate.image}
                    alt={`${certificate.platform || "Certificate"} certificate: ${certificate.title}`}
                    loading="lazy"
                    className="certificate-image"
                  />
                )}
              </div>

              {/* INFORMATION */}
              <figcaption>
                <span className="certificate-platform">
                  {certificate.platform}
                </span>

                <h3 className="certificate-name">
                  {certificate.title}
                </h3>

                {certificate.date && (
                  <span className="certificate-date">
                    {certificate.date}
                  </span>
                )}

                {/* SKILLS */}
                {certificate.skills?.length > 0 && (
                  <div className="certificate-skills">
                    {certificate.skills.map((skill, skillIndex) => (
                      <span key={skillIndex}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* BUTTONS */}
                {(certificate.url || certificate.verifyUrl) && (
                  <div className="certificate-actions">

                    {certificate.url && (
                      <a
                        href={certificate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="certificate-btn certificate-btn-primary"
                      >
                        View Certificate →
                      </a>
                    )}

                    {certificate.verifyUrl && (
                      <a
                        href={certificate.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="certificate-btn certificate-btn-secondary"
                      >
                        Verify Credential
                      </a>
                    )}

                  </div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Achievements;