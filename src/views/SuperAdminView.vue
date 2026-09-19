<template>
  <div class="super-admin-layout">
    <!-- Боковая панель -->
    <aside class="sa-sidebar">
      <img src="/logo-light.png" class="brand-logo-img" alt="Achab Menu" />
      <nav>
        <button 
          :class="['nav-btn', { active: currentTab === 'restaurants' }]" 
          @click="currentTab = 'restaurants'"
        >
          🏢 Рестораны
        </button>
        <button 
          :class="['nav-btn', { active: currentTab === 'tariffs' }]" 
          @click="currentTab = 'tariffs'"
        >
          💳 Тарифы
        </button>
        <button 
          :class="['nav-btn', { active: currentTab === 'stats' }]" 
          @click="currentTab = 'stats'"
        >
          📈 Статистика
        </button>
      </nav>
      <div class="sidebar-footer">
        <button class="nav-btn logout" @click="logout">Выйти</button>
      </div>
    </aside>

    <!-- Основная рабочая область -->
    <main class="sa-content">
      <header class="sa-header">
        <h1>{{ pageTitle }}</h1>
        <div class="header-actions" v-if="currentTab === 'restaurants'">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск по email или названию..." 
            class="search-input" 
          />
        </div>
      </header>

      <!-- 1. ВКЛАДКА: РЕСТОРАНЫ -->
      <div v-if="currentTab === 'restaurants'" class="table-container">
        <table class="sa-table">
          <thead>
            <tr>
              <th>Название заведения</th>
              <th>Email владельца</th>
              <th>Дата регистрации</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="res in filteredRestaurants" :key="res.id">
              <td class="font-semibold">{{ res.name }}</td>
              <td>{{ res.email }}</td>
              <td>{{ new Date(res.createdAt).toLocaleDateString('ru-RU') }}</td>
              <td>
                <span :class="['status-badge', res.isBlocked ? 'blocked' : 'active']">
                  {{ res.isBlocked ? 'Заблокирован' : 'Активен' }}
                </span>
              </td>
              <td class="actions-cell">
                <button @click="loginAsUser(res.id, res.name)" class="btn-action btn-login" title="Войти в конструктор этого ресторана">
                  🔑 Войти
                </button>
                <button @click="toggleBlock(res.id)" class="btn-action btn-warn" :title="res.isBlocked ? 'Разблокировать' : 'Заблокировать'">
                  {{ res.isBlocked ? '🔓' : '🔒' }}
                </button>
                <button @click="deleteRestaurant(res.id)" class="btn-action btn-danger" title="Удалить навсегда">
                  🗑️
                </button>
              </td>
            </tr>
            <tr v-if="filteredRestaurants.length === 0">
              <td colspan="5" class="empty-state">Рестораны не найдены</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. ВКЛАДКА: ТАРИФЫ -->
      <div v-if="currentTab === 'tariffs'" class="tariffs-container">
        <div class="tariff-card" v-for="plan in mockTariffs" :key="plan.id">
          <div class="t-header">
            <h3>{{ plan.name }}</h3>
            <div class="t-price">{{ plan.price }} ₽ <span>/ мес</span></div>
          </div>
          <ul class="t-features">
            <li v-for="(feature, idx) in plan.features" :key="idx">✔️ {{ feature }}</li>
          </ul>
          <div class="t-stats">
            Активных клиентов: <strong>{{ plan.activeUsers }}</strong>
          </div>
          <button class="t-btn-edit">Редактировать тариф</button>
        </div>
        
        <!-- Кнопка создания нового тарифа -->
        <div class="tariff-card add-new">
          <div class="add-icon">+</div>
          <p>Создать новый тариф</p>
        </div>
      </div>

      <!-- 3. ВКЛАДКА: СТАТИСТИКА -->
      <div v-if="currentTab === 'stats'" class="stats-container">
        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-title">Всего клиентов</div>
            <div class="stat-value">{{ filteredRestaurants.length }}</div>
            <div class="stat-trend positive">↑ 2 за этот месяц</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Активных PRO-подписок</div>
            <div class="stat-value">12</div>
            <div class="stat-trend positive">↑ 15% рост</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Заблокировано</div>
            <div class="stat-value">1</div>
            <div class="stat-trend negative">Требует внимания</div>
          </div>
          <div class="stat-card highlight">
            <div class="stat-title">Примерная выручка (MRR)</div>
            <div class="stat-value">11 880 ₽</div>
            <div class="stat-trend">в месяц</div>
          </div>
        </div>

        <div class="stat-details">
          <div class="stat-chart-placeholder">
            <h3>График регистраций</h3>
            <div class="placeholder-box">Здесь будет линейный график (например, Chart.js или ECharts)</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { superAdminApi, setToken } from '../api';
import { useMenuStore } from '../store/menuStore';

const router = useRouter();
const menuStore = useMenuStore();

// Состояние вкладок
const currentTab = ref('restaurants'); // 'restaurants' | 'tariffs' | 'stats'
const searchQuery = ref('');
const loading = ref(false);

// Динамический заголовок страницы
const pageTitle = computed(() => {
  if (currentTab.value === 'restaurants') return 'Управление клиентами';
  if (currentTab.value === 'tariffs') return 'Тарифные планы';
  if (currentTab.value === 'stats') return 'Аналитика платформы';
  return '';
});

// ─── ДАННЫЕ: РЕСТОРАНЫ ──────────────────────────────────────────
const restaurants = ref<any[]>([]);

