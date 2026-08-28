import "./Transition.css";
import { motion } from "framer-motion";

function Transition() {
  return (
    <section className="skills-transition">
      <div className="transition-container">
        <motion.div
          className="transition-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="transition-title">
            I DON'T JUST LIST SKILLS.
            <br />
            I BUILD WITH THEM.
          </h2>
          
          <p className="transition-text">
            From digital marketing campaigns and conversion-focused landing pages to web applications and UX/UI concepts, every project is an opportunity to turn an idea into something tangible.
          </p>
          
          <motion.a
            href="#experience"
            className="btn-primary transition-cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            EXPLORE MY WORK →
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

export default Transition;