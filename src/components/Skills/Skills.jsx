import "./Skills.css";

import skillsBg from "../../assets/heroe.png";
import { motion } from "framer-motion";

import {
  FaLaptopCode,
  FaHtml5,
  FaCss3Alt,
  FaJsSquare,
  FaReact,
  FaWordpress,
  FaMusic,
  FaPaintBrush,
  FaMicrophone,
  FaBullhorn,
} from "react-icons/fa";

import {
  SiGoogleads,
  SiMeta,
  SiGoogleanalytics,
} from "react-icons/si";

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 80,
  },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

const SkillBar = ({ icon, name, level, className }) => {
  return (
    <motion.div
      className="skill-item"
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="skill-info">
        <div className="skill-name">
          <div className="skill-icon">
            {icon}
          </div>

          <span>{name}</span>
        </div>

        
      </div>

      <div className="progress">
        <motion.div
          className={`progress-fill ${className}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{
            duration: 1.6,
            ease: "easeOut",
          }}
        />
      </div>
    </motion.div>
  );
};

function Skills() {
  return (
    <section className="skills" id="skills" style={{
        backgroundImage: `
          linear-gradient(rgba(8, 8, 8, 0.88), rgba(8, 8, 8, 0.92)),
          url(${skillsBg})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container">
        <motion.div
          className="skills-heading"
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p>MY SKILLS</p>

        <h2>
          Technologies, Marketing & Creative Tools
        </h2>

      </motion.div>

      <div className="skills-grid">

        {/* WEB DEVELOPMENT */}

        <motion.div
          className="skill-card"
          custom={0}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >

          <h3 className="card-title">
            <div className="title-icon">
              <FaLaptopCode />
            </div>

            <span>Web Development</span>
          </h3>

          <SkillBar icon={<FaHtml5 />} name="HTML5"className="html"/>

          <SkillBar icon={<FaCss3Alt />} name="CSS3"className="css"/>

          <SkillBar icon={<FaJsSquare />} name="JavaScript"className="js"/>

          <SkillBar icon={<FaReact />} name="React"className="react"/>

          <SkillBar icon={<FaWordpress />} name="WordPress"className="wordpress"/>

        </motion.div>

        {/* DIGITAL MARKETING */}

        <motion.div
          className="skill-card"
          custom={1}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >

          <h3 className="card-title">

            <div className="title-icon">
              <FaBullhorn />
            </div>

            <span>Digital Marketing</span>

          </h3>

          <SkillBar icon={<SiGoogleads />} name="Google Ads"className="ads"/>

          <SkillBar icon={<SiMeta />} name="Meta Ads"className="meta"/>

          <SkillBar icon={<SiGoogleanalytics />} name="Analytics" className="analytics"/>

          <SkillBar icon={<FaBullhorn />} name="SEO"className="seo"/>

          <SkillBar icon={<FaPaintBrush />} name="Canva"className="canva"/>

        </motion.div>

        {/* CREATIVE */}

        <motion.div
          className="skill-card"
          custom={2}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >

          <h3 className="card-title">

            <div className="title-icon">
              <FaMusic />
            </div>

            <span>Creative Tools</span>

          </h3>

          <SkillBar icon={<FaMusic />} name="FL Studio" className="fl"/>

          <SkillBar icon={<FaMicrophone />} name="Music Production"className="music"/>

          <SkillBar icon={<FaPaintBrush />} name="Adobe Photoshop"className="photoshop"/>

          <SkillBar icon={<FaMicrophone />} name="Premiere Pro"className="premiere"/>

          <SkillBar icon={<FaBullhorn />} name="Brand Strategy"className="branding"/>

        </motion.div>

      </div>
    </div>
  </section>
      
  );
}

export default Skills;