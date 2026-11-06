// Helper function to extract and decode the title part from the URL
export const extractTitlePart = (currentPage: string) => {
  const [, raw = ""] = currentPage.split("/posts/");
  return decodeURIComponent(raw.replace(/\/$/, ""));
};

// 从路径推断语言路由（/cn /en /ja /tw），无前缀时视为中文
export const getLangRouteFromPath = (currentPage: string) => {
  const match = currentPage.match(/\/(cn|en|ja|tw)\/posts\//);
  return match ? match[1] : "cn";
};

export const getSlugParts = (slug: string) => {
  const [numberPart = "", ...nameParts] = slug.split("-");
  return {
    numberPart,
    name: nameParts.join("-"),
  };
};

export const getIndex = (currentPage: string) => {
  const { numberPart } = getSlugParts(extractTitlePart(currentPage));
  return Number.parseInt(numberPart, 10);
};

export const sortPosts = (allPosts: any) => {
  return allPosts.sort((a: any, b: any) => getIndex(b.url) - getIndex(a.url));
};

export const toNumericUrl = (currentPage: string) => {
  const index = getIndex(currentPage);
  const langRoute = getLangRouteFromPath(currentPage);
  const basePath = `/${langRoute}/posts`;
  return Number.isNaN(index) ? currentPage : `${basePath}/${index}`;
};

// 统一标题格式（四种语言一套规则）：
//   cn/tw「第 5 期 · 2026/06/10」  ja「第 5 回 · 2026/06/10」  en「Issue 5 · 2026/06/10」
// 期数不补零；日期取各篇 frontmatter 的 date（补考/鸽了之后期数失去时间感，日期才是关键信息）
export const parseTitle = (
  currentPage: string,
  legacySlug?: string,
  _fallbackName = "",
  lang = "cn",
  _isSidebar = false,
  date?: string,
) => {
  const slug = legacySlug ?? extractTitlePart(currentPage);
  const { numberPart } = getSlugParts(slug);
  const parsed = Number.parseInt(numberPart, 10);
  const issue = Number.isNaN(parsed) ? numberPart : String(parsed);

  const label =
    lang === "en"
      ? `Issue ${issue}`
      : `第 ${issue} ${lang === "ja" ? "回" : "期"}`;

  return date ? `${label} · ${date}` : label;
};
