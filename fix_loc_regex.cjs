const fs = require('fs');
let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

const regex = /<div class="info-row">\s*<span class="icon">📍<\/span>\s*<span v-if="order\.type === 'delivery'">\{\{ order\.address \|\| 'Адрес не указан' \}\}<\/span>\s*<span v-else-if="order\.type === 'table'">Стол \{\{ order\.tableNumber \|\| '\?' \}\}<\/span>\s*<span v-else>Самовывоз<\/span>\s*<\/div>/;

if (regex.test(vue)) {
  const newHtml = `<div class="info-row" v-if="order.type === 'delivery' || order.type === 'pickup' || ((order.type === 'onsite' || order.type === 'table') && order.tableNumber)">
                  <span class="icon">📍</span> 
                  <span v-if="order.type === 'delivery'">{{ order.address || 'Адрес не указан' }}</span>
                  <span v-else-if="order.type === 'onsite' || order.type === 'table'">Стол №{{ order.tableNumber }}</span>
                  <span v-else-if="order.type === 'pickup'">Самовывоз</span>
                </div>`;
  vue = vue.replace(regex, newHtml);
  fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);
  console.log('Regex MATCHED and replaced');
} else {
  console.log('Regex did NOT match');
}
