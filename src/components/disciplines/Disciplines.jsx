import "./Disciplines.css";

function Disciplines() {
  return (
    <section className="disciplines" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">WHAT I DO</span>
          <h2>Services</h2>
        </div>
        <div className="disciplines-grid">
          <div className="discipline-card">
            <div className="discipline-icon">01</div>
            <h3 className="discipline-title">Digital Marketing</h3>
            <ul className="discipline-list">
              <li>SEO & AEO</li>
              <li>Content Strategy</li>
              <li>Social Media Marketing</li>
              <li>Paid Advertising</li>
              <li>Campaign Strategy</li>
              <li>Analytics & Optimisation</li>
            </ul>
          </div>

          <div className="discipline-card">
            <div className="discipline-icon">02</div>
            <h3 className="discipline-title">Web Development</h3>
            <ul className="discipline-list">
              <li>Responsive Websites</li>
              <li>React</li>
              <li>Front-End Development</li>
              <li>Backend/API Integration</li>
              <li>Modern Web Applications</li>
              <li>Deployment</li>
            </ul>
          </div>

          <div className="discipline-card">
            <div className="discipline-icon">03</div>
            <h3 className="discipline-title">Creative Design</h3>
            <ul className="discipline-list">
              <li>UI/UX Design</li>
              <li>Visual Design</li>
              <li>Brand Design</li>
              <li>Marketing Creatives</li>
              <li>Campaign Design</li>
              <li>Figma & Canva</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Disciplines;
