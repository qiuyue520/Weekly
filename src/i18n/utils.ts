import { ui, defaultLang } from "./ui";
import { BASE } from '@/config';

export function getLangFromUrl(url: URL) {
  if (url.pathname.includes('/en')) return 'en';
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function useLocalizedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    const prefix = l === defaultLang ? "" : `/${l}`;
    let normalizedPath = path.startsWith("/") ? path : `/${path}`;

    if (l !== defaultLang && normalizedPath === "/") {
      return `${BASE}/${l}`;
    }

    if (l !== defaultLang && normalizedPath.startsWith(prefix)) {
      return `${BASE}${normalizedPath}`.replace(/\/$/, "") || "/";
    }

    return `${BASE}${prefix}${normalizedPath}`.replace(/\/$/, "") || "/";
  };
}