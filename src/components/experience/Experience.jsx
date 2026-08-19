import "./Experience.css";

const rows = [
  {
    years: "01",
    title: "Digital Marketing",
    description:
      "Building digital growth strategies that connect brands with the right audiences.",
    tags: ["SEO", "AEO", "Social Media", "Content Strategy", "Analytics"],
  },
  {
    years: "02",
    title: "Creative Design",
    description:
      "Creating visual identities, interfaces and marketing creatives that communicate clearly.",
    tags: ["UI/UX", "Figma", "Canva", "Graphic Design"],
  },
  {
    years: "03",
    title: "Web Development",
    description:
      "Designing and developing responsive digital experiences from interface to deployment.",
    tags: ["React", "JavaScript", "Python", "Django", "HTML/CSS", "Git/GitHub"],
  },
];

function Experience() {
  return (
    <section className="experience" id="experience">
      <div className="experience-background"></div>
      <div className="experience-overlay"></div>
      
      <div className="experience-container">
        <div className="experience-header">
          <div className="header-main">
            <p className="eyebrow">CAPABILITIES</p>
            <h2 className="experience-title">
              EXPERIENCE
              <br />
              &amp; SKILLS
            </h2>
          </div>
          <div className="header-description">
            <p className="editorial-text">
              Three disciplines. One approach:
              <br />
              build work that performs.
            </p>
            <p className="description-text">
              I work across marketing, design and development, bringing
              strategy and execution together to create useful digital
              experiences.
            </p>
          </div>
        </div>

        <div className="experience-list">
          {rows.map((row) => (
            <article key={row.title} className="experience-item">
              <div className="experience-item-grid">
                <div className="item-number">
                  <span>{row.years}</span>
                </div>
                <div className="item-content">
                  <h3 className="item-title">{row.title}</h3>
                  <p className="item-description">{row.description}</p>
                </div>
                <div className="item-skills">
                  {row.tags.map((tag) => (
                    <span key={tag} className="skill-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="experience-stats">
          <div className="stat-item">
            <p className="stat-number">08</p>
            <p className="stat-label">Projects</p>
          </div>
          <div className="stat-item">
            <p className="stat-number">03</p>
            <p className="stat-label">Disciplines</p>
          </div>
          <div className="stat-item">
            <p className="stat-number">06+</p>
            <p className="stat-label">Core Tools</p>
          </div>
          <div className="stat-item">
            <p className="stat-number">01</p>
            <p className="stat-label">Creative Direction</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Experience;
