import "./Experience.css";

function Experience() {
  return (
    <section className="experience" id="experience">
      <div className="experience-background"></div>
      <div className="experience-overlay"></div>
      
      <div className="experience-container">
        <div className="experience-header">
          <div className="header-main">
            <p className="eyebrow">PROOF OF WORK</p>
            <h2 className="experience-title">
              EXPERIENCE
              <br />
              &amp; PROJECTS
            </h2>
          </div>
          <div className="header-description">
            <p className="editorial-text">
              Real projects. Real results.
              <br />
              Real impact.
            </p>
            <p className="description-text">
              I don't just list skills — I use them to build actual solutions. 
              From digital marketing campaigns and web applications to brand identities 
              and user experiences, every project demonstrates practical application 
              of marketing, development, and design expertise.
            </p>
          </div>
        </div>

        <div className="experience-intro">
          <p className="intro-text">
            The skills section shows what I know. The projects below show what I've built with that knowledge.
          </p>
          <a href="#projects" className="btn-primary">
            View All Projects →
          </a>
        </div>

        <div className="experience-highlights">
          <div className="highlight-item">
            <div className="highlight-number">08+</div>
            <div className="highlight-label">Completed Projects</div>
          </div>
          <div className="highlight-item">
            <div className="highlight-number">03</div>
            <div className="highlight-label">Core Disciplines</div>
          </div>
          <div className="highlight-item">
            <div className="highlight-number">100%</div>
            <div className="highlight-label">Real Work</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Experience;
