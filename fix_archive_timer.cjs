const fs = require('fs');
let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

const regex = /<span class="order-time">\{\{ new Date\(order\.createdAt\)\.toLocaleTimeString\('ru-RU', \{hour: '2-digit', minute:'2-digit'\}\) \}\}<\/span>/g;

const replacement = `<div style="display: flex; gap: 8px; align-items: center;">
                  <span class="order-time">{{ new Date(order.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'}) }}</span>
                  <div class="order-timer-badge">⏱️ {{ getElapsedTime(order) }}</div>
                </div>`;

if (regex.test(vue)) {
  vue = vue.replace(regex, replacement);
  fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);
  console.log('Replaced order-time with wrapped order-time + timer');
} else {
  console.log('Could not find order-time span to replace.');
}