const loadRestaurants = async () => {
  loading.value = true;
  try {
    const res = await superAdminApi.getRestaurants();
    restaurants.value = res.restaurants || [];
  } catch (e: any) {
    alert(e.message || 'Ошибка при загрузке ресторанов');
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

// ─── ДАННЫЕ: ТАРИФЫ (Моки) ───────────────────────────────────────
const mockTariffs = ref([
  {
    id: 'free',
    name: 'Базовый (Free)',
    price: 0,
    features: ['До 50 блюд в меню', 'Генерация QR-кода', 'Стандартный дизайн'],
    activeUsers: 15
  },
  {
    id: 'pro',
    name: 'Продвинутый (PRO)',
    price: 990,
    features: ['Безлимитное количество блюд', 'Панель для кухни/официантов', 'Брендирование и логотип', 'Прием заказов со столиков'],
    activeUsers: 12
  }
]);

// ─── ФУНКЦИИ УПРАВЛЕНИЯ ──────────────────────────────────────────
const toggleBlock = (_id: string) => {
  alert('Функция блокировки пока не реализована на бэкенде.');
};

const loginAsUser = async (id: string, name: string) => {
  if (confirm(`Выполнить вход в панель управления ресторана "${name}"?`)) {
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
        // Загружаем данные магазина для нового ресторана
        menuStore.loadUserInfo();
        menuStore.loadFromServer();
        router.push('/constructor');
      }
    } catch (e: any) {
      alert(e.message || 'Ошибка при входе');
    }
  }
};

const deleteRestaurant = async (id: string) => {
  if (confirm('ВНИМАНИЕ! Вы уверены, что хотите удалить этот ресторан НАВСЕГДА? Данные меню будут утеряны.')) {
    try {
      await superAdminApi.deleteRestaurant(id);
      restaurants.value = restaurants.value.filter(r => r.id !== id);
      alert('Ресторан удален');
    } catch (e: any) {
      alert(e.message || 'Ошибка удаления');
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

/* Боковая панель */
.sa-sidebar {
  width: 260px;
  background-color: #111827;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
}

.sa-logo {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 40px;
  padding-left: 12px;
  letter-spacing: 0.5px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-btn {
  background: transparent;
  color: #9ca3af;
  border: none;
  text-align: left;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background-color: #1f2937;
  color: white;
}

.nav-btn.active {
  background-color: #9D0D0E;
  color: white;
}

.sidebar-footer {
  margin-top: auto;
}

.logout {
  width: 100%;
  color: #ef4444;
}
.logout:hover {
  background-color: #7f1d1d;
  color: #f87171;
}

/* Контентная часть */
.sa-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.sa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.sa-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.search-input {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  width: 300px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus {
  border-color: #9D0D0E;
}

/* 1. Таблица Ресторанов */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.sa-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.sa-table th {
  background-color: #f9fafb;
  padding: 16px 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.sa-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.font-semibold { font-weight: 600; color: #111827; }

.status-badge {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}
.status-badge.active { background-color: #d1fae5; color: #065f46; }
.status-badge.blocked { background-color: #fee2e2; color: #991b1b; }

.actions-cell { display: flex; gap: 8px; }

.btn-action {
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-action:hover { opacity: 0.8; }
.btn-login { background-color: #f3f4f6; color: #1f2937; border: 1px solid #d1d5db; }
.btn-warn { background-color: #fef3c7; color: #92400e; }
.btn-danger { background-color: #fee2e2; color: #b91c1c; }

.empty-state { text-align: center; padding: 40px !important; color: #6b7280; }

/* 2. Тарифы */
.tariffs-container {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.tariff-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 300px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.t-header h3 { margin: 0 0 8px 0; font-size: 18px; color: #111827; }
.t-price { font-size: 28px; font-weight: 800; color: #111827; margin-bottom: 20px; }
.t-price span { font-size: 14px; font-weight: 500; color: #6b7280; }

.t-features { list-style: none; padding: 0; margin: 0 0 24px 0; flex: 1; }
.t-features li { margin-bottom: 12px; font-size: 14px; color: #4b5563; }

.t-stats {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
}
.t-stats strong { color: #111827; font-size: 14px; }

.t-btn-edit {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}
.t-btn-edit:hover { background-color: #e5e7eb; }

.add-new {
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: 2px dashed #d1d5db;
  box-shadow: none;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}
.add-new:hover { border-color: #9D0D0E; color: #9D0D0E; background-color: #eff6ff; }
.add-icon { font-size: 40px; font-weight: 300; margin-bottom: 8px; }

/* 3. Статистика */
.stats-container { display: flex; flex-direction: column; gap: 24px; }
.stat-row { display: flex; gap: 24px; }

.stat-card {
  background: white;
  flex: 1;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.stat-card.highlight { background: linear-gradient(135deg, #1e3a8a, #9D0D0E); color: white; }
.stat-card.highlight .stat-title, .stat-card.highlight .stat-trend { color: #dbeafe; }

.stat-title { font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500; }
.stat-value { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
.stat-trend { font-size: 13px; }
.stat-trend.positive { color: #059669; }
.stat-trend.negative { color: #dc2626; }

.stat-details {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.stat-details h3 { margin: 0 0 16px 0; font-size: 16px; }
.placeholder-box {
  height: 300px;
  background-color: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
}
</style>
<style scoped>
.brand-logo-img {
  height: 48px;
  object-fit: contain;
  margin-bottom: 24px;
}
</style>
