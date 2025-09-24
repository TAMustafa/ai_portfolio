import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { PortfolioSection } from './components/PortfolioSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProjectPage from './pages/ProjectPage';
import ChatbotWidget from './components/ChatbotWidget';
import ScrollDots from './components/ScrollDots';

function HomePage() {
  return (
    <div id="scroll-container" className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth pt-20">
      <AboutSection />
      <PortfolioSection />
      <ContactSection />
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('about');
  const sections = ['about', 'portfolio', 'contact'];

  useEffect(() => {
    const root = document.getElementById('scroll-container');
    if (!root) return;
    // Account for the fixed Header (~80px height) so a section is considered active
    // when its content is visible below the header. rootMargin shrinks the top
    // of the viewport for intersection calculations.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root, threshold: 0.5, rootMargin: '-80px 0px -30% 0px' }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const container = document.getElementById('scroll-container');
    const target = document.getElementById(id);
    if (!container || !target) return;
    // Scroll the internal container so we don't affect the body scroll.
    const containerTop = container.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const currentScroll = container.scrollTop;
    const headerOffset = 80; // keep in sync with Header height
    const delta = targetTop - containerTop + currentScroll - headerOffset;
    container.scrollTo({ top: delta, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-900 text-gray-200 font-sans antialiased">
      <Header activeSection={activeSection} scrollToSection={scrollToSection} />
      <ScrollDots activeSection={activeSection} sections={sections} onSelect={scrollToSection} />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/nl" replace />} />
          <Route path=":lang" element={<HomePage />} />
          <Route path=":lang/project/:slug" element={<ProjectPage />} />
        </Routes>
      </main>
      {/* Floating chatbot available site-wide */}
      <ChatbotWidget />
      <Footer />
    </div>
  );
}
