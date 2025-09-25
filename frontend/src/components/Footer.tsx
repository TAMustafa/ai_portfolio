import React from 'react';
import { useI18n } from '../i18n/I18nProvider';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-paper/50 border-t border-border">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center muted">
        <p>&copy; {new Date().getFullYear()} {t('common.brand')}. {t('footer.rights')}</p>
        <p className="text-xs mt-1">{t('common.tagline')}</p>
      </div>
    </footer>
  );
}
