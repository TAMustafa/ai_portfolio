export type Lang = "nl" | "en";

// Generic dictionary for translations; values can be nested structures.
export type TranslationDict = Record<string, unknown>;

export interface PortfolioItem {
  title: string;
  description: string;
  tags: string[];
  slug?: string;
}

export interface AboutValue {
  title: string;
  description: string;
}

export interface RootDict {
  portfolio?: { items?: PortfolioItem[] };
  about?: { title?: string; subtitle?: string; values?: AboutValue[] };
}
