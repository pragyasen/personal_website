import Parser from 'rss-parser';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FEED_URL = 'https://medium.com/feed/@pragya_sen1';
const MAX_POSTS = 12;

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImage(item) {
  const content = item['content:encoded'] || item.content || '';
  const match = content.match(/<img[^>]+src="([^"]+)"/);
  if (match) return match[1];

  if (item.enclosure?.url) return item.enclosure.url;
  return null;
}

async function fetchBlog() {
  const parser = new Parser({
    customFields: {
      item: [['content:encoded', 'contentEncoded']],
    },
  });

  console.log(`Fetching Medium feed: ${FEED_URL}`);
  const feed = await parser.parseURL(FEED_URL);

  const posts = feed.items.slice(0, MAX_POSTS).map((item) => {
    const rawContent = item.contentEncoded || item.contentSnippet || item.content || '';
    const excerpt = stripHtml(rawContent).slice(0, 220) + '…';

    return {
      title: item.title,
      link: item.link,
      date: item.isoDate || item.pubDate,
      excerpt,
      image: extractImage(item),
      tags: (item.categories || []).slice(0, 5),
    };
  });

  const dataDir = join(ROOT, 'data');
  mkdirSync(dataDir, { recursive: true });

  const output = {
    fetchedAt: new Date().toISOString(),
    source: FEED_URL,
    posts,
  };

  writeFileSync(join(dataDir, 'blog.json'), JSON.stringify(output, null, 2));
  console.log(`Wrote ${posts.length} posts to data/blog.json`);
}

fetchBlog().catch((err) => {
  console.error('Blog fetch failed:', err.message);
  process.exit(1);
});
