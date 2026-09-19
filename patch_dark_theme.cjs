const fs = require('fs');
let css = fs.readFileSync('src/style.css', 'utf8');

css = css.replace(
  /:root \{[\s\S]*?--loading-overlay-bg: rgba\(20, 20, 20, 0\.8\);\s*\}/,
  `:root {
  --bg-main: #6C2937;
  --bg-dark: #6C2937;
  --bg-panel: #7B3241;
  --bg-card: #7B3241;
  --bg-input: #7B3241;
  --bg-input-inner: #5A202C;
  --border-color: #8B3E4F;
  --text-main: #ffffff;
  --text-color: #ffffff;
  --text-muted: #d9b8bf;
  --accent: #ffffff;
  --editor-bg: #5A202C;
  --badge-bg: rgba(255, 255, 255, 0.1);
  --badge-color: #ffffff;
  --action-hover: rgba(255, 255, 255, 0.2);
  --slider-bg: #8B3E4F;
  --border-dashed: #8B3E4F;
  --loading-overlay-bg: rgba(108, 41, 55, 0.8);
}`
);

fs.writeFileSync('src/style.css', css);
console.log('Patched style.css');

