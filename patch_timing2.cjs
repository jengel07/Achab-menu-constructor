const fs = require('fs');
let code = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

// Insert helper functions
const helpers = `
function formatTime(dateString: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function getDiffMins(start: string, end: string) {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.round((e - s) / 60000);
}

`;
code = code.replace(/function elapsed\(order: any\) \{/, helpers + 'function elapsed(order: any) {');

// Insert HTML in two places
const timingHtml1 = `
              <div v-if="order.status === 'done' || order.status === 'archived'" class="k-timing-info">
                <div class="k-timing-text">Время заказа: {{ formatTime(order.createdAt) }} • Завершен: {{ formatTime(order.updatedAt) }}</div>
                <div class="k-timing-badge">⏱️ Выполнен за {{ getDiffMins(order.createdAt, order.updatedAt) }} мин</div>
              </div>
`;
code = code.replace(/<!-- Order items -->/g, timingHtml1 + '              <!-- Order items -->');

const timingHtml2 = `
            <div v-if="order.status === 'done' || order.status === 'archived'" class="k-timing-info">
              <div class="k-timing-text">Время заказа: {{ formatTime(order.createdAt) }} • Завершен: {{ formatTime(order.updatedAt) }}</div>
              <div class="k-timing-badge">⏱️ Выполнен за {{ getDiffMins(order.createdAt, order.updatedAt) }} мин</div>
            </div>
`;
code = code.replace(/<!-- Items -->/g, timingHtml2 + '            <!-- Items -->');


// Insert CSS
const css = `
.k-timing-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
  margin-bottom: 4px;
}
.k-timing-text {
  font-size: 12px;
  color: #d1d5db;
}
.light-theme .k-timing-text {
  color: #374151;
}
.k-timing-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  width: fit-content;
}
.light-theme .k-timing-badge {
  background: #dcfce7;
  color: #166534;
}

</style>
`;
code = code.replace(/<\/style>/, css);

fs.writeFileSync('src/views/KitchenOrders.vue', code);
console.log('Patched KitchenOrders.vue with UTF-8 support');

