const fs = require('fs');
let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

vue = vue.replace(
  /\.hub-actions \{ display: flex; gap: 10px; align-items: center; \}/g,
  '.hub-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }'
);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);
console.log('Fixed OrderSettingsEditor.vue');

