const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const configPath = path.join(root, 'data', 'tools-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

describe('Tool configuration', function() {
  config.tools.forEach(tool => {
    const toolDir = path.join(root, 'tools', tool.id);
    const indexPath = path.join(toolDir, 'index.html');

    it(`has directory for ${tool.id}`, function() {
      expect(fs.existsSync(toolDir)).to.be.true;
    });

    it(`tool ${tool.id} includes script.js script tag`, function() {
      expect(fs.existsSync(indexPath)).to.be.true;
      const content = fs.readFileSync(indexPath, 'utf8');
      expect(content.includes('<script src="script.js"')).to.be.true;
    });
  });
});
