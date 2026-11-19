import "./about.css";
import { useEffect, useState } from "react";
import { fetchAbout } from "../../api";

const CV_FILE = "/Munyaradzi_Mbewe_CV.pdf";

const defaultAbout = {
  profilePic: "",
  heading: "EXPERT IN BUILDING BRANDS, WEBSITES & CREATIVE EXPERIENCES.",
  bio1: "I'm a digital professional who combines strategic marketing, technical development, and creative design to build comprehensive digital solutions.",
  bio2: "My approach integrates data-driven marketing strategies with modern web technologies and thoughtful design thinking to create experiences that connect with audiences and drive results.",
  availability: "Available for new opportunities",
};

function About() {
  const [about, setAbout] = useState(defaultAbout);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchAbout().then((data) => {
      if (!active) return;
      setAbout((prev) => ({
        ...prev,
        ...data,
      }));
    });
    return () => {
      active = false;
    };
  }, []);

  const profileSrc = "/images/portrait.jpeg";

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <section className="about" id="about">
      <div className="about-background"></div>
      <div className="about-overlay"></div>

      <div className="about-container">
        <div className="about-grid">
          <div className="about-portrait">
            {!imageError && profileSrc ? (
              <div className="portrait-card">
                <img
                  src={profileSrc}
                  alt="Portrait of Munyaradzi Mbewe"
                  loading="lazy"
                  className="portrait-image"
                  onError={handleImageError}
                />
                <div className="portrait-label">“Munyaradzi Mbewe, a digital marketer, web developer and creative designer.”</div>
              </div>
            ) : (
              <div className="portrait-placeholder">
                <div className="placeholder-avatar">MM</div>
                <p className="placeholder-text">Portrait not available</p>
              </div>
            )}
          </div>

          <div className="about-content">
            <p className="eyebrow">ABOUT ME</p>

            <h2 className="about-heading">
              {about.heading || "Building brands, websites & creative experiences."}
            </h2>

            <div className="bio-paragraphs">
              {about.bio1 && <p className="bio-text">{about.bio1}</p>}
              {about.bio2 && <p className="bio-text">{about.bio2}</p>}
            </div>

            <div className="about-actions">
              <a
                href={CV_FILE}
                download="Munyaradzi_Mbewe_CV.pdf"
                className="btn-primary"
              >
                Download CV
              </a>

              {about.availability && (
                <span className="availability-text">
                  {about.availability}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
