import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import { MDXProvider } from "@mdx-js/react";
import ProjectLayout from "../components/mdx/ProjectLayout";
import Callout from "../components/mdx/Callout";

// Eagerly discover all MDX files for both languages
const mdxModules = import.meta.glob("../content/**/*.{md,mdx}") as Record<
  string,
  () => Promise<{ default: React.ComponentType }>
>;

export default function ProjectPage() {
  const { slug, lang: routeLang } = useParams<{ slug: string; lang: "nl" | "en" }>();
  const { lang, setLang } = useI18n();

  useEffect(() => {
    if (routeLang && routeLang !== lang) setLang(routeLang);
  }, [routeLang, lang, setLang]);

  const effectiveLang = routeLang ?? lang;
  const pathCandidates = [
    `../content/${effectiveLang}/${slug}.mdx`,
    `../content/${effectiveLang}/${slug}.md`,
  ];

  const matched = pathCandidates.find((p) => p in mdxModules);

  if (!slug) {
    return (
      <div className="bg-paper text-ink h-screen overflow-y-auto pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Missing slug</h1>
          <p className="text-ink-muted">No project slug provided.</p>
          <Link to="/" className="text-indigo-700 hover:underline">
            ← Home
          </Link>
        </div>
      </div>
    );
  }

  if (!matched) {
    return (
      <div className="bg-paper text-ink h-screen overflow-y-auto pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <p className="text-ink-muted mb-8">
            We couldn't find a page for "{slug}" in language "{lang}".
          </p>
          <Link to="/" className="text-indigo-700 hover:underline">
            ← Home
          </Link>
        </div>
      </div>
    );
  }

  const loader = mdxModules[matched]!; // matched is ensured above
  const Component = React.lazy(loader);

  return (
    <div className="bg-paper text-ink h-screen overflow-y-auto pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to={`/${effectiveLang}`}
            className="inline-flex items-center text-indigo-700 hover:text-indigo-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 mr-2"
            >
              <path
                fillRule="evenodd"
                d="M15.78 4.22a.75.75 0 010 1.06L9.06 12l6.72 6.72a.75.75 0 11-1.06 1.06l-7.25-7.25a.75.75 0 010-1.06l7.25-7.25a.75.75 0 011.06 0z"
                clipRule="evenodd"
              />
            </svg>
            Home
          </Link>
        </div>
        <React.Suspense fallback={<div className="text-gray-400">Loading…</div>}>
          <MDXProvider
            components={{
              ProjectLayout,
              Callout,
              h1: (props) => (
                <h1
                  className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink mb-6"
                  {...props}
                />
              ),
              h2: (props) => <h2 className="text-2xl font-bold text-ink mt-10 mb-4" {...props} />,
              h3: (props) => <h3 className="text-xl font-semibold text-ink mt-8 mb-3" {...props} />,
              p: (props) => <p className="text-ink-muted leading-relaxed" {...props} />,
              a: (props) => (
                <a
                  className="text-indigo-700 hover:text-indigo-900 underline decoration-indigo-600/40"
                  {...props}
                />
              ),
              ul: (props) => <ul className="list-disc list-inside space-y-2" {...props} />,
              ol: (props) => <ol className="list-decimal list-inside space-y-2" {...props} />,
              li: (props) => <li className="text-ink-muted" {...props} />,
              blockquote: (props) => (
                <blockquote
                  className="border-l-4 border-indigo-700 pl-4 italic text-ink-muted"
                  {...props}
                />
              ),
              code: (props) => <code className="text-teal-700" {...props} />,
              pre: (props) => (
                <pre
                  className="bg-paper border border-ink/20 rounded-lg p-4 overflow-x-auto"
                  {...props}
                />
              ),
              hr: () => <hr className="my-10 border-ink/20" />,
            }}
          >
            <article className="prose max-w-none">
              <Component />
            </article>
          </MDXProvider>
        </React.Suspense>
      </div>
    </div>
  );
}
