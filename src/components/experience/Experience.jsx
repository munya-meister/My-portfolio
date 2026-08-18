import "./Experience.css";
import { motion } from "framer-motion";

const experienceData = [
  {
    role: "Digital Marketing Specialist",
    organization: "Company Name",
    period: "2023 - Present",
    description: "Led digital marketing campaigns, SEO optimization, and content strategy initiatives that drove measurable growth in engagement and conversions."
  },
  {
    role: "Web Developer",
    organization: "Company Name",
    period: "2022 - 2023",
    description: "Developed responsive web applications using React, integrated APIs, and implemented modern frontend solutions for client projects."
  },
  {
    role: "Creative Designer",
    organization: "Company Name",
    period: "2021 - 2022",
    description: "Created visual designs, brand identities, and marketing creatives using Figma and Canva for various digital campaigns."
  }
];

function Experience() {
  return (
    <section className="experience" id="experience">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">EXPERIENCE</span>
          <h2>Work History</h2>
        </motion.div>

        <div className="timeline">
          {experienceData.map((exp, index) => (
            <motion.div
              key={index}
              className="timeline-item"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className="timeline-content">
                <div className="timeline-period">{exp.period}</div>
                <h3 className="timeline-role">{exp.role}</h3>
                <div className="timeline-organization">{exp.organization}</div>
                <p className="timeline-description">{exp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
