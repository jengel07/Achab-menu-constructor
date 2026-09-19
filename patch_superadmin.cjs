const fs = require('fs');
let code = fs.readFileSync('src/views/SuperAdminView.vue', 'utf8');

// 1. Add "Заявки на оплату" to sidebar
code = code.replace(
  /<button \s*:class="\['nav-btn', \{ active: currentTab === 'stats' \}\]"\s*@click="currentTab = 'stats'"\s*>\s*Статистика\s*<\/button>/,
  `<button 
          :class="['nav-btn', { active: currentTab === 'stats' }]" 
          @click="currentTab = 'stats'"
        >
          Статистика
        </button>
        <button 
          :class="['nav-btn', { active: currentTab === 'requests' }]" 
          @click="currentTab = 'requests'"
        >
          Заявки на оплату
        </button>`
);

// 2. Add columns to Restaurants table
code = code.replace(
  /<th>Статус<\/th>\s*<th>Действия<\/th>/,
  `<th>Тариф</th>
              <th>Оплачено до</th>
              <th>Статус оплаты</th>
              <th>Блок.</th>
              <th>Действия</th>`
);

// 3. Update restaurant row td elements
code = code.replace(
  /<td>\s*<span :class="\['status-badge', res\.isBlocked \? 'blocked' : 'active'\]">\s*\{\{ res\.isBlocked \? 'Заблокирован' : 'Активен' \}\}\s*<\/span>\s*<\/td>/g,
  `<td>{{ res.tariff?.name || 'Нет' }}</td>
              <td>
                <span :class="{'text-red-500 font-bold': res.paidUntil && new Date(res.paidUntil) < new Date()}">
                  {{ res.paidUntil ? new Date(res.paidUntil).toLocaleDateString('ru-RU') : 'Нет' }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="res.paymentStatus === 'active' ? 'active' : 'warn'">
                  {{ res.paymentStatus === 'active' ? 'Оплачен' : (res.paymentStatus === 'expiring' ? 'Истекает' : res.paymentStatus) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', res.isBlocked ? 'blocked' : 'active']">
                  {{ res.isBlocked ? 'Да' : 'Нет' }}
                </span>
              </td>`
);

// 4. Add Wallet icon to actions
code = code.replace(
  /<button @click="toggleBlock\(res\.id\)"/g,
  `<button @click="openExtendModal(res)" class="btn-action" title="Продлить подписку" style="color: #4caf50;">💳</button>
                <button @click="toggleBlock(res.id)"`
);

// 5. Add Requests tab content
const requestsTabHTML = `
      <!-- 4. ВКЛАДКА: ЗАЯВКИ НА ОПЛАТУ -->
      <div v-if="currentTab === 'requests'" class="table-container">
        <table class="sa-table">
          <thead>
            <tr>
              <th>Ресторан</th>
              <th>Тариф</th>
              <th>Месяцев</th>
              <th>Сумма</th>
              <th>Дата заявки</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in paymentRequests" :key="req.id">
              <td class="font-semibold">{{ req.restaurant?.name || 'Неизвестно' }}</td>
              <td>{{ req.tariff?.name || '?' }}</td>
              <td>{{ req.months }}</td>
              <td>{{ req.amount }} ₽</td>
              <td>{{ new Date(req.createdAt).toLocaleDateString('ru-RU') }}</td>
              <td>
                <span class="status-badge" :class="req.status === 'approved' ? 'active' : (req.status === 'rejected' ? 'blocked' : 'warn')">
                  {{ req.status === 'approved' ? 'Подтвержден' : (req.status === 'rejected' ? 'Отклонен' : 'Ожидает') }}
                </span>
              </td>
              <td class="actions-cell">
                <button v-if="req.status === 'pending'" @click="confirmRequest(req.id)" class="btn-action btn-login" title="Подтвердить">✅</button>
                <button v-if="req.status === 'pending'" @click="rejectRequest(req.id)" class="btn-action btn-danger" title="Отклонить">❌</button>
              </td>
            </tr>
            <tr v-if="paymentRequests.length === 0">
              <td colspan="7" class="empty-state">Нет заявок</td>
            </tr>
          </tbody>
        </table>
      </div>
`;

