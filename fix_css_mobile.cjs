import fs from 'fs';

let code = fs.readFileSync('src/style.css', 'utf8');

const regex = /@media \(max-width: 900px\) \{[\s\S]*?\}\s*\}/;

const replacement = `@media (max-width: 900px) {
  .constructor-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .sidebar {
    position: fixed !important;
    top: 0;
    left: -320px;
    bottom: 0;
    width: 280px;
    z-index: 3000;
    transition: left 0.3s ease;
    box-shadow: 2px 0 12px rgba(0,0,0,0.3);
  }
  .sidebar.mobile-open {
    left: 0;
  }
  .mobile-sidebar-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 2999;
  }
  .preview-area {
    display: none !important;
  }
  .editor-area {
    flex-grow: 1;
    width: 100%;
  }
  .btn-mobile-menu {
    display: flex !important;
  }
  .editor-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
  }
  .editor-content {
    padding: 16px;
  }
}`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/style.css', code);
    console.log('Fixed CSS');
} else {
    console.log('Could not find media query');
}

