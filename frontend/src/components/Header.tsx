import React, { useState } from "react";
import { Bot, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "../i18n/I18nProvider";

export interface HeaderProps {
  activeSection: string;
  scrollToSection: (id: string) => void;
}

export function Header({ activeSection, scrollToSection }: HeaderProps) {
  const { t, lang, setLang } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { key: "about", label: t("nav.about") },
    { key: "portfolio", label: t("nav.portfolio") },
    { key: "contact", label: t("nav.contact") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-paper/80 backdrop-blur-sm shadow-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-indigo-400" />
            <span className="ml-3 text-2xl font-bold tracking-tighter">{t("common.brand")}</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => scrollToSection(item.key)}
                className={`text-sm font-medium transition-colors duration-300 relative ${
                  activeSection === item.key ? "text-link" : "muted hover:text-link"
                }`}
              >
                {item.label}
                {activeSection === item.key && (
                  <motion.div
                    className="absolute bottom-[-8px] left-0 right-0 h-0.5 bg-link"
                    layoutId="underline"
                  />
                )}
              </button>
            ))}
            <button
              onClick={() => setLang(lang === "nl" ? "en" : "nl")}
              className="p-2 rounded-md muted hover:text-ink hover:bg-surface transition-colors"
              aria-label={lang === "nl" ? t("common.switch_to") : t("common.switch_to")}
              title={lang === "nl" ? t("common.switch_to") : t("common.switch_to")}
            >
              <Globe className="h-5 w-5" />
            </button>
          </nav>
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-md muted hover:text-ink hover:bg-surface"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4"
          >
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  scrollToSection(item.key);
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-4 text-sm muted hover:bg-surface hover:text-link rounded-md"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setLang(lang === "nl" ? "en" : "nl");
                setIsMenuOpen(false);
              }}
              className="mt-2 block w-full text-left py-2 px-4 text-sm muted hover:bg-surface hover:text-link rounded-md"
            >
              <span className="inline-flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t("common.switch_to")}
              </span>
            </button>
          </motion.div>
        )}
      </div>
    </header>
  );
}
