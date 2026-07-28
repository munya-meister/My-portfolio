import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/navbar";
import Hero from "./components/hero/Hero";
import About from "./components/about/about";
import Skills from "./components/skills/skills";
import Projects from "./components/projects/projects";
import Achievements from "./components/achievements/achievements";
import Contact from "./components/contact/Contact";
import Footer from "./components/footer/Footer";
import Admin from "./pages/Admin";

function App() {
  return (
    <>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={
          <>
            <Navbar />
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Achievements />
            <Contact />
            <Footer />
          </>
        } />
      </Routes>
    </>
  );
}

export default App;

