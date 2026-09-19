const fs = require('fs');

let css = fs.readFileSync('src/style.css', 'utf8');

// 1. Update light theme variables
css = css.replace(/--bg-panel:\s*#ffffff;/g, '--bg-panel: #f7f5f2;'); // Warm beige for sidebar
css = css.replace(/--bg-main:\s*#f8fafc;/g, '--bg-main: #f4f4f2;');
css = css.replace(/--editor-bg:\s*#f8fafc;/g, '--editor-bg: #f4f4f2;');
css = css.replace(/--bg-dark:\s*#f4f5f7;/g, '--bg-dark: #ebebeb;');
css = css.replace(/--bg-card:\s*#ffffff;/g, '--bg-card: #ffffff;');

// 2. Add light theme overrides for active sidebar tab
const overrides = `
/* Light theme overrides for active tab */
.light-theme .menu-btn {
  color: #1e293b;
}
.light-theme .menu-btn.active {
  background: rgba(108, 34, 51, 0.12) !important;
  color: var(--accent) !important;
  font-weight: 600;
}
.light-theme .menu-btn:hover:not(.active) {
  background: rgba(0, 0, 0, 0.05);
}

/* Fix active toggle for light theme */
.light-theme .slider {
  background-color: #cbd5e0;
}
.light-theme input:checked + .slider {
  background-color: var(--accent);
}
`;

if (!css.includes('.light-theme .menu-btn.active')) {
  css += '\n' + overrides;
}

fs.writeFileSync('src/style.css', css);
console.log('Updated style.css for exact light theme matching');

