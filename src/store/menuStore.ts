import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { RestaurantInfo, MenuCategory, MenuItem } from '../types/menu';
import { menuApi, getToken, removeToken } from '../api';

export const useMenuStore = defineStore('menu', () => {
  const restaurantInfo = ref<RestaurantInfo>({
    name: 'Ресторан',
    primaryColor: '#9D0D0E',
    secondaryColor: '#333',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    isWifiEnabled: true,
    wifiName: '',
    wifiPassword: '',
  });

  const categories = ref<MenuCategory[]>([]);
  const items = ref<MenuItem[]>([]);

  const generalSettings = ref({
    wifiEnabled: true,
    wifiSsid: '',
    wifiPassword: '',
    yandexReviewLink: 'https://yandex.ru/maps/org/jazzve/43328610653/reviews/',
  });

  const userInfo = ref({
    name: 'Пользователь',
    email: '',
  });

  let isInitializing = true;
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  // ============================================================
  // Чтение userInfo из localStorage (заполняется при логине)
  // ============================================================
  const loadUserInfo = () => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) userInfo.value.name = parsed.name;
        if (parsed.email) userInfo.value.email = parsed.email;
      } catch {
        // ignore
      }
    }
  };

  // ============================================================
  // Получение restaurantId из localStorage
  // ============================================================
  const getRestaurantId = (): string | null => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved).restaurantId || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  // Синхронизация Wi-Fi полей между restaurantInfo и generalSettings
  const syncWifi = () => {
    restaurantInfo.value.isWifiEnabled = generalSettings.value.wifiEnabled;
    restaurantInfo.value.wifiName = generalSettings.value.wifiSsid;
    restaurantInfo.value.wifiPassword = generalSettings.value.wifiPassword;
  };

  // ============================================================
  // Загрузка данных с сервера
  // ============================================================
  const loadFromServer = async () => {
    // В публичном режиме клиента не нужно загружать данные админа из токена, 
    // так как ClientView сам загрузит нужное меню по ID из ссылки.
    if (window.location.pathname === '/client' && !window.location.search.includes('preview=true')) {
      return;
    }

    const restaurantId = getRestaurantId();
    if (!restaurantId || !getToken()) return;

    isInitializing = true;
    try {
      const data = await menuApi.get(restaurantId);

      if (data.restaurantInfo && Object.keys(data.restaurantInfo).length) {
        restaurantInfo.value = { ...restaurantInfo.value, ...(data.restaurantInfo as unknown as RestaurantInfo) };
      }
      if (data.categories?.length) categories.value = data.categories as MenuCategory[];
      if (data.items?.length) items.value = data.items as MenuItem[];

      if (data.generalSettings && Object.keys(data.generalSettings).length) {
        generalSettings.value = { ...generalSettings.value, ...(data.generalSettings as typeof generalSettings.value) };
      }

      syncWifi();
    } catch (error) {
      console.error('❌ Ошибка загрузки с сервера, используем localStorage:', error);
      loadFromLocalStorage();
    } finally {
      isInitializing = false;
    }
  };

  const loadFromLocalStorage = () => {
    if (window.location.pathname === '/client' && !window.location.search.includes('preview=true')) {
      return;
    }

    const restaurantId = getRestaurantId();
    const key = restaurantId ? `restaurantData_${restaurantId}` : 'restaurantData';
    const savedState = localStorage.getItem(key) || localStorage.getItem('restaurantData');

    if (!savedState) return;
    try {
      const parsed = JSON.parse(savedState);
      if (parsed.userInfo) userInfo.value = parsed.userInfo;
      if (parsed.restaurantInfo) restaurantInfo.value = { ...restaurantInfo.value, ...parsed.restaurantInfo };
      if (parsed.categories?.length) categories.value = parsed.categories;
      if (parsed.items?.length) items.value = parsed.items;
      if (parsed.generalSettings) generalSettings.value = { ...generalSettings.value, ...parsed.generalSettings };
      syncWifi();
    } catch (e) {
      console.error('❌ Ошибка парсинга локальных данных:', e);
    }
  };

  // ============================================================
  // Фоновый опрос сервера (каждые 10 сек)
  // ============================================================
  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  const startPolling = () => {
    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(async () => {
      const restaurantId = getRestaurantId();
      if (!restaurantId || !getToken()) {
        stopPolling();
        return;
      }

      try {
        const data = await menuApi.get(restaurantId);
        if (!data) return;

        isInitializing = true;
        if (data.restaurantInfo) restaurantInfo.value = { ...restaurantInfo.value, ...(data.restaurantInfo as unknown as RestaurantInfo) };
        if (data.categories?.length) categories.value = data.categories as MenuCategory[];
        if (data.items?.length) items.value = data.items as MenuItem[];
        if (data.generalSettings) generalSettings.value = { ...generalSettings.value, ...(data.generalSettings as typeof generalSettings.value) };
        syncWifi();
        isInitializing = false;
      } catch {
        // Тихо игнорируем сетевые ошибки при фоновом опросе
      }
    }, 10_000); // 10 секунд вместо 2
  };

  // ============================================================
  // Сохранение на сервер
  // ============================================================
  const syncToServer = async () => {
    const restaurantId = getRestaurantId();
    if (!restaurantId || !getToken()) return;

    try {
      await menuApi.save(restaurantId, {
        info: restaurantInfo.value,
        items: items.value,
        cats: categories.value,
        generalSettings: generalSettings.value,
      });
    } catch (error) {
      console.error('❌ Ошибка синхронизации с сервером:', error);
    }
  };

  const saveToLocalStorage = () => {
    const restaurantId = getRestaurantId();
    const key = restaurantId ? `restaurantData_${restaurantId}` : 'restaurantData';
    const dataToSave = {
      userInfo: userInfo.value,
      restaurantInfo: restaurantInfo.value,
      items: items.value,
      categories: categories.value,
      generalSettings: generalSettings.value,
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
  };

  // ============================================================
  // Watchers
  // ============================================================
  watch(
    [restaurantInfo, categories, items, generalSettings],
    () => {
      if (isInitializing) return;
      if (window.location.pathname === '/client' && !window.location.search.includes('preview=true')) return;
      
      syncWifi();
      saveToLocalStorage();
      syncToServer();
    },
    { deep: true }
  );

  // ============================================================
  // Мутации
  // ============================================================
  const updateItems = (newItems: typeof items.value) => {
    items.value = newItems;
  };

  const updateCategories = (newCategories: typeof categories.value) => {
    categories.value = newCategories;
  };

  // ============================================================
  // Корзина удалённых блюд
  // ============================================================
  const _loadTrashed = (): MenuItem[] => {
    try { return JSON.parse(localStorage.getItem('menu_trash') || '[]'); } catch { return []; }
  };
  const trashedItems = ref<MenuItem[]>(_loadTrashed());

  const _saveTrashed = () => {
    localStorage.setItem('menu_trash', JSON.stringify(trashedItems.value));
  };

  const trashItem = (id: string) => {
    const idx = items.value.findIndex((i: any) => i.id === id);
    if (idx !== -1) {
      trashedItems.value.unshift(items.value[idx]);
      items.value = items.value.filter((_: any, i: number) => i !== idx);
      _saveTrashed();
    }
  };

  const restoreItem = (id: string) => {
    const idx = trashedItems.value.findIndex((i: any) => i.id === id);
    if (idx !== -1) {
      items.value.push(trashedItems.value[idx]);
      trashedItems.value = trashedItems.value.filter((_: any, i: number) => i !== idx);
      _saveTrashed();
    }
  };

  const permanentlyDeleteItem = (id: string) => {
    trashedItems.value = trashedItems.value.filter((i: any) => i.id !== id);
    _saveTrashed();
  };

  const logout = () => {
    stopPolling();
    removeToken();
  };

  // Запуск при инициализации стора
  loadUserInfo();
  loadFromServer();
  startPolling();

  return {
    restaurantInfo,
    categories,
    items,
    generalSettings,
    userInfo,
    trashedItems,
    updateItems,
    updateCategories,
    trashItem,
    restoreItem,
    permanentlyDeleteItem,
    loadFromServer,
    loadUserInfo,
    startPolling,
    stopPolling,
    logout,
  };
});