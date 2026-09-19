const fs = require('fs');
let code = fs.readFileSync('src/Constructor.vue', 'utf8');

// Add import for MyTariffContent
if (!code.includes('MyTariffContent.vue')) {
  code = code.replace(/import BannerManager from '\.\/components\/admin\/BannerManager\.vue';/, "import BannerManager from './components/admin/BannerManager.vue';\nimport MyTariffContent from './components/MyTariffContent.vue';");
}

// Add 'tariff' to SidebarView type
code = code.replace(/type SidebarView = 'main' \| 'orders' \| 'staff' \| 'payment' \| 'profile' \| 'filters' \| 'trash';/, "type SidebarView = 'main' | 'orders' | 'staff' | 'payment' | 'profile' | 'filters' | 'trash' | 'tariff';");

// Add 'tariff' to sidebarTitle
code = code.replace(/trash: 'Корзина',/, "trash: 'Корзина',\n    tariff: 'Мой тариф',");
// In case cyrillic was broken in my regex replace above, I'll use index
code = code.replace(/trash: '.*?',/, "$&\n    tariff: 'Мой тариф',");

// Add button to main view
if (!code.includes("openSidebarView('tariff')")) {
  code = code.replace(/<button class="smenu-nav-item" @click="openSidebarView\('payment'\)">[\s\S]*?<\/button>/, 
  `$&
              <button class="smenu-nav-item" @click="openSidebarView('tariff')">
                <CreditCard :size="18" />
                <span>Мой тариф / Оплата</span>
              </button>`);
}

// Add the tariff view template
if (!code.includes("sidebarView === 'tariff'")) {
  const tariffTemplate = `
          <!-- 💳 TARIFF VIEW 💳 -->
          <template v-else-if="sidebarView === 'tariff'">
            <div class="smenu-scrollable" style="padding: 16px;">
              <MyTariffContent />
            </div>
          </template>
`;
  code = code.replace(/<!-- 🗑️ TRASH VIEW 🗑️ -->/, tariffTemplate + '\n          <!-- 🗑️ TRASH VIEW 🗑️ -->');
}

fs.writeFileSync('src/Constructor.vue', code);
console.log('Patched Constructor.vue for tariff');

