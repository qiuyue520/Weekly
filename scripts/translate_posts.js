/**
 * This script automates the translation of weekly posts using the Grok API (xAI).
 * It checks for missing translations (en / ja / tw) and generates them.
 * Run with: GROK_API_KEY=your_key node scripts/translate_posts.js
 */
import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
// 源语言文章在 src/pages/cn/posts，目标语言一次跑三个
const SOURCE_DIR = path.join(__dirname, "../src/pages/cn/posts");
const API_URL = "https://api.x.ai/v1/chat/completions";
const API_KEY = process.env.GROK_API_KEY;
const MODEL = "grok-beta";

// 各语言共用的翻译规则
const SHARED_RULES = `Rules:
1. Tone: Engineer's cool, interesting, and professional tone. Preserve the author's casual voice; do not make colloquial phrasing formal.
2. Formatting: STRICTLY preserve all Markdown formatting (links, images, bold, lists, code blocks, tables, blockquotes, etc.).
3. Content: Translate all text, including titles and descriptions. Keep emojis (like 🏐 📎) unchanged.
4. Accuracy: Ensure technical terms are translated accurately.
5. Output: Return ONLY the translated Markdown content, no explanations or conversational text.`;

// --- PROMPTS（每个目标语言一份） ---
const TARGETS = [
  {
    lang: "en",
    dir: path.join(__dirname, "../src/pages/en/posts"),
    systemPrompt: `You are a professional tech blogger and translator.
Translate the following Markdown content from Simplified Chinese to English.

${SHARED_RULES}`,
  },
  {
    lang: "ja",
    dir: path.join(__dirname, "../src/pages/ja/posts"),
    systemPrompt: `You are a professional tech blogger and translator.
Translate the following Markdown content from Simplified Chinese into natural Japanese.

${SHARED_RULES}
6. Style: Use polite but relaxed です/ます style.
7. Localize idioms with natural Japanese equivalents (e.g. 临时抱佛脚 → 一夜漬け), not word-for-word translations.`,
  },
  {
    lang: "tw",
    dir: path.join(__dirname, "../src/pages/tw/posts"),
    systemPrompt: `You are a professional tech blogger and translator.
Translate the following Markdown content from Simplified Chinese into Traditional Chinese as used in Taiwan.

${SHARED_RULES}
6. Style: Use Traditional characters with Taiwan wording and phrasing (網路、軟體、專案、搜尋、環境建置), not a plain character-by-character conversion.
7. Do not over-localize: keep common English words exactly as a Taiwanese blogger would naturally write them (e.g. write "blog" instead of 部落格, keep "weekly" as-is).`,
  },
];

function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (match) {
    return {
      frontmatter: match[1],
      body: match[2],
      hasFrontmatter: true,
    };
  }
  return {
    frontmatter: "",
    body: fileContent,
    hasFrontmatter: false,
  };
}

async function translateContent(content, systemPrompt) {
  if (!API_KEY) {
    console.error("❌ ERROR: GROK_API_KEY is not set.");
    return null;
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content },
        ],
        temperature: 0.3,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "❌ Translation API failed:",
      error.response?.data || error.message,
    );
    return null;
  }
}

function targetDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return fs.readdirSync(dir);
}

async function run() {
  const files = fs.readdirSync(SOURCE_DIR).filter((f) => f.endsWith(".md"));

  console.log(
    `🔍 Checking ${files.length} posts against ${TARGETS.length} target languages (en / ja / tw)...`,
  );

  let processedCount = 0;

  for (const file of files) {
    const issueNumber = file.split("-")[0];

    const sourcePath = path.join(SOURCE_DIR, file);
    const rawContent = fs.readFileSync(sourcePath, "utf-8");
    const { frontmatter, body, hasFrontmatter } = parseFrontmatter(rawContent);

    if (!body.trim()) {
      console.log(`⚠️  Skipping empty body: ${file}`);
      continue;
    }

    for (const target of TARGETS) {
      const targetFiles = targetDirExists(target.dir);

      // 该期数在该语言下已有译文（任意文件名，只要期数前缀相同）则跳过
      const existingTranslation = targetFiles.find((f) =>
        f.startsWith(`${issueNumber}-`),
      );

      if (existingTranslation) {
        continue;
      }

      console.log(
        `\n🚀 Translating Issue #${issueNumber} → ${target.lang} (${file})...`,
      );

      const translatedBody = await translateContent(body, target.systemPrompt);

      if (translatedBody) {
        // 与源文件同名，方便按期数一一对应；路由只使用期数前缀，slug 不影响页面
        const targetPath = path.join(target.dir, file);

        // Reconstruct valid file content
        let finalContent = "";
        if (hasFrontmatter) {
          finalContent = `---\n${frontmatter}\n---\n\n${translatedBody.trim()}\n`;
        } else {
          finalContent = `${translatedBody.trim()}\n`;
        }

        fs.writeFileSync(targetPath, finalContent);
        console.log(
          `✅ Saved ${target.lang} translation to: src/pages/${target.lang}/posts/${file}`,
        );
        processedCount++;
      }

      // Rate limiting (gentle)
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (processedCount === 0) {
    console.log("\n✨ All posts have translations in all languages. Nothing to do.");
  } else {
    console.log(`\n🎉 Successfully translated ${processedCount} posts.`);
  }
}

run();
