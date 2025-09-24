import type { TranslationDict } from './types';
import translationsData from './translations.json';

export const translations: Record<'nl' | 'en', TranslationDict> = translationsData;
