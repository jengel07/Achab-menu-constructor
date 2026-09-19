<template>
  <!-- Главный контейнер дашборда Yumzi с динамическим классом для темной темы -->
  <div class="yumzi-dashboard" :class="{ 'dark-theme': isDarkMode }">
    
    <!-- ==================== БОКОВОЕ МЕНЮ (SIDEBAR) ==================== -->
    <aside class="sidebar" :class="{ open: isSidebarOpen }">
      <!-- Шапка сайдбара с кнопкой закрытия для мобильных устройств -->
      <div class="sidebar-header">
        <button class="btn-close-sidebar" @click="isSidebarOpen = false">✕</button>
      </div>

      <!-- Карточка текущего пользователя в сайдбаре -->
      <div class="user-profile-card">
        <div class="avatar">
          <span class="avatar-icon">👤</span>
        </div>
        <div class="user-info">
          <!-- Реактивный вывод имени и email из объекта userProfile -->
          <div class="user-name">{{ userProfile.firstName }} {{ userProfile.lastName }}</div>
          <div class="user-email">{{ userProfile.email }}</div>
        </div>
      </div>

      <!-- Основная навигация сайдбара -->
      <nav class="sidebar-nav">
        <!-- Вкладка Home (Главная) -->
        <a href="#" class="nav-item" :class="{ active: activeTab === 'home' }" @click.prevent="openTab('home')">
          <span class="nav-icon">🏠</span> Home
        </a>
        <!-- Переход на страницу админки заказов -->
        <a href="#" class="nav-item" @click.prevent="openRoute('/admin')">
          <span class="nav-icon">🛍️</span> Заказ
        </a>
        <!-- Вкладка статистики (переключает на home/раздел статистики) -->
        <a href="#" class="nav-item" @click.prevent="openTab('home')">
          <span class="nav-icon">📈</span> Статистика
        </a>

        <div class="nav-divider"></div>

        <!-- Раздел Управления Персоналом -->
        <a href="#" class="nav-item" :class="{ active: activeTab === 'staff' }" @click.prevent="openTab('staff')">
          <span class="nav-icon">👥</span> Персонал
        </a>

        <!-- Настройки (открывают модалку/вкладку профиля с нужным вложенным табом) -->
        <a href="#" class="nav-item" @click.prevent="openSettings('payment')">
          <span class="nav-icon">💳</span> Оплата
        </a>
        <a href="#" class="nav-item" @click.prevent="openSettings('profile')">
          <span class="nav-icon">👤</span> Профиль
        </a>
        <a href="#" class="nav-item" @click.prevent="openSettings('tags')">
          <span class="nav-icon">🏷️</span> Фильтры и теги
        </a>
        <a href="#" class="nav-item" @click.prevent="openSettings('trash')">
          <span class="nav-icon">🗑️</span> Корзина
        </a>

        <div class="nav-divider"></div>

        <!-- Кнопка Выхода из системы -->
        <a href="#" class="nav-item logout" @click.prevent="requestLogout">
          <span class="nav-icon">↪️</span> Выйти
        </a>
      </nav>
    </aside>

    <!-- Затемнение (оверлей) при открытии сайдбара на мобильных -->
    <div 
      v-if="isSidebarOpen" 
      class="sidebar-overlay" 
      @click="isSidebarOpen = false"
    ></div>

    <!-- ==================== ОСНОВНОЙ КОНТЕНТ ==================== -->
    <div class="main-wrapper" :class="{ 'is-loading': isLoading }">
      <!-- ВЕРХНИЙ ХЕДЕР -->
      <header class="dash-header">
        <div class="left-header-block">
          <!-- Кнопка Гамбургер для открытия сайдбара -->
          <button class="btn-burger" @click="isSidebarOpen = true" title="Открыть меню">
            ☰
          </button>
          <img src="/achab-logo.jpg" class="brand-logo-img" alt="Achab Menu" />
        </div>

        <!-- Приветственный блок -->
        <div class="greeting-box">
          <h2>Добрый вечер, {{ userProfile.firstName }}! 🌙</h2>
          <p class="subtitle">Что вы планируете сегодня?</p>
        </div>

        <!-- Переключатели темы и кнопка обновления -->
        <div class="header-actions">
          <button 
            class="btn-theme-toggle" 
            @click="toggleTheme" 
            :title="isDarkMode ? 'Включить светлую тему' : 'Включить темную тему'"
          >
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
          
          <!-- Улучшено: обновляет данные по API без перезагрузки всей SPA-страницы -->
          <button class="btn-refresh" @click="fetchDashboardData" :disabled="isLoading">
            {{ isLoading ? 'Обновление...' : 'Обновить' }}
          </button>
        </div>
      </header>

      <!-- TAB 1: ГЛАВНАЯ СТРАНИЦА (DASHBOARD) -->
      <main v-if="activeTab === 'home'">
        <!-- Инпут AI-помощника / Шефа -->
        <div class="search-shef-bar">
          <span class="shef-icon">✨</span>
          <input type="text" placeholder="Спросите Шефа..." readonly />
          <span class="arrow-icon">→</span>
        </div>

        <!-- Карточки быстрой навигации к операциям -->
        <section class="section-block">
          <span class="section-title">ОПЕРАЦИИ</span>
          <div class="operations-grid">
            <div class="op-card" @click="openRoute('/constructor')">
              <div class="op-icon digital">📱</div>
              <h3>Цифровое</h3>
              <p>Настроить QR-код меню</p>
            </div>
            <div class="op-card" @click="router.push('/menu-data')">
              <div class="op-icon data">田</div>
              <h3>Данные</h3>
              <p>Массовое управление данными меню</p>
            </div>
            <div class="op-card" @click="openRoute('/admin')">
              <div class="op-icon orders">📋</div>
              <h3>Центр заказов</h3>
              <p>Управление входящими заказами</p>
            </div>
          </div>
        </section>

        <!-- Список созданных меню ресторана -->
        <section class="section-block">
          <div class="section-header-row">
            <span class="section-title">МЕНЮ</span>
          </div>
          <div class="menu-items-list">
            <!-- Рендеринг списка меню из реактивного массива menus -->
            <div class="menu-row-card" v-for="(menu, idx) in menus" :key="menu.id || idx">
              <div class="menu-row-left">
                <span class="drag-dots">⋮⋮</span>
                <!-- Индикатор активности меню -->
                <span class="status-dot" :class="{ active: menu.isActive }"></span>
                <div class="menu-info-text">
                  <h4>{{ menu.name }}</h4>
                  <p>{{ menu.isActive ? 'Всегда доступно' : 'Скрыто' }} • {{ menu.categories }} категорий • {{ menu.items }} позиций</p>
                </div>
              </div>
              <div class="menu-row-right">
                <!-- Быстрый переход в конструктор -->
                <button class="icon-arrow" @click="openRoute('/constructor')">→</button>
                
                <!-- Выпадающее меню действий (три точки) -->
                <div class="menu-actions-wrapper" @click.stop>
                  <span class="menu-dots" @click="toggleDropdown(idx)">⋮</span>
                  
                  <!-- Контекстное выпадающее меню -->
                  <div class="dropdown-menu" v-if="activeDropdown === idx">
                    <div class="dropdown-item" @click="promptRenameMenu(idx)">
                      <span>✏️</span> Редактировать название
                    </div>
                    <div class="dropdown-item" @click="toggleAvailability(idx)">
                      <span>👁️</span> Доступность
                    </div>
                    <div class="dropdown-item" @click="duplicateMenu(idx)">
                      <span>📋</span> Дублировать
                    </div>
                    <div class="dropdown-item delete" @click="promptDeleteMenu(idx)">
                      <span>🗑️</span> Удалить
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Кнопка создания нового меню -->
          <button class="btn-new-menu" @click="promptAddNewMenu">+ Новое меню</button>
        </section>

        <!-- Блок со статистикой и геймификацией/ограничением просмотров -->
        <section class="section-block stats-section">
          <div class="stat-header-row">
            <span class="section-title">СТАТИСТИКА</span>
            <span class="total-views-text">{{ viewsCount }} Всего просмотров</span>
          </div>

          <div class="stat-card-container">
            <!-- Декоративный график фоном -->
            <svg class="bg-chart-svg" viewBox="0 0 500 100" preserveAspectRatio="none">
              <path d="M 0,80 Q 80,70 160,85 T 320,50 T 500,20" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-dasharray="4 4" />
            </svg>

            <div class="stat-center-box">
              <!-- Круговой Прогресс-бар с вычисляемым градиентом -->
              <div class="circle-progress" :style="progressStyle">
                <div class="circle-inner">
                  {{ viewsCount }}/10
                </div>
              </div>

              <!-- Динамическое описание с правильным склонением слова "посетитель" -->
              <p class="stat-desc">
                {{ userProfile.firstName }}, осталось всего {{ 10 - viewsCount }} {{ getVisitorsWord(10 - viewsCount) }}, чтобы открыть полную статистику — верим в вас 😄
              </p>

              <!-- Заблокированная кнопка просмотра статистики -->
              <button class="btn-lock-stat" disabled>
                <span class="lock-icon">🔒</span> Посмотреть полную статистику
              </button>
            </div>
          </div>
        </section>
      </main>

      <!-- TAB 2: УПРАВЛЕНИЕ ПЕРСОНАЛОМ -->
      <main v-if="activeTab === 'staff'">
        <section class="section-block">
          <div class="staff-header-row">
            <div>
              <h2 class="staff-title">Управление персоналом</h2>
              <p class="staff-subtitle">Управляйте правами доступа и сотрудниками заведения</p>
            </div>
            <!-- Открытие модалки приглашения -->
            <button class="btn-primary-orange" @click="showInviteModal = true">
              + Пригласить сотрудника
            </button>
          </div>

          <!-- Список сотрудников -->
          <div class="staff-list">
            <div class="staff-card" v-for="(member, idx) in staffMembers" :key="member.id || idx">
              <div class="staff-info-left">
                <!-- Аватарка (первая буква имени) -->
                <div class="staff-avatar">
                  {{ member.firstName ? member.firstName[0] : '👤' }}
                </div>
                <div>
                  <h4 class="staff-name">
                    {{ member.firstName }} {{ member.lastName }}
                    <span class="badge-status" :class="member.status">
                      {{ member.status === 'active' ? 'Активен' : 'Ожидает' }}
                    </span>
                  </h4>
                  <p class="staff-email">{{ member.email }}</p>
                </div>
              </div>

              <div class="staff-info-right">
                <!-- Отображение человекочитаемой роли -->
                <span class="staff-role-tag">{{ getRoleLabel(member.role) }}</span>
                <button class="btn-remove-staff" @click="promptRemoveStaff(idx)" title="Удалить">🗑️</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- TAB 3: НАСТРОЙКИ ПРОФИЛЯ -->
      <main v-if="activeTab === 'settings'">
        <!-- Внедрение дочернего компонента настроек с пропсами и эмиттерами -->
        <ProfileSettings 
          :profile="userProfile" 
          :initialSubTab="activeSettingsSubTab"
          @close="activeTab = 'home'"
          @save="onSaveProfile"
        />
      </main>
    </div>

    <!-- МОДАЛЬНОЕ ОКНО ПРИГЛАШЕНИЯ СОТРУДНИКА -->
    <InviteStaffModal 
      v-if="showInviteModal" 
      @close="showInviteModal = false" 
      @invited="onStaffInvited" 
    />

    <!-- ==================== КАСТОМНОЕ МОДАЛЬНОЕ ОКНО (ДИАЛОГИ) ==================== -->
    <div v-if="modalConfig.isOpen" class="custom-modal-overlay" @click.self="closeCustomModal">
      <div class="custom-modal-card">
        <h3>{{ modalConfig.title }}</h3>
        <p v-if="modalConfig.message">{{ modalConfig.message }}</p>

        <!-- Поле ввода (если требуется ввод текста) -->
        <div v-if="modalConfig.type === 'prompt'" class="modal-input-group">
          <input 
            v-model="modalConfig.inputValue" 
            type="text" 
            class="modal-input" 
            ref="modalInputRef"
            @keyup.enter="confirmCustomModal" 
          />
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="closeCustomModal">Отмена</button>
          <button class="btn-primary" @click="confirmCustomModal">Подтвердить</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import ProfileSettings from './ProfileSettings.vue';
