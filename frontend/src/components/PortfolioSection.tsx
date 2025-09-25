import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bot, Lightbulb, Target, Users } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import { Link } from 'react-router-dom';

export function PortfolioSection() {
  const { t, dict, lang } = useI18n();

  // Eagerly import MDX as raw text to parse frontmatter for cards
  const mdxRawModules = import.meta.glob('../content/*/*.mdx', {
    eager: true,
    import: 'default',
  }) as Record<string, string>;

  function parseFrontmatter(raw: string): { title?: string; description?: string; tags?: string[] } {
    // Basic frontmatter parser: looks for leading --- ... --- block
    if (typeof raw !== 'string') return {};
    const m = raw.match(/^---[\s\S]*?---/);
    if (!m) return {};
    const block = m[0].replace(/^---|---$/g, '');
    const out: any = {};
    for (const line of block.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const kv = trimmed.match(/^(\w+):\s*(.*)$/);
      if (!kv) continue;
      const key = kv[1];
      let value = kv[2].trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          out[key] = JSON.parse(value.replace(/'/g, '"'));
        } catch {
          out[key] = [];
        }
      } else {
        // strip quotes if present
        value = value.replace(/^["']|["']$/g, '');
        out[key] = value;
      }
    }
    return out;
  }

  const mdxItems = useMemo(() => {
    const list: Array<{ title: string; description: string; tags: string[]; slug?: string }> = [];
    const prefix = `../content/${lang}/`;
    for (const [path, raw] of Object.entries(mdxRawModules)) {
      if (!path.startsWith(prefix)) continue;
      if (typeof raw !== 'string') continue; // safety: only parse string contents
      const slug = path.slice(prefix.length).replace(/\.mdx$/, '');
      const fm = parseFrontmatter(raw);
      if (fm.title && fm.description) {
        list.push({
          title: fm.title,
          description: fm.description,
          tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
          slug,
        });
      }
    }
    return list;
  }, [lang, mdxRawModules]);

  const items = (mdxItems?.length ? mdxItems : (dict?.portfolio as any)?.items) as Array<{
    title: string;
    description: string;
    tags: string[];
    slug?: string;
  }>;
  const icons = [
    <Bot className="w-8 h-8 text-indigo-400" key="i0" />, 
    <Lightbulb className="w-8 h-8 text-teal-400" key="i1" />, 
    <Target className="w-8 h-8 text-purple-400" key="i2" />, 
    <Users className="w-8 h-8 text-rose-400" key="i3" />
  ];

  return (
    <section id="portfolio" className="min-h-screen snap-start flex items-center justify-center bg-paper py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('portfolio.title')}</h2>
        <p className="text-lg muted text-center max-w-2xl mx-auto mb-12">{t('portfolio.subtitle')}</p>
        <div className="grid md:grid-cols-2 gap-8">
          {items?.map((project, index) => {
            const card = (
              <motion.div
                key={`${project.title}-${index}`}
                className="card p-6 hover:border-link/50 transition-colors duration-300 flex items-start space-x-4"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex-shrink-0 bg-white/60 p-3 rounded-lg border border-border">{icons[index % icons.length]}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-ink">{project.title}</h3>
                  <p className="muted mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={`${project.title}-${tag}`} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );

            return project.slug ? (
              <Link to={`/${lang}/project/${project.slug}`} key={`${project.title}-${index}`} className="block">
                {card}
              </Link>
            ) : (
              card
            );
          })}
        </div>
      </div>
    </section>
  );
}
