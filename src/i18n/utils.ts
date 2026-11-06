import { ui, languages, defaultLang, type Lang } from "./ui";
import { BASE } from '@/config';

const LANG_ROUTES = Object.keys(languages) as Lang[];

/** 从 URL 提取语言路由（/cn /en /ja /tw），无前缀时回退到默认语言 */
export function getLangFromUrl(url: URL): Lang {
  const pathname = BASE && url.pathname.startsWith(BASE) ? url.pathname.slice(BASE.length) : url.pathname;
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return (LANG_ROUTES as string[]).includes(firstSegment ?? '') ? (firstSegment as Lang) : defaultLang;
}

/** 从任意站点路径提取语言路由，无前缀时回退到默认语言 */
export function getLangFromPath(pathname: string): Lang {
  const normalized = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const firstSegment = normalized.split('/').filter(Boolean)[0];
  return (LANG_ROUTES as string[]).includes(firstSegment ?? '') ? (firstSegment as Lang) : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: string) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

/** 所有语言统一带路由前缀：/cn /en /ja /tw */
export function useLocalizedPath(lang: Lang) {
  return function translatePath(path: string, l: string = lang) {
    const prefix = `/${l}`;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    if (normalizedPath === "/") {
      return `${BASE}${prefix}`;
    }

    if (normalizedPath.startsWith(`${prefix}/`)) {
      return `${BASE}${normalizedPath}`.replace(/\/$/, "") || "/";
    }

    return `${BASE}${prefix}${normalizedPath}`.replace(/\/$/, "") || "/";
  };
}
