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
        <div className="relative h-56 md:h-72 mb-8 rounded-2xl overflow-hidden border border-ink/20">
          <img src={heroImageUrl} alt={title ?? ''} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
        </div>
      ) : null}

      {title ? (
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink mb-2">
          {title}
        </h1>
      ) : null}
      {subtitle ? <p className="text-ink-muted mb-4">{subtitle}</p> : null}

      {tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((t) => (
            <span key={t} className="text-xs font-mono bg-white/60 text-indigo-800 px-2 py-1 rounded-full border border-ink/20">
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="prose max-w-none">
        {children}
      </div>
    </section>
  );
}
