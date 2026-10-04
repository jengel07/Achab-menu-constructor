const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const regex = /if \(savedGeneralSettings\) store\.generalSettings = \{ \.\.\.store\.generalSettings, \.\.\.JSON\.parse\(savedGeneralSettings\) \};/;
const replacement = `if (savedGeneralSettings) store.generalSettings = { ...store.generalSettings, ...JSON.parse(savedGeneralSettings) };

      // Load orderMode in preview mode
      const savedMenuState = localStorage.getItem('menuState');
      if (savedMenuState) {
        const parsed = JSON.parse(savedMenuState);
        if (parsed.orderMode) store.orderMode = parsed.orderMode;
      }
      const savedModeStr = localStorage.getItem('menu_order_mode');
      if (savedModeStr) {
        const modeMap: Record<string, string> = { menu: 'CATALOG', cart: 'CART', order: 'ORDER' };
        if (modeMap[savedModeStr]) store.orderMode = modeMap[savedModeStr];
      }`;

vue = vue.replace(regex, replacement);

fs.writeFileSync('src/views/ClientView.vue', vue);
