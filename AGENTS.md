# Weekly Agent Guide

## Project

Weekly is an Astro and Markdown static site for weekly posts.

## Repository Map

- `src/` - Astro source, shared utilities, and page components.
- `public/` - static assets and generated public metadata.
- `posts.json` - post metadata used by the site.
- `RECENT.md` - recent posts index.
- `scripts/` - maintenance scripts, including image probing and translation helpers.
- `.github/workflows/build.yml` - site build and deployment workflow.
- `.github/workflows/translate-posts.yml` - scheduled or manual translation workflow.

## Language Routing

- Four language routes under `src/pages/`: `cn/`, `en/`, `ja/`, `tw/`, each with `index.astro`, `posts/` Markdown, and `rss.xml.js`.
- Chinese posts live in `src/pages/cn/posts/`; legacy `/posts/N` URLs redirect to `/cn/posts/N` via the `redirects` config plus the `fixRedirectBase` integration.
- The language switcher (`src/components/LangSwitcher.astro`) lists all four languages; on post pages it deep-links to an issue only when that language's translation exists, otherwise it links to the language home.
- `ja/` and `tw/` are scaffolding with no posts yet; dropping translated Markdown into their `posts/` directories is enough to publish.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm image:probe
GROK_API_KEY=your_key node scripts/translate_posts.js
```

`pnpm build` runs `scripts/probe-images.js` before the Astro build and `pagefind` after the build.

## Content Rules

- Required frontmatter fields: `title`, `date`, `cover`, `tag`. Do not submit posts with missing fields.
- Chinese posts: `YYYY-MM-DD-{topic}.md`; English posts: `YYYY-MM-DD-{topic}.en.md`. Do not mix languages in a single file.
- Preserve the author's voice: do not make colloquial phrasing formal, do not add emoji unless the original has them.

## Working Rules

- Do not delete existing posts or rewrite old content unless the task explicitly asks for it.
- Keep `posts.json` aligned with content changes.
- Keep generated files under `dist/` out of commits.
- Translation automation writes missing English posts under `src/pages/en/posts/`; preserve Markdown and frontmatter shape.
- Prefer small content or component edits with targeted verification.

## Verification

- Site or content changes: run `pnpm build`.
- Image-related changes: run `pnpm image:probe` or rely on the `prebuild` step.
- Translation changes: verify `GROK_API_KEY` is provided before running `scripts/translate_posts.js`, then inspect generated English Markdown before committing.
- Local visual checks: run `pnpm dev` and inspect the affected page.
- Documentation-only changes: check links and commands.

## GitHub Operations

- Use `gh` for issue and PR inspection.
- Do not post public comments unless the maintainer explicitly asks.
- Draft public replies in the same language as the thread.
