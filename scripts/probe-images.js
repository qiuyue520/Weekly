import fs from "fs";
import path from "path";
import probe from "probe-image-size";
import throat from "throat";

// 扫描全部语言的 posts 目录（缺失的目录自动跳过）
const POSTS_DIRS = [
  "./src/pages/cn/posts",
  "./src/pages/en/posts",
  "./src/pages/ja/posts",
  "./src/pages/tw/posts",
];
const OUTPUT_FILE = "./src/data/image-metadata.json";
const CONCURRENCY = 10;

// Regex to find images in markdown files
// More robustly match src="..."
const IMG_REGEX = /<img\s+[^>]*src="([^"]+)"/g;
const FRONTMATTER_IMG_REGEX = /^image:\s*(https?:\/\/\S+)/m;

function listPostFiles() {
  return POSTS_DIRS.flatMap((dir) => {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => path.join(dir, f));
  });
}

async function probeImages() {
  const files = listPostFiles();
  const imageUrls = new Set();

  console.log(`Scanning ${files.length} files...`);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");

    // 1. Match <img> tags
    let match;
    while ((match = IMG_REGEX.exec(content)) !== null) {
      const url = match[1];
      const domainRegex =
        /https:\/\/(?:cdn\.(?:fliggy\.com|alipayobjects\.com)|gw\.(?:alipayobjects\.com|alicdn\.com)|img\.alicdn\.com|raw\.githubusercontent\.com|camo\.githubusercontent\.com|cdn\.tw93\.fun)/;
      const isSvgOrGif =
        url.toLowerCase().includes(".svg") ||
        url.toLowerCase().includes(".gif") ||
        url.includes("2e737667") || // .svg in hex
        url.includes("2e676966"); // .gif in hex

      if (url.match(domainRegex) && !isSvgOrGif) {
        imageUrls.add(url);
      }
    }

    // 2. Match frontmatter image
    const fmMatch = content.match(FRONTMATTER_IMG_REGEX);
    if (fmMatch) {
      const url = fmMatch[1];
      const domainRegex =
        /https:\/\/(?:cdn\.(?:fliggy\.com|alipayobjects\.com)|gw\.(?:alipayobjects\.com|alicdn\.com)|img\.alicdn\.com|raw\.githubusercontent\.com|camo\.githubusercontent\.com|cdn\.tw93\.fun)/;
      if (
        url.match(domainRegex) &&
        !url.toLowerCase().includes(".svg") &&
        !url.toLowerCase().includes(".gif")
      ) {
        imageUrls.add(url);
      }
    }
  }

  console.log(`Found ${imageUrls.size} unique images across all posts.`);

  // Load existing metadata to avoid re-probing
  let metadata = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const rawData = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
      // Clean up legacy garbage keys (like ones containing " width=")
      for (const [key, value] of Object.entries(rawData)) {
        if (
          !key.includes('"') &&
          !key.includes(" width=") &&
          !key.includes("svg")
        ) {
          metadata[key] = value;
        }
      }
    } catch (e) {
      console.warn("Failed to parse existing metadata, starting fresh.");
    }
  }

  const urlsToProbe = Array.from(imageUrls).filter((url) => !metadata[url]);

  console.log(
    `Incremental update: ${Object.keys(metadata).length} in cache, ${urlsToProbe.length} new images to probe.`,
  );

  const t = throat(CONCURRENCY);
  const tasks = urlsToProbe.map((url) =>
    t(async () => {
      let retries = 3;
      while (retries > 0) {
        try {
          console.log(`Probing ${url}...`);
          // Add User-Agent to avoid 403 Forbidden errors
          const result = await probe(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });
          let width = result.width;
          let height = result.height;

          // Handle EXIF orientation (5-8 mean the image is rotated 90 or 270 degrees)
          if (result.orientation >= 5 && result.orientation <= 8) {
            [width, height] = [height, width];
          }

          metadata[url] = {
            width,
            height,
            mime: result.mime,
          };
          return; // Success
        } catch (err) {
          retries--;
          if (retries === 0) {
            console.error(
              `Failed to probe ${url} after 3 attempts: ${err.message}`,
            );
          } else {
            console.log(`Retrying ${url} (${retries} attempts left)...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }
    }),
  );

  await Promise.all(tasks);

  // Ensure directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Sort keys for clean git diffs
  const sortedMetadata = {};
  Object.keys(metadata)
    .sort()
    .forEach((key) => {
      sortedMetadata[key] = metadata[key];
    });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedMetadata, null, 2));
  console.log(`Metadata saved to ${OUTPUT_FILE}`);
}

probeImages().catch((err) => {
  console.error(err);
  process.exit(1);
});
