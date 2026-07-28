import "./about.css";
import { useEffect, useState } from "react";
import profilePic from "../../assets/profilePic.png";
import aboutBg from "../../assets/heroe.png";
import { FaDownload, FaArrowRight } from "react-icons/fa";
import { fetchAbout } from "../../api";

const defaultAbout = {
  profilePic: "",
  heading: "Passionate About Building Brands, Websites & Creative Experiences.",
  bio1: "I'm Munyaradzi Mbewe, a Digital Marketer, Web Developer and Music Writer who enjoys combining creativity with technology to help businesses and creators grow online.",
  bio2: "From designing modern websites to creating high-converting marketing campaigns and writing music, I enjoy turning ideas into memorable digital experiences that leave a lasting impression.",
  cvUrl: "/cv.pdf",
  socials: {}
};

function About() {
  const [about, setAbout] = useState(defaultAbout);

  useEffect(() => {
    let active = true;
    fetchAbout()
      .then((data) => {
        if (!active) return;
        setAbout((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {
        // keep defaults
      });
    return () => {
      active = false;
    };
  }, []);

  const profileSrc = about.profilePic
    ? about.profilePic.startsWith("/uploads/")
      ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}${about.profilePic}`
      : about.profilePic
    : profilePic;

  return (
    <section className="about" id="about" style={{
        backgroundImage: `
          linear-gradient(rgba(8, 8, 8, 0.88), rgba(8, 8, 8, 0.92)),
          url(${aboutBg})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container">
        <div className="about-container">
          <div className="about-image">
            <div className="gold-line"></div>

            <div className="image-card">
              <img src={profileSrc} alt="Munyaradzi Mbewe" />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="about-content">

          <p className="section-tag">ABOUT ME</p>

          <h2>
            {about.heading}
          </h2>

          <p className="about-text">
            {about.bio1}
          </p>

          <p className="about-text">
            {about.bio2}
          </p>



          {/* BUTTONS */}

          <div className="about-buttons">

            <a className="primary-btn" href={about.cvUrl} download="Munyaradzi-Mbewe-CV.pdf">
              <FaDownload />
              Download CV
            </a>

            <a className="secondary-btn" href="#contact">
              Let's Talk
              <FaArrowRight />
            </a>

          </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
