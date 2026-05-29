import fs from 'fs';
import path from 'path';
import axios from 'axios';

const POSTS_DIR = path.join(process.cwd(), 'src', 'pages', 'posts');
const EN_POSTS_DIR = path.join(process.cwd(), 'src', 'pages', 'en', 'posts');
const POSTS_JSON = path.join(process.cwd(), 'posts.json');

function parseArgs() {
  const args = {
    model: 'gpt-4o-mini'
  };

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg === '--id' && process.argv[i + 1]) {
      args.id = parseInt(process.argv[i + 1]);
      i++;
    } else if (arg === '--url' && process.argv[i + 1]) {
      args.url = process.argv[i + 1];
      i++;
    } else if (arg === '--key' && process.argv[i + 1]) {
      args.key = process.argv[i + 1];
      i++;
    } else if (arg === '--model' && process.argv[i + 1]) {
      args.model = process.argv[i + 1];
      i++;
    }
  }

  return args;
}

function formatNumber(num) {
  return String(num).padStart(3, '0');
}

async function translateTitle(title, apiUrl, apiKey, model) {
  try {
    const response = await axios.post(
      apiUrl,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: '你是一个翻译专家。请将中文标题翻译成英文，只返回翻译后的英文标题，不要任何解释或引号。使用 kebab-case 格式（单词用连字符分隔，全部小写）。例如："我的第一篇文章" -> "my-first-article",用户说什么你就翻译什么'
          },
          {
            role: 'user',
            content: title
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('\u274C 标题翻译失败:', error.message);
    return null;
  }
}

async function translateContent(content, apiUrl, apiKey, model) {
  try {
    const response = await axios.post(
      apiUrl,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的翻译助手，请将中文翻译成自然流畅的英文。保留Markdown格式、链接和图片标签。只需翻译内容，不要添加或删除任何内容，并且了解用户想要表达的语气，神态，语境，保持意思不变，意译也行，别把可能带骂人的脏话翻译成不骂人的'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('\u274C 内容翻译失败:', error.message);
    return null;
  }
}

function getPostById(id) {
  if (!fs.existsSync(POSTS_JSON)) {
    return null;
  }

  try {
    const data = fs.readFileSync(POSTS_JSON, 'utf8');
    const posts = JSON.parse(data);
    return posts.find(p => p.num === id);
  } catch {
    return null;
  }
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (match) {
    return {
      frontmatter: match[1],
      body: content.slice(match[0].length)
    };
  }
  return {
    frontmatter: '',
    body: content
  };
}

function updateFrontmatterTitle(frontmatter, newTitle) {
  return frontmatter.replace(/^title:\s*.+$/m, `title: ${newTitle}`);
}

async function main() {
  const { id, url, key, model } = parseArgs();

  if (!id) {
    console.error('\u274C 缺少参数: --id 编号');
    console.log('用法: node scripts/AI_translate.js --id 编号 --url API接口 --key apikey [--model 模型名]');
    console.log('示例: node scripts/AI_translate.js --id 1 --url https://api.openai.com/v1/chat/completions --key sk-xxx --model gpt-4o-mini');
    process.exit(1);
  }

  if (!url) {
    console.error('\u274C 缺少参数: --url API接口');
    console.log('用法: node scripts/AI_translate.js --id 编号 --url API接口 --key apikey [--model 模型名]');
    process.exit(1);
  }

  if (!key) {
    console.error('\u274C 缺少参数: --key apikey');
    console.log('用法: node scripts/AI_translate.js --id 编号 --url API接口 --key apikey [--model 模型名]');
    process.exit(1);
  }

  const post = getPostById(id);

  if (!post) {
    console.error(`\u274C 编号 ${id} 的文章不存在`);
    process.exit(1);
  }

  const formattedNum = formatNumber(id);
  const sourcePath = path.join(POSTS_DIR, `${formattedNum}-${post.title}.md`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`\u274C 文件不存在: ${sourcePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(sourcePath, 'utf8');
  const { frontmatter, body } = extractFrontmatter(content);

  console.log(`\u23F0 开始翻译文章: ${post.title} (${id})`);
  console.log(`\u6A21\u578B: ${model}`);

  console.log('\u270D\uFE0F 正在翻译标题...');
  const translatedTitle = await translateTitle(post.title, url, key, model);

  if (!translatedTitle) {
    process.exit(1);
  }

  console.log(`\u2714\uFE0F 标题翻译完成: ${translatedTitle}`);

  console.log('\u270D\uFE0F 正在翻译内容...');
  const translatedBody = await translateContent(body, url, key, model);

  if (!translatedBody) {
    process.exit(1);
  }

  console.log('\u2714\uFE0F 内容翻译完成');

  const updatedFrontmatter = updateFrontmatterTitle(frontmatter, translatedTitle);
  const translatedContent = `---\n${updatedFrontmatter}\n---\n${translatedBody}`;

  const enFileName = `${formattedNum}-${translatedTitle}.md`;
  const enFilePath = path.join(EN_POSTS_DIR, enFileName);

  fs.writeFileSync(enFilePath, translatedContent, 'utf8');

  console.log(`\u2705 翻译完成！`);
  console.log(`\u6587\u4EF6: src/pages/en/posts/${enFileName}`);
}

main();