import "./Resume.css";
import resumeBg from "../../assets/heroe.png";
import { motion } from "framer-motion";
import { FaDownload, FaEye, FaMapMarkerAlt, FaEnvelope, FaLanguage, FaGraduationCap, FaCalendarAlt } from "react-icons/fa";

const timelineItems = [
  {
    title: "Digital Marketing Specialist",
    period: "2026 — Present",
    detail: "Leading brand strategy, paid media campaigns, SEO, and conversion-focused growth initiatives.",
    type: "Experience",
  },
  {
    title: "Freelance Web Developer",
    period: "2026 — Present",
    detail: "Crafting responsive websites and immersive web experiences using React, Vite, and modern UI systems.",
    type: "Experience",
  },
  {
    title: "Creative Media & Branding",
    period: "2026 — Present",
    detail: "Developing visual identities, content strategy, and multimedia production for modern brands.",
    type: "Experience",
  },
  {
    title: "Digital Marketing",
    period: "2026 — 2027",
    detail: "Built a strong foundation in communication, technology, creativity, and strategic thinking.",
    type: "Education",
  },
  {
    title: "Professional Certifications",
    period: "2026 — 2027",
    detail: "Expanded my expertise through Google, Coursera, UXcel, and Meta learning pathways.",
    type: "Certifications",
  },
];

const skills = [
  "React",
  "JavaScript",
  "SEO",
  "Google Ads",
  "Meta Ads",
  "Branding",
  "Canva",
  "Photoshop",
  "Analytics",
  "UI/UX",
  "Content Strategy",
];

const stats = [
  { value: "20+", label: "Projects Completed" },
  { value: "12+", label: "Professional Certifications" },
  { value: "2", label: "Areas of Expertise" },
  { value: "1+", label: "Years Continuous Learning" },
];

const profileDetails = [
  { icon: <FaMapMarkerAlt />, label: "Location", value: "Harare, Zimbabwe" },
  {
    icon: <FaEnvelope />,
    label: "Email",
    value: "munyaradzi.mbewe01@gmail.com",
  },
  { icon: <FaLanguage />, label: "Languages", value: "English, Shona" },
  {
    icon: <FaGraduationCap />,
    label: "Education",
    value: "Digital Marketing/ Creative Tech",
  },
  {
    icon: <FaCalendarAlt />,
    label: "Availability",
    value: "Open for projects & collaborations",
  },
];

function Resume() {
  return (
    <section
      className="resume"
      id="resume"
      style={{
        backgroundImage: `
          linear-gradient(rgba(8, 8, 8, 0.88), rgba(8, 8, 8, 0.92)),
          url(${resumeBg})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container resume-shell">
        <motion.div
          className="resume-heading"
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-tag">RESUME</p>
          <h2>Resume</h2>
          <p className="resume-subtitle">My Professional Journey.</p>
        </motion.div>

        <div className="resume-grid">
          <div className="resume-main">
            <motion.div
              className="resume-intro-card"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p>
                I’m a multidisciplinary digital professional with experience across
                Digital Marketing, Web Development, Branding, and Creative Media.
                I combine strategy, design, and technology to build thoughtful,
                high-impact digital experiences for brands and creators.
              </p>
            </motion.div>

            <motion.div
              className="resume-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="timeline">
                {timelineItems.map((item, index) => (
                  <motion.div
                    className="timeline-item"
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.08 }}
                  >
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <span className="timeline-type">{item.type}</span>
                        <span>{item.period}</span>
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="resume-sidebar">
            <motion.div
              className="resume-card profile-card"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="profile-card-header">
                <h3>Professional Profile</h3>
              </div>
              <div className="profile-list">
                {profileDetails.map((detail) => (
                  <div className="profile-item" key={detail.label}>
                    <span className="profile-icon">{detail.icon}</span>
                    <div>
                      <strong>{detail.label}</strong>
                      <p>{detail.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="resume-card"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h3>Core Competencies</h3>
              <div className="skill-badges">
                {skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="resume-card stats-card"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="stats-grid">
                {stats.map((stat) => (
                  <div className="stat-pill" key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="resume-card resume-action-card"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h3>Professional Resume</h3>
              <div className="resume-actions">
                <a className="view-btn" href="/resume/resume.pdf" target="_blank" rel="noreferrer">
                  <FaEye />
                  View Resume
                </a>
                <a className="download-btn" href="/resume/resume.pdf" download="Munyaradzi-Mbewe-Resume.pdf">
                  <FaDownload />
                  Download Resume
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Resume;
