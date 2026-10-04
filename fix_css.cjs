const fs = require('fs');

let code = fs.readFileSync('src/style.css', 'utf8');

// Remove the previously appended queries
code = code.replace(/@media \(max-width: 1024px\).*?padding: 16px;\s*}\s*}/s, '');

// Append better queries
const newQueries = `
@media (max-width: 1200px) {
  .constructor-layout {
    grid-template-columns: 280px 1fr 0px;
  }
  .preview-area {
    display: none !important;
  }
}

@media (max-width: 900px) {
  .constructor-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .sidebar {
    display: none !important;
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
}
`;

fs.writeFileSync('src/style.css', code + newQueries);
