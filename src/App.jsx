import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/hero/Hero";
import About from "./components/about/about";
import Skills from "./components/Skills/Skills";
import Transition from "./components/transition/Transition";
import Experience from "./components/experience/Experience";
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
            <Transition />
            <Experience />
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

