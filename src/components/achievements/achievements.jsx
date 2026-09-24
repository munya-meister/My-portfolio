import "./achievements.css";
import initialCertifications from "./certificationsData";
import { useEffect, useRef, useState } from "react";
import { fetchCertificates } from "../../api";

function Achievements() {
  const [certificates, setCertificates] = useState(initialCertifications);
  const [activeFilter, setActiveFilter] = useState("All");
  const [error, setError] = useState("");

  const stripRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  /* ==============================
     LOAD CERTIFICATES
  ============================== */

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
                certificate.local_image ||
                certificate.localImage ||
                certificate.image_url ||
                certificate.imageUrl ||
                certificate.image ||
                certificate.file_url ||
                certificate.fileUrl ||
                null,

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

  /* ==============================
     FILTERS
  ============================== */

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

  /* ==============================
     RESET SCROLL WHEN FILTER CHANGES
  ============================== */

  useEffect(() => {
    if (stripRef.current) {
      stripRef.current.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
  }, [activeFilter]);

  /* ==============================
     MOUSE DRAG SCROLL
  ============================== */

  const handleMouseDown = (event) => {
    if (!stripRef.current) return;

    isDragging.current = true;
    startX.current = event.pageX - stripRef.current.offsetLeft;
    scrollLeft.current = stripRef.current.scrollLeft;

    stripRef.current.classList.add("is-dragging");
  };

  const handleMouseMove = (event) => {
    if (!isDragging.current || !stripRef.current) return;

    event.preventDefault();

    const x = event.pageX - stripRef.current.offsetLeft;
    const distance = x - startX.current;

    stripRef.current.scrollLeft =
      scrollLeft.current - distance * 1.2;
  };

  const handleMouseUp = () => {
    isDragging.current = false;

    if (stripRef.current) {
      stripRef.current.classList.remove("is-dragging");
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging.current) return;

    isDragging.current = false;

    if (stripRef.current) {
      stripRef.current.classList.remove("is-dragging");
    }
  };

  /* ==============================
     TOUCH SUPPORT
  ============================== */

  const handleTouchStart = (event) => {
    if (!stripRef.current) return;

    startX.current =
      event.touches[0].pageX - stripRef.current.offsetLeft;

    scrollLeft.current = stripRef.current.scrollLeft;
  };

  const handleTouchMove = (event) => {
    if (!stripRef.current) return;

    const x =
      event.touches[0].pageX - stripRef.current.offsetLeft;

    const distance = x - startX.current;

    stripRef.current.scrollLeft =
      scrollLeft.current - distance;
  };

  /* ==============================
     RENDER
  ============================== */

  return (
    <section className="achievements" id="certifications">
      <div className="achievements-container">

        {/* ==========================
            HEADER
        ========================== */}

        <div className="achievements-header">
          <h2 className="achievements-title">
            Certificates
          </h2>

          <p className="achievements-description">
            A collection of certifications and continuous learning
            across marketing, design, technology and digital skills.
          </p>
        </div>

        {/* ==========================
            FILTERS
        ========================== */}

        {categories.length > 1 && (
          <div className="certificate-filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
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

        {/* ==========================
            ERROR
        ========================== */}

        {error && (
          <p className="certificate-error">
            {error}
          </p>
        )}

        {/* ==========================
            CERTIFICATE STRIP
        ========================== */}

        <div
          ref={stripRef}
          className="certificate-strip"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {filteredCertificates.map((certificate, index) => (
            <figure
              key={certificate.id || index}
              className={`certificate-item ${
                index % 2 === 0
                  ? "certificate-large"
                  : "certificate-small"
              }`}
            >

              {/* ==========================
                  IMAGE
              ========================== */}

              <div className="certificate-image-wrap">
                {certificate.image && certificate.url ? (
                  <a
                    href={certificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    draggable="false"
                    aria-label={`View ${certificate.title} certificate`}
                    onClick={(event) => {
                      if (isDragging.current) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <img
                      src={certificate.image}
                      alt={`${certificate.platform || "Certificate"} certificate: ${certificate.title}`}
                      loading="lazy"
                      draggable="false"
                      className="certificate-image"
                    />
                  </a>
                ) : certificate.image ? (
                  <img
                    src={certificate.image}
                    alt={`${certificate.platform || "Certificate"} certificate: ${certificate.title}`}
                    loading="lazy"
                    draggable="false"
                    className="certificate-image"
                  />
                ) : (
                  <div className="certificate-image certificate-image-placeholder" aria-hidden="true" />
                )}
              </div>

              {/* ==========================
                  INFORMATION
              ========================== */}

              <figcaption>

                {/* Platform */}
                {certificate.platform && (
                  <span className="certificate-platform">
                    {certificate.platform}
                  </span>
                )}

                {/* Title */}
                <h3 className="certificate-name">
                  {certificate.title}
                </h3>

                {/* Date */}
                {certificate.date && (
                  <span className="certificate-date">
                    {certificate.date}
                  </span>
                )}

                {/* Skills */}
                {certificate.skills?.length > 0 && (
                  <div className="certificate-skills">
                    {certificate.skills.map(
                      (skill, skillIndex) => (
                        <span key={skillIndex}>
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* ==========================
                    BUTTONS
                ========================== */}

                {(certificate.url ||
                  certificate.verifyUrl) && (
                  <div
                    className="certificate-actions"
                    onMouseDown={(event) =>
                      event.stopPropagation()
                    }
                  >

                    {/* View Certificate */}
                    {certificate.url && (
                      <a
                        href={certificate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary btn-compact"
                      >
                        View Certificate →
                      </a>
                    )}

                    {/* Verify Credential */}
                    {certificate.verifyUrl && (
                      <a
                        href={certificate.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary btn-compact"
                      >
                        Verify Credential
                      </a>
                    )}

                  </div>
                )}

              </figcaption>
            </figure>
          ))}

          {/* Empty state */}
          {filteredCertificates.length === 0 && (
            <div className="certificate-empty">
              No certificates found in this category.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default Achievements;