const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const configPath = path.join(root, 'data', 'tools-config.json');
const sitemapPath = path.join(root, 'sitemap.xml');

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const tools = config.tools || [];

const existing = fs.readFileSync(sitemapPath, 'utf8');
const marker = '<!-- Tool pages -->';
const idx = existing.indexOf(marker);
if (idx === -1) {
  throw new Error('Marker not found in sitemap');
}

// Use the current date in YYYY-MM-DD format for each sitemap generation
const lastmod = new Date().toISOString().slice(0, 10);

let header = existing.substring(0, idx + marker.length);
header = header.replace(/<lastmod>.*?<\/lastmod>/g, `<lastmod>${lastmod}</lastmod>`);
const footer = '\n</urlset>\n';

const toolEntries = tools.map(t =>
  `    <url><loc>https://SITE_URL_PLACEHOLDER/tools/${t.id}/</loc><lastmod>${lastmod}</lastmod><priority>0.8</priority></url>`
).join('\n');

const newContent = header + '\n' + toolEntries + '\n' + footer;
fs.writeFileSync(sitemapPath, newContent);
console.log('Sitemap regenerated with', tools.length, 'tools');
