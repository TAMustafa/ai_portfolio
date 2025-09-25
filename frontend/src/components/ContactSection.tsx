import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../i18n/I18nProvider';

export const ContactSection = () => {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
    }, 1000);
  };

  if (submitted) {
    return (
      <section id="contact" className="min-h-screen snap-start flex items-center justify-center bg-paper py-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">{t('contact.thank_you_title')}</h2>
          <p className="text-xl muted mb-8">{t('contact.thank_you_message')}</p>
          <button 
            onClick={() => setSubmitted(false)} 
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            {t('contact.send_another')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="min-h-screen snap-start flex items-center justify-center bg-paper py-20">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <h2 className="text-4xl font-bold mb-4">{t('contact.title')}</h2>
        <p className="text-xl muted mb-12">{t('contact.subtitle')}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="sr-only">{t('contact.labels.name')}</label>
            <input type="text" id="name" placeholder={t('contact.labels.name')} required className="w-full bg-white border border-border rounded-lg py-3 px-4 text-ink placeholder-ink/50 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">{t('contact.labels.email')}</label>
            <input type="email" id="email" placeholder={t('contact.labels.email')} required className="w-full bg-white border border-border rounded-lg py-3 px-4 text-ink placeholder-ink/50 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label htmlFor="message" className="sr-only">{t('contact.labels.message')}</label>
            <textarea id="message" placeholder={t('contact.labels.message')} rows={5} required className="w-full bg-white border border-border rounded-lg py-3 px-4 text-ink placeholder-ink/50 focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:bg-ink/30">
            {isSubmitting ? t('contact.submitting') : t('contact.cta')}
          </button>
        </form>
      </div>
    </section>
  );
};
