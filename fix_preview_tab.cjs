import fs from 'fs';

let vue = fs.readFileSync('src/Constructor.vue', 'utf8');

// 1. Add 'preview' to the array of tabs
vue = vue.replace(
  /\['navigation', 'colors', 'branding', 'banners', 'general', 'qrcode', 'orders'\]/,
  `['navigation', 'colors', 'branding', 'banners', 'general', 'qrcode', 'orders', 'preview']`
);

// 2. Add 'mobile-only' conditionally to the menu-btn
vue = vue.replace(
  /class="menu-btn" :class="\{ active: activeTab === tab \}"/,
  `class="menu-btn" :class="[{ active: activeTab === tab }, tab === 'preview' ? 'mobile-only' : '']"`
);

// 3. Add the icon for 'preview'
vue = vue.replace(
  /<ClipboardList v-else-if="tab === 'orders'" :size="18" stroke-width="2" \/>/,
  `<ClipboardList v-else-if="tab === 'orders'" :size="18" stroke-width="2" />
                <Smartphone v-else-if="tab === 'preview'" :size="18" stroke-width="2" />`
);

// 4. Add the label for 'preview'
vue = vue.replace(
  /tab === 'qrcode' \? 'QR-код меню' : 'Настройки заказов' \}\}/,
  `tab === 'qrcode' ? 'QR-код меню' : tab === 'orders' ? 'Настройки заказов' : 'Предпросмотр' }}`
);

// 5. Add the editor content for 'preview'
vue = vue.replace(
  /<OrderSettingsEditor v-else-if="activeTab === 'orders'" :model-value="menuStore.restaurantInfo"[\s\S]*?@update:model-value="updateRestaurantInfo" \/>/,
  `$&
            <div v-else-if="activeTab === 'preview'" style="display: flex; justify-content: center; align-items: center; padding: 20px 0; overflow-x: hidden;">
              <div class="preview-container" style="transform: scale(0.95); transform-origin: top center;">
                <PhoneMockupContent :restaurantInfo="menuStore.restaurantInfo" :items="menuStore.items"
                  :categories="menuStore.categories" />
              </div>
            </div>`
);

// 6. Import Smartphone icon
if (!vue.includes('Smartphone,')) {
    vue = vue.replace(
      /ClipboardList,/,
      `ClipboardList,
    Smartphone,`
    );
}

fs.writeFileSync('src/Constructor.vue', vue);

