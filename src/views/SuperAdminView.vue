<template>
  <div class="super-admin-layout">
    <aside class="sa-sidebar">
      <img src="/logo-light.png" class="brand-logo-img" alt="Achab Menu" />
      <nav>
        <button class="nav-btn active">
          👥 Рестораны
        </button>
      </nav>
      <div class="sidebar-footer">
        <button class="nav-btn logout" @click="logout">Выйти</button>
      </div>
    </aside>

    <main class="sa-content">
      <header class="sa-header">
        <h1>Управление клиентами</h1>
        <div class="header-actions">
          <input type="text" v-model="searchQuery" placeholder="Поиск по email или названию..." class="search-input" />
        </div>
      </header>

      <div class="table-container">
        <table class="sa-table">
          <thead>
            <tr>
              <th>Заведение</th>
              <th>Дата регистрации</th>
              <th>Статус</th>
              <th>Оплачено до / Тест до</th>
              <th>Блок.</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="res in filteredRestaurants" :key="res.id">
              <td>
                <div class="font-semibold">{{ res.name || 'Без названия' }}</div>
                <div style="font-size: 12px; color: #6b7280;">{{ res.email }}</div>
              </td>
              <td>{{ res.createdAt ? new Date(res.createdAt).toLocaleDateString('ru-RU') : 'Нет данных' }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(res.status)">
                  {{ getStatusText(res.status) }}
                </span>
              </td>
              <td>
                <span :class="{'text-red-500 font-bold': isExpired(res)}">
                  {{ getUntilDate(res) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', res.status === 'BLOCKED' ? 'blocked' : 'active']">
                  {{ res.status === 'BLOCKED' ? 'Да' : 'Нет' }}
                </span>
              </td>
              <td class="actions-cell">
                <button @click="loginAsUser(res.id, res.name)" class="btn-action btn-login" title="Вход от имени клиента">Вход</button>
                <button v-if="res.status === 'PENDING_PAYMENT'" @click="openConfirmModal(res)" class="btn-action btn-success" title="Подтвердить платеж">✅ Подтвердить</button>
                <button @click="toggleBlock(res.id, res.status === 'BLOCKED')" class="btn-action btn-warn" title="Блокировать">🚫</button>
                <button @click="deleteRestaurant(res.id)" class="btn-action btn-danger" title="Удалить">❌</button>
              </td>
            </tr>
            <tr v-if="filteredRestaurants.length === 0">
              <td colspan="6" class="empty-state">Нет клиентов</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Модалка подтверждения платежа -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="modal-content">
        <h2>Подтвердить платеж для "{{ confirmData.restaurantName }}"</h2>
        <div class="form-group">
          <label>Продлить доступ на:</label>
          <select v-model="confirmData.months" class="form-input">
            <option value="1">1 месяц (2 000 ₽)</option>
            <option value="12">1 год (20 000 ₽)</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showConfirmModal = false">Отмена</button>
          <button class="btn-primary" @click="confirmPayment">Подтвердить и активировать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { superAdminApi, setToken } from '../api';
import { useMenuStore } from '../store/menuStore';

const router = useRouter();
const menuStore = useMenuStore();

const searchQuery = ref('');
const loading = ref(false);
const restaurants = ref<any[]>([]);

const showConfirmModal = ref(false);
const confirmData = ref({ restaurantId: '', restaurantName: '', months: '1' });

const loadRestaurants = async () => {
  loading.value = true;
  try {
    const res = await superAdminApi.getRestaurants();
    restaurants.value = res.restaurants || [];
  } catch (e: any) {
    alert(e.message || 'Ошибка');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRestaurants();
});

const filteredRestaurants = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return restaurants.value.filter(r =>
    (r.name && r.name.toLowerCase().includes(q)) || (r.email && r.email.toLowerCase().includes(q))
  );
});

const getStatusText = (status: string) => {
  if (status === 'TRIAL') return 'Тест';
  if (status === 'ACTIVE') return 'Оплачен';
  if (status === 'EXPIRED') return 'Истек';
  if (status === 'PENDING_PAYMENT') return 'Ожидает проверки';
  return status || 'Неизвестно';
};

const getStatusClass = (status: string) => {
  if (status === 'TRIAL') return 'active';
  if (status === 'ACTIVE') return 'success-badge';
  if (status === 'EXPIRED') return 'blocked';
  if (status === 'PENDING_PAYMENT') return 'warn';
  return 'active';
};

const getUntilDate = (res: any) => {
  if (res.status === 'TRIAL') {
    return res.trialEndsAt ? new Date(res.trialEndsAt).toLocaleDateString('ru-RU') : 'Нет';
  }
  return res.paidUntil ? new Date(res.paidUntil).toLocaleDateString('ru-RU') : 'Нет';
};

const isExpired = (res: any) => {
  if (res.status === 'TRIAL' && res.trialEndsAt) return new Date(res.trialEndsAt) < new Date();
  if (res.status === 'ACTIVE' && res.paidUntil) return new Date(res.paidUntil) < new Date();
  return res.status === 'EXPIRED';
};

const openConfirmModal = (res: any) => {
  confirmData.value = {
    restaurantId: res.id,
    restaurantName: res.name || res.email,
    months: '1'
  };
  showConfirmModal.value = true;
};

const confirmPayment = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    await fetch(`${API_URL}/api/superadmin/restaurants/${confirmData.value.restaurantId}/confirm-payment`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ months: confirmData.value.months })
    });
    
    showConfirmModal.value = false;
    loadRestaurants();
  } catch (e: any) {
    alert('Ошибка при подтверждении: ' + e.message);
  }
};

