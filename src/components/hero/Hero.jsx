import "./Hero.css";
import { useEffect, useState } from "react";
import { fetchAbout } from "../../api";
import { downloadPublicFile } from "../../utils/downloadFile";

const defaultAbout = {
  profilePic: "",
  availability: "Available for new opportunities",
  cvUrl: "/Munyaradzi CV.pdf",
};

function Hero() {
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
      : about.profilePic
    : null;

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
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-left">
            <div className="intro-badge">HEY,</div>

            <h1 className="hero-main">
              I'M
              <span className="hero-name">MUNYARADZI.</span>
            </h1>

            <div className="roles" aria-label="Professional roles">
              <span>DIGITAL MARKETER</span>
              <span className="separator">•</span>
              <span>WEB DEVELOPER</span>
              <span className="separator">•</span>
              <span>CREATIVE DESIGNER</span>
            </div>

            <p className="hero-statement">
              I create digital experiences that combine strategy, technology and creative design.
            </p>

            <div className="hero-cta-row">
              <button className="primary-btn" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
                VIEW MY WORK
              </button>
              <button className="secondary-btn" onClick={handleDownloadCv}>
                DOWNLOAD CV
              </button>
            </div>

            {about.availability && (
              <div className="availability-badge">
                <span className="availability-dot"></span>
                {about.availability}
              </div>
            )}

            {downloadMessage && (
              <p className="download-feedback" role="status" aria-live="polite">
                {downloadMessage}
              </p>
            )}
          </div>

          <div className="hero-right">
            <div className="portrait-card">
              {!imageError && profileSrc ? (
                <img
                  src={profileSrc}
                  alt="Munyaradzi Mbewe"
                  className="portrait-image"
                  onError={handleImageError}
                />
              ) : null}
              <div className="portrait-info">
                <div className="portrait-name">MUNYARADZI MBEWE</div>
                <div className="portrait-roles">
                  <span>Digital Marketing</span>
                  <span>Web Development</span>
                  <span>Creative Design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
