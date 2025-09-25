import React from "react";
import { motion } from "framer-motion";

type Props = {
  activeSection: string;
  sections: string[];
  onSelect: (id: string) => void;
};

export default function ScrollDots({ activeSection, sections, onSelect }: Props) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3">
      {sections.map((id) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            aria-label={`Scroll to ${id}`}
            onClick={() => onSelect(id)}
            className="relative group"
          >
            <motion.span
              layout
              className={`block rounded-full transition-colors duration-300 ${
                isActive ? "bg-teal-400" : "bg-gray-600 group-hover:bg-teal-300"
              }`}
              style={{ width: isActive ? 12 : 8, height: isActive ? 12 : 8 }}
            />
            <span className="absolute left-[-140px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-300 whitespace-nowrap">
              {id}
            </span>
          </button>
        );
      })}
    </div>
  );
}
