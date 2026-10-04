const fs = require('fs');
let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const regex = /const loadPreviewFromStorage = \(\) => \{\s*try \{\s*const savedRestaurantInfo = localStorage\.getItem\('preview_restaurantInfo'\);/;

const replacement = `const loadPreviewFromStorage = () => {
  try {
    // Sync order mode
    const savedMenuState = localStorage.getItem('menuState');
    if (savedMenuState) {
      try {
        const parsed = JSON.parse(savedMenuState);
        if (parsed.orderMode) store.orderMode = parsed.orderMode;
      } catch (e) {}
    }
    const savedModeStr = localStorage.getItem('menu_order_mode');
    if (savedModeStr) {
      const modeMap = { menu: 'CATALOG', cart: 'CART', order: 'ORDER' };
      if (modeMap[savedModeStr]) store.orderMode = modeMap[savedModeStr];
    }

    const savedRestaurantInfo = localStorage.getItem('preview_restaurantInfo');`;

vue = vue.replace(regex, replacement);
fs.writeFileSync('src/views/ClientView.vue', vue);