const toggleBlock = async (id: string, currentlyBlocked: boolean) => {
  if (confirm(currentlyBlocked ? 'Разблокировать этот аккаунт?' : 'Заблокировать этот аккаунт?')) {
    try {
      await superAdminApi.toggleBlockRestaurant(id, !currentlyBlocked);
      loadRestaurants();
    } catch (e: any) {
      alert('Ошибка: ' + e.message);
    }
  }
};

const loginAsUser = async (id: string, name: string) => {
  if (confirm(`Войти в панель клиента "${name}"?`)) {
    try {
      const res = await superAdminApi.loginAs(id);
      if (res.success && res.token) {
        setToken(res.token);
        localStorage.setItem('currentUser', JSON.stringify({
          restaurantId: res.restaurantId,
          name: res.name,
          email: 'unknown',
          role: res.role,
        }));
        menuStore.loadUserInfo();
        menuStore.loadFromServer();
        router.push('/constructor');
      }
    } catch (e: any) {
      alert(e.message || 'Ошибка входа');
    }
  }
};

const deleteRestaurant = async (id: string) => {
  if (confirm('Точно удалить ресторан?')) {
    try {
      await superAdminApi.deleteRestaurant(id);
      restaurants.value = restaurants.value.filter(r => r.id !== id);
    } catch (e: any) {
      alert(e.message || 'Ошибка');
    }
  }
};

const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  menuStore.stopPolling();
  router.push('/login');
};
</script>

<style scoped>
.super-admin-layout {
  display: flex;
  height: 100vh;
  background-color: #f3f4f6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.sa-sidebar { width: 260px; background-color: #111827; color: white; display: flex; flex-direction: column; padding: 24px 16px; }
.brand-logo-img { height: 48px; object-fit: contain; margin-bottom: 24px; }
nav { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.nav-btn { background: transparent; color: #9ca3af; border: none; text-align: left; padding: 12px 16px; border-radius: 8px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.nav-btn:hover { background-color: #1f2937; color: white; }
.nav-btn.active { background-color: #9D0D0E; color: white; }
.sidebar-footer { margin-top: auto; }
.logout { width: 100%; color: #ef4444; }
.logout:hover { background-color: #7f1d1d; color: #f87171; }

.sa-content { flex: 1; padding: 40px; overflow-y: auto; }
.sa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.sa-header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #111827; }
.search-input { padding: 10px 16px; border-radius: 8px; border: 1px solid #d1d5db; width: 300px; font-size: 14px; outline: none; }
.search-input:focus { border-color: #9D0D0E; }

.table-container { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
.sa-table { width: 100%; border-collapse: collapse; text-align: left; }
.sa-table th { background-color: #f9fafb; padding: 16px 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
.sa-table td { padding: 16px 20px; font-size: 14px; color: #374151; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
.font-semibold { font-weight: 600; color: #111827; }
.status-badge { padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
.status-badge.active { background-color: #dbeafe; color: #1e40af; }
.status-badge.blocked { background-color: #fee2e2; color: #b91c1c; }
.status-badge.warn { background-color: #fef3c7; color: #b45309; }
.status-badge.success-badge { background-color: #d1fae5; color: #065f46; }
.text-red-500 { color: #ef4444; }
.font-bold { font-weight: bold; }

.actions-cell { display: flex; gap: 8px; }
.btn-action { padding: 6px 12px; border-radius: 6px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
.btn-action:hover { opacity: 0.8; }
.btn-login { background-color: #f3f4f6; color: #374151; }
.btn-success { background-color: #10b981; color: white; }
.btn-warn { background-color: #fef3c7; color: #b45309; }
.btn-danger { background-color: #fee2e2; color: #b91c1c; }
.empty-state { text-align: center; color: #9ca3af; font-size: 14px; }

/* Modals */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; color: #111827; padding: 24px; border-radius: 12px; width: 400px; max-width: 90%; }
.modal-content h2 { margin-top: 0; margin-bottom: 20px; color: #111827; font-size: 18px; }
.form-group { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
.form-group label { color: #374151; font-weight: 600; font-size: 13px; }
.form-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; color: #111827; background: #fff; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.btn-primary { background: #9D0D0E; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-secondary { background: #e5e7eb; color: #374151; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
</style>
