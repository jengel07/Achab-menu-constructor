import fs from 'fs';

let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

vue = vue.replace(
  /<button class="btn-activate" :disabled="!isLiabilityAgreed" @click="activateOrdering">\s*Активировать заказы.*?\s*<\/button>/,
  `<button class="btn-activate" :disabled="!isLiabilityAgreed" @click="activateOrdering">Активировать заказы</button>`
);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);

