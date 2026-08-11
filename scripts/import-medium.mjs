import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const feedPathIndex = process.argv.indexOf('--feed');
const feedPath = feedPathIndex >= 0 ? process.argv[feedPathIndex + 1] : null;
const mediumFeedUrl = 'https://medium.com/feed/@selvamsriram';
const siteUrl = 'https://www.srirams.dev';

const articleDetails = {
  cfd645e7d08b: {
    slug: 'running-language-models-locally',
    kind: 'Guide',
    readMinutes: 5,
  },
  '8401bee9e1ce': {
    slug: 'does-chatgpt-memory-contain-pii',
    kind: 'Research read',
    readMinutes: 5,
  },
  '67d076efff26': {
    slug: 'what-makes-llm-memorize-things',
    kind: 'Research read',
    readMinutes: 4,
  },
};

const htmlEscape = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const decodeEntities = (value) => String(value)
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replaceAll('&nbsp;', ' ')
  .replaceAll('&amp;', '&')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'");

const plainText = (html) => decodeEntities(html.replace(/<[^>]+>/g, ' '))
  .replace(/\s+/g, ' ')
  .trim();

const readTag = (item, tag) => {
  const safeTag = tag.replace(':', '\\:');
  const match = item.match(new RegExp(`<${safeTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${safeTag}>`));
  return match?.[1]
    ?.replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .trim() ?? '';
};

const readFeed = async () => {
  if (feedPath) return readFile(feedPath, 'utf8');
  const response = await fetch(mediumFeedUrl);
  if (!response.ok) throw new Error(`Medium feed returned ${response.status}`);
  return response.text();
};

const parseFeed = (xml) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
  const item = match[1];
  const originalUrl = readTag(item, 'link').split('?')[0];
  const postId = readTag(item, 'guid').split('/').pop();
  const details = articleDetails[postId];
  if (!details) throw new Error(`Add metadata for Medium post ${postId}`);

  const rawContent = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] ?? '';
  const contentWithoutRssFooter = rawContent.replace(/<img src="https:\/\/medium\.com\/_\/stat[\s\S]*$/, '').trim();
  const firstParagraph = contentWithoutRssFooter.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? '';
  const words = plainText(contentWithoutRssFooter).split(/\s+/).filter(Boolean).length;

  return {
    ...details,
    postId,
    title: readTag(item, 'title'),
    originalUrl,
    publishedAt: new Date(readTag(item, 'pubDate')),
    categories: [...item.matchAll(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g)].map((category) => category[1]),
    description: plainText(firstParagraph),
    readMinutes: details.readMinutes ?? Math.max(1, Math.round(words / 220)),
    rawContent: contentWithoutRssFooter,
    images: [...contentWithoutRssFooter.matchAll(/<img[^>]+src="([^"]+)"/g)].map((image) => image[1]),
  };
});

const formatDate = (date) => new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
}).format(date);

const formatShortDate = (date) => new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
}).format(date);

const formatMonthYear = (date) => new Intl.DateTimeFormat('en-US', {
  month: 'short', year: 'numeric', timeZone: 'UTC',
}).format(date);

const themeButton = (placement) => `<button type="button" data-theme-toggle data-theme-toggle-${placement} aria-pressed="false">
  <svg data-theme-icon viewBox="0 0 24 24" aria-hidden="true"><path data-theme-moon d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path><g data-theme-sun><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"></path></g></svg>
</button>`;

const socialLinks = `<div class="rail-utilities" role="group" aria-label="Profile links and appearance">
  <a class="rail-icon" href="https://www.linkedin.com/in/sriramselvam/" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 3.5a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4ZM3.7 8.2h3v12h-3v-12Zm5 0h2.9v1.6h.04c.4-.8 1.4-2 3.9-2 4.1 0 4.9 2.7 4.9 6.3v6.1h-3v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.1h-3v-12Z"></path></svg></a>
  <a class="rail-icon" href="https://github.com/selvamsriram" target="_blank" rel="noopener" aria-label="GitHub" title="GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.61-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.55 9.55 0 0 1 12 7.5c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"></path></svg></a>
  <a class="rail-icon rail-icon-stroke" href="https://scholar.google.com/citations?view_op=search_authors&amp;mauthors=Sriram+Selvam" target="_blank" rel="noopener" aria-label="Google Scholar" title="Google Scholar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5Z"></path><path d="M7 11.5v4.2c2.7 2.1 7.3 2.1 10 0v-4.2M21 9v6"></path></svg></a>
  <a class="rail-icon rail-icon-stroke" href="https://huggingface.co/srirxml" target="_blank" rel="noopener" aria-label="Hugging Face" title="Hugging Face"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="11" r="5"></circle><path d="M10 10h.01M14 10h.01M10 13c1.2.9 2.8.9 4 0M7.3 13.8 4 16.2l1.7 2.3 3.4-2.2M16.7 13.8l3.3 2.4-1.7 2.3-3.4-2.2"></path></svg></a>
  <span class="rail-separator" aria-hidden="true"></span>
  ${themeButton('rail')}
</div>`;