import InviteStaffModal from './InviteStaffModal.vue';

const router = useRouter();

// ==================== РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ====================
const isDarkMode = ref(false);
const isSidebarOpen = ref(false);
const showInviteModal = ref(false);
const isLoading = ref(false);

const activeTab = ref<'home' | 'settings' | 'staff'>('home'); 
const activeSettingsSubTab = ref('profile');
const viewsCount = ref(1);

const userProfile = reactive({
  firstName: 'Евгения',
  lastName: '',
  email: 'apsny.sklad@gmail.com',
  role: 'Владелец/Партнёр',
  timezone: 'Istanbul (GMT+3)',
  language: 'Русский',
  wideView: false
});

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
}

const staffMembers = ref<StaffMember[]>([
  {
    id: 1,
    firstName: 'Евгения',
    lastName: '',
    email: 'apsny.sklad@gmail.com',
    role: 'owner',
    status: 'active'
  }
]);

// Интерфейс для меню
interface MenuItem {
  id: number;
  name: string;
  categories: number; // Динамическое количество категорий
  items: number;      // Динамическое количество блюд/позиций
  isActive: boolean;
}

// Инициализируем массив меню
const menus = ref<MenuItem[]>([]);

const activeDropdown = ref<number | null>(null);

// ==================== КАСТОМНАЯ МОДАЛКА ====================
const modalInputRef = ref<HTMLInputElement | null>(null);
const modalConfig = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'confirm' as 'confirm' | 'prompt',
  inputValue: '',
  onConfirm: (_val?: string) => {}
});

const openCustomModal = (opts: {
  title: string;
  message?: string;
  type?: 'confirm' | 'prompt';
  initialValue?: string;
  onConfirm: (val?: string) => void;
}) => {
  modalConfig.title = opts.title;
  modalConfig.message = opts.message || '';
  modalConfig.type = opts.type || 'confirm';
  modalConfig.inputValue = opts.initialValue || '';
  modalConfig.onConfirm = opts.onConfirm;
  modalConfig.isOpen = true;

  if (opts.type === 'prompt') {
    nextTick(() => {
      modalInputRef.value?.focus();
    });
  }
};

const closeCustomModal = () => {
  modalConfig.isOpen = false;
};

const confirmCustomModal = () => {
  modalConfig.onConfirm(modalConfig.inputValue);
  closeCustomModal();
};

// COMPUTED
const progressStyle = computed(() => {
  const percentage = Math.min((viewsCount.value / 10) * 100, 100);
  return {
    background: `conic-gradient(#ff5722 ${percentage}%, #e5e7eb ${percentage}% 100%)`
  };
});

// Сохранение списка меню в localStorage
const saveMenusToStorage = () => {
  localStorage.setItem('user_menus', JSON.stringify(menus.value));
};

// Получение статистики для самого первого (дефолтного) меню из Конструктора
const getConstructorStats = () => {
  try {
    const savedData = localStorage.getItem('menuData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const categoriesCount = parsed.categories ? parsed.categories.length : 4;
      const itemsCount = parsed.dishes ? parsed.dishes.length : (parsed.items ? parsed.items.length : 4);
      return { categoriesCount, itemsCount };
    }
  } catch (e) {
    console.error('Ошибка чтения данных конструктора:', e);
  }
  return { categoriesCount: 4, itemsCount: 4 };
};

