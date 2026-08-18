import "./services.css";

function Services() {
  const services = [
    {
      title: "Digital Marketing",
      desc: "Strategy, paid acquisition, content and analytics to grow brands.",
    },
    {
      title: "Web Development",
      desc: "Modern front-end experiences with React and clean build tooling.",
    },
    {
      title: "UI/UX Design",
      desc: "Editorial-led interfaces, prototyping and brand systems in Figma.",
    },
    {
      title: "SEO + AEO",
      desc: "Search-first content structure and technical optimizations.",
    },
    {
      title: "Content & Social Media",
      desc: "Social-first content strategy and production for audience growth.",
    },
    {
      title: "Creative Services",
      desc: "Visual direction, music writing and creative consulting.",
    },
  ];

  return (
    <section id="services" className="services">
      <div className="container">
        <div className="services-heading">
          <p>SERVICES</p>
          <h2>What I Do</h2>
          <span>Selected services offered with a premium editorial approach.</span>
        </div>

        <div className="services-grid">
          {services.map((s) => (
            <article className="service-card" key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;