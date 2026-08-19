import "./services.css";

const services = [
  {
    title: "Digital Marketing",
    body: "Full-funnel strategy, campaign builds and reporting.",
  },
  {
    title: "Web Development",
    body: "React and Django applications built to scale.",
  },
  {
    title: "UI/UX Design",
    body: "Interfaces designed around real user behaviour.",
  },
  {
    title: "SEO + AEO",
    body: "Technical SEO and answer-engine visibility.",
  },
  {
    title: "Social Media Marketing",
    body: "Content systems that grow organic reach.",
  },
  {
    title: "Creative Services",
    body: "Brand visuals, decks and digital assets.",
  },
];

function Services() {
  return (
    <section id="services" className="services">
      <div className="services-container">
        <div className="services-header">
          <div className="header-main">
            <p className="eyebrow">WHAT I DO</p>
            <h2 className="services-title">SERVICES</h2>
          </div>
          <div className="header-description">
            <p className="editorial-text">
              Strategy, design and technology working together to create
              digital work that delivers.
            </p>
          </div>
        </div>

        <div className="services-list">
          {services.map((service, i) => (
            <article key={service.title} className="service-item">
              <div className="service-item-grid">
                <span className="service-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.body}</p>
                <div className="service-arrow">
                  <span className="arrow-icon">↗</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="services-footer">
          <span>Strategy • Design • Development</span>
          <span>Harare, Zimbabwe</span>
        </div>
      </div>
    </section>
  );
}

export default Services;