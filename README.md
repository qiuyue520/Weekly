# xiaonai's Weekly

> xiaonai 的周报，记录每周发生的一些小事。欢迎订阅，项目改自 [tw93/weekly](https://github.com/tw93/weekly)，感谢原作者。

**在线阅读**：[weekly.xiaonai.top](https://weekly.xiaonai.top) · [qiuyue520.github.io/Weekly](https://qiuyue520.github.io/Weekly/)

基于 [Astro](https://astro.build) + Markdown 的静态站点，同一篇周报提供四种语言：

| 路由 | 语言 |
|:---|:---|
| [/cn](https://weekly.xiaonai.top/cn) | 简体中文 |
| [/en](https://weekly.xiaonai.top/en) | English |
| [/ja](https://weekly.xiaonai.top/ja) | 日本語 |
| [/tw](https://weekly.xiaonai.top/tw) | 繁體中文 |

文章页右上角可以随时切换语言，某期有对应翻译就会深链过去。

## 写一篇新周报

在 `src/pages/cn/posts/` 下新建 `NNN-标题.md`（NNN 为期数，补零），frontmatter 写好 `date` 即可，标题会自动生成为「第 N 期 · YYYY/MM/DD」格式：

```bash
# 或者用脚手架，自动编号并更新 posts.json
pnpm new-post <标题>
```

## 翻译

周报有 en / ja / tw 三个译版，放在各自语言的 `posts/` 目录。自动补齐缺失翻译：

```bash
GROK_API_KEY=your_key node scripts/translate_posts.js
```

推送到 main 时 CI 也会自动检查并补翻（需要仓库配置 `GROK_API_KEY` secret）。

## 本地开发

```bash
pnpm install   # Node 20+，pnpm 12（构建脚本批准清单见 pnpm-workspace.yaml）
pnpm dev       # 本地预览，默认 http://localhost:4321/Weekly
pnpm build     # 构建到 dist/（含图片探测与 pagefind 索引）
pnpm preview   # 预览构建产物
```

## 部署

- 推送到 `main` 后由 GitHub Actions 自动构建并发布到 GitHub Pages（`.github/workflows/deploy.yml`）
- `weekly.xiaonai.top` 走 Cloudflare Pages，指向同一仓库
- 部署环境通过环境变量控制：`BASE`（子路径）与 `SITE_URL`（站点域名），默认按 GitHub Pages 子路径配置

## 结构速览

```
src/pages/cn|en|ja|tw/   # 四种语言的首页、posts/ 与 rss.xml
src/components/           # LangSwitcher（语言切换）、Card 等组件
scripts/                  # 翻译、图片探测、新文章脚手架
posts.json                # 供外部使用的文章元数据
```
