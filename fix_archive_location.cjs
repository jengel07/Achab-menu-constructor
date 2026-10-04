const fs = require('fs');
let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

const oldHtml = `<div class="info-row">
                  <span class="icon">📍</span> 
                  <span v-if="order.type === 'delivery'">{{ order.address || 'Адрес не указан' }}</span>
                  <span v-else-if="order.type === 'table'">Стол {{ order.tableNumber || '?' }}</span>
                  <span v-else>Самовывоз</span>
                </div>`;

const newHtml = `<div class="info-row" v-if="order.type === 'delivery' || order.type === 'pickup' || ((order.type === 'onsite' || order.type === 'table') && order.tableNumber)">
                  <span class="icon">📍</span> 
                  <span v-if="order.type === 'delivery'">{{ order.address || 'Адрес не указан' }}</span>
                  <span v-else-if="order.type === 'onsite' || order.type === 'table'">Стол №{{ order.tableNumber }}</span>
                  <span v-else-if="order.type === 'pickup'">Самовывоз</span>
                </div>`;

vue = vue.replace(oldHtml, newHtml);
fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);
console.log('Fixed archive order location info');
