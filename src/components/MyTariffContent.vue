<template>
  <div class="my-tariff-container">
    <div v-if="loading" class="tariff-loading">Загрузка...</div>
    
    <div v-else-if="currentRestaurant">
      <div class="status-card" :class="statusClass">
        <div class="status-header">
          <h3>Статус подписки: <strong>{{ formattedStatusText }}</strong></h3>
        </div>
        <p class="status-info" v-if="currentRestaurant.status === 'TRIAL'">
          Осталось дней: <strong>{{ daysLeft }}</strong> (до {{ formattedTrialEnds }})
        </p>
        <p class="status-info" v-else-if="currentRestaurant.paidUntil && currentRestaurant.status === 'ACTIVE'">
          Оплачено до: <strong>{{ formattedPaidUntil }}</strong>
        </p>
      </div>

      <div class="offer-section">
        <div class="offer-card" style="margin-top: 20px;">
          <h3 style="margin-bottom: 15px;">Продление подписки</h3>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
            Для оплаты тарифа перейдите в наш официальный Telegram-бот.
          </p>
          <button class="btn-pay" @click="handlePaymentClick" :disabled="submitting">
            Оплатить месяц<br/><span>2 000 ₽</span>
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="error-notice">
      Ошибка загрузки данных тарифа.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const loading = ref(true);
const submitting = ref(false);
const currentRestaurant = ref<any>(null);

const fetchBillingInfo = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    
    let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (!API_URL || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {
        API_URL = `http://${window.location.hostname}:3000`;
      }

    const res = await fetch(`${API_URL}/api/my-restaurant-status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      currentRestaurant.value = await res.json();
    }
  } catch (e) {
    console.error('Failed to load billing info', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBillingInfo();
});

const formattedStatusText = computed(() => {
  const st = currentRestaurant.value?.status;
  if (st === 'TRIAL') return 'Тест-драйв';
  if (st === 'ACTIVE') return 'Активная';
  if (st === 'PENDING_PAYMENT') return 'Ожидает проверки';
  if (st === 'EXPIRED') return 'Истекла';
  return st || 'Неизвестно';
});

const statusClass = computed(() => {
  const st = currentRestaurant.value?.status;
  if (st === 'EXPIRED') return 'danger';
  if (st === 'ACTIVE') return 'success';
  if (st === 'TRIAL') return 'primary';
  return 'warning';
});

const formattedTrialEnds = computed(() => {
  if (!currentRestaurant.value?.trialEndsAt) return '';
  return new Date(currentRestaurant.value.trialEndsAt).toLocaleDateString('ru-RU');
});

const formattedPaidUntil = computed(() => {
  if (!currentRestaurant.value?.paidUntil) return '';
  return new Date(currentRestaurant.value.paidUntil).toLocaleDateString('ru-RU');
});

const daysLeft = computed(() => {
  if (!currentRestaurant.value?.trialEndsAt) return 0;
  const diff = new Date(currentRestaurant.value.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});


const handlePaymentClick = () => {
  if (currentRestaurant.value?.id) {
    window.open(`https://t.me/achab_notify_bot?start=REST_${currentRestaurant.value.id}`, '_blank');
  } else {
    alert('Ошибка: Не удалось определить ID ресторана.');
  }
};

const submitPayment = async (months: number) => {
  const amount = months === 12 ? '20 000' : '2 000';
  
  
  submitting.value = true;
  try {
    const token = localStorage.getItem('authToken');
    
    let API_URL = import.meta.env.VITE_API_URL;
    if (!API_URL) {
      API_URL = `http://${window.location.hostname}:3000`;
    }
    
    await fetch(`${API_URL}/api/my-restaurant-status/request`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ months })
    });
    
    if (currentRestaurant.value) {
      currentRestaurant.value.status = 'PENDING_PAYMENT';
    }
  } catch (e) {
    alert('Ошибка при отправке');
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
.status-card.primary { background: #3b82f6; }
.status-card.success { background: #10b981; }
.status-card.warning { background: #f59e0b; }
.status-card.danger { background: #ef4444; }

.status-header h3 { margin: 0 0 10px 0; font-size: 18px; }
.status-info { margin: 4px 0; font-size: 15px; }

.offer-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  background: white;
}
.offer-card h3 { margin-top: 0; margin-bottom: 16px; color: #111827; }

.payment-instructions { background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 14px; color: #374151; border: 1px dashed #d1d5db; }
.payment-instructions h4 { margin: 0 0 8px 0; color: #111827; }
.warning-text { margin-top: 12px; font-size: 13px; color: #ef4444; font-weight: 600; }

.buttons-grid { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
.btn-pay { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; cursor: pointer; font-weight: 600; font-size: 15px; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
.btn-pay span { font-size: 18px; color: #111827; font-weight: 700; }
.btn-pay:hover:not(:disabled) { background: #e5e7eb; }
.btn-pay.year { background: #fffbeb; border-color: #fcd34d; }
.btn-pay.year span { color: #b45309; }
.btn-pay.year:hover:not(:disabled) { background: #fef3c7; }

.btn-pay:disabled { opacity: 0.6; cursor: not-allowed; }

.pending-notice { text-align: center; padding: 32px 16px; background: white; border-radius: 12px; border: 1px solid #e5e7eb; }
.icon-clock { font-size: 40px; margin-bottom: 16px; }
.pending-notice h3 { margin-top: 0; color: #111827; }
.pending-notice p { color: #6b7280; font-size: 14px; line-height: 1.5; }

.error-notice { text-align: center; padding: 20px; color: #ef4444; font-weight: 600; }
</style>
