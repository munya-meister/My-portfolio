import "./Footer.css";
import { FaHeart, FaArrowUp } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-shell">
        <div className="footer-brand">
          <div className="footer-logo">MM</div>
          <p>
            Creating refined digital experiences through strategy, design, and
            storytelling.
          </p>
        </div>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </div>

        <a className="back-to-top" href="#home" aria-label="Back to top">
          <FaArrowUp />
        </a>
      </div>

      <div className="container footer-bottom">
        <p>
          © 2026 Munyaradzi Mbewe. Crafted with love for impact.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
