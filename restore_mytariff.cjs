const fs = require('fs');

const content = `<template>
  <div class="my-tariff-container">
    <div v-if="loading" class="tariff-loading">Загрузка...</div>
    
    <div v-else-if="currentRestaurant">
      <div class="status-card" :class="statusClass">
        <div class="status-header">
          <h3>Текущий тариф: <strong>{{ currentRestaurant.tariff?.name || 'Нет тарифа' }}</strong></h3>
        </div>
        <p class="status-info">Оплачено до: <strong>{{ formattedPaidUntil }}</strong></p>
        <p class="status-info">Статус оплаты: <strong>{{ formattedPaymentStatus }}</strong></p>
      </div>

      <div class="tariffs-list" v-if="!showRequestForm">
        <h3>Доступные тарифы</h3>
        <div v-for="t in tariffs" :key="t.id" class="tariff-item" :class="{ 'active-tariff': currentRestaurant.tariffId === t.id }">
          <div class="t-name">{{ t.name }}</div>
          <div class="t-price">{{ t.pricePerMonth }} ₽ / мес</div>
          <ul class="t-features">
            <li v-for="(f, idx) in (t.features || '').split(',')" :key="idx">✅ {{ f.trim() }}</li>
          </ul>
          <button class="btn-primary" @click="selectTariff(t)">Выбрать и оплатить</button>
        </div>
      </div>

      <div v-else class="request-form">
        <button class="btn-back" @click="showRequestForm = false">← Назад к тарифам</button>
        <h3>Оформление подписки</h3>
        <div class="form-group">
          <label>Выбранный тариф</label>
          <input type="text" :value="selectedTariff?.name" disabled class="form-input" />
        </div>
        <div class="form-group">
          <label>Период оплаты</label>
          <select v-model="selectedMonths" class="form-input" @change="calculateAmount">
            <option value="1">1 месяц ({{ selectedTariff?.pricePerMonth }} ₽)</option>
            <option v-if="selectedTariff?.pricePer6Months" value="6">6 месяцев ({{ selectedTariff?.pricePer6Months }} ₽)</option>
            <option v-if="selectedTariff?.pricePerYear" value="12">1 год ({{ selectedTariff?.pricePerYear }} ₽)</option>
          </select>
        </div>
        
        <div class="payment-instructions" v-if="selectedTariff?.paymentInstruction">
          <h4>Инструкция по оплате</h4>
          <p style="white-space: pre-wrap;">{{ selectedTariff?.paymentInstruction }}</p>
        </div>

        <div class="amount-total">
          Итого к оплате: <strong>{{ calculatedAmount }} ₽</strong>
        </div>

        <button class="btn-submit" @click="submitRequest" :disabled="submitting">
          {{ submitting ? 'Отправка...' : 'Я оплатил, отправить заявку' }}
        </button>
        <p class="form-hint">После подтверждения администратором, ваш доступ будет автоматически продлен.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const loading = ref(true);
const submitting = ref(false);
const tariffs = ref<any[]>([]);
const currentRestaurant = ref<any>(null);

const showRequestForm = ref(false);
const selectedTariff = ref<any>(null);
const selectedMonths = ref<string>('1');
const calculatedAmount = ref<number>(0);

const fetchTariffData = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    if (!token || !userStr) return;
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    // Fetch Tariffs
    const tariffsRes = await fetch(\`\${API_URL}/api/tariffs\`, {
      headers: { 'Authorization': \`Bearer \${token}\` }
    });
    tariffs.value = await tariffsRes.json();
    
    // Fetch Current Restaurant Info
    const infoRes = await fetch(\`\${API_URL}/api/my-restaurant-billing\`, {
      headers: { 'Authorization': \`Bearer \${token}\` }
    });
    if (infoRes.ok) {
      currentRestaurant.value = await infoRes.json();
    }
  } catch (e) {
    console.error('Failed to load tariff data', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTariffData();
});

const formattedPaidUntil = computed(() => {
  if (!currentRestaurant.value?.paidUntil) return 'Нет данных';
  return new Date(currentRestaurant.value.paidUntil).toLocaleDateString('ru-RU');
});

const formattedPaymentStatus = computed(() => {
  const st = currentRestaurant.value?.paymentStatus;
  if (st === 'active') return 'Оплачен';
  if (st === 'expiring') return 'Истекает';
  if (st === 'pending') return 'Ожидает проверки';
  return st || 'Нет статуса';
});

const statusClass = computed(() => {
  const st = currentRestaurant.value?.paymentStatus;
  const isExpired = currentRestaurant.value?.paidUntil && new Date(currentRestaurant.value.paidUntil) < new Date();
  if (isExpired) return 'danger';
  if (st === 'active') return 'success';
  return 'warning';
});

const selectTariff = (t: any) => {
  selectedTariff.value = t;
  selectedMonths.value = '1';
  calculateAmount();
  showRequestForm.value = true;
};

const calculateAmount = () => {
  const t = selectedTariff.value;
  if (!t) return;
  const m = parseInt(selectedMonths.value);
  if (m === 12 && t.pricePerYear) calculatedAmount.value = t.pricePerYear;
  else if (m === 6 && t.pricePer6Months) calculatedAmount.value = t.pricePer6Months;
  else calculatedAmount.value = t.pricePerMonth * m;
};

const submitRequest = async () => {
  submitting.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    const resId = JSON.parse(userStr || '{}').restaurantId;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    await fetch(\`\${API_URL}/api/payment-requests\`, {
      method: 'POST',
      headers: { 
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        restaurantId: resId,
        tariffId: selectedTariff.value.id,
        amount: calculatedAmount.value,
        months: parseInt(selectedMonths.value),
        status: 'pending'
      })
    });
    
    if (currentRestaurant.value) currentRestaurant.value.paymentStatus = 'pending';
    showRequestForm.value = false;
    alert('Ваша заявка успешно отправлена! Администратор проверит оплату и активирует подписку.');
  } catch (e) {
    alert('Ошибка при отправке заявки');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.my-tariff-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.status-card {
  padding: 16px;
  border-radius: 12px;
  color: white;
  margin-bottom: 20px;
}
.status-card.success { background: #10b981; }
.status-card.warning { background: #f59e0b; }
.status-card.danger { background: #ef4444; }

.status-header h3 { margin: 0 0 10px 0; font-size: 18px; }
.status-info { margin: 4px 0; font-size: 14px; }

.tariffs-list { display: flex; flex-direction: column; gap: 12px; }
.tariff-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  background: white;
}
.tariff-item.active-tariff {
  border-color: #9D0D0E;
  box-shadow: 0 0 0 1px #9D0D0E;
}
.t-name { font-weight: bold; font-size: 16px; margin-bottom: 4px; }
.t-price { color: #9D0D0E; font-weight: 600; margin-bottom: 12px; }
.t-features { margin: 0 0 16px 0; padding: 0; list-style: none; font-size: 13px; color: #4b5563; }
.t-features li { margin-bottom: 4px; }

.btn-primary { background: #9D0D0E; color: white; border: none; border-radius: 6px; padding: 8px 16px; cursor: pointer; width: 100%; font-weight: 600; }
.btn-back { background: none; border: none; color: #6b7280; padding: 0; cursor: pointer; margin-bottom: 16px; font-weight: 500; }
.btn-submit { background: #10b981; color: white; border: none; border-radius: 6px; padding: 12px 16px; cursor: pointer; width: 100%; font-weight: 600; margin-top: 16px; }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

.form-group { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.form-input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }

.payment-instructions { background: #f3f4f6; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #374151; border-left: 3px solid #9D0D0E; }
.payment-instructions h4 { margin: 0 0 8px 0; }

.amount-total { font-size: 16px; padding: 12px 0; border-top: 1px solid #e5e7eb; margin-top: 16px; }
.form-hint { font-size: 12px; color: #6b7280; text-align: center; margin-top: 8px; }
</style>
`;
fs.writeFileSync('src/components/MyTariffContent.vue', content);
console.log('Restored MyTariffContent.vue properly.');