const navigationItems = (homePath) => [
  { label: 'Index', href: homePath },
  { label: 'Research', href: `${homePath}#research` },
  { label: 'Systems', href: `${homePath}#systems` },
  { label: 'Writing', href: `${homePath}#writing`, writingParent: true },
  { label: 'Experience', href: `${homePath}#experience` },
  { label: 'Press', href: `${homePath}#press` },
  { label: 'Education', href: `${homePath}#education` },
  { label: 'Contact', href: `${homePath}#contact` },
];

const profileNavigation = ({ depth = 1, currentArticle = null } = {}) => {
  const homePath = '../'.repeat(depth);
  const allWritingPath = depth === 1 ? './' : '../';
  const items = navigationItems(homePath);
  const railWritingTree = `<div class="rail-writing-tree" role="group" aria-label="Writing navigation">
        <a class="rail-sub-link${currentArticle ? ' is-ancestor' : ' is-active'}" href="${allWritingPath}"${currentArticle ? '' : ' aria-current="page"'}><span>All writing</span></a>
        ${currentArticle ? `<a class="rail-sub-link rail-article-link is-active" href="./" aria-current="page" title="${htmlEscape(currentArticle.title)}"><span>${htmlEscape(currentArticle.title)}</span></a>` : ''}
      </div>`;
  const narrowWritingTree = `<a class="narrow-context-link${currentArticle ? ' is-ancestor' : ' is-active'}" href="${allWritingPath}"${currentArticle ? '' : ' aria-current="page"'}>All writing</a>
    ${currentArticle ? `<a class="narrow-context-link narrow-article-link is-active" href="./" aria-current="page" title="${htmlEscape(currentArticle.title)}">${htmlEscape(currentArticle.title)}</a>` : ''}`;
  return `<nav class="profile-rail" data-profile-rail aria-label="Portfolio navigation">
  <div data-reveal data-delay="120">
    <a class="rail-name" href="${homePath}">Sriram Selvam</a>
    ${socialLinks}
    <div class="rail-rule"></div>
    <div class="rail-links">
      ${items.map((item) => `<a class="rail-link${item.writingParent ? ' is-parent' : ''}" href="${item.href}"><span class="rail-link-rule"></span><span>${item.label}</span></a>${item.writingParent ? `\n      ${railWritingTree}` : ''}`).join('\n      ')}
    </div>
  </div>
</nav>
<nav class="profile-nav-narrow" data-nav-narrow aria-label="Portfolio navigation">
  <div class="profile-nav-scroll" data-nav-narrow-scroll>
    ${items.map((item) => `<a class="narrow-link${item.writingParent ? ' is-parent' : ''}" href="${item.href}">${item.label}</a>${item.writingParent ? `\n    ${narrowWritingTree}` : ''}`).join('\n    ')}
  </div>
  ${themeButton('compact')}
</nav>`;
};

const siteFooter = ({ depth = 1 } = {}) => {
  const homePath = '../'.repeat(depth);
  return `<footer class="profile-footer">
  <div class="profile-footer-inner">
    <span>© 2026 Sriram Selvam</span>
    <div><a href="${homePath}">Profile</a><a href="https://medium.com/@selvamsriram" target="_blank" rel="noopener">Medium ↗</a></div>
  </div>
</footer>`;
};

