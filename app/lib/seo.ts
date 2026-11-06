import type { MetaDescriptor } from "react-router";
import { DEFAULT_LOCALE, ENABLED_LOCALES, localize, type Locale } from "~/i18n/types";

/** Production origin without a trailing slash (SITE_URL at build time). */
export const SITE_URL: string = __SITE_URL__;
export const ROBOTS_ALLOW: boolean = __ROBOTS_ALLOW__;
export const SITE_NAME = "Nyro Soft";

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

export interface SeoInput {
  title: string;
  description: string;
  /** Unprefixed path, e.g. "/xizmatlar/web-platformalar"; the locale prefix is added here. */
  path: string;
  locale?: Locale;
  image?: { src: string; width: number; height: number; alt: string };
  type?: "website" | "article";
  jsonLd?: readonly object[];
  noindex?: boolean;
}

const DEFAULT_IMAGE = { src: "/og.png", width: 1200, height: 630 };

/** Title, description, canonical, Open Graph, Twitter card, robots and JSON-LD for one route. */
const OG_LOCALE: Record<Locale, string> = { uz: "uz_UZ", ru: "ru_RU" };

export function seo(input: SeoInput): MetaDescriptor[] {
  const locale = input.locale ?? DEFAULT_LOCALE;
  const url = absoluteUrl(localize(input.path, locale));
  const image = input.image ?? { ...DEFAULT_IMAGE, alt: input.title };
  const noindex = input.noindex || !ROBOTS_ALLOW;
  const tags: MetaDescriptor[] = [
    { title: input.title },
    { name: "description", content: input.description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: OG_LOCALE[locale] },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:url", content: url },
    { property: "og:image", content: absoluteUrl(image.src) },
    { property: "og:image:width", content: String(image.width) },
    { property: "og:image:height", content: String(image.height) },
    { property: "og:image:alt", content: image.alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description },
    { name: "twitter:image", content: absoluteUrl(image.src) },
  ];
  if (ENABLED_LOCALES.length > 1 && !input.noindex) {
    for (const alt of ENABLED_LOCALES) {
      tags.push({ tagName: "link", rel: "alternate", hrefLang: alt, href: absoluteUrl(localize(input.path, alt)) });
      if (alt !== locale) tags.push({ property: "og:locale:alternate", content: OG_LOCALE[alt] });
    }
    tags.push({ tagName: "link", rel: "alternate", hrefLang: "x-default", href: absoluteUrl(input.path) });
  }
  if (noindex) tags.push({ name: "robots", content: "noindex, nofollow" });
  for (const data of input.jsonLd ?? []) tags.push({ "script:ld+json": data });
  return tags;
}

export function pageTitle(title: string): string {
  return `${title} — ${SITE_NAME}`;
}

export function organizationLd(description: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/favicon.svg"),
    description,
  };
}

export function websiteLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    inLanguage: ENABLED_LOCALES,
  };
}

export function breadcrumbLd(items: readonly { name: string; path: string }[], locale: Locale = DEFAULT_LOCALE): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(localize(item.path, locale)),
    })),
  };
}

export function serviceLd(name: string, description: string, path: string, locale: Locale = DEFAULT_LOCALE): object {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absoluteUrl(localize(path, locale)),
    provider: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    areaServed: "UZ",
  };
}

export function faqLd(items: readonly { q: string; a: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
