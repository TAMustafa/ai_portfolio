import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, FileText } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const SocialLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 text-lg text-gray-300 hover:text-teal-400 transition-colors duration-300"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className="w-6 h-6" />
    <span>{label}</span>
  </motion.a>
);

export const AboutSection = () => {
  const { t } = useI18n();

  return (
    <section id="about" className="min-h-screen snap-start flex items-center justify-center bg-gray-900 py-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="/profile.jpg" 
            alt="Profile" 
            className="rounded-full object-cover w-full h-full border-4 border-gray-700 shadow-lg"
          />
        </motion.div>
        <motion.div 
          className="text-center md:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('about.title')}</h2>
          <p className="text-lg text-gray-400 max-w-xl mb-8 leading-relaxed">
            {t('about.subtitle')}
          </p>
          <div className="flex justify-center md:justify-start items-center gap-6 md:gap-8 flex-wrap">
            <SocialLink 
              href="/resume.pdf" 
              icon={FileText} 
              label={t('about.resume_cta')} 
            />
            <SocialLink 
              href={t('about.socials.github')} 
              icon={Github} 
              label="GitHub"
            />
            <SocialLink 
              href={t('about.socials.linkedin')} 
              icon={Linkedin} 
              label="LinkedIn"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
