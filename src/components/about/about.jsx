import "./about.css";
import { useEffect, useState } from "react";
import { fetchAbout } from "../../api";
import { downloadPublicFile } from "../../utils/downloadFile";

const defaultAbout = {
  profilePic: "",
  heading: "EXPERT IN BUILDING BRANDS, WEBSITES & CREATIVE EXPERIENCES.",
  bio1: "I'm a digital professional who combines strategic marketing, technical development, and creative design to build comprehensive digital solutions.",
  bio2: "My approach integrates data-driven marketing strategies with modern web technologies and thoughtful design thinking to create experiences that connect with audiences and drive results.",
  cvUrl: "/Munyaradzi CV.pdf",
  availability: "Available for new opportunities",
};

function About() {
  const [about, setAbout] = useState(defaultAbout);
  const [downloadMessage, setDownloadMessage] = useState("");
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

  const profileSrc = about.profilePic
    ? about.profilePic.startsWith("/uploads/")
      ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}${about.profilePic}`
      : about.profilePic.startsWith("/images/")
        ? about.profilePic
        : `/images/${about.profilePic}`
    : "/images/portrait.png";

  const handleDownloadCv = async () => {
    setDownloadMessage("");
    const success = await downloadPublicFile(
      about.cvUrl || "/Munyaradzi CV.pdf",
      "Munyaradzi_Mbewe_CV.pdf",
    );
    if (success) {
      setDownloadMessage("Download started.");
    } else {
      setDownloadMessage(
        "The CV could not be downloaded right now. Please try again shortly.",
      );
    }
  };

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
                  alt={about.heading ? `Portrait of ${about.heading}` : "Portrait"}
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
              {about.bio1 && (
                <p className="bio-text">{about.bio1}</p>
              )}
              {about.bio2 && (
                <p className="bio-text">{about.bio2}</p>
              )}
            </div>

            <div className="about-actions">
              {about.cvUrl && (
                <a
                  href={about.cvUrl}
                  download
                  className="btn-primary"
                  onClick={handleDownloadCv}
                >
                  Download CV
                </a>
              )}

              {about.availability && (
                <span className="availability-text">
                  {about.availability}
                </span>
              )}
            </div>

            {downloadMessage && (
              <p className="download-feedback" role="status" aria-live="polite">
                {downloadMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
