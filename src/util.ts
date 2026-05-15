// Helper function to extract and decode the title part from the URL
export const extractTitlePart = (currentPage: string) => {
  const isEn = currentPage.includes("/en/posts/");
  const separator = isEn ? "/en/posts/" : "/posts/";
  const [, raw = ""] = currentPage.split(separator);
  return decodeURIComponent(raw.replace(/\/$/, ""));
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
  const isEn = currentPage.includes("/en/posts/");
  const basePath = isEn ? "/en/posts" : "/posts";
  return Number.isNaN(index) ? currentPage : `${basePath}/${index}`;
};

export const parseTitle = (
  currentPage: string,
  legacySlug?: string,
  fallbackName = "",
  lang = "zh",
  isSidebar = false,
) => {
  const slug = legacySlug ?? extractTitlePart(currentPage);
  const { numberPart, name } = getSlugParts(slug);
  const displayName = name || fallbackName;

  if (lang === "en") {
    if (isSidebar) {
      return `${numberPart}.`;
    }
    const cleanName = displayName.replace(/-/g, " ");
    return `${numberPart}.${cleanName ? ` ${cleanName}` : ""}`;
  }

  let title = `第${numberPart}期`;
  if (displayName) {
    title += ` - ${displayName}`;
  }
  return title;
};