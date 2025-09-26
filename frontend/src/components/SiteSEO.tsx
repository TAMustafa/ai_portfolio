import React, { useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider";

export interface SiteSEOProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  siteName?: string;
}

const DEFAULTS = {
  title: "automai — Portfolio",
  description:
    "A modern, multilingual portfolio showcasing projects, experience, and an AI-powered assistant.",
  image: "",
  siteName: "automai",
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attributes).forEach(([k, v]) => el!.setAttribute(k, v));
}

export default function SiteSEO(props: SiteSEOProps) {
  const { lang } = useI18n();
  const title = props.title ?? DEFAULTS.title;
  const description = props.description ?? DEFAULTS.description;
  const url = props.url;
  const image = props.image ?? DEFAULTS.image;
  const siteName = props.siteName ?? DEFAULTS.siteName;

  useEffect(() => {
    // Update <html lang>
    document.documentElement.lang = lang;

    // Title
    if (document.title !== title) document.title = title;

    // Standard meta
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="theme-color"]', { name: "theme-color", content: "#0f172a" });

    // Open Graph
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: siteName,
    });
    if (url) upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    if (image) upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });

    // Twitter
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    if (image) upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
  }, [lang, title, description, url, image, siteName]);

  return null;
}