const documentHead = ({ title, description, canonical, cssPath, type = 'website', image }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${htmlEscape(description)}">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0e1116" media="(prefers-color-scheme: dark)">
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${htmlEscape(title)}">
  <meta property="og:description" content="${htmlEscape(description)}">
  <meta property="og:url" content="${canonical}">
  ${image ? `<meta property="og:image" content="${image}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="${cssPath.includes('../blog.css') ? '../../favicon.svg?v=2' : '../favicon.svg?v=2'}" type="image/svg+xml">
  <link rel="stylesheet" href="${cssPath}?v=9">
  <title>${htmlEscape(title)}</title>
</head>`;

const transformArticleContent = (article, localLinks) => {
  let content = article.rawContent;
  article.images.forEach((source, index) => {
    const suffix = extname(new URL(source).pathname) || '.jpg';
    content = content.replaceAll(source, `../media/${article.postId}-${index + 1}${suffix}`);
  });
  Object.entries(localLinks).forEach(([source, destination]) => {
    content = content.replaceAll(source, destination);
  });
  content = content
    .replaceAll('<h3>', '<h2>')
    .replaceAll('</h3>', '</h2>')
    .replaceAll('<h4>', '<h3>')
    .replaceAll('</h4>', '</h3>')
    .replace(/<figure><img alt="" src="([^"]+)" \/><figcaption>([\s\S]*?)<\/figcaption><\/figure>/g, (_match, source, caption) => (
      `<figure><img alt="${htmlEscape(plainText(caption))}" src="${source}" loading="lazy" /><figcaption>${caption}</figcaption></figure>`
    ))
    .replace(/<img alt="" src="([^"]+)" \/>/g, '<img alt="" src="$1" loading="lazy" />')
    .replace(/<a href="https:\/\//g, '<a target="_blank" rel="noopener" href="https://');
  return content;
};

const articleRow = (article, index) => `<a class="archive-row" data-row data-reveal data-delay="${50 + (index * 45)}" href="${article.slug}/">
  <div class="row-meta" data-meta-col>
    <span>${formatMonthYear(article.publishedAt)}</span>
    <span class="row-kind">${htmlEscape(article.kind)}</span>
    <span>${article.readMinutes} min read</span>
  </div>
  <div class="row-copy">
    <h2>${htmlEscape(article.title)}</h2>
    <p>${htmlEscape(article.description)}</p>
  </div>
  <span class="row-arrow" aria-hidden="true">→</span>
</a>`;

const sectionHeading = ({ title, detail, id, titleTag = 'h2' }) => `<div class="section-heading" data-reveal data-delay="0">
  <${titleTag} class="section-title"${id ? ` id="${id}"` : ''}>${title}</${titleTag}>
  ${detail ? `<span class="section-detail">${detail}</span>` : ''}
</div>`;

const heroGlow = '<div class="hero-glow" data-hero-glow aria-hidden="true"></div>';

const portfolioPageStart = ({ depth, bodyClass = '', currentArticle = null }) => `<body class="${bodyClass}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="profile-page" data-page="sriram">
    ${profileNavigation({ depth, currentArticle })}
    <main class="profile-main" id="main-content">`;

const portfolioPageEnd = ({ depth, scriptPath }) => `</main>
    ${siteFooter({ depth })}
  </div>
  <script src="${scriptPath}?v=9"></script>
</body>
</html>`;

const renderBlogIndex = (articles) => {
  const [featured] = articles;
  const years = [...new Set(articles.map((article) => article.publishedAt.getUTCFullYear()))];
  return `${documentHead({
    title: 'Writing — Sriram Selvam',
    description: 'Essays by Sriram Selvam on language models, privacy, AI systems, and responsible model behavior.',
    canonical: `${siteUrl}/blog/`,
    cssPath: 'blog.css',
    image: `${siteUrl}/blog/media/${featured.postId}-1${extname(new URL(featured.images[0]).pathname)}`,
  })}
${portfolioPageStart({ depth: 1, bodyClass: 'archive-page' })}
    <section class="archive-hero" aria-labelledby="page-title">
      ${heroGlow}
      <h1 id="page-title" data-reveal data-delay="90">Writing</h1>
      <div class="hero-topics" data-reveal data-delay="180">
        <span class="accent">Language models</span><span>/</span><span>Privacy</span><span>/</span><span>AI systems</span>
      </div>
      <p data-reveal data-delay="270">Long-form notes on how language models remember, what they expose, and how to run and reason about them more deliberately.</p>
    </section>
    <section class="archive-list" id="articles" aria-labelledby="archive-title">
      ${sectionHeading({ title: 'Essays', detail: `${String(articles.length).padStart(2, '0')} pieces · ${years.join(', ')}`, id: 'archive-title' })}
      ${articles.map((article, index) => articleRow(article, index)).join('\n')}
    </section>
${portfolioPageEnd({ depth: 1, scriptPath: 'blog.js' })}`;
};

const articlePager = (article, label) => `<a class="pager-row" data-row href="../${article.slug}/">
  <span class="pager-direction" data-meta-col>${label}</span>
  <strong>${htmlEscape(article.title)}</strong>
  <span class="row-arrow" aria-hidden="true">→</span>
</a>`;

const renderArticle = (article, articles, localLinks) => {
  const index = articles.indexOf(article);
  const newer = articles[index - 1];
  const older = articles[index + 1];
  const suffix = extname(new URL(article.images[0]).pathname) || '.jpg';
  const canonical = `${siteUrl}/blog/${article.slug}/`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt.toISOString(),
    author: { '@type': 'Person', name: 'Sriram Selvam', url: siteUrl },
    image: `${siteUrl}/blog/media/${article.postId}-1${suffix}`,
    mainEntityOfPage: canonical,
  };

  return `${documentHead({
    title: `${article.title} — Sriram Selvam`,
    description: article.description,
    canonical,
    cssPath: '../blog.css',
    type: 'article',
    image: jsonLd.image,
  })}
${portfolioPageStart({ depth: 2, bodyClass: 'article-page', currentArticle: article })}
  <div class="reading-progress" data-reading-progress aria-hidden="true"></div>
    <article class="essay">
      <header class="article-header">
        ${heroGlow}
        <div class="article-title-row" data-row>
          <div class="article-meta" data-meta-col data-reveal data-delay="60">
            <span>${formatShortDate(article.publishedAt)}</span>
            <span class="article-kind">${htmlEscape(article.kind)}</span>
            <span>${article.readMinutes} min read</span>
          </div>
          <div class="article-title-copy">
            <h1 data-reveal data-delay="90">${htmlEscape(article.title)}</h1>
            <p class="article-deck" data-reveal data-delay="180">${htmlEscape(article.description)}</p>
            <div class="article-byline" data-reveal data-delay="240"><span>By Sriram Selvam</span><span>/</span><span>${formatDate(article.publishedAt)}</span></div>
          </div>
        </div>
      </header>
      <div class="article-layout" data-row>
        <aside class="article-aside" data-meta-col>
          <div class="aside-sticky">
            <span class="aside-label">In this essay</span>
            <nav data-article-toc aria-label="Article sections"></nav>
          </div>
        </aside>
        <div class="article-body" id="article-body">
          ${transformArticleContent(article, localLinks)}
        </div>
      </div>
      <footer class="article-source">
        <span data-meta-col>Source</span>
        <div><span>Originally published on Medium.</span><a href="${article.originalUrl}" target="_blank" rel="noopener">Medium ↗</a></div>
      </footer>
    </article>
    <nav class="article-pager" aria-label="More writing">
      ${sectionHeading({ title: 'More writing' })}
      ${newer ? articlePager(newer, 'Newer') : '<span></span>'}
      ${older ? articlePager(older, 'Older') : '<span></span>'}
    </nav>
  <script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll('<', '\\u003c')}</script>
${portfolioPageEnd({ depth: 2, scriptPath: '../blog.js' })}`;
};

const updateHomepageLinks = async (articles) => {
  const homepagePath = join(projectRoot, 'index.html');
  const bundled = await readFile(homepagePath, 'utf8');
  const templatePattern = /<script type="__bundler\/template">([\s\S]*?)<\/script>/;
  const match = bundled.match(templatePattern);
  if (!match) throw new Error('Could not find the homepage bundle template');
  let template = JSON.parse(match[1]);

  articles.forEach((article) => {
    template = template.replaceAll(
      `href="${article.originalUrl}" target="_blank" rel="noopener"`,
      `href="/blog/${article.slug}/"`,
    );
  });

  template = template
    .replace(
      'href="https://medium.com/llm-everything" target="_blank" rel="noopener"',
      'href="/blog/"',
    )
    .replace('All essays on Medium ↗', 'Browse all writing →')
    .replace(/\n\s*<span[^>]*>LLM Everything<\/span>/, '')
    .replace(/\n\s*<div data-writing-tree-home=""[\s\S]*?<\/div>/, '')
    .replace(/\n\s*<a href="\/blog\/" data-writing-context-home=""[\s\S]*?<\/a>/, '')
    .replace(/\n<script data-writing-hash-navigation="">[\s\S]*?<\/script>/, '')
    .replace(/^\s*<a href="\/blog\/" data-blog-nav="rail".*<\/a>\n?/m, '')
    .replace(/^\s*<a href="\/blog\/" data-blog-nav="compact".*<\/a>\n?/m, '');

  const homeRailWritingChild = `<div data-writing-tree-home="" style="display:flex; flex-direction:column; margin:2px 0 5px 31px">
          <a href="/blog/" style="display:block; padding:5px 0; border-bottom:none; color:var(--ink-3,#51565E); font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:var(--fs-meta,10.5px); font-weight:500; line-height:1.4; letter-spacing:0.15em; text-transform:uppercase" style-hover="color:var(--accent,#0B57D0)">All writing</a>
        </div>`;
  const homeNarrowWritingChild = `<a href="/blog/" data-writing-context-home="" style="position:relative; flex:0 0 auto; padding:3px 0 4px 17px; border-bottom:none; color:var(--ink-3,#51565E); font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:var(--fs-meta,10.5px); font-weight:500; line-height:1.4; letter-spacing:0.11em; text-transform:uppercase">↳ All writing</a>`;

  template = template
    .replace(/(<a href="#writing" data-nav="writing"[\s\S]*?<\/a>)/, `$1\n        ${homeRailWritingChild}`)
    .replace(/(<a href="#writing" data-nav2="writing"[\s\S]*?<\/a>)/, `$1\n      ${homeNarrowWritingChild}`);

  const homeHashNavigation = `<script data-writing-hash-navigation="">
(() => {
  if (!window.location.hash) return;
  const alignTarget = () => {
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!target) return;
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    target.scrollIntoView({ block: 'start', behavior: 'auto' });
    window.requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = previousBehavior; });
  };
  const settleOnTarget = () => [0, 120, 360, 800].forEach((delay) => window.setTimeout(alignTarget, delay));
  settleOnTarget();
  if (document.readyState !== 'complete') window.addEventListener('load', settleOnTarget, { once: true });
})();
</script>`;
  template = template.replace('</body>', `${homeHashNavigation}\n</body>`);

  const encodedTemplate = JSON.stringify(template).replaceAll('</', '<\\u002F');
  await writeFile(homepagePath, bundled.replace(templatePattern, `<script type="__bundler/template">\n${encodedTemplate}\n</script>`));
};

const writeSitemap = async (articles) => {
  const urls = [
    `${siteUrl}/`,
    `${siteUrl}/blog/`,
    ...articles.map((article) => `${siteUrl}/blog/${article.slug}/`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>\n`;
  await writeFile(join(projectRoot, 'sitemap.xml'), xml);
};

const main = async () => {
  const articles = parseFeed(await readFeed()).sort((a, b) => b.publishedAt - a.publishedAt);
  const blogRoot = join(projectRoot, 'blog');
  await mkdir(join(blogRoot, 'media'), { recursive: true });

  const localLinks = Object.fromEntries(articles.map((article) => [article.originalUrl, `../${article.slug}/`]));
  await writeFile(join(blogRoot, 'index.html'), renderBlogIndex(articles));

  for (const article of articles) {
    const articleRoot = join(blogRoot, article.slug);
    await mkdir(articleRoot, { recursive: true });
    await writeFile(join(articleRoot, 'index.html'), renderArticle(article, articles, localLinks));
  }

  const imageManifest = articles.flatMap((article) => article.images.map((source, index) => {
    const suffix = extname(new URL(source).pathname) || '.jpg';
    return `blog/media/${article.postId}-${index + 1}${suffix}\t${source}`;
  })).join('\n');
  await writeFile(join(projectRoot, 'blog', 'image-manifest.tsv'), `${imageManifest}\n`);
  await updateHomepageLinks(articles);
  await writeSitemap(articles);
  console.log(`Imported ${articles.length} articles and indexed ${imageManifest.split('\n').length} images.`);
};

await main();
