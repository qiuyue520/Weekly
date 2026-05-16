// BASE 路径，从环境变量获取，默认为 /Weekly（GitHub Pages）
// Cloudflare Pages 部署时设置为空字符串
export const BASE = import.meta.env.BASE_URL || '/Weekly';

// 站点域名，根据部署环境动态设置
// GitHub Pages: https://qiuyue520.github.io/Weekly
// Cloudflare Pages: https://weekly.xiaonai.top
export const SITE_URL = import.meta.env.SITE_URL || 'https://qiuyue520.github.io/Weekly';

export const SITE = {
  title: "xiaonai's weekly",
  author: "xiaonai",
  description: "记录工程师 xiaonai 的不枯燥生活，每周一发布，欢迎关注",
  keywords: "xiaonai,Weekly,Blog,前端,linux,设计",
  icon: `${BASE}/icon-144.png`,
  siteImage: `${BASE}/xnwky.png`,
  homePage: SITE_URL,
  blogPage: "https://blog.xiaonai.top",
  repo: "qiuyue520/Weekly",
};

export const GISCUS_CONFIG = {
  repo: "qiuyue520/Weekly",
  repoId: "R_kgDOSeKEAg",
  category: "General",
  categoryId: "DIC_kwDOSeKEAs4C9Ho3",
  mapping: "title",
  strict: "0",
  reactionsEnabled: "1",
  emitMetadata: "0",
  inputPosition: "bottom",
  theme: "preferred_color_scheme",
  lang: "zh-CN",
};
