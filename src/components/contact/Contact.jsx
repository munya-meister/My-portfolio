import "./Contact.css";
import contactBg from "../../assets/heroe.png";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";

const contactMethods = [
  {
    icon: <FaEnvelope />,
    label: "Email",
    value: "munyaradzi.mbewe01@gmail.com",
    href: "mailto:munyaradzi.mbewe01@gmail.com",
  },
  {
    icon: <FaPhoneAlt />,
    label: "Phone",
    value: "+263 776 717 471",
    href: "tel:+263 719 692 697",
  },
  {
    icon: <FaMapMarkerAlt />,
    label: "Location",
    value: "Harare, Zimbabwe",
    href: "https://maps.google.com/?q=Harare+Zimbabwe",
  },
];

const socialLinks = [
  {
    icon: <FaGithub />,
    label: "GitHub",
    href: "https://github.com",
  },
  {
    icon: <FaLinkedin />,
    label: "LinkedIn",
    href: "https://linkedin.com",
  },
  {
    icon: <FaInstagram />,
    label: "Instagram",
    href: "https://instagram.com",
  },
];

function Contact() {
  const handleSubmit = (event) => {
    event.preventDefault();
    window.location.href =
      "mailto:munyaradzi.mbewe01@gmail.com?subject=Portfolio%20Inquiry";
  };

  return (
    <section
      className="contact"
      id="contact"
      style={{
        backgroundImage: `
          linear-gradient(rgba(8, 8, 8, 0.88), rgba(8, 8, 8, 0.92)),
          url(${contactBg})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container contact-shell">
        <motion.div
          className="contact-heading"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p>LET'S CONNECT</p>
          <h2>Let’s build a brand that feels unforgettable.</h2>
          <p className="contact-intro">
            Whether you need a polished website, a high-performing campaign, or
            a creative collaboration, I’m ready to turn your vision into
            something exceptional.
          </p>
        </motion.div>

        <div className="contact-grid">
          <motion.div
            className="contact-card contact-main"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3>Start a conversation</h3>
            <p>
              Available for freelance projects, consulting, and creative
              partnerships.
            </p>

            <div className="contact-list">
              {contactMethods.map((item) => (
                <a
                  key={item.label}
                  className="contact-item"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="contact-icon">{item.icon}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="contact-actions">
              <a className="primary-btn" href="mailto:munyaradzi@example.com">
                Mail Me
              </a>
              <a className="secondary-btn" href="#projects">
                Explore Projects
              </a>
            </div>
          </motion.div>

          <motion.form
            className="contact-card contact-form"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            onSubmit={handleSubmit}
          >
            <div className="form-row">
              <label>
                Name
                <input type="text" placeholder="Your name" />
              </label>
            </div>

            <div className="form-row">
              <label>
                Email
                <input type="email" placeholder="you@example.com" />
              </label>
            </div>

            <div className="form-row">
              <label>
                Project Type
                <input
                  type="text"
                  placeholder="Website, campaign, music project"
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Message
                <textarea rows="5" placeholder="Tell me about your idea..." />
              </label>
            </div>

            <button type="submit" className="primary-btn full-width">
              Send Message
            </button>

            <div className="social-links">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
