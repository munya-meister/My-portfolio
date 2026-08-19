import "./Contact.css";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
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

const socialLinks = [
  {
    icon: <FaLinkedin />,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/munyaradzi-mbewe-digital-marketer/",
  },
  {
    icon: <FaGithub />,
    label: "GitHub",
    href: "https://github.com",
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
    const mailtoAddress = "munyaradzimbe@gmail.com";
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

  const field =
    "w-full border-b border-white/15 bg-transparent py-4 text-lg text-white outline-none placeholder:text-white/30 transition-colors focus:border-[#ed1745]";

  return (
    <section className="contact" id="contact">
      <div className="contact-background"></div>
      <div className="contact-overlay"></div>
      
      <div className="contact-container">
        <div className="contact-header">
          <p className="header-tag">LET'S WORK TOGETHER</p>
          <div className="header-title">
            <h2>START A</h2>
            <h2 className="title-white">PROJECT</h2>
          </div>
          <div className="header-content">
            <p className="editorial-text">
              Tell me what you're building and I'll come back with a plan.
            </p>
            <div className="header-location">
              <p>Harare</p>
              <p>Zimbabwe</p>
            </div>
          </div>
        </div>

        <div className="contact-grid">
          <aside className="contact-sidebar">
            <p className="sidebar-label">Contact</p>
            <div className="sidebar-section">
              <p className="sidebar-section-label">Email</p>
              <a
                href="mailto:munyaradzimbe@gmail.com"
                className="sidebar-link"
              >
                munyaradzimbe@gmail.com
              </a>
            </div>
            <div className="sidebar-section">
              <p className="sidebar-section-label">Availability</p>
              <p className="sidebar-text">Available for new opportunities.</p>
            </div>
            <div className="sidebar-section">
              <p className="sidebar-section-label">Social</p>
              <div className="sidebar-social">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="sidebar-social-link"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </aside>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <p className="form-label">Start a conversation</p>
              <span className="form-counter">01 / 04</span>
            </div>

            <div className="form-field">
              <label htmlFor="name" className="field-label">
                01 — Your name
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="Munyaradzi Mbewe"
                className={field}
                value={form.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.name ? (
                <span className="error-text">{errors.name}</span>
              ) : null}
            </div>

            <div className="form-field">
              <label htmlFor="email" className="field-label">
                02 — Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className={field}
                value={form.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.email ? (
                <span className="error-text">{errors.email}</span>
              ) : null}
            </div>

            <div className="form-field">
              <label htmlFor="subject" className="field-label">
                03 — Subject
              </label>
              <input
                id="subject"
                name="subject"
                required
                placeholder="What can I help you with?"
                className={field}
                value={form.subject}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.subject ? (
                <span className="error-text">{errors.subject}</span>
              ) : null}
            </div>

            <div className="form-field">
              <label htmlFor="message" className="field-label">
                04 — Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                placeholder="Tell me a little about your project..."
                className={`${field} resize-none`}
                value={form.message}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.message ? (
                <span className="error-text">{errors.message}</span>
              ) : null}
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

            <div className="form-submit">
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send message"}
                {!isSubmitting && <span>→</span>}
              </button>
              <span className="submit-note">
                Usually replies within 24–48 hours
              </span>
            </div>
          </form>
        </div>

        <footer className="contact-footer">
          <span>© {new Date().getFullYear()} Munyaradzi Mbewe</span>
          <span>Digital Marketing · Web Development · Creative Design</span>
        </footer>
      </div>
    </section>
  );
}

export default Contact;
