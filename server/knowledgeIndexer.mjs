import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Support both legacy layout (root/src) and new layout (frontend/src)
const FRONTEND_CONTENT_DIR = path.resolve(__dirname, "..", "frontend", "src", "content");
const ROOT_CONTENT_DIR = path.resolve(__dirname, "..", "src", "content");
const CONTENT_DIR = fs.existsSync(FRONTEND_CONTENT_DIR) ? FRONTEND_CONTENT_DIR : ROOT_CONTENT_DIR;

// --- MDX Parsing Logic (from previous indexer) ---
function readAllMdxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readAllMdxFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(full);
    }
  }
  return files;
}

function parseProjectLayoutProps(src) {
  const layoutOpen = src.indexOf("<ProjectLayout");
  if (layoutOpen === -1) return {};
  const close = src.indexOf(">", layoutOpen);
  if (close === -1) return {};
  const props = src.slice(layoutOpen, close + 1);

  function readStringProp(name) {
    const m = props.match(new RegExp(`${name}=\"([^\"]+)\"`));
    return m ? m[1] : undefined;
  }

  return { title: readStringProp("title"), subtitle: readStringProp("subtitle") };
}

function stripMarkup(src) {
  return src
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Simple frontmatter parser for leading --- ... --- blocks
function parseFrontmatter(raw) {
  const m = raw.match(/^---[\s\S]*?---/);
  if (!m) return {};
  const block = m[0].replace(/^---|---$/g, "");
  const out = {};
  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const kv = trimmed.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let value = kv[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        out[key] = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        out[key] = [];
      }
    } else {
      value = value.replace(/^["']|["']$/g, "");
      out[key] = value;
    }
  }
  return out;
}

import { createRequire } from "module";
const require = createRequire(import.meta.url);
let rawTranslations;
try {
  // Preferred: per-locale files
  const nl = require("../frontend/src/i18n/nl.json");
  const en = require("../frontend/src/i18n/en.json");
  rawTranslations = { nl, en };
} catch (_e0) {
  try {
    // Fallback: combined translations.json in frontend/src
    rawTranslations = require("../frontend/src/i18n/translations.json");
  } catch (_e1) {
    // Legacy layout fallback: translations under root/src
    rawTranslations = require("../src/i18n/translations.json");
  }
}

// --- Main Indexing Function ---
export function buildKnowledgeIndex() {
  const docs = [];
  const translations = rawTranslations;

  // 1. Index content from translations.ts
  for (const lang of ["en", "nl"]) {
    const langData = translations[lang];
    if (!langData) continue;

    // Index the 'About' section
    if (langData.about) {
      const values = Array.isArray(langData.about.values) ? langData.about.values : [];
      const valuesPart = values.length
        ? ` Values: ${values.map((v) => `${v.title}: ${v.description}`).join(". ")}`
        : "";
      const aboutText =
        `${langData.about.title}. ${langData.about.subtitle || ""}.${valuesPart}`.trim();
      docs.push({
        id: `${lang}-about`,
        lang,
        type: "about",
        title: langData.about.title,
        text: aboutText,
        tags: ["about", "experience", "mission", "values"],
      });
    }

    // Index portfolio item summaries
    if (langData.portfolio && langData.portfolio.items) {
      for (const item of langData.portfolio.items) {
        docs.push({
          id: `${lang}-portfolio-${item.slug}`,
          lang,
          type: "portfolio_item",
          title: item.title,
          slug: item.slug,
          text: item.description,
          tags: item.tags,
        });
      }
    }
  }

  // 2. Index full content from .mdx files
  const mdxFiles = readAllMdxFiles(CONTENT_DIR);
  for (const f of mdxFiles) {
    const raw = fs.readFileSync(f, "utf8");
    const rel = path.relative(CONTENT_DIR, f);
    const [lang, name] = rel.split(path.sep);
    const slug = (name || "").replace(/\.mdx$/, "");
    const fm = parseFrontmatter(raw);
    const props = parseProjectLayoutProps(raw);
    const text = stripMarkup(raw);

    // Find if a doc for this slug already exists from translations, and enrich it.
    const existingDoc = docs.find((d) => d.slug === slug && d.lang === lang);
    if (existingDoc) {
      // Prefer frontmatter fields when available
      if (fm.title && !existingDoc.title) existingDoc.title = fm.title;
      if (Array.isArray(fm.tags) && (!existingDoc.tags || existingDoc.tags.length === 0))
        existingDoc.tags = fm.tags;
      if (fm.description) existingDoc.text = `${fm.description} ${existingDoc.text || ""}`.trim();
      existingDoc.text += ` ${text}`; // Append full content
    } else {
      docs.push({
        id: `${lang}-mdx-${slug}`,
        lang: lang || "en",
        type: "project_detail",
        title: fm.title || props.title || slug,
        slug,
        text: fm.description ? `${fm.description} ${text}` : text,
        tags: Array.isArray(fm.tags) ? fm.tags : [],
      });
    }
  }

  return docs;
}
