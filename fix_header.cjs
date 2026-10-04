import fs from 'fs';

let css = fs.readFileSync('src/style.css', 'utf8');

// 1. smenu-overlay right side
css = css.replace('justify-content: flex-start;', 'justify-content: flex-end;');

// 2. smenu-slide-in keyframes
css = css.replace(/@keyframes smenu-slide-in \{[\s\S]*?from \{ transform: translateX\(-100\%\); \}[\s\S]*?to \{ transform: translateX\(0\); \}[\s\S]*?\}/, 
`@keyframes smenu-slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}`);
css = css.replace(/box-shadow: 4px 0 24px rgba/g, 'box-shadow: -4px 0 24px rgba'); // shadow on left side of drawer

// 3. Add mobile-only and desktop-only utility classes
if (!css.includes('.mobile-only')) {
    css += `\n
@media (min-width: 901px) {
  .mobile-only { display: none !important; }
}
@media (max-width: 900px) {
  .desktop-only { display: none !important; }
  .editor-header {
    justify-content: space-between; /* To space out Burger, Logo, Avatar */
  }
}
.btn-mobile-avatar {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
}
.btn-mobile-avatar .smenu-avatar {
  width: 32px;
  height: 32px;
  font-size: 14px;
}
.sidebar-mobile-close-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
`;
}

fs.writeFileSync('src/style.css', css);

let vue = fs.readFileSync('src/Constructor.vue', 'utf8');

// 4. Update the editor-header to have the Burger, Logo, and Avatar
const oldEditorHeader = /<header class="editor-header">[\s\S]*?<h1 class="tab-title">.*?<\/h1>[\s\S]*?<\/header>/;
const newEditorHeader = `<header class="editor-header">
  <div class="mobile-only" style="display:flex; align-items:center;">
    <button @click="isMobileSidebarOpen = true" class="btn-theme-toggle" style="width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center;">
      <MenuIcon :size="22" stroke-width="2" />
    </button>
  </div>
  
  <h1 class="tab-title desktop-only">Редактирование меню</h1>
  
  <div class="mobile-only" style="display:flex; align-items:center;">
    <img :src="isLightTheme ? '/logo-light.png' : '/logo-dark.png'" alt="Achab" style="height: 24px; object-fit: contain; margin: 0;" />
  </div>

  <div class="mobile-only" style="display:flex; align-items:center;">
    <button class="btn-mobile-avatar" @click="isMenuOpen = true">
      <div class="smenu-avatar">{{ (menuStore.userInfo?.name || 'U')[0].toUpperCase() }}</div>
    </button>
  </div>
</header>`;
vue = vue.replace(oldEditorHeader, newEditorHeader);

// 5. Update the sidebar to have an X close button on mobile, and hide the logo row on mobile
const oldSidebarLogo = /<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">[\s\S]*?<img :src="isLightTheme \? '\/logo-light.png' : '\/logo-dark.png'" alt="Achab" style="height: 32px; object-fit: contain; margin: 0;" \/>[\s\S]*?<\/div>/;
const newSidebarLogo = `<div class="desktop-only" style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
  <button @click="isMenuOpen = true" class="btn-theme-toggle" title="Отрыть меню"
    style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
    <MenuIcon :size="18" stroke-width="2" />
  </button>
  <img :src="isLightTheme ? '/logo-light.png' : '/logo-dark.png'" alt="Achab" style="height: 32px; object-fit: contain; margin: 0;" />
</div>
<div class="mobile-only sidebar-mobile-close-row">
  <button @click="isMobileSidebarOpen = false" class="btn-theme-toggle" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
    <X :size="20" stroke-width="2" />
  </button>
</div>`;
vue = vue.replace(oldSidebarLogo, newSidebarLogo);

fs.writeFileSync('src/Constructor.vue', vue);

