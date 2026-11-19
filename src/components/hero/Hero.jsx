import "./Hero.css";
import { useEffect, useState } from "react";
import { fetchAbout } from "../../api";

const CV_FILE = "/Munyaradzi%20CV.pdf";

const defaultAbout = {
  profilePic: "",
  availability: "",
  cvUrl: CV_FILE,
};

const columnItems = [
  {
    title: "Digital Marketing",
    body: "Web strategy, SEO, AEO and content.",
  },
  {
    title: "Web Development",
    body: "Modern responsive websites and applications.",
  },
  {
    title: "Creative Design",
    body: "UI/UX, visual design and digital experiences.",
  },
];

function Hero() {
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
    <section id="home" className="hero">
      <div className="hero-background"></div>
      <div className="hero-overlay"></div>
      <div className="hero-red-overlay"></div>

      <div className="hero-container">
        <div className="hero-grid">
          <div className="hero-main">
            <div className="eyebrow">HEY, THERE</div>

            <h1 className="hero-title">
              I AM
              <br />
              MUNYARADZI
            </h1>

            <p className="hero-roles">
              DIGITAL MARKETER • WEB DEVELOPER • CREATIVE DESIGNER
            </p>

            <p className="hero-statement">
              Specialised in digital marketing, web development and creative
              design.
            </p>

            <div className="hero-cta-row">
              <a
                href={CV_FILE}
                download="Munyaradzi_Mbewe_CV.pdf"
                className="primary-btn"
              >
                DOWNLOAD CV
              </a>

              <span className="availability-text">
                {about.availability ?? "Available for new opportunities"}
              </span>
            </div>
          </div>

          <aside className="hero-sidebar">
            {columnItems.map((item) => (
              <div key={item.title} className="sidebar-item">
                <p className="sidebar-title">{item.title}</p>
                <p className="sidebar-body">{item.body}</p>
              </div>
            ))}

            <div className="sidebar-location">
              <p className="sidebar-title">Based in Harare, Zimbabwe</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Hero;