// ==================== ЗАГРУЗКА ДАННЫХ ====================
const fetchDashboardData = async () => {
  isLoading.value = true;
  try {
    // 1. Сначала читаем сохраненный список из localStorage
    const storedMenus = localStorage.getItem('user_menus');
    if (storedMenus) {
      menus.value = JSON.parse(storedMenus);
      return;
    }

    // 2. Если нет в локальном хранилище — пытаемся получить с бэкенда
    const response = await fetch('/api/menu'); 
    const contentType = response.headers.get('content-type');

    if (response.ok && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      menus.value = data.map((m: any) => {
        const categoriesCount = m.categories ? m.categories.length : 0;
        const totalItemsCount = m.categories 
          ? m.categories.reduce((acc: number, cat: any) => acc + (cat.items ? cat.items.length : 0), 0)
          : 0;

        return {
          id: m.id,
          name: m.name,
          isActive: m.isActive ?? true,
          categories: categoriesCount,
          items: totalItemsCount
        };
      });
    } else {
      // 3. Fallback: Загружаем статистику для первого основного меню
      const { categoriesCount, itemsCount } = getConstructorStats();
      menus.value = [
        {
          id: 101,
          name: 'Основное меню',
          categories: categoriesCount,
          items: itemsCount,
          isActive: true
        }
      ];
    }
    saveMenusToStorage();
  } catch (error) {
    console.warn('Сервер API недоступен, используем локальные данные');
    const { categoriesCount, itemsCount } = getConstructorStats();
    menus.value = [
      {
        id: 101,
        name: 'Основное меню',
        categories: categoriesCount,
        items: itemsCount,
        isActive: true
      }
    ];
    saveMenusToStorage();
  } finally {
    isLoading.value = false;
  }
};

// LIFECYCLE HOOKS
onMounted(() => {
  window.addEventListener('click', closeDropdowns);

  const savedName = localStorage.getItem('userName');
  const savedEmail = localStorage.getItem('userEmail');

  if (savedName) userProfile.firstName = savedName;
  if (savedEmail) {
    userProfile.email = savedEmail;
    if (staffMembers.value.length > 0) {
      staffMembers.value[0].firstName = savedName || userProfile.firstName;
      staffMembers.value[0].email = savedEmail;
    }
  }

  fetchDashboardData();
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns);
});

// ==================== МЕТОДЫ ====================
const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    owner: 'Владелец',
    chef: 'Шеф-повар',
    waiter: 'Официант',
    manager: 'Менеджер',
    other: 'Персонал'
  };
  return map[role] || role;
};

const onStaffInvited = (data: { email: string; role: string }) => {
  staffMembers.value.push({
    id: Date.now(),
    firstName: 'Новый',
    lastName: 'Сотрудник',
    email: data.email,
    role: data.role,
    status: 'pending'
  });
};

const promptRemoveStaff = (idx: number) => {
  openCustomModal({
    title: 'Удаление сотрудника',
    message: `Вы действительно хотите удалить сотрудника ${staffMembers.value[idx].firstName}?`,
    type: 'confirm',
    onConfirm: () => {
      staffMembers.value.splice(idx, 1);
    }
  });
};

const getVisitorsWord = (count: number) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'посетителей';
  if (lastDigit === 1) return 'посетитель';
  if (lastDigit >= 2 && lastDigit <= 4) return 'посетителя';
  return 'посетителей';
};

const toggleTheme = () => { isDarkMode.value = !isDarkMode.value; };
const openRoute = (path: string) => { isSidebarOpen.value = false; router.push(path); };
const openTab = (tab: 'home' | 'settings' | 'staff') => { activeTab.value = tab; isSidebarOpen.value = false; };
const openSettings = (subTabName: string) => { activeSettingsSubTab.value = subTabName; activeTab.value = 'settings'; isSidebarOpen.value = false; };
const onSaveProfile = () => {};

const requestLogout = () => {
  openCustomModal({
    title: 'Выход из системы',
    message: 'Вы действительно хотите выйти из своего аккаунта?',
    type: 'confirm',
    onConfirm: () => { router.push('/login'); }
  });
};

const toggleDropdown = (idx: number) => { activeDropdown.value = activeDropdown.value === idx ? null : idx; };
const closeDropdowns = () => { activeDropdown.value = null; };

const promptRenameMenu = (idx: number) => {
  closeDropdowns();
  openCustomModal({
    title: 'Редактировать название',
    message: 'Введите новое наименование для этого меню:',
    type: 'prompt',
    initialValue: menus.value[idx].name,
    onConfirm: (newName) => {
      if (newName && newName.trim()) {
        menus.value[idx].name = newName.trim();
        saveMenusToStorage();
      }
    }
  });
};

