export const SUPPORT_CALLOUT = {
  cn: "欢迎通过邮箱联系我",
  en: "Welcome to contact me via email",
  ja: "メールでお気軽にご連絡ください",
  tw: "歡迎透過信箱聯繫我",
  link: "mailto:xiaonaihenlihai@outlook.com",
};

export const renderSupportCalloutForRSS = (lang: "cn" | "en" | "ja" | "tw" = "cn") => {
  const cta = SUPPORT_CALLOUT[lang] ?? SUPPORT_CALLOUT.cn;
  const { link } = SUPPORT_CALLOUT;
  return `
    <hr style="border:none;border-top:0.5px solid rgba(0,0,0,0.08);margin:26px 0 14px;" />
    <p style="text-align:left;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <a
        href="${link}"
        style="
          display:inline-block;
          padding:6px 18px;
          border-radius:999px;
          background:#222;
          color:#fff;
          font-size:13px;
          text-decoration:none;
        "
        target="_blank"
        rel="noreferrer"
      >${cta}</a>
    </p>
  `.trim();
};