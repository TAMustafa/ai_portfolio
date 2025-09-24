import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Lightbulb, Target, Users } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import { Link } from 'react-router-dom';

export function PortfolioSection() {
  const { t, dict, lang } = useI18n();
  const items = (dict?.portfolio as any)?.items as Array<{
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
    <section id="portfolio" className="min-h-screen snap-start flex items-center justify-center bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('portfolio.title')}</h2>
        <p className="text-lg text-gray-400 text-center max-w-2xl mx-auto mb-12">{t('portfolio.subtitle')}</p>
        <div className="grid md:grid-cols-2 gap-8">
          {items?.map((project, index) => {
            const card = (
              <motion.div
                key={`${project.title}-${index}`}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-indigo-500/50 transition-colors duration-300 flex items-start space-x-4"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex-shrink-0 bg-gray-900 p-3 rounded-lg">{icons[index % icons.length]}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-100">{project.title}</h3>
                  <p className="text-gray-400 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={`${project.title}-${tag}`} className="text-xs font-mono bg-gray-700 text-indigo-300 px-2 py-1 rounded-full">
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
