import fs from 'fs';

let vue = fs.readFileSync('src/Constructor.vue', 'utf8');

// 1. Remove the bottom button
const bottomBtnRegex = /<button @click="openMobilePreview" class="btn-preview-menu mobile-only"[\s\S]*?Предпросмотр меню\s*<\/button>/;
vue = vue.replace(bottomBtnRegex, '');

// 2. Add the toggle at the top of the sidebar
// Wait, let's find the place. Right below `<nav class="sidebar-menu">`? No, the screenshot shows it ABOVE "Навигация и блюда".
// So right BEFORE `<nav class="sidebar-menu">`.
const navRegex = /<nav class="sidebar-menu">/;
const toggleHtml = `<div class="mobile-only sidebar-mode-toggle" style="display: flex; background: rgba(150,150,150,0.15); padding: 4px; border-radius: 12px; margin: 0 16px 16px; gap: 4px;">
            <button class="mode-btn active" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 10px 4px; border-radius: 8px; border: none; background: var(--bg-panel); color: var(--accent); font-size: 11px; font-weight: 600; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <Pen :size="18" stroke-width="2" style="color: var(--accent)" />
              Редактирование
            </button>
            <button class="mode-btn" @click="openMobilePreview" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 10px 4px; border-radius: 8px; border: none; background: transparent; color: inherit; font-size: 11px; font-weight: 500; cursor: pointer; opacity: 0.7;">
              <Eye :size="18" stroke-width="2" />
              Предпросмотр
            </button>
          </div>
          <nav class="sidebar-menu">`;
vue = vue.replace(navRegex, toggleHtml);

// 3. Add Pen and Eye to imports
if (!vue.includes('Pen,')) {
    vue = vue.replace('ClipboardList,', 'ClipboardList,\n    Pen,\n    Eye,');
}

fs.writeFileSync('src/Constructor.vue', vue);

