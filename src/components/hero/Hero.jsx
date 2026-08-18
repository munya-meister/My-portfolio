import "./Hero.css";
import { useEffect, useState } from "react";
import heroBg from "../../assets/heroe.png";
import { fetchAbout } from "../../api";
import { downloadPublicFile } from "../../utils/downloadFile";

function Hero() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    let active = true;
    fetchAbout()
      .then((data) => {
        if (!active) return;
        setAbout((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const profileSrc = about && about.profilePic
    ? about.profilePic.startsWith("/uploads/")
      ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}${about.profilePic}`
      : about.profilePic
    : null;

  const handleDownloadCv = async () => {
    const url = about?.cvUrl || "/Munyaradzi CV.pdf";
    await downloadPublicFile(url, "Munyaradzi_Mbewe_CV.pdf");
  };

  return (
    <section id="home" className="hero editorial-hero"
      style={{
        backgroundImage: `
          linear-gradient(rgba(8, 8, 8, 0.92), rgba(8, 8, 8, 0.96)),
          url(${heroBg})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container">
        <div className="hero-grid">

          <div className="hero-left">
            <div className="intro-badge">HEY, THERE</div>

            <h1 className="hero-main">
              I AM
              <span className="hero-name">MUNYARADZI</span>
            </h1>

            <div className="roles">
              <div> DIGITAL MARKETER</div>
              <div> WEB DEVELOPER</div>
              <div> CREATIVE</div>
            </div>

            <p className="hero-copy">
              I combine marketing, technology and creativity to build digital
              experiences that help brands and creators grow.
            </p>

            <div className="hero-cta-row">
              <a className="primary-btn" href="#projects">View My Work</a>

              <button className="secondary-btn" onClick={handleDownloadCv}>
                Download CV
              </button>
            </div>

            <div className="status-badge">Available for new opportunities</div>
          </div>

          <div className="hero-right">
            {profileSrc ? (
              <div className="profile-wrap">
                <img src={profileSrc} alt="Munyaradzi Mbewe" className="profile-image" />
              </div>
            ) : (
              <div className="profile-wrap placeholder">MM</div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;