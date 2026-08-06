import "./Contact.css";
import { useState } from "react";
import contactBg from "../../assets/heroe.png";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { sendContactMessage } from "../../api";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const contactMethods = [
  {
    icon: <FaEnvelope />,
    label: "Email",
    value: "munyaradzi.mbewe01@gmail.com",
    href: "https://mail.google.com/mail/?view=cm&to=munyaradzi.mbewe01@gmail.com",
  },
  {
    icon: <FaPhoneAlt />,
    label: "Phone",
    value: "+263 776 717 471",
    href: "tel:+263719692697",
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
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [mailtoUrl, setMailtoUrl] = useState("");

  const buildMailtoLink = ({ name, email, subject, message }) => {
    const mailtoAddress = contactMethods[0].value;
    const mailSubject = encodeURIComponent(subject || "Portfolio Contact");
    const mailBody = encodeURIComponent(
      `Name: ${name}
Email: ${email}

Subject: ${subject}

Message:
${message}`
    );

    return `mailto:${mailtoAddress}?subject=${mailSubject}&body=${mailBody}`;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));

    if (feedback.message) {
      setFeedback({ type: "", message: "" });
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.subject.trim()) {
      nextErrors.subject = "Please enter a subject.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Please enter your message.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setFeedback({
        type: "error",
        message: "Please fix the highlighted fields before sending.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });
    setMailtoUrl("");

    try {
      const result = await sendContactMessage(form);

      if (result?.success) {
        if (result.fallback) {
          const fallbackLink = buildMailtoLink(form);
          setMailtoUrl(fallbackLink);
          setFeedback({
            type: "error",
            message:
              "The message was received, but the mail service is not currently available. Use the button below to send it directly via your email client.",
          });
        } else {
          setFeedback({
            type: "success",
            message: result.message || "Message sent successfully.",
          });
          setForm(initialForm);
        }
      } else {
        throw new Error(result?.message || "Unable to send message.");
      }
    } catch (error) {
      const fallbackLink = buildMailtoLink(form);
      setMailtoUrl(fallbackLink);
      setFeedback({
        type: "error",
        message:
          error.message ||
          "Could not reach the contact server. Use the button below to send your message directly via email.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <a
                className="primary-btn"
                href="https://mail.google.com/mail/?view=cm&to=munyaradzi.mbewe01@gmail.com"
                target="_blank"
                rel="noreferrer"
              >
                Write Me
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
              <label htmlFor="name">
                Name
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                  disabled={isSubmitting}
                />
                {errors.name ? (
                  <span className="error-text">{errors.name}</span>
                ) : null}
              </label>
            </div>

            <div className="form-row">
              <label htmlFor="email">
                Email
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  disabled={isSubmitting}
                />
                {errors.email ? (
                  <span className="error-text">{errors.email}</span>
                ) : null}
              </label>
            </div>

            <div className="form-row">
              <label htmlFor="subject">
                Subject
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Website, campaign, music project"
                  value={form.subject}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.subject)}
                  disabled={isSubmitting}
                />
                {errors.subject ? (
                  <span className="error-text">{errors.subject}</span>
                ) : null}
              </label>
            </div>

            <div className="form-row">
              <label htmlFor="message">
                Message
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Tell me about your idea..."
                  value={form.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.message)}
                  disabled={isSubmitting}
                />
                {errors.message ? (
                  <span className="error-text">{errors.message}</span>
                ) : null}
              </label>
            </div>

            {feedback.message ? (
              <div
                className={`form-status ${feedback.type}`}
                role="status"
                aria-live="polite"
              >
                {feedback.type === "success" ? (
                  <FaCheckCircle />
                ) : (
                  <FaTimesCircle />
                )}
                <span>{feedback.message}</span>
              </div>
            ) : null}

            {mailtoUrl ? (
              <a
                className="secondary-btn full-width"
                href={mailtoUrl}
                target="_blank"
                rel="noreferrer"
              >
                Send via email client
              </a>
            ) : null}

            <button
              type="submit"
              className="primary-btn full-width"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="spinner" />
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Send Message
                </>
              )}
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
