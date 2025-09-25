import React, { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { PortfolioSection } from "./components/PortfolioSection";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { Routes, Route, Navigate, useNavigate, useLocation, matchPath } from "react-router-dom";
import ProjectPage from "./pages/ProjectPage";
import ChatbotWidget from "./components/ChatbotWidget";
import ScrollDots from "./components/ScrollDots";
import { useI18n } from "./i18n/I18nProvider";

const SECTIONS = ["about", "portfolio", "contact"] as const;

function HomePage() {
  return (
    <div
      id="scroll-container"
      className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth pt-20"
    >
      <AboutSection />
      <PortfolioSection />
      <ContactSection />
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState("about");
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useI18n();

  // Dots should be visible only on home pages like '/nl' or '/en'
  const isHome =
    !!matchPath({ path: "/:lang", end: true }, location.pathname) &&
    !matchPath({ path: "/:lang/project/:slug", end: false }, location.pathname);

  useEffect(() => {
    if (!isHome) return; // only attach logic on home pages
    const root = document.getElementById("scroll-container");
    if (!root) return;

    // IntersectionObserver for primary detection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root, threshold: 0.3, rootMargin: "-64px 0px -40% 0px" },
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Scroll-based fallback to keep dots responsive during snap animations
    const headerOffset = 80;
    const onScroll = () => {
      const positions = SECTIONS.map((id) => {
        const el = document.getElementById(id);
        if (!el) return { id, dist: Number.POSITIVE_INFINITY };
        const rect = el.getBoundingClientRect();
        // distance from header line
        const dist = Math.abs(rect.top - headerOffset);
        return { id, dist };
      }).sort((a, b) => a.dist - b.dist);
      const [first] = positions;
      if (first && first.dist !== Number.POSITIVE_INFINITY) {
        setActiveSection(first.id);
      }
    };
    root.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", onScroll);
    };
  }, [isHome, location.pathname]);

  const scrollToSection = (id: string) => {
    const doScroll = () => {
      const container = document.getElementById("scroll-container");
      const target = document.getElementById(id);
      if (!container || !target) return;
      const containerTop = container.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const currentScroll = container.scrollTop;
      const headerOffset = 80; // keep in sync with Header height
      const delta = targetTop - containerTop + currentScroll - headerOffset;
      container.scrollTo({ top: delta, behavior: "smooth" });
    };

    // If we are not on the home page (no internal scroll container), navigate then scroll
    if (!document.getElementById("scroll-container")) {
      navigate(`/${lang}`);
      // delay to allow home to mount before scrolling
      setTimeout(doScroll, 100);
      return;
    }
    doScroll();
  };

  return (
    <div className="bg-paper text-ink font-sans antialiased">
      <Header activeSection={activeSection} scrollToSection={scrollToSection} />
      {isHome && (
        <ScrollDots
          activeSection={activeSection}
          sections={SECTIONS as unknown as string[]}
          onSelect={scrollToSection}
        />
      )}
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