code = code.replace(/<\/main>/, requestsTabHTML + '\n    </main>');

// 6. Add Extend Modal HTML
const extendModalHTML = `
    <!-- Модалка продления подписки -->
    <div v-if="showExtendModal" class="modal-overlay" @click.self="showExtendModal = false">
      <div class="modal-content">
        <h2>Продлить подписку для "{{ extendData.restaurantName }}"</h2>
        <div class="form-group">
          <label>Тариф</label>
          <select v-model="extendData.tariffId" class="form-input">
            <option v-for="t in tariffsList" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Продлить на (мес.)</label>
          <input type="number" v-model="extendData.months" class="form-input" min="1" />
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showExtendModal = false">Отмена</button>
          <button class="btn-primary" @click="saveExtension">Сохранить</button>
        </div>
      </div>
    </div>
`;
code = code.replace(/<\/div>\s*<\/template>/, extendModalHTML + '\n  </div>\n</template>');

// 7. Update Vue script
const scriptReplacements = `
import { ref, computed, onMounted } from 'vue';

const currentTab = ref('restaurants');
const paymentRequests = ref<any[]>([]);
const tariffsList = ref<any[]>([]);

const showExtendModal = ref(false);
const extendData = ref({ restaurantId: '', restaurantName: '', tariffId: '', months: 1 });

const loadTariffs = async () => {
  try {
    tariffsList.value = await superAdminApi.getTariffs();
  } catch(e) {}
};

const loadPaymentRequests = async () => {
  try {
    paymentRequests.value = await superAdminApi.getPaymentRequests();
  } catch(e) {}
};

const confirmRequest = async (id: string) => {
  if (confirm('Подтвердить оплату и продлить подписку?')) {
    await superAdminApi.confirmPaymentRequest(id);
    loadPaymentRequests();
    loadRestaurants();
  }
};

const rejectRequest = async (id: string) => {
  if (confirm('Отклонить заявку?')) {
    await superAdminApi.rejectPaymentRequest(id);
    loadPaymentRequests();
  }
};

const openExtendModal = (res: any) => {
  extendData.value = {
    restaurantId: res.id,
    restaurantName: res.name || res.email,
    tariffId: res.tariffId || (tariffsList.value[0]?.id || ''),
    months: 1
  };
  showExtendModal.value = true;
};

const saveExtension = async () => {
  try {
    await superAdminApi.updateRestaurantTariff(extendData.value.restaurantId, extendData.value.tariffId, extendData.value.months);
    showExtendModal.value = false;
    loadRestaurants();
  } catch (e: any) {
    alert('Ошибка при продлении: ' + e.message);
  }
};

onMounted(() => {
  loadRestaurants();
  loadTariffs();
  loadPaymentRequests();
});
`;

// we just inject it after `const loading = ref(false);`
code = code.replace(
  /const loading = ref\(false\);/,
  `const loading = ref(false);\n` + scriptReplacements
);
code = code.replace(/onMounted\(\(\) => \{\s*loadRestaurants\(\);\s*\}\);/, '');

// Fix invalid date issue for res.createdAt
code = code.replace(
  /\{\{ new Date\(res\.createdAt\)\.toLocaleDateString\('ru-RU'\) \}\}/g,
  `{{ res.createdAt ? new Date(res.createdAt).toLocaleDateString('ru-RU') : 'Нет данных' }}`
);

// Style for modal and text-red-500
code = code.replace(
  /<\/style>/,
  `
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 24px; border-radius: 12px; width: 400px; max-width: 90%; }
.form-group { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
.form-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.btn-primary { background: #9D0D0E; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
.btn-secondary { background: #e5e7eb; color: #374151; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
.text-red-500 { color: #ef4444; }
.font-bold { font-weight: bold; }
</style>`
);

fs.writeFileSync('src/views/SuperAdminView.vue', code);
console.log('SuperAdmin patched');

