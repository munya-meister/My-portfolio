import "./achievements.css";
import AchievementCard from "./achievementCard";
import initialCertifications from "./certificationsData";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchCertificates, createCertificate } from "../../api";

function Achievements() {
  const [certificates, setCertificates] = useState(initialCertifications);
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    platform: "",
    date: "",
    category: "",
    skills: "",
    url: "",
    verifyUrl: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCertificates()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setCertificates(
            data.map((certificate) => ({
              ...certificate,
              image: certificate.imageUrl || certificate.fileUrl || certificate.image || "",
              skills: Array.isArray(certificate.skills)
                ? certificate.skills
                : typeof certificate.skills === "string"
                ? certificate.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
                : [],
            }))
          );
        }
      })
      .catch(() => {
        setError("Unable to load backend certificates, using local data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = ["All", ...new Set(certificates.map((certificate) => certificate.category))];

  const filteredCertifications =
    activeFilter === "All"
      ? certificates
      : certificates.filter((certificate) => certificate.category === activeFilter);

  const visibleCertificates = filteredCertifications.slice(currentIndex, currentIndex + 3);

  const nextSlide = () => {
    if (currentIndex < filteredCertifications.length - 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setFormData((current) => ({ ...current, file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.platform.trim()) {
      return;
    }

    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("platform", formData.platform.trim());
    payload.append("date", formData.date.trim() || "Recently completed");
    payload.append("category", formData.category.trim() || "General");
    payload.append("skills", formData.skills.trim());
    payload.append("url", formData.url.trim());
    payload.append("verifyUrl", formData.verifyUrl.trim());
    if (formData.file) {
      payload.append("file", formData.file);
    }

    try {
      const created = await createCertificate(payload);
      setCertificates((current) => [
        {
          ...created,
          image: created.imageUrl || created.fileUrl || created.image,
          skills: Array.isArray(created.skills)
            ? created.skills
            : typeof created.skills === "string"
            ? created.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
            : [],
        },
        ...current,
      ]);
    } catch (err) {
      setError("Could not save certificate to backend. Check server connection.");
    }

    setFormData({
      title: "",
      platform: "",
      date: "",
      category: "",
      skills: "",
      url: "",
      verifyUrl: "",
      file: null,
    });
    setShowForm(false);
  };

  return (
    <section className="achievements" id="certifications">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-tag">CERTIFICATES & ACHIEVEMENTS</span>
          <h2>Certificates & Achievements</h2>
          <p>
            A curated collection of qualifications, hands-on learning, and
            continuous growth across marketing, design, and modern technology.
          </p>
        </motion.div>

        <div className="filter-bar">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-chip ${activeFilter === category ? "active" : ""}`}
              onClick={() => {
                setActiveFilter(category);
                setCurrentIndex(0);
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="add-certificate-wrap" />

        {error && <p className="error-message">{error}</p>}

        <div className="carousel-container">
          <button
            className="carousel-nav prev"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            aria-label="Previous certificates"
          >
            ←
          </button>

          <div className="carousel-track">
            {visibleCertificates.map((certificate, index) => (
              <AchievementCard
                key={certificate.id || `${currentIndex}-${index}`}
                certificate={certificate}
                index={index}
              />
            ))}
          </div>

          <button
            className="carousel-nav next"
            onClick={nextSlide}
            disabled={currentIndex >= filteredCertifications.length - 3}
            aria-label="Next certificates"
          >
            →
          </button>
        </div>

        <div className="carousel-indicators">
          {filteredCertifications.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Achievements;