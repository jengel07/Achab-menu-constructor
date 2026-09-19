<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch, onMounted, computed } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';

import { useMenuStore } from './store/menuStore';
import type { MenuCategory } from './types/menu';
import { ordersApi, staffApi } from './api';


import MenuEditor from './components/MenuEditor.vue';
import BrandingEditor from './components/BrandingEditor.vue';
import GeneralSettings from './components/GeneralSettings.vue';
import ColorEditor from './components/ColorEditor.vue';
import QrCodeEditor from './components/QrCodeEditor.vue';
import OrderSettingsEditor from './components/OrderSettingsEditor.vue';
import PhoneMockupContent from './components/PhoneMockupContent.vue';
import BannerManager from './components/admin/BannerManager.vue';
import MyTariffContent from './components/MyTariffContent.vue';

import {
  Image as ImageIcon,
  UtensilsCrossed,
  Palette,
  Sparkles,
  FileText,
  QrCode,
  ClipboardList,
  Sun,
  Moon,
  RotateCcw,
  Save,
  Upload,
  Menu as MenuIcon,
  X,
  Users,
  CreditCard,
  User,
  Tag,
  Trash2,
  LogOut,
  
  ArrowLeft,
  RefreshCw,
} from 'lucide-vue-next';

let API_URL = (import.meta as any).env.VITE_API_URL;
if (!API_URL || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {
  API_URL = `http://${window.location.hostname}:3000`;
}

const isBlocked = ref(false);
const checkBilling = async () => {
  try {
    const token = localStorage.getItem('authToken');
    let API_URL_VAR = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    if (!API_URL_VAR || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {
      API_URL_VAR = `http://${window.location.hostname}:3000`;
    }
    const res = await fetch(`${API_URL_VAR}/api/my-restaurant-status`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const r = await res.json();
      if (r.status === 'BLOCKED') {
        isBlocked.value = true;
      } else if (r.status === 'PENDING_PAYMENT' || r.status === 'ACTIVE' || r.status === 'TRIAL') {
        const now = new Date();
        const paidDate = r.paidUntil ? new Date(r.paidUntil) : new Date(0);
        const trialDate = r.trialEndsAt ? new Date(r.trialEndsAt) : new Date(0);
        if (r.status === 'TRIAL' && trialDate < now) isBlocked.value = true;
        if ((r.status === 'PENDING_PAYMENT' || r.status === 'ACTIVE') && paidDate < now) isBlocked.value = true;
      }
      if (isBlocked.value && sidebarView.value !== 'payment') {
        sidebarView.value = 'payment';
      }
    }
  } catch (e) { console.error('Billing check failed', e); }
};

const router = useRouter();
const menuStore = useMenuStore();

const activeTab = ref<'navigation' | 'colors' | 'branding' | 'banners' | 'general' | 'qrcode' | 'orders'>('navigation');
const isLightTheme = ref(false);
const hasImported = ref(true);
const isInitialLoading = ref(true);
const fileInputRef = ref<HTMLInputElement | null>(null);

// ═══════════════════════════════════════════════════════
// SIDEBAR STATE
// ═══════════════════════════════════════════════════════
const isMenuOpen = ref(false);
type SidebarView = 'main' | 'orders' | 'staff' | 'payment' | 'profile' | 'filters' | 'trash' | 'tariff';
const sidebarView = ref<SidebarView>('main');

const closeSidebar = () => {
  isMenuOpen.value = false;
  sidebarView.value = 'main';
};

const openSidebarView = (view: SidebarView) => {
  sidebarView.value = view;
  if (view === 'orders') loadSidebarOrders();
  if (view === 'staff') loadStaff();
};

const sidebarTitle = computed(() => ({
  main: 'Achab',
  orders: 'Заказы',
  staff: 'Персонал',
  payment: 'Моя подписка',
  profile: 'Профиль',
  filters: 'Фильтры и теги',
  trash: 'Корзина',
    tariff: 'Мой тариф',
    tariff: 'Мой тариф',
}[sidebarView.value]));

// ─── ORDERS ───────────────────────────────────────────
const sidebarOrdersTab = ref<'new' | 'progress' | 'done' | 'cancelled'>('new');
const sidebarOrders = ref<any[]>([]);
const sidebarOrdersLoading = ref(false);

const orderTabs = [
  { key: 'new' as const, label: 'Новые' },
  { key: 'progress' as const, label: 'В работе' },
  { key: 'done' as const, label: 'Готовы' },
  { key: 'cancelled' as const, label: 'Отменено' },
];

const filteredSidebarOrders = computed(() =>
  sidebarOrders.value.filter(o =>
    o.status === sidebarOrdersTab.value ||
    (sidebarOrdersTab.value === 'new' && o.status === 'open')
  )
);


const getOrderCountByStatus = (status: string) =>
  sidebarOrders.value.filter(o =>
    o.status === status || (status === 'new' && o.status === 'open')
  ).length;

const loadSidebarOrders = async () => {
  sidebarOrdersLoading.value = true;
  try {
    const data = await ordersApi.getAll() as any[];
    sidebarOrders.value = data.map((o: any) => ({
      ...o,
      total: Number(o.totalPrice ?? o.total ?? 0),
    }));
  } catch (e) {
    console.error('Ошибка загрузки заказов:', e);
  } finally {
    sidebarOrdersLoading.value = false;
  }
};

const changeSidebarOrderStatus = async (id: string, status: string) => {
  const order = sidebarOrders.value.find(o => o.id === id);
  if (order) order.status = status; // optimistic
  try {
    await ordersApi.updateStatus(id, status);
  } catch {
    await loadSidebarOrders();
  }
};

const getOrderTypeLabel = (type?: string) =>
  ({ delivery: '🚲 Доставка', pickup: '📦 Самовывоз', onsite: '🍽️ На месте' })[type || 'onsite'] || '🍽️ На месте';

const getOrderTimestamp = (createdAt: string) => {
  if (!createdAt) return '';
  try {
    const d = new Date(createdAt);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } catch { return createdAt; }
};

// ─── STAFF ────────────────────────────────────────────
const staff = ref<Array<{ id: string; name: string; role: string; email: string; status?: string }>>([]);
const addingStaff = ref(false);
const staffForm = ref({ name: '', role: 'cook', email: '', password: '' });
const staffLoading = ref(false);
const staffError = ref('');

const loadStaff = async () => {
  staffLoading.value = true;
  staffError.value = '';
  try {
    const res = await staffApi.getAll();
    staff.value = res.staff;
  } catch (err: unknown) {
    staffError.value = err instanceof Error ? err.message : 'Ошибка загрузки персонала';
  } finally {
    staffLoading.value = false;
  }
};

const addStaffMember = async () => {
  if (!staffForm.value.name.trim() || !staffForm.value.email.trim()) return;
  if (!staffForm.value.password || staffForm.value.password.length < 6) {
    staffError.value = 'Пароль должен быть не менее 6 символов';
    return;
  }
  staffError.value = '';
  staffLoading.value = true;
  try {
    const res = await staffApi.create({
      name: staffForm.value.name,
      email: staffForm.value.email,
      password: staffForm.value.password,
      role: staffForm.value.role,
    });
    staff.value.unshift(res.staff);
    staffForm.value = { name: '', role: 'cook', email: '', password: '' };
    addingStaff.value = false;
  } catch (err: unknown) {
    staffError.value = err instanceof Error ? err.message : 'Ошибка создания сотрудника';
  } finally {
    staffLoading.value = false;
  }
};

const removeStaffMember = async (id: string) => {
  try {
    await staffApi.remove(id);
    staff.value = staff.value.filter(s => s.id !== id);
  } catch (err: unknown) {
    staffError.value = err instanceof Error ? err.message : 'Ошибка удаления';
  }
};

const getRoleLabel = (role: string) =>
  ({ cook: '👨‍🍳 Повар', chef: '👨‍🍳 Повар', waiter: '👱‍♀️🍽️ Официант', barista: '☕ Бармен', admin: '👑 Администратор' })[role] || role;


// ─── PAYMENT ──────────────────────────────────────────
const _loadPayment = () => {
  try { return JSON.parse(localStorage.getItem('payment_settings') || '{"cash":true,"card":true,"qr":false}'); }
  catch { return { cash: true, card: true, qr: false }; }
};
const paymentSettings = ref(_loadPayment());
const savePaymentSettings = () => localStorage.setItem('payment_settings', JSON.stringify(paymentSettings.value));

// ─── PROFILE ──────────────────────────────────────────
const profileForm = ref({
  name: menuStore.userInfo?.name || '',
  email: menuStore.userInfo?.email || '',
  newPassword: '',
});
const profileSaved = ref(false);

const saveProfile = () => {
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      parsed.name = profileForm.value.name;
      localStorage.setItem('currentUser', JSON.stringify(parsed));
      menuStore.loadUserInfo();
    } catch { /* ignore */ }
  }
  profileSaved.value = true;
  setTimeout(() => (profileSaved.value = false), 2000);
};

// ─── FILTERS & TAGS ───────────────────────────────────
const _loadFilters = () => {
  try {
    return {
      nutFree: true, glutenFree: true, vegetarian: true, vegan: true,
      ...JSON.parse(localStorage.getItem('filter_settings') || '{}'),
    };
  } catch { return { nutFree: true, glutenFree: true, vegetarian: true, vegan: true }; }
};
const filterSettings = ref(_loadFilters());
const saveFilterSettings = () => {
  localStorage.setItem('filter_settings', JSON.stringify(filterSettings.value));
  if (!menuStore.restaurantInfo) return;
  menuStore.restaurantInfo = { ...menuStore.restaurantInfo, filterSettings: filterSettings.value };
  if (typeof syncToTableStorage === 'function') syncToTableStorage();
};

const availableFilters = [
  { key: 'nutFree', icon: '🥜', name: 'Без орехов', desc: 'Блюда не содержат орехи и арахис' },
  { key: 'glutenFree', icon: '🌾', name: 'Без глютена', desc: 'Подходит для людей с целиакией' },
  { key: 'vegetarian', icon: '🥗', name: 'Вегетарианское', desc: 'Без мяса и рыбы' },
  { key: 'vegan', icon: '🌱', name: 'Веганское', desc: 'Без животных продуктов' },
] as const;

// ─── TRASH ────────────────────────────────────────────
const getItemDisplayName = (item: any) => {
  if (!item?.name) return 'Без названия';
  if (typeof item.name === 'object') return item.name.ru || item.name.en || Object.values(item.name)[0] || 'Без названия';
  return item.name;
};

// ═══════════════════════════════════════════════════════
// CONSTRUCTOR LOGIC
// ═══════════════════════════════════════════════════════
const toggleTheme = () => {
  isLightTheme.value = !isLightTheme.value;
  localStorage.setItem('constructorTheme', isLightTheme.value ? 'light' : 'dark');
};

const saveMenuConfig = async () => {
  const currentUser = localStorage.getItem('currentUser');
  const restaurantId = currentUser ? JSON.parse(currentUser).restaurantId : null;
  const token = localStorage.getItem('authToken');
  if (!restaurantId || !token) return;

  try {
    await axios.post(`${API_URL}/api/menu/${restaurantId}`, {
      info: menuStore.restaurantInfo,
      items: menuStore.items,
      cats: menuStore.categories,
      generalSettings: menuStore.generalSettings || {}
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('❌ Ошибка сохранения на бэкенд:', error);
  }
};

const loadMenuFromDatabase = async () => {
  const currentUser = localStorage.getItem('currentUser');
  const restaurantId = currentUser ? JSON.parse(currentUser).restaurantId : null;
  const token = localStorage.getItem('authToken');

  if (!restaurantId || !token) {
    isInitialLoading.value = false;
    return;
  }

  try {
    const response = await axios.get(`${API_URL}/api/menu/${restaurantId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data) {
      if (response.data.restaurantInfo) menuStore.restaurantInfo = { ...menuStore.restaurantInfo, ...response.data.restaurantInfo };
      if (response.data.categories?.length) menuStore.updateCategories(response.data.categories);
      if (response.data.items?.length) menuStore.updateItems(response.data.items);
      if (response.data.generalSettings) menuStore.generalSettings = { ...menuStore.generalSettings, ...response.data.generalSettings };
    }
  } catch (error) {
    console.error('❌ Ошибка при загрузке из БД:', error);
  } finally {
    isInitialLoading.value = false;
  }
};

const syncToTableStorage = () => {
  const formattedData = menuStore.categories.map((cat: MenuCategory) => ({
    id: cat.id || 'cat-' + Math.random(),
    name: cat.name,
    expanded: true,
    items: menuStore.items
      .filter((item: any) => item.categoryId === cat.id || item.category === cat.name)
      .map((item: any) => ({
        id: item.id || 'item-' + Math.random(),
        name: item.name,
        description: item.description || '',
        price: item.price || 0,
        priceGlass: item.priceGlass || 0,
        priceBottle: item.priceBottle || 0,
        noNuts: item.noNuts || false,
        noLactose: item.noLactose || false,
        noGluten: item.noGluten || false,
        isAvailable: item.isAvailable !== false,
        image: item.image || '',
          modifiers: item.modifiers || []
      }))
  }));

  localStorage.setItem('constructor_menu_data', JSON.stringify(formattedData));
  localStorage.setItem('saved_menu', JSON.stringify({
    categoriesCount: menuStore.categories.length,
    itemsCount: menuStore.items.length,
    updatedAt: new Date().toISOString()
  }));

  saveMenuConfig();
};

const manualSave = async () => {
  try {
    syncToTableStorage();
    alert('✅ Меню успешно сохранено!');
  } catch (error) {
    alert('❌ Не удалось сохранить меню');
  }
};

const triggerFileUpload = () => fileInputRef.value?.click();

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  if (!files.length) return;

  const dataFiles = files.filter(f => !f.type.startsWith('image/') && f.type !== 'application/pdf');

  try {
    let newCategories: any[] = [];
    let newItems: any[] = [];

    // Обработка дата-файлов (Excel, JSON)
    for (const file of dataFiles) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        const categoriesMap = new Map<string, string>();

        rows.forEach((row) => {
          const catName = row.Category || row['Категория (Category)'] || row['Категория'] || 'Основное меню';
          const title = row.Title || row['Название (Title)'] || row['Название'];
          const description = row.Description || row['Описание / Состав (Description)'] || row['Описание'] || '';
          let rawPrice = row.Price || row['Цена, руб. (Price)'] || row['Цена'] || 0;
          let price = 0;
          let priceBottle = Number(row['Цена за бутылку'] || row['Цена (бутылка)'] || 0);
          let priceGlass = Number(row['Цена за бокал'] || row['Цена (бокал)'] || row['Цена за стакан'] || 0);

          if (typeof rawPrice === 'string' && rawPrice.includes('/')) {
            const parts = rawPrice.split('/').map(p => Number(p.replace(/[^0-9.]/g, ''))).filter(p => !isNaN(p) && p > 0);
            if (parts.length === 2) {
              priceGlass = Math.min(...parts);
              priceBottle = Math.max(...parts);
            }
          } else {
            price = Number(String(rawPrice).replace(/[^0-9.]/g, '')) || 0;
          }

          if (!title) return;

          if (!categoriesMap.has(catName)) {
            const catId = 'cat-' + Math.random().toString(36).substr(2, 9);
            categoriesMap.set(catName, catId);
            newCategories.push({ id: catId, name: catName });
          }

          newItems.push({
            id: 'item-' + Math.random().toString(36).substr(2, 9),
            categoryId: categoriesMap.get(catName),
            category: catName,
            name: title,
            description,
            price,
            priceBottle: priceBottle > 0 ? priceBottle : undefined,
            priceGlass: priceGlass > 0 ? priceGlass : undefined,
            isAvailable: true,
            image: ''
          });
        });
      } else if (fileName.endsWith('.json')) {
        const text = await file.text();
        const jsonData = JSON.parse(text);

        if (jsonData.categories && jsonData.items) {
          newCategories.push(...jsonData.categories);
          newItems.push(...jsonData.items);
        } else if (Array.isArray(jsonData)) {
          jsonData.forEach((cat, cIdx) => {
            const catId = cat.id || 'cat-' + cIdx;
            newCategories.push({ id: catId, name: cat.name });
            if (cat.items) {
              cat.items.forEach((item: any) => {
                newItems.push({ ...item, categoryId: catId, category: cat.name });
              });
            }
          });
        }
      }
    }

    if (newCategories.length > 0 || newItems.length > 0) {
      // Добавляем к текущему меню, чтобы не стирать старое (по просьбе пользователя)
      const mergedCats = [...menuStore.categories, ...newCategories];
      // Убираем дубликаты категорий по имени
      const uniqueCats = Array.from(new Map(mergedCats.map(c => [c.name, c])).values());
      
      // Обновляем categoryId у новых блюд, если их категория была слита с существующей
      newItems.forEach(item => {
        const catName = item.category || newCategories.find(c => c.id === item.categoryId)?.name;
        if (catName) {
          const finalCat = uniqueCats.find(c => c.name === catName);
          if (finalCat) {
            item.categoryId = finalCat.id;
          }
        }
      });

      menuStore.updateCategories(uniqueCats);
      menuStore.updateItems([...menuStore.items, ...newItems]);
      
      hasImported.value = true;
      syncToTableStorage();
      alert(`✅ Успешно добавлено ${newItems.length} новых блюд!`);
    }

  } catch (error: any) {
    console.error(error);
    alert('❌ Ошибка при обработке файлов: ' + (error.message || 'Неизвестная ошибка'));
  } finally {
    if (target) target.value = '';
  }
};

// Перехват удаления блюд — автоматически отправляет в корзину
const handleUpdateItems = (newItems: any[]) => {
  if (!isInitialLoading.value) {
    const newIds = new Set(newItems.map((i: any) => i.id));
    const removed = menuStore.items.filter((item: any) => !newIds.has(item.id));
    removed.forEach((item: any) => {
      menuStore.trashedItems.unshift(item as any);
    });
    if (removed.length > 0) {
      localStorage.setItem('menu_trash', JSON.stringify(menuStore.trashedItems));
    }
  }
  menuStore.updateItems(newItems as any);
  syncToTableStorage();
};

watch([() => menuStore.items, () => menuStore.categories, () => menuStore.restaurantInfo, () => menuStore.generalSettings], () => {
  if (isInitialLoading.value) return;
  if (menuStore.items.length > 0 || menuStore.categories.length > 0) {
    hasImported.value = true;
  }
}, { deep: true });

watch(isBlocked, (blocked) => {
  if (blocked) {
    sidebarView.value = 'payment';
  }
}, { immediate: true });

onMounted(async () => {
  await checkBilling();
  const savedTheme = localStorage.getItem('constructorTheme');
  if (savedTheme === 'light') isLightTheme.value = true;

  await loadMenuFromDatabase();

  if (menuStore.items.length > 0 || menuStore.categories.length > 0) hasImported.value = true;
  isInitialLoading.value = false;

  profileForm.value.name = menuStore.userInfo?.name || '';
  profileForm.value.email = menuStore.userInfo?.email || '';
});



const resetImport = () => {
  menuStore.updateCategories([]);
  menuStore.updateItems([]);
  hasImported.value = false;
  localStorage.removeItem('restaurantData');
  localStorage.removeItem('constructor_menu_data');
  localStorage.removeItem('saved_menu');
};

const updateRestaurantInfo = (newData: typeof menuStore.restaurantInfo) => {
  menuStore.restaurantInfo = { ...menuStore.restaurantInfo, ...newData };
  syncToTableStorage(); // Autosave to backend
};
</script>

<template>
  <div :class="['constructor-wrapper', { 'light-theme': isLightTheme }]">

    <input type="file" ref="fileInputRef" style="display: none" accept=".xlsx,.xls,.json" multiple @change="handleFileUpload" />

    <div v-if="isBlocked" style="position: fixed; top: 0; left: 0; right: 0; background: #dc3545; color: white; padding: 15px; text-align: center; z-index: 9999; font-weight: bold; font-size: 16px;">
      ВНИМАНИЕ: Ваш аккаунт заблокирован за неуплату. Оплатите подписку для восстановления доступа (публичное меню также скрыто).
    </div>
    <div class="constructor-layout" :style="isBlocked && sidebarView !== 'payment' ? 'pointer-events: none; opacity: 0.5;' : ''">

      <aside class="sidebar">
        <div class="sidebar-header">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <button @click="isMenuOpen = true" class="btn-theme-toggle" title="Открыть меню"
              style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
              <MenuIcon :size="18" stroke-width="2" />
            </button>
            <img :src="isLightTheme ? '/logo-light.png' : '/logo-dark.png'" alt="Achab" style="height: 32px; object-fit: contain; margin: 0;" />
          </div>

          <div class="header-actions-row">
            <span class="status-badge">Режим редактирования</span>
            <button class="btn-theme-toggle" @click="toggleTheme">
              <component :is="isLightTheme ? Moon : Sun" :size="16" stroke-width="2" />
            </button>
          </div>
        </div>

        <nav class="sidebar-menu">
          <button v-for="tab in ['navigation', 'colors', 'branding', 'banners', 'general', 'qrcode', 'orders']" :key="tab"
            class="menu-btn" :class="{ active: activeTab === tab }" @click="activeTab = tab as any">
            <span class="icon" style="display: flex; align-items: center;">
              <UtensilsCrossed v-if="tab === 'navigation'" :size="18" stroke-width="2" />
              <Palette v-else-if="tab === 'colors'" :size="18" stroke-width="2" />
              <Sparkles v-else-if="tab === 'branding'" :size="18" stroke-width="2" />
                <ImageIcon v-else-if="tab === 'banners'" :size="18" stroke-width="2" />
              <FileText v-else-if="tab === 'general'" :size="18" stroke-width="2" />
              <QrCode v-else-if="tab === 'qrcode'" :size="18" stroke-width="2" />
              <ClipboardList v-else-if="tab === 'orders'" :size="18" stroke-width="2" />
            </span>
            {{ tab === 'navigation' ? 'Навигация и блюда' : tab === 'colors' ? 'Цвета интерфейса' : tab === 'branding' ? 'Брендинг и лого' : tab === 'banners' ? 'Баннеры' : tab === 'banners' ? 'Баннеры' : tab === 'general' ? 'Общие данные' : tab === 'qrcode' ? 'QR-код меню' : 'Настройка заказов' }}
          </button>
        </nav>

        <div style="padding: 0 16px; display: flex; flex-direction: column; gap: 8px; margin-top: auto;">
          <button @click="manualSave" class="btn-save-menu"
            style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px; background-color: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
            <Save :size="14" stroke-width="2" /> Сохранить меню
          </button>
          <button @click="triggerFileUpload" class="btn-upload-file"
            style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px; background-color: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 13px;">
            <Upload :size="14" stroke-width="2" /> Загрузить блюда (Excel/JSON)
          </button>
          <button @click="resetImport" class="btn-reset-sidebar"
            style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%;">
            <RotateCcw :size="14" stroke-width="2" /> Сбросить и загрузить заново
          </button>
        </div>
      </aside>

      <main class="editor-area">
        <header class="editor-header">
          <h1 class="tab-title">Настройка раздела</h1>
        </header>

        <div class="editor-content" :style="isBlocked && sidebarView !== 'payment' ? 'pointer-events: none; opacity: 0.5;' : ''">
          <MenuEditor v-if="activeTab === 'navigation'" :items="menuStore.items" :categories="menuStore.categories"
            @update-items="handleUpdateItems"
            @update-categories="(cats) => { menuStore.updateCategories(cats); syncToTableStorage(); }" />
          <BrandingEditor v-else-if="activeTab === 'branding'" :model-value="menuStore.restaurantInfo"
            @update:model-value="updateRestaurantInfo" />
          <BannerManager v-else-if="activeTab === 'banners'" :restaurantId="(menuStore.restaurantInfo as any).id || (menuStore.restaurantInfo as any).restaurantId || JSON.parse(localStorage.getItem('currentUser') || '{}').restaurantId" />
          <GeneralSettings v-else-if="activeTab === 'general'" :model-value="menuStore.restaurantInfo"
            @update:model-value="updateRestaurantInfo" />
          <ColorEditor v-else-if="activeTab === 'colors'" :model-value="menuStore.restaurantInfo"
            @update:model-value="updateRestaurantInfo" />
          <QrCodeEditor v-else-if="activeTab === 'qrcode'" :model-value="menuStore.restaurantInfo"
            @update:model-value="updateRestaurantInfo" />
          <OrderSettingsEditor v-else-if="activeTab === 'orders'" :model-value="menuStore.restaurantInfo"
            @update:model-value="updateRestaurantInfo" />
        </div>
      </main>

      <section class="preview-area">
        <div class="preview-container">
          <PhoneMockupContent :restaurantInfo="menuStore.restaurantInfo" :items="menuStore.items"
            :categories="menuStore.categories" />
        </div>
      </section>

    </div>

    <!-- ══════════════════════════════════════════
         SIDEBAR MODAL
    ══════════════════════════════════════════ -->
    <div v-if="isMenuOpen" class="smenu-overlay" @click.self="closeSidebar">
      <div class="smenu-panel" :class="{ 'light-theme': isLightTheme }">

        <!-- Header -->
        <div class="smenu-header">
          <button v-if="sidebarView !== 'main'" class="smenu-back-btn" @click="sidebarView = 'main'">
            <ArrowLeft :size="16" /> Назад
          </button>
          <span class="smenu-header-title">
            <img v-if="sidebarView === 'main'" :src="isLightTheme ? '/logo-light.png' : '/logo-dark.png'" alt="Achab" style="height: 24px; object-fit: contain; margin: 0;" />
            <template v-else>{{ sidebarTitle }}</template>
          </span>
          <button class="smenu-close-btn" @click="closeSidebar">
            <X :size="18" />
          </button>
        </div>

        <!-- ══ MAIN VIEW ══ -->
        <template v-if="sidebarView === 'main'">
          <div class="smenu-user-card">
            <div class="smenu-avatar">{{ (menuStore.userInfo?.name || 'U')[0].toUpperCase() }}</div>
            <div class="smenu-user-info">
              <div class="smenu-user-name">{{ menuStore.userInfo?.name || 'Пользователь' }}</div>
              <div class="smenu-user-email">{{ menuStore.userInfo?.email || '' }}</div>
            </div>
          </div>

          <nav class="smenu-nav">
            <button class="smenu-nav-item" @click="openSidebarView('staff')">
              <Users :size="18" />
              <span>Персонал</span>
              <span v-if="staff.length > 0" class="smenu-badge smenu-badge-grey">{{ staff.length }}</span>
            </button>
            
            <button class="smenu-nav-item" @click="openSidebarView('payment')">
                <CreditCard :size="18" />
                <span>Моя подписка</span>
              </button>
              
            <button class="smenu-nav-item" @click="openSidebarView('profile')">
              <User :size="18" />
              <span>Профиль</span>
            </button>
            <button class="smenu-nav-item" @click="openSidebarView('filters')">
              <Tag :size="18" />
              <span>Фильтры и теги</span>
            </button>
            <button class="smenu-nav-item" @click="openSidebarView('trash')">
              <Trash2 :size="18" />
              <span>Корзина</span>
              <span v-if="menuStore.trashedItems.length > 0" class="smenu-badge smenu-badge-grey">{{
                menuStore.trashedItems.length }}</span>
            </button>
          </nav>

          <div class="smenu-footer">
            <button class="smenu-logout-btn" @click="closeSidebar; menuStore.logout(); router.push('/login')">
              <LogOut :size="16" /> Выйти из аккаунта
            </button>
          </div>
        </template>

        <!-- ══ ORDERS VIEW ══ -->
        <template v-else-if="sidebarView === 'orders'">
          <div class="smenu-order-tabs">
            <button v-for="tab in orderTabs" :key="tab.key"
              :class="['smenu-order-tab', { active: sidebarOrdersTab === tab.key }]"
              @click="sidebarOrdersTab = tab.key">
              {{ tab.label }}
              <span v-if="getOrderCountByStatus(tab.key) > 0" class="smenu-tab-count">{{
                getOrderCountByStatus(tab.key) }}</span>
            </button>
          </div>

          <div class="smenu-scrollable">
            <div v-if="sidebarOrdersLoading" class="smenu-loading">
              <RefreshCw :size="20" class="smenu-spin" /> Загрузка…
            </div>
            <div v-else-if="filteredSidebarOrders.length === 0" class="smenu-empty">
              <div style="font-size: 32px; margin-bottom: 8px;">📋</div>
              Нет заказов в этой категории
            </div>
            <div v-else class="smenu-orders-list">
              <div v-for="order in filteredSidebarOrders" :key="order.id" class="smenu-order-card">
                <div class="smenu-order-head">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span class="smenu-order-num">#{{ order.orderNumber || String(order.id).slice(-4).padStart(4,'0') }}</span>
                    <span :class="['smenu-order-type', order.type || 'onsite']">{{ getOrderTypeLabel(order.type) }}</span>
                  </div>
                  <span class="smenu-order-time">{{ getOrderTimestamp(order.createdAt) }}</span>
                </div>

                <div v-if="order.customerName || order.tableNumber" class="smenu-order-meta">
                  <span v-if="order.customerName">👤 {{ order.customerName }}</span>
                  <span v-if="order.customerPhone">📞 {{ order.customerPhone }}</span>
                  <span v-if="order.tableNumber">🍽️ Стол №{{ order.tableNumber }}</span>
                  <span v-if="order.address">📍 {{ order.address }}</span>
                </div>

                <div v-if="order.items?.length" class="smenu-order-items-list">
                  <div v-for="item in order.items" :key="item.id" class="smenu-order-item-row">
                    <span>{{ item.quantity }}× {{ item.name }}</span>
                    <span>{{ (Number(item.price) * item.quantity).toFixed(0) }} ₽</span>
                  </div>
                </div>

                <div v-if="order.comment" class="smenu-order-comment">💬 {{ order.comment }}</div>

                <div class="smenu-order-foot">
                  <span class="smenu-order-total">Итого: {{ Number(order.total || order.totalPrice || 0).toFixed(2) }} ₽</span>
                  <div class="smenu-order-actions">
                    <template v-if="sidebarOrdersTab === 'new'">
                      <button class="smenu-btn-cancel" @click="changeSidebarOrderStatus(order.id, 'cancelled')">Отменить</button>
                      <button class="smenu-btn-accept" @click="changeSidebarOrderStatus(order.id, 'progress')">В работу ➔</button>
                    </template>
                    <template v-else-if="sidebarOrdersTab === 'progress'">
                      <button class="smenu-btn-cancel" @click="changeSidebarOrderStatus(order.id, 'cancelled')">Отменить</button>
                      <button class="smenu-btn-accept smenu-btn-done" @click="changeSidebarOrderStatus(order.id, 'done')">Готово ✓</button>
                    </template>
                    <template v-else-if="sidebarOrdersTab === 'cancelled'">
                      <button class="smenu-btn-accept" @click="changeSidebarOrderStatus(order.id, 'new')">↩ Вернуть</button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="smenu-refresh-btn" @click="loadSidebarOrders">
            <RefreshCw :size="14" /> Обновить
          </button>
        </template>

        <!-- ══ STAFF VIEW ══ -->
        
        
<template v-else-if="sidebarView === 'staff'">
          <div class="smenu-scrollable">
            <!-- Ошибка -->
            <div v-if="staffError" class="smenu-error-msg">⚠️ {{ staffError }}</div>

            <!-- Загрузка -->
            <div v-if="staffLoading && staff.length === 0" class="smenu-empty">
              <div style="font-size: 24px; margin-bottom: 8px;">⏳</div>
              Загрузка персонала...
            </div>

            <!-- Пусто -->
            <div v-if="!staffLoading && staff.length === 0 && !addingStaff" class="smenu-empty">
              <div style="font-size: 32px; margin-bottom: 8px;">👥</div>
              Нет сотрудников
            </div>

            <div v-for="member in staff" :key="member.id" class="smenu-staff-card">
              <div class="smenu-staff-avatar">{{ member.name[0]?.toUpperCase() }}</div>
              <div class="smenu-staff-info">
                <div class="smenu-staff-name">{{ member.name }}</div>
                <div class="smenu-staff-role">{{ getRoleLabel(member.role) }}</div>
                <div v-if="member.email" class="smenu-staff-email">{{ member.email }}</div>
              </div>
              <button class="smenu-staff-remove" @click="removeStaffMember(member.id)" title="Удалить">
                <X :size="14" />
              </button>
            </div>

            <!-- Add staff form -->
            <div v-if="addingStaff" class="smenu-form-card">
              <div class="smenu-form-title">Новый сотрудник</div>
              <input v-model="staffForm.name" placeholder="Имя *" class="smenu-input" />
              <input v-model="staffForm.email" placeholder="Email *" type="email" class="smenu-input" />
              <input v-model="staffForm.password" placeholder="Пароль (мин. 6 символов) *" type="password" class="smenu-input" />
              <select v-model="staffForm.role" class="smenu-input">
                <option value="cook">👨‍🍳 Повар</option>
                <option value="waiter">🧑‍💼 Официант</option>
                  <option value="barista">☕ Бармен</option>
                <option value="admin">👑 Администратор</option>
              </select>
              <div class="smenu-form-actions">
                <button class="smenu-btn-secondary" @click="addingStaff = false; staffError = ''">Отмена</button>
                <button class="smenu-btn-primary" @click="addStaffMember" :disabled="staffLoading">
                  {{ staffLoading ? '⏳' : 'Добавить' }}
                </button>
              </div>
            </div>
          </div>

          <button v-if="!addingStaff" class="smenu-add-btn" @click="addingStaff = true; staffError = ''">
            + Добавить сотрудника
          </button>
        </template>


        <!-- ══ PAYMENT VIEW ══ -->
        <template v-else-if="sidebarView === 'payment'">
          <div class="smenu-scrollable">
            
              
              <MyTariffContent />
            </div>
        </template>

        <!-- ══ PROFILE VIEW ══ -->
        <template v-else-if="sidebarView === 'profile'">
          <div class="smenu-scrollable">
            <div class="smenu-profile-avatar-large">
              {{ (profileForm.name || 'U')[0].toUpperCase() }}
            </div>

            <div class="smenu-form-section">
              <label class="smenu-label">Имя</label>
              <input v-model="profileForm.name" class="smenu-input" placeholder="Ваше имя" />

              <label class="smenu-label">Email</label>
              <input v-model="profileForm.email" class="smenu-input smenu-input-disabled" placeholder="Email"
                type="email" disabled />

              <div class="smenu-divider"></div>

              <label class="smenu-label">Новый пароль</label>
              <input v-model="profileForm.newPassword" class="smenu-input" type="password"
                placeholder="Оставьте пустым, если не меняете" />

              <button :class="['smenu-btn-primary', 'smenu-btn-full', { 'smenu-btn-saved': profileSaved }]"
                @click="saveProfile">
                {{ profileSaved ? '✓ Сохранено!' : 'Сохранить' }}
              </button>
            </div>
          </div>
        </template>

        <!-- ══ FILTERS VIEW ══ -->
        <template v-else-if="sidebarView === 'filters'">
          <div class="smenu-scrollable">
            <p class="smenu-section-desc">Включите теги, которые клиенты смогут использовать для фильтрации блюд в меню.</p>

            <div v-for="filter in availableFilters" :key="filter.key" class="smenu-filter-row">
              <div class="smenu-filter-icon-box">{{ filter.icon }}</div>
              <div class="smenu-filter-info">
                <div class="smenu-filter-name">{{ filter.name }}</div>
                <div class="smenu-filter-desc">{{ filter.desc }}</div>
              </div>
              <label class="smenu-switch">
                <input type="checkbox" v-model="filterSettings[filter.key]" @change="saveFilterSettings" />
                <span class="smenu-slider"></span>
              </label>
            </div>

            <div class="smenu-filter-tip">
              💡 Чтобы блюдо отображалось в фильтре, отметьте соответствующий тег в редакторе блюда.
            </div>
          </div>
        </template>

        <!-- ══ TRASH VIEW ══ -->
        <template v-else-if="sidebarView === 'trash'">
          <div class="smenu-scrollable">
            <div v-if="menuStore.trashedItems.length === 0" class="smenu-empty">
              <div style="font-size: 32px; margin-bottom: 8px;">🗑️</div>
              Корзина пуста
            </div>
            <div v-else>
              <p class="smenu-section-desc">Удалённые блюда хранятся здесь. Восстановите или удалите их безвозвратно.</p>
              <div v-for="item in menuStore.trashedItems" :key="(item as any).id" class="smenu-trash-card">
                <div class="smenu-trash-img-wrap">
                  <img v-if="(item as any).image" :src="(item as any).image" class="smenu-trash-img" />
                  <div v-else class="smenu-trash-img smenu-trash-no-img">🍽️</div>
                </div>
                <div class="smenu-trash-info">
                  <div class="smenu-trash-name">{{ getItemDisplayName(item) }}</div>
                  <div class="smenu-trash-price">{{ Number((item as any).price || 0).toFixed(2) }} ₽</div>
                </div>
                <div class="smenu-trash-actions">
                  <button class="smenu-btn-restore" @click="menuStore.restoreItem((item as any).id)" title="Восстановить">
                    ↩
                  </button>
                  <button class="smenu-btn-delete-forever" @click="menuStore.permanentlyDeleteItem((item as any).id)"
                    title="Удалить безвозвратно">
                    <Trash2 :size="13" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

      </div>
    </div>

  </div>
</template>