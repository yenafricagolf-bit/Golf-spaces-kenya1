import { readFile, writeFile } from 'node:fs/promises';
const raw = process.env.VITE_SITE_URL || process.env.URL || '';
const strict = process.argv.includes('--require-domain') || process.env.CONTEXT === 'production';
let origin = '';
if (raw) {
  const url = new URL(raw);
  if (url.protocol !== 'https:') throw new Error('VITE_SITE_URL must use HTTPS.');
  origin = url.origin;
}
if (!origin && strict)
  throw new Error('Set VITE_SITE_URL to the production HTTPS domain before deploying.');
let html = await readFile('dist/index.html', 'utf8');
html = html
  .replace(/\s*<link rel="canonical"[^>]*>/g, '')
  .replace(/\s*<meta property="og:url"[^>]*>/g, '')
  .replace(/\s*<meta property="og:image"[^>]*>/g, '')
  .replace(/\s*<meta name="twitter:image"[^>]*>/g, '')
  .replace(/\s*<meta name="twitter:url"[^>]*>/g, '')
  .replace(/\s*<meta name="robots"[^>]*>/g, '')
  .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
if (origin) {
  const metadata = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Golf Spaces Kenya',
    description: 'Design and installation of golf practice spaces in Kenya. A YENGolf venture.',
    url: origin,
    image: `${origin}/photos/social.jpg`,
    areaServed: { '@type': 'Country', name: 'Kenya' },
    ...(process.env.VITE_CONTACT_PHONE ? { telephone: process.env.VITE_CONTACT_PHONE } : {}),
    ...(process.env.VITE_CONTACT_EMAIL ? { email: process.env.VITE_CONTACT_EMAIL } : {}),
  };
  html = html
    .replace(
      '</head>',
      `<link rel="canonical" href="${origin}/"/><meta property="og:url" content="${origin}/"/><meta property="og:image" content="${origin}/photos/social.jpg"/><meta name="twitter:image" content="${origin}/photos/social.jpg"/><meta name="twitter:url" content="${origin}/"/><script type="application/ld+json">${JSON.stringify(metadata).replace(/</g, '\\u003c')}</script></head>`,
    )
    .replace('content="/photos/social.jpg"', `content="${origin}/photos/social.jpg"`);
  await writeFile(
    'dist/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>`,
  );
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
} else {
  html = html.replace(
    '</head>',
    '<meta property="og:image" content="/photos/social.jpg"/><meta name="twitter:image" content="/photos/social.jpg"/><meta name="robots" content="noindex,nofollow"/></head>',
  );
  await writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n');
  process.stderr.write(
    'No production domain configured. Preview is noindex; canonical/sitemap/JSON-LD are generated on a configured build.\n',
  );
}
await writeFile('dist/index.html', html);
