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
          <h2>Skills & Tools</h2>
        </motion.div>

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
              <span className="tag">SEO</span>
              <span className="tag">AEO</span>
              <span className="tag">Content Strategy</span>
              <span className="tag">Social Media</span>
              <span className="tag">Paid Advertising</span>
              <span className="tag">Analytics</span>
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
              <span className="tag">HTML</span>
              <span className="tag">CSS</span>
              <span className="tag">JavaScript</span>
              <span className="tag">React</span>
              <span className="tag">Node.js</span>
              <span className="tag">APIs</span>
              <span className="tag">Responsive Development</span>
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
            <h3 className="capability-title">Creative Design</h3>
            <div className="capability-tags">
              <span className="tag">UI/UX</span>
              <span className="tag">Figma</span>
              <span className="tag">Canva</span>
              <span className="tag">Visual Design</span>
              <span className="tag">Brand Design</span>
              <span className="tag">Marketing Creatives</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Skills;