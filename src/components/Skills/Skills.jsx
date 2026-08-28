import "./Skills.css";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

function Skills() {
  return (
    <section className="skills" id="skills">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">CAPABILITIES</span>
          <h2>What I Can Do</h2>
        </motion.div>

        <div className="skills-intro">
          <p className="skills-description">
            These are the tools and technologies I use to bring ideas to life. 
            The projects section shows how I apply them in real-world scenarios.
          </p>
        </div>

        <div className="skills-grid">
          <motion.div
            className="capability-card"
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="capability-title">Digital Marketing</h3>
            <div className="capability-tags">
              <span className="tag">Social Media Marketing</span>
              <span className="tag">SEO</span>
              <span className="tag">AEO</span>
              <span className="tag">Email Marketing</span>
              <span className="tag">Content Strategy</span>
              <span className="tag">Audience Research</span>
              <span className="tag">Analytics</span>
              <span className="tag">Campaign Strategy</span>
            </div>
          </motion.div>

          <motion.div
            className="capability-card"
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="capability-title">Web Development</h3>
            <div className="capability-tags">
              <span className="tag">React</span>
              <span className="tag">JavaScript</span>
              <span className="tag">HTML</span>
              <span className="tag">CSS</span>
              <span className="tag">Node.js</span>
              <span className="tag">Express</span>
              <span className="tag">Python</span>
              <span className="tag">Django</span>
            </div>
          </motion.div>

          <motion.div
            className="capability-card"
            custom={2}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="capability-title">Creative & UX</h3>
            <div className="capability-tags">
              <span className="tag">UI/UX Design</span>
              <span className="tag">Figma</span>
              <span className="tag">Canva</span>
              <span className="tag">Visual Design</span>
              <span className="tag">Wireframing</span>
              <span className="tag">Prototyping</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Skills;