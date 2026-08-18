import "./about.css";
import { useEffect, useState } from "react";
import { fetchAbout } from "../../api";

const defaultAbout = {
  profilePic: "",
  heading: "About Me",
  bio1: "I'm a digital professional who combines strategic marketing, technical development, and creative design to build comprehensive digital solutions.",
  bio2: "My approach integrates data-driven marketing strategies with modern web technologies and thoughtful design thinking to create experiences that connect with audiences and drive results.",
  socials: {},
};

function About() {
  const [about, setAbout] = useState(defaultAbout);

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

  return (
    <section className="about" id="about">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">ABOUT ME</span>
          <h2>{about.heading}</h2>
        </div>
        <div className="about-content">
          <p className="about-text">{about.bio1}</p>
          <p className="about-text">{about.bio2}</p>
        </div>
      </div>
    </section>
  );
}

export default About;
