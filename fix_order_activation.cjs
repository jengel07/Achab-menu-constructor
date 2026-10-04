const fs = require('fs');

let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

const regex = /<p class="order-top-text">([^<]+)<\/p>/;

const replacement = `<div class="mode-description-card" style="margin-bottom: 20px;">
                  <div class="mode-card-icon">🛎️</div>
                  <h3>Заказы</h3>
                  <p>$1</p>
                  <div v-if="currentMode === 'order'" class="mode-active-badge">✓ Активный режим</div>
                  <button v-else class="btn-set-mode" @click="applyMode('order')">Включить этот режим</button>
                </div>`;

vue = vue.replace(regex, replacement);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);