const toggleAvailability = (idx: number) => {
  closeDropdowns();
  menus.value[idx].isActive = !menus.value[idx].isActive;
  saveMenusToStorage();
};

const duplicateMenu = (idx: number) => {
  closeDropdowns();
  const target = menus.value[idx];
  menus.value.push({
    id: Date.now(),
    name: `${target.name} (Копия)`,
    categories: target.categories,
    items: target.items,
    isActive: target.isActive
  });
  saveMenusToStorage();
};

const promptDeleteMenu = (idx: number) => {
  closeDropdowns();
  openCustomModal({
    title: 'Удаление меню',
    message: `Вы уверены, что хотите полностью удалить "${menus.value[idx].name}"?`,
    type: 'confirm',
    onConfirm: () => {
      menus.value.splice(idx, 1);
      saveMenusToStorage();
    }
  });
};

// Создание нового ЧИСТОГО меню (0 категорий, 0 позиций)
const promptAddNewMenu = () => {
  openCustomModal({
    title: 'Создание меню',
    message: 'Укажите название нового меню:',
    type: 'prompt',
    initialValue: 'Новое меню',
    onConfirm: (name) => {
      if (name && name.trim()) {
        menus.value.push({
          id: Date.now(),
          name: name.trim(),
          categories: 0,
          items: 0,
          isActive: true
        });
        saveMenusToStorage();
      }
    }
  });
};
</script>

<style scoped>
/* Стили для кастомных модальных окон (диалогов) */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.custom-modal-card {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  min-width: 320px;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.dark-theme .custom-modal-card {
  background: #1e1e24;
  color: #f1f1f1;
}

.custom-modal-card h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1.2rem;
}

.custom-modal-card p {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.dark-theme .custom-modal-card p {
  color: #aaa;
}

.modal-input-group {
  margin-bottom: 20px;
}

.modal-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary {
  padding: 8px 16px;
  background: #ff5722;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.main-wrapper.is-loading {
  opacity: 0.6;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
</style>

<style scoped>
/* ТЕМАТИЧЕСКИЕ ПЕРЕМЕННЫЕ */
.yumzi-dashboard {
  --bg-color: #f8f9fa;
  --card-bg: #ffffff;
  --text-main: #111827;
  --text-muted: #6b7280;
  --border-color: #e5e7eb;
  --input-bg: #ffffff;
  --button-hover: #f3f4f6;
  
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-main);
  transition: all 0.2s ease-in-out;
  position: relative;
}

.yumzi-dashboard.dark-theme {
  --bg-color: #121316;
  --card-bg: #1c1e22;
  --text-main: #ffffff;
  --text-muted: #9ca3af;
  --border-color: #2a2d34;
  --input-bg: #181a1e;
  --button-hover: #262930;
}

.main-wrapper {
  flex: 1;
  padding: 20px 40px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

/* SIDEBAR */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background-color: var(--card-bg);
  box-shadow: 4px 0 20px rgba(0,0,0,0.08);
  z-index: 1000;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  transform: translateX(-110%);
  transition: transform 0.3s ease-in-out;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.btn-close-sidebar {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px 8px;
}

.user-profile-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0 20px 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 15px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #9D0D0E;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.user-info {
  overflow: hidden;
}

.user-name {
  font-weight: 700;
  font-size: 14px;
  color: var(--text-main);
}

.user-email {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-main);
  text-decoration: none;
  transition: background 0.2s;
}

.nav-item:hover, .nav-item.active {
  background-color: var(--button-hover);
  font-weight: 600;
}

.nav-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 10px 0;
}

