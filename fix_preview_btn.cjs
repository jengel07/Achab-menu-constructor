import fs from 'fs';

let vue = fs.readFileSync('src/Constructor.vue', 'utf8');

// 1. Remove 'preview' from the array of tabs
vue = vue.replace(
  /\['navigation', 'colors', 'branding', 'banners', 'general', 'qrcode', 'orders', 'preview'\]/g,
  `['navigation', 'colors', 'branding', 'banners', 'general', 'qrcode', 'orders']`
);

// 2. Remove the preview tab markup
vue = vue.replace(
  /class="menu-btn" :class="\[\{ active: activeTab === tab \}, tab === 'preview' \? 'mobile-only' : ''\]"/g,
  `class="menu-btn" :class="{ active: activeTab === tab }"`
);

// 3. Remove Smartphone icon
vue = vue.replace(
  /<Smartphone v-else-if="tab === 'preview'" :size="18" stroke-width="2" \/>/g,
  ``
);

// 4. Revert the label
vue = vue.replace(
  /tab === 'qrcode' \? 'QR-код меню' : tab === 'orders' \? 'Настройка заказов' : 'Предпросмотр'/g,
  `tab === 'qrcode' ? 'QR-код меню' : 'Настройки заказов'`
);

// 5. Remove the editor content for 'preview'
vue = vue.replace(
  /<div v-else-if="activeTab === 'preview'" style="display: flex; justify-content: center; align-items: center; padding: 20px 0; overflow-x: hidden;">[\s\S]*?<\/div>[\s\S]*?<\/div>/g,
  ``
);

// 6. Add the highlighted "Preview" button at the bottom of the sidebar
const oldSaveBtn = `<button @click="manualSave" class="btn-save-menu"`;
const newPreviewBtn = `
            <button @click="openMobilePreview" class="btn-preview-menu mobile-only"
              style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 12px; background-color: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; margin-bottom: 8px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);">
              <Smartphone :size="16" stroke-width="2" /> Предпросмотр меню
            </button>
            <button @click="manualSave" class="btn-save-menu"`;

if (!vue.includes('openMobilePreview')) {
    vue = vue.replace(oldSaveBtn, newPreviewBtn);
    
    // Add openMobilePreview method
    const methodStr = `
const openMobilePreview = () => {
  window.open('/client?preview=true', '_blank');
  isMobileSidebarOpen.value = false;
};
`;
    vue = vue.replace('const isMobileSidebarOpen = ref(false);', `const isMobileSidebarOpen = ref(false);\n${methodStr}`);
}

fs.writeFileSync('src/Constructor.vue', vue);

