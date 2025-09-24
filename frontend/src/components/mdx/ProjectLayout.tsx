import React from 'react';

interface ProjectLayoutProps {
  title?: string;
  subtitle?: string;
  tags?: string[];
  heroImageUrl?: string;
  children: React.ReactNode;
}

export default function ProjectLayout({ title, subtitle, tags, heroImageUrl, children }: ProjectLayoutProps) {
  return (
    <section className="relative overflow-hidden">
      {heroImageUrl ? (
        <div className="relative h-56 md:h-72 mb-8 rounded-2xl overflow-hidden border border-gray-800">
          <img src={heroImageUrl} alt={title ?? ''} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-gray-900/30" />
        </div>
      ) : null}

      {title ? (
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-teal-300 mb-2">
          {title}
        </h1>
      ) : null}
      {subtitle ? <p className="text-gray-400 mb-4">{subtitle}</p> : null}

      {tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((t) => (
            <span key={t} className="text-xs font-mono bg-gray-800 text-indigo-300 px-2 py-1 rounded-full border border-gray-700">
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="prose prose-invert max-w-none">
        {children}
      </div>
    </section>
  );
}
