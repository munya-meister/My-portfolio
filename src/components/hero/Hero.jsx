import "./Hero.css";
import heroBg from "../../assets/heroe.png";
import { FaRocket, FaChartLine, FaGraduationCap } from "react-icons/fa";

function Hero() {
  return (
    <section id="home" className="hero"
      style={{
        backgroundImage: `
          linear-gradient(rgba(8, 8, 8, 0.88), rgba(8, 8, 8, 0.92)),
          url(${heroBg})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container">
        <div className="hero-content">
          <p className="hero-intro">HELLO, I'M</p>

          <h1>Munyaradzi Mbewe</h1>

          <h2>Digital Marketer | Content Creator | Web Developer </h2>

          <p className="hero-description">
            Helping businesses and creators build powerful digital experiences
            through marketing, technology, and creativity.
          </p>

          <div className="hero-buttons">
            <a className="secondary-btn" href="#contact">
              Contact Me
            </a>
          </div>


          <div className="stats-container">
            <div className="stat-card">
              <FaRocket className="stat-icon" />
              <h3>6</h3>
              <p>Projects Completed</p>
            </div>

            <div className="stat-card">
              <FaChartLine className="stat-icon" />
              <h3>10</h3>
              <p>Marketing Campaigns</p>
            </div>

            <div className="stat-card">
              <FaGraduationCap className="stat-icon" />
              <h3>1</h3>
              <p>Years Learning & Building</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;