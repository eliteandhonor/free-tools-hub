const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

describe('Sitemap generation', function() {
  it('includes all tools', function() {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-test-'));
    fs.mkdirSync(path.join(tmp, 'scripts'));
    fs.mkdirSync(path.join(tmp, 'data'));

    const root = path.resolve(__dirname, '..');
    fs.copyFileSync(path.join(root, 'scripts', 'generate-sitemap.js'), path.join(tmp, 'scripts', 'generate-sitemap.js'));
    fs.copyFileSync(path.join(root, 'data', 'tools-config.json'), path.join(tmp, 'data', 'tools-config.json'));
    fs.copyFileSync(path.join(root, 'sitemap.xml'), path.join(tmp, 'sitemap.xml'));

    execFileSync('node', ['scripts/generate-sitemap.js'], { cwd: tmp });

    const sitemap = fs.readFileSync(path.join(tmp, 'sitemap.xml'), 'utf8');
    const config = JSON.parse(fs.readFileSync(path.join(tmp, 'data', 'tools-config.json'), 'utf8'));
    config.tools.forEach(tool => {
      const loc = `<loc>https://SITE_URL_PLACEHOLDER/tools/${tool.id}/</loc>`;
      expect(sitemap).to.include(loc);
    });
  });
});
