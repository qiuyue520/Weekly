// 语言路由（src/pages 下的目录名）与站点语言配置
export const languages = {
  cn: "简体中文",
  en: "English",
  ja: "日本語",
  tw: "繁體中文",
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = "cn";

// 切换按钮上的短标签
export const langShort: Record<Lang, string> = {
  cn: "中",
  en: "EN",
  ja: "日",
  tw: "繁",
};

// <html lang> 与 giscus 使用的 BCP-47 代码
export const htmlLang: Record<Lang, string> = {
  cn: "zh-CN",
  en: "en",
  ja: "ja",
  tw: "zh-TW",
};

export const giscusLang: Record<Lang, string> = {
  cn: "zh-CN",
  en: "en",
  ja: "ja",
  tw: "zh-TW",
};

export const ui: Record<Lang, Record<string, string>> = {
  cn: {
    "nav.home": "Blog",
    "nav.posts": "Posts",
    "site.title": "xiaonai's weekly",
    "site.description": "记录工程师 xiaonai 的不枯燥生活，每周一发布，欢迎关注",
    "search.placeholder": "搜索文章...",
    "post.publishedAt": "发布日期：",
    "post.next": "下一篇",
    "post.prev": "上一篇",
    "post.home": "去首页",
    "lang.switch": "切换语言",
  },
  en: {
    "nav.home": "Blog",
    "nav.posts": "Posts",
    "site.title": "xiaonai's weekly",
    "site.description":
      "Recording engineer xiaonai's interesting life, published every Monday. Welcome to follow.",
    "search.placeholder": "Search posts...",
    "post.publishedAt": "Published at: ",
    "post.next": "Next",
    "post.prev": "Prev",
    "post.home": "Home",
    "lang.switch": "Switch language",
  },
  ja: {
    "nav.home": "Blog",
    "nav.posts": "Posts",
    "site.title": "xiaonai's weekly",
    "site.description":
      "エンジニア xiaonai のおもしろい日常を記録。毎週月曜日更新、フォロー歓迎。",
    "search.placeholder": "記事を検索...",
    "post.publishedAt": "公開日：",
    "post.next": "次へ",
    "post.prev": "前へ",
    "post.home": "ホーム",
    "lang.switch": "言語を切り替える",
  },
  tw: {
    "nav.home": "Blog",
    "nav.posts": "Posts",
    "site.title": "xiaonai's weekly",
    "site.description": "記錄工程師 xiaonai 的不枯燥生活，每週一發布，歡迎關注",
    "search.placeholder": "搜尋文章...",
    "post.publishedAt": "發布日期：",
    "post.next": "下一篇",
    "post.prev": "上一篇",
    "post.home": "回首頁",
    "lang.switch": "切換語言",
  },
};
