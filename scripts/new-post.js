import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'src', 'pages', 'posts');
const POSTS_JSON = path.join(process.cwd(), 'posts.json');
const BASE_URL = 'https://weekly.xiaonai.top';

function getNextNumber() {
  if (!fs.existsSync(POSTS_JSON)) {
    return 1;
  }

  try {
    const data = fs.readFileSync(POSTS_JSON, 'utf8');
    const posts = JSON.parse(data);

    if (!Array.isArray(posts) || posts.length === 0) {
      return 1;
    }

    const maxNum = Math.max(...posts.map(p => p.num));
    return maxNum + 1;
  } catch {
    return 1;
  }
}

function formatNumber(num) {
  return String(num).padStart(3, '0');
}

function createPostFile(num, title) {
  const formattedNum = formatNumber(num);
  const fileName = `${formattedNum}-${title}.md`;
  const filePath = path.join(POSTS_DIR, fileName);

  const today = new Date();
  const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

  const content = `---
date: ${dateStr}
---

<img src="" width="800" />

<small>封面图描述...</small>

> **记录每周发生的一些小事**

**周一**: 

**周二**: 

**周三**: 

**周四**: 

**周五**: 


`;

  fs.writeFileSync(filePath, content, 'utf8');
  return fileName;
}

function updatePostsJson(num, title) {
  let posts = [];

  if (fs.existsSync(POSTS_JSON)) {
    try {
      const data = fs.readFileSync(POSTS_JSON, 'utf8');
      posts = JSON.parse(data);
    } catch {
      posts = [];
    }
  }

  const newPost = {
    num,
    title,
    url: `${BASE_URL}/posts/${formatNumber(num)}-${title}`,
    pic: ''
  };

  posts.unshift(newPost);

  fs.writeFileSync(POSTS_JSON, JSON.stringify(posts, null, 2), 'utf8');
}

function main() {
  const title = process.argv[2];

  if (!title) {
    console.error('用法: node scripts/new-post.js <文章标题>');
    process.exit(1);
  }

  const num = getNextNumber();
  const fileName = createPostFile(num, title);
  updatePostsJson(num, title);

  console.log(`\u2705 文章创建成功！`);
  console.log(`\u6587\u4EF6: src/pages/posts/${fileName}`);
  console.log(`\u7F16\u53F7: ${formatNumber(num)}`);
  console.log(`\u94FE\u63A5: ${BASE_URL}/posts/${formatNumber(num)}-${title}`);
}

main();