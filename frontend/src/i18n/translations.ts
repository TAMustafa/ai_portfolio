import type { TranslationDict } from './types';
import en from './en.json';
import nl from './nl.json';

export const translations: Record<'nl' | 'en', TranslationDict> = {
  en: en as TranslationDict,
  nl: nl as TranslationDict,
};