.nav-item.logout {
  color: #9D0D0E;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

/* HEADER */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.left-header-block {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-burger {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
}

.brand-logo {
  font-size: 20px;
  font-weight: 800;
}

.greeting-box {
  text-align: center;
}

.greeting-box h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 2px;
}

.subtitle {
  color: var(--text-muted);
  font-size: 12px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-theme-toggle {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-refresh {
  background-color: #9D0D0E;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

/* SEARCH BAR */
.search-shef-bar {
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 30px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  max-width: 500px;
  margin: 0 auto 30px auto;
  color: var(--text-muted);
}

.search-shef-bar input {
  border: none;
  outline: none;
  flex: 1;
  margin-left: 10px;
  font-size: 13px;
  background: transparent;
  color: var(--text-main);
}

/* CARDS & GRID */
.section-block {
  margin-bottom: 25px;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  display: block;
  letter-spacing: 0.5px;
}

.operations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 10px;
}

.op-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.op-card h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 6px;
}

.op-card p {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.3;
}

.op-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 14px;
}

.op-icon.digital { background: rgba(255, 85, 0, 0.15); color: #9D0D0E; }
.op-icon.data { background: rgba(239, 68, 68, 0.15); color: #9D0D0E; }
.op-icon.orders { background: rgba(34, 197, 94, 0.15); color: #22c55e; }

/* MENU ITEMS */
.section-header-row {
  margin-bottom: 10px;
}

.menu-row-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.menu-row-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drag-dots {
  color: var(--text-muted);
  cursor: grab;
  font-size: 14px;
}

.status-dot {
  width: 7px;
  height: 7px;
  background-color: var(--text-muted);
  border-radius: 50%;
}

.status-dot.active {
  background-color: #22c55e;
}

.menu-info-text h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.menu-info-text p {
  font-size: 12px;
  color: var(--text-muted);
}

.menu-row-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-arrow {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
}

.menu-actions-wrapper {
  position: relative;
}

.menu-dots {
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 25px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;
  width: 180px;
  overflow: hidden;
}

.dropdown-item {
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-item:hover {
  background: var(--button-hover);
}

.dropdown-item.delete {
  color: #ef4444;
}

.btn-new-menu {
  width: 100%;
  background: #9D0D0E;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  margin-top: 5px;
}

/* СТАТИСТИКА */
.stat-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.total-views-text {
  color: #9D0D0E;
  font-weight: 600;
  font-size: 14px;
}

.stat-card-container {
  position: relative;
  background: #f1f2f4;
  border-radius: 20px;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.yumzi-dashboard.dark-theme .stat-card-container {
  background: #181a1e;
}

.bg-chart-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.6;
}

.stat-center-box {
  position: relative;
  z-index: 1;
  background: #f7f8f9;
  border-radius: 16px;
  padding: 24px 30px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.yumzi-dashboard.dark-theme .stat-center-box {
  background: #23262d;
}

.circle-progress {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.circle-inner {
  width: 44px;
  height: 44px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  color: #9D0D0E;
}

.yumzi-dashboard.dark-theme .circle-inner {
  background: #23262d;
}

.stat-desc {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.4;
  margin-bottom: 18px;
}

.yumzi-dashboard.dark-theme .stat-desc {
  color: #9ca3af;
}

.btn-lock-stat {
  background: #e9ecef;
  color: #6c757d;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: not-allowed;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.yumzi-dashboard.dark-theme .btn-lock-stat {
  background: #2e323b;
  color: #8b92a1;
}

/* СТИЛИ ДЛЯ ВКТАДКИ "ПЕРСОНАЛ" */
.staff-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.staff-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.staff-subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.btn-primary-orange {
  background: #9D0D0E;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary-orange:hover {
  background: #9D0D0E;
}

.staff-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.staff-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.staff-info-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.staff-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.yumzi-dashboard.dark-theme .staff-avatar {
  background: #2e323b;
  color: #fff;
}

.staff-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.staff-email {
  font-size: 12px;
  color: var(--text-muted);
}

.badge-status {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.badge-status.active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.badge-status.pending {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
}

.staff-info-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.staff-role-tag {
  font-size: 12px;
  padding: 4px 10px;
  background: var(--button-hover);
  border-radius: 6px;
  color: var(--text-main);
  font-weight: 500;
}

.btn-remove-staff {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-remove-staff:hover {
  opacity: 1;
}
</style>
<style scoped>
.brand-logo-img {
  height: 48px;
  object-fit: contain;
  margin-bottom: 24px;
}
</style>
