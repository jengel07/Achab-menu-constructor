const fs = require('fs');

// 1. Fix src/types/menu.ts
let menuTs = fs.readFileSync('src/types/menu.ts', 'utf8');
if (!menuTs.includes('filterSettings?:')) {
  menuTs = menuTs.replace(/isWifiEnabled\?: boolean;/g, "isWifiEnabled?: boolean;\n  filterSettings?: Record<string, boolean>;");
  fs.writeFileSync('src/types/menu.ts', menuTs);
}

// 2. Fix src/components/admin/BannerManager.vue
let banner = fs.readFileSync('src/components/admin/BannerManager.vue', 'utf8');
banner = banner.replace(/\(banner, index\)/g, "(banner)");
fs.writeFileSync('src/components/admin/BannerManager.vue', banner);

// 3. Fix src/components/client/PromoBanners.vue
let promo = fs.readFileSync('src/components/client/PromoBanners.vue', 'utf8');
promo = promo.replace(/const handleScroll = \(\) => \{[\s\S]*?\};\r?\n/g, "");
fs.writeFileSync('src/components/client/PromoBanners.vue', promo);

// 4. Fix src/components/ClientModifiersModal.vue
let clientMod = fs.readFileSync('src/components/ClientModifiersModal.vue', 'utf8');
clientMod = clientMod.replace(/\(group, gIdx\)/g, "(group)");
clientMod = clientMod.replace(/const selectedRadio = ref<Record<string, number>>/g, "const selectedRadio = ref<Record<string, any>>");
fs.writeFileSync('src/components/ClientModifiersModal.vue', clientMod);

// 5. Fix src/components/MenuEditor.vue
let menuEd = fs.readFileSync('src/components/MenuEditor.vue', 'utf8');
menuEd = menuEd.replace(/noNuts/g, "nutFree");
menuEd = menuEd.replace(/noLactose/g, "dairyFree");
menuEd = menuEd.replace(/noGluten/g, "glutenFree");
menuEd = menuEd.replace(/v-if="showModifiersModal && editingItem"/g, 'v-if="showModifiersModal && editingItem"'); // Just in case, it said 465
menuEd = menuEd.replace(/<ModifiersEditor[\s\S]*?\/>/g, (match) => {
  return match.replace(/v-if="showModifiersModal"/, 'v-if="showModifiersModal && editingItem"');
});
fs.writeFileSync('src/components/MenuEditor.vue', menuEd);

// 6. Fix src/components/PhoneMockupContent.vue
let phoneMock = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');
phoneMock = phoneMock.replace(/viewMode: 'list' \| 'grid'/g, "viewMode: 'list' | 'grid' | 'full'");
fs.writeFileSync('src/components/PhoneMockupContent.vue', phoneMock);

// 7. Fix src/Constructor.vue
let cstr = fs.readFileSync('src/Constructor.vue', 'utf8');
cstr = cstr.replace(/const savePaymentSettings = \(\) => \{[\s\S]*?\}\s*catch[\s\S]*?\}\r?\n\};\r?\n/g, '');
fs.writeFileSync('src/Constructor.vue', cstr);

// 8. Fix src/views/ClientView.vue
let clientV = fs.readFileSync('src/views/ClientView.vue', 'utf8');
clientV = clientV.replace(/viewMode: 'list' \| 'grid'/g, "viewMode: 'list' | 'grid' | 'full'");
fs.writeFileSync('src/views/ClientView.vue', clientV);

console.log('Fixed bulk errors');
