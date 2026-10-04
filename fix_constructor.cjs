import fs from 'fs';
let code = fs.readFileSync('src/Constructor.vue', 'utf8');

const regex = /<header class="editor-header">\s*<h1 class="tab-title">/;
const replacement = `<header class="editor-header">
            <button @click="isMenuOpen = true" class="btn-mobile-menu btn-theme-toggle" title="Отрыть меню" style="display: none; align-items: center; justify-content: center; width: 36px; height: 36px; padding: 0;">
              <MenuIcon :size="20" stroke-width="2" />
            </button>
            <h1 class="tab-title">`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/Constructor.vue', code);

