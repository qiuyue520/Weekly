import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dayjs from "dayjs";
import tailwind from "@astrojs/tailwind";
import remarkBreaks from "remark-breaks";
import sitemap from "@astrojs/sitemap";

import { defineConfig } from "astro/config";
import { parse } from "node-html-parser";
import { visit } from "unist-util-visit";
import rehypeImage from "./rehype-image.js";

// 给行内代码与代码块加 translate="no"：
// 浏览器翻译扩展（谷歌翻译 / 沉浸式翻译等）默认不翻 code，但可能把 code 元素
// 从原位抽走堆到段尾，导致句子顺序错乱。标记后翻译引擎会原样保留、原地不动。
function rehypeNoTranslateCode() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.tagName === "code" || node.tagName === "pre") {
        node.properties ??= {};
        node.properties.translate = "no";
      }
    });
  };
}

// 部署配置：通过环境变量控制
// GitHub Pages: BASE=/Weekly SITE_URL=https://qiuyue520.github.io/Weekly
// Cloudflare Pages/EdgeOne: BASE=/ SITE_URL=https://weekly.xiaonai.top
// 去掉尾部斜杠，避免路径拼接时出现 //
const BASE = (process.env.BASE || "/Weekly").replace(/\/+$/, "");
const SITE_URL = process.env.SITE_URL || "https://qiuyue520.github.io/Weekly";

// Markdown configuration - controls line break behavior
const markdownConfig = {
  hardBreaks: true, // Set to true to enable hard breaks (similar to CMARK_OPT_HARDBREAKS)
  gfm: true,
  smartypants: true,
  allowDangerousHtml: true,
};

const DEFAULT_FORMAT = "YYYY/MM/DD";
const WEEKLY_REPO_NAME = "tw93/weekly";

function formatDate(date) {
  return dayjs(date).format(DEFAULT_FORMAT);
}

function getFileCreateDate(filePath) {
  return formatDate(fs.statSync(filePath).birthtime);
}

function getTwitterImage(num) {
  return num >= 110 ? `https://weekly.tw93.fun/assets/${num}.jpg` : undefined;
}

// 语言路由与 src/pages/{lang}/posts 目录一一对应
const LANG_ROUTES = ["cn", "en", "ja", "tw"];

// 各语言的默认描述（正文首段缺失时的兜底）
const DEFAULT_DESCRIPTIONS = {
  cn: "记录工程师 xiaonai 的不枯燥生活，每周一发布，欢迎关注",
  tw: "記錄工程師 xiaonai 的不枯燥生活，每週一發布，歡迎關注",
  en: "Recording engineer xiaonai's interesting life, published every Monday. Welcome to follow.",
  ja: "エンジニア xiaonai のおもしろい日常を記録。毎週月曜日更新、フォロー歓迎。",
};

// 从文件路径推断语言（兼容 / 与 \ 分隔符）
function getLangFromFilePath(filePath) {
  const match = filePath.match(/[\/\\](cn|en|ja|tw)[\/\\]posts[\/\\]/);
  return match ? match[1] : "cn";
}

// Astro 为 redirects 生成的静态跳转页不会自动拼 BASE 前缀，
// GitHub Pages 子路径部署（BASE=/Weekly）时会 404，这里在构建完成后补写
function fixRedirectBase() {
  return {
    name: "fix-redirect-base",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        if (!BASE) return;
        const postsDir = path.join(fileURLToPath(dir), "posts");
        if (!fs.existsSync(postsDir)) return;
        const siteOrigin = new URL(SITE_URL).origin;
        let fixed = 0;
        for (const entry of fs.readdirSync(postsDir, { withFileTypes: true })) {
          const redirectPage = path.join(postsDir, entry.name, "index.html");
          if (!entry.isDirectory() || !fs.existsSync(redirectPage)) continue;
          const html = fs.readFileSync(redirectPage, "utf-8");
          const rewritten = html
            .replaceAll(`href="${siteOrigin}/cn/posts/`, `href="${SITE_URL}/cn/posts/`)
            .replaceAll(`url=/cn/posts/`, `url=${BASE}/cn/posts/`)
            .replaceAll(`href="/cn/posts/`, `href="${BASE}/cn/posts/`);
          if (rewritten !== html) {
            fs.writeFileSync(redirectPage, rewritten);
            fixed++;
          }
        }
        if (fixed > 0) {
          logger.info(`fix-redirect-base: rewrote ${fixed} redirect pages with BASE prefix`);
        }
      },
    },
  };
}

function defaultLayoutPlugin() {
  return function (tree, file) {
    const filePath = file.history[0];
    const { frontmatter } = file.data.astro;
    frontmatter.layout = "@layouts/post.astro";

    const lang = getLangFromFilePath(filePath);
    const postsDir = `/${lang}/posts/`;
    frontmatter.lang = lang;

    const relativePath = filePath
      .split(/[\/\\]posts[\/\\]/)[1]
      ?.replace(/\.md$/, "");

    if (relativePath) {
      frontmatter.legacySlug = relativePath;
      const [numberPart, ...nameParts] = relativePath.split("-");
      if (numberPart) {
        const numericIndex = Number.parseInt(numberPart, 10);
        if (!Number.isNaN(numericIndex)) {
          frontmatter.issueNumber = numericIndex;
          frontmatter.numericUrl = `${postsDir}${numericIndex}`;
        } else {
          frontmatter.numericUrl = `${postsDir}${numberPart}`;
        }
      }
      if (nameParts.length > 0) {
        frontmatter.issueTitle = decodeURIComponent(nameParts.join("-"));
      }
    }

    if (tree.children[0]?.value && !frontmatter.image) {
      const imageElement = parse(tree.children[0].value).querySelector("img");
      frontmatter.image = imageElement.getAttribute("src");
    }

    if (tree.children[1]?.children[1]?.value) {
      frontmatter.description = tree.children[1].children[1].value;
    }

    frontmatter.description = frontmatter.description || DEFAULT_DESCRIPTIONS[lang];
    frontmatter.image = frontmatter.image || `${BASE}/xnwky.png`;

    // Fallback to file creation time if no date is specified
    if (!frontmatter.date) {
      frontmatter.date = getFileCreateDate(filePath);
    }

    if ("qiuyue520/Weekly" === WEEKLY_REPO_NAME) {
      const postNumber = filePath.split(/[\/\\]posts[\/\\]/)[1]?.split("-")[0];
      frontmatter.socialImage = getTwitterImage(postNumber);
    }
  };
}

export default defineConfig({
  site: SITE_URL,
  base: BASE,
  prefetch: true,
  trailingSlash: "never",
  server: {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  integrations: [
    tailwind(),
    fixRedirectBase(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => {
        const url = new URL(page);
        // 根路径是真首页，正常收录
        if (url.pathname === `${BASE}/` || url.pathname === BASE) {
          return true;
        }
        // 各语言的数字文章页正常收录
        if (new RegExp(`\\/(${LANG_ROUTES.join("|")})\\/posts\\/\\d+$`).test(url.pathname)) {
          return true;
        }
        // 旧版数字 URL（现在是重定向页）与 legacy slug 不进 sitemap
        const postPathMatch = url.pathname.match(/\/posts\/(\d+)(-|$)/);
        return !postPathMatch;
      },
    }),
  ],
  i18n: {
    defaultLocale: "cn",
    locales: LANG_ROUTES,
    routing: {
      // 全部语言带前缀：/cn /en /ja /tw
      // 根路径 / 直接渲染中文首页（src/pages/index.astro），不再 302 跳转 /cn
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  // 旧版无前缀 URL 兼容：/posts/5 → /cn/posts/5
  // 静态构建时会基于目标路由的 getStaticPaths 枚举参数，生成 meta refresh 跳转页
  // （跳转目标缺 BASE 前缀的问题由 fixRedirectBase 集成在构建完成后修复）
  redirects: {
    "/posts/[id]": "/cn/posts/[id]",
  },
  markdown: {
    remarkPlugins: [
      defaultLayoutPlugin,
      // Enable hard breaks based on configuration
      ...(markdownConfig.hardBreaks ? [remarkBreaks] : []),
    ],
    rehypePlugins: [rehypeImage, rehypeNoTranslateCode],
    remarkRehype: {
      handlers: {},
      allowDangerousHtml: markdownConfig.allowDangerousHtml,
    },
    gfm: markdownConfig.gfm,
    smartypants: markdownConfig.smartypants,
  },
  vite: {
    server: {
      cors: true,
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress harmless internal Astro import warnings
          if (
            warning.code === "UNUSED_EXTERNAL_IMPORT" &&
            warning.exporter === "@astrojs/internal-helpers/remote"
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  },
});
