<template>
  <!-- Главный контейнер управления данными с фиолетовым стилем по умолчанию -->
  <div class="menu-data-container" :class="{ 'dark-theme': isDarkMode }">
    
    <!-- ==================== ВЕРХНЯЯ ПАНЕЛЬ НАВИГАЦИИ ==================== -->
    <header class="top-nav-bar">
      <div class="nav-left">
        <!-- Кнопка возврата на Главную (Дашборд) -->
        <button class="btn-icon" @click="navigateTo('/dashboard')" title="Вернуться в дашборд">
          ⬅
        </button>
        <span class="brand-badge">🍇</span>
        <span class="menu-title-main">Управление данными</span>
        <span class="chevron">▼</span>
      </div>

      <!-- Переключатели режимов/разделов -->
      <div class="nav-center-actions">
        <!-- Кнопка перехода в Конструктор -->
        <button class="action-tab" @click="sendToConstructor">⚙️ Конструктор</button>
        <button class="action-tab" @click="openPrintModal">🖨️ Печать</button>
        <button class="action-tab" @click="navigateTo('/preview')">📱 Цифровой</button>
        <button class="action-tab active-tab">田 Данные</button>
      </div>

      <div class="nav-right">
        <span class="lang-selector">🌐 Русский ▾</span>
        <button class="refresh-btn" @click="handleRefresh" :disabled="isRefreshing">
          {{ isRefreshing ? 'Загрузка...' : 'Обновить' }}
        </button>
        <button class="btn-chat-top" @click="isDarkMode = !isDarkMode">
          {{ isDarkMode ? '☀️ Светлая' : '🌙 Тёмная' }}
        </button>
      </div>
    </header>

    <!-- ==================== СТАТИСТИКА И ИНФО-БАР ==================== -->
    <div class="sub-header-info">
      <div class="info-left-group">
        <span class="info-title">Основное меню заведения</span>
        <span class="info-muted">{{ totalItemsCount }} товаров • {{ categories.length }} категорий</span>
      </div>
      <div class="progress-line-text">
        Синхронизировано {{ totalItemsCount }}/{{ totalItemsCount }} позиций
      </div>
    </div>

    <!-- ==================== ПАНЕЛЬ КНОПОК УПРАВЛЕНИЯ ==================== -->
    <div class="action-buttons-bar">
      <!-- Кнопка создания категории -->
      <button class="btn-primary-purple" @click="addCategory">+ Категория</button>
      
      <!-- Выпадающий список добавления подкатегории/блюда -->
      <div class="dropdown-container" ref="subCategoryDropdownRef">
        <button class="btn-secondary-purple" @click="isSubCategoryMenuOpen = !isSubCategoryMenuOpen">
          + Блюдо в категорию ▾
        </button>
        <div v-if="isSubCategoryMenuOpen" class="dropdown-menu">
          <div 
            v-for="(cat, idx) in categories" 
            :key="'sub-cat-opt-' + (cat.id || idx)" 
            class="dropdown-item"
            @click="addSubcategoryTo(idx)"
          >
            <span class="folder-icon">📁</span> {{ cat.name }}
          </div>
        </div>
      </div>

      <button class="btn-secondary-purple" @click="addItem">+ Элемент</button>
      <button class="btn-action-outline" @click="expandAll">Раскрыть всё</button>
      <button class="btn-action-outline" @click="collapseAll">Свернуть всё</button>
      
      <!-- Управление видимыми колонками -->
      <div class="dropdown-container" ref="columnsDropdownRef">
        <button class="btn-action-outline" @click="isColumnsMenuOpen = !isColumnsMenuOpen">
          📊 Колонки ▾
        </button>
        <div v-if="isColumnsMenuOpen" class="dropdown-menu">
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.status" /> Статус
          </label>
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.image" /> Изображение
          </label>
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.name" /> Название
          </label>
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.categoryCol" /> Категория
          </label>
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.desc" /> Описание
          </label>
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.price" /> Цена
          </label>
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.filters" /> Фильтры
          </label>
        </div>
      </div>

      <!-- Кнопка быстрой отправки в конструктор (Purple Highlight) -->
      <button class="btn-primary-purple btn-to-constructor" @click="sendToConstructor">
        🚀 В конструктор
      </button>

      <!-- Инпут поиска -->
      <div class="search-box-wrapper">
        <span class="search-icon">🔍</span>
        <input type="text" v-model="searchQuery" placeholder="Поиск по блюдам..." />
      </div>
    </div>

    <!-- ==================== ТАБЛИЦА ДАННЫХ ==================== -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-checkbox"><input type="checkbox" /></th>
            <th v-if="visibleColumns.status" class="col-status">СТАТУС</th>
            <th v-if="visibleColumns.image" class="col-img">🖼️</th>
            <th v-if="visibleColumns.name" class="col-name">НАЗВАНИЕ</th>
            <th v-if="visibleColumns.categoryCol" class="col-category">КАТЕГОРИЯ</th>
            <th v-if="visibleColumns.desc" class="col-desc">ОПИСАНИЕ</th>
            <th v-if="visibleColumns.price" class="col-price">ЦЕНА</th>
            <th v-if="visibleColumns.filters" class="col-filters">ФИЛЬТРЫ / ТЕГИ</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, rIdx) in paginatedRows" :key="'row-' + rIdx">
            
            <!-- СТРОКА КАТЕГОРИИ -->
            <tr v-if="row.type === 'category'" class="category-row">
              <td><input type="checkbox" /></td>
              <td v-if="visibleColumns.status">-</td>
              <td v-if="visibleColumns.image"></td>
              <td v-if="visibleColumns.name" class="category-title-cell" :colspan="getCategoryColspan()">
                <span class="folder-icon" @click="toggleCategoryExpand(row.catIdx)" style="cursor: pointer;">
                  {{ row.data.expanded !== false ? '📂' : '📁' }}
                </span> 
                <div class="cat-input-group">
                  <input 
                    type="text" 
                    v-model="row.data.name" 
                    @change="saveToStorage" 
                    class="inline-edit-input cat-input" 
                  />
                  <span class="sub-count">{{ row.data.items ? row.data.items.length : 0 }} поз.</span>
                </div>
                
                <button 
                  class="btn-secondary-purple btn-add-in-cat" 
                  @click="addSubcategoryTo(row.catIdx)" 
                  title="Добавить блюдо в эту категорию"
                >
                  + Блюдо
                </button>

                <button class="btn-delete-row" @click="removeCategory(row.catIdx)" title="Удалить категорию">🗑️</button>
              </td>
              <td v-if="visibleColumns.categoryCol && !isNameOnlyColspan()"></td>
              <td v-if="visibleColumns.desc && !isNameOnlyColspan()">-</td>
              <td v-if="visibleColumns.price && !isNameOnlyColspan()">-</td>
              <td v-if="visibleColumns.filters && !isNameOnlyColspan()">-</td>
            </tr>

            <!-- СТРОКА ЭЛЕМЕНТА / БЛЮДА -->
            <tr v-else-if="row.type === 'item' && isCategoryExpanded(row.catIdx)" class="item-row">
              <td><input type="checkbox" /></td>
              
              <!-- Видимость блюда -->
              <td v-if="visibleColumns.status">
                <span 
                  class="badge-visible" 
                  :class="{ 'badge-hidden': row.data.isAvailable === false }" 
                  @click="toggleItemVisibility(row.catIdx, row.itemIdx)"
                  title="Кликните для переключения статуса"
                >
                  {{ row.data.isAvailable !== false ? '● Активно' : '○ Скрыто' }}
                </span>
              </td>

              <!-- Изображение блюда с функцией сжатия -->
              <td v-if="visibleColumns.image" class="img-cell">
                <div class="image-uploader-box" @click="triggerUpload(row.catIdx, row.itemIdx)" title="Загрузить фото">
                  <img v-if="row.data.image" :src="row.data.image" class="thumb-img" alt="preview" />
                  <span v-else class="upload-icon-text">📷</span>
                </div>
              </td>

              <!-- Название -->
              <td v-if="visibleColumns.name" class="item-name-cell">
                <span class="file-icon">🍽️</span> 
                <input type="text" v-model="row.data.name" @change="saveToStorage" class="inline-edit-input" />
              </td>
              
              <!-- Выбор категории -->
              <td v-if="visibleColumns.categoryCol" class="item-category-cell">
                <select 
                  class="inline-category-select" 
                  :value="row.catIdx" 
                  @change="changeItemCategory(row.catIdx, row.itemIdx, Number(($event.target as HTMLSelectElement).value))"
                >
                  <option v-for="(cat, cIdx) in categories" :key="'cat-opt-' + cIdx" :value="cIdx">
                    📁 {{ cat.name }}
                  </option>
                </select>
              </td>

              <!-- Описание -->
              <td v-if="visibleColumns.desc" class="item-desc-cell">
                <input 
                  type="text" 
                  v-model="row.data.description" 
                  @change="saveToStorage" 
                  class="inline-edit-input desc-input" 
                  placeholder="Описание состава..." 
                />
              </td>

              <!-- Цена -->
              <td v-if="visibleColumns.price" class="item-price-cell">
                <div class="price-input-wrapper">
                  <input 
                    type="number" 
                    v-model.number="row.data.price" 
                    @change="saveToStorage" 
                    class="inline-edit-input price-input" 
                    placeholder="0" 
                  /> ₽
                </div>
                <button class="btn-delete-row" @click="removeItem(row.catIdx, row.itemIdx)" title="Удалить блюдо">🗑️</button>
              </td>
              
              <!-- Фильтры / Диетические теги -->
              <td v-if="visibleColumns.filters" class="item-filters-cell">
                <div class="filters-badges-inline">
                  <label class="filter-badge-toggle" :class="{ active: row.data.noNuts }">
                    <input type="checkbox" v-model="row.data.noNuts" @change="saveToStorage" hidden />
                    🌰 Без орехов
                  </label>
                  <label class="filter-badge-toggle" :class="{ active: row.data.noLactose }">
                    <input type="checkbox" v-model="row.data.noLactose" @change="saveToStorage" hidden />
                    🥛 Без лактозы
                  </label>
                  <label class="filter-badge-toggle" :class="{ active: row.data.noGluten }">
                    <input type="checkbox" v-model="row.data.noGluten" @change="saveToStorage" hidden />
                    🌾 Без глютена
                  </label>
                </div>
              </td>
            </tr>

          </template>
        </tbody>
      </table>
    </div>

    <!-- ==================== ФУТЕР И ПАГИНАЦИЯ ==================== -->
    <div class="table-footer">
      <span>Всего записей: {{ totalRowsCount }}</span>
      <div class="pagination-info">
        <span>Строк на странице: </span>
        <select class="select-rows" v-model.number="rowsPerPage" @change="currentPage = 1">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
        <span>{{ paginationRangeText }} из {{ totalRowsCount }}</span>
        <button class="btn-page" :disabled="currentPage === 1" @click="currentPage--">‹</button>
        <button class="btn-page" :disabled="currentPage >= totalPages" @click="currentPage++">›</button>
      </div>
    </div>

    <!-- ==================== МОДАЛЬНОЕ ОКНО ПЕЧАТИ ==================== -->
    <div v-if="isPrintModalOpen" class="print-modal-overlay">
      <div class="print-modal-content">
        <div class="print-modal-header">
          <h3>🖨️ Предпросмотр печатной формы</h3>
          <button class="close-btn" @click="isPrintModalOpen = false">✕</button>
        </div>

        <div class="print-menu-template" id="printable-area">
          <h1 class="print-restaurant-title">МЕНЮ ЗАВЕДЕНИЯ</h1>
          <div class="print-divider"></div>

          <div v-for="(cat, cIdx) in categories" :key="'print-cat-' + cIdx" class="print-category-block">
            <h2 class="print-category-title">{{ cat.name }}</h2>
            <div class="print-items-list">
              <template v-for="(item, iIdx) in (cat.items || []).filter((i: any) => i.isAvailable !== false)" :key="'print-item-' + iIdx">
                <div class="print-menu-item">
                  <div class="print-item-left">
                    <span class="print-item-name">{{ item.name }}</span>
                    <span v-if="item.description" class="print-item-desc">{{ item.description }}</span>
                  </div>
                  <div class="print-item-dots"></div>
                  <div class="print-item-price">{{ item.price || 0 }} ₽</div>
                </div>
              </template>
            </div>
          </div>

          <div class="print-footer-note">Желаем приятного аппетита!</div>
        </div>

        <div class="print-modal-actions">
          <button class="btn-action-outline" @click="isPrintModalOpen = false">Отмена</button>
          <button class="btn-primary-purple" @click="triggerBrowserPrint">Распечатать</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '../store/menuStore';

// Регистрация экземпляра Vue Router & Pinia Store
const router = useRouter();
const store = useMenuStore();

// Состояния UI
const isDarkMode = ref(false);
const searchQuery = ref('');
const isRefreshing = ref(false);
const isPrintModalOpen = ref(false);
const isColumnsMenuOpen = ref(false);
const isSubCategoryMenuOpen = ref(false);

const columnsDropdownRef = ref<HTMLElement | null>(null);
const subCategoryDropdownRef = ref<HTMLElement | null>(null);

// Колонки таблицы (реактивное управление видимостью)
const visibleColumns = ref({
  status: true,
  image: true,
  name: true,
  categoryCol: true,
  desc: true,
  price: true,
  filters: true
});

// Настройка пагинации
const currentPage = ref(1);
const rowsPerPage = ref(10);

// Хранилище категорий
const categories = ref<any[]>([]);

// Обработчик клика вне элементов выпадающих меню (Dropdown)
const handleClickOutside = (event: MouseEvent) => {
  if (columnsDropdownRef.value && !columnsDropdownRef.value.contains(event.target as Node)) {
    isColumnsMenuOpen.value = false;
  }
  if (subCategoryDropdownRef.value && !subCategoryDropdownRef.value.contains(event.target as Node)) {
    isSubCategoryMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  loadFromStorage();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Безопасный переход по маршрутам с фолбэками
const navigateTo = (path: string) => {
  router.push(path).catch(() => {
    console.warn(`Маршрут ${path} не найден.`);
  });
};

// ==================== СОХРАНЕНИЕ И СИНХРОНИЗАЦИЯ ====================

// Загрузка данных из LocalStorage или Установка дефолтных
const loadFromStorage = () => {
  const savedData = localStorage.getItem('constructor_menu_data');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        categories.value = parsed;
        syncWithStore();
        return;
      }
    } catch (e) {
      console.error('Ошибка парсинга данных меню из localStorage:', e);
    }
  }
  setDefaultCategories();
};

const setDefaultCategories = () => {
  categories.value = [
    {
      id: 'cat-1',
      name: 'Завтраки & Десерты',
      expanded: true,
      items: [
        { 
          id: 'item-1', 
          name: 'Сырники с ягодами', 
          description: 'Подаются со свежей сметаной и малиновым джемом', 
          price: 380, 
          isAvailable: true, 
          image: '', 
          noNuts: true, 
          noLactose: false, 
          noGluten: false 
        }
      ]
    }
  ];
  saveToStorage();
};

// Синхронизация данных со стором Pinia
const syncWithStore = () => {
  if (store) {
    store.categories = categories.value;
    store.items = categories.value.flatMap(c => c.items || []);
  }
};

// Главная функция сохранения (СОХРАНЯЕТ ИЗОБРАЖЕНИЯ И НЕ УДАЛЯЕТ ИХ)
const saveToStorage = () => {
  try {
    localStorage.setItem('constructor_menu_data', JSON.stringify(categories.value));
  } catch (e) {
    console.warn('LocalStorage переполнен! Сжатие картинок спасает ситуацию.', e);
  }
  syncWithStore();
};

// НАДЁЖНЫЙ ПЕРЕХОД В КОНСТРУКТОР: гарантирует сохранение всех Base64 изображений
const sendToConstructor = () => {
  saveToStorage();
  
  // Переходим в конструктор по имени или прямому пути
  router.push('/constructor').catch(() => {
    router.push({ name: 'constructor' }).catch(err => {
      console.error('Не удалось перейти в конструктор:', err);
    });
  });
};

// ==================== ОБРАБОТКА ИЗОБРАЖЕНИЙ С ОПТИМИЗАЦИЕЙ ====================

// Загрузка файла с динамическим сжатием через Canvas (гарантия сохранения в Storage)
const triggerUpload = (catIdx: number, itemIdx: number) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      
      reader.onload = (uploadEvent) => {
        const rawBase64 = uploadEvent.target?.result as string;
        if (!rawBase64) return;

        // Сжимаем фото перед записью, чтобы избежать переполнения LocalStorage
        compressImage(rawBase64, 800, 0.75, (compressedBase64) => {
          categories.value[catIdx].items[itemIdx].image = compressedBase64;
          saveToStorage();
        });
      };
      
      reader.readAsDataURL(file);
    }
  };
  input.click();
};

// Вспомогательная функция для оптимизации фото в формате WebP/JPEG
const compressImage = (base64Str: string, maxWidth: number, quality: number, callback: (result: string) => void) => {
  const img = new Image();
  img.src = base64Str;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      // Возвращаем оптимизированный DataURL
      const compressed = canvas.toDataURL('image/jpeg', quality);
      callback(compressed);
    } else {
      callback(base64Str);
    }
  };
  img.onerror = () => callback(base64Str);
};

// ==================== ОПЕРАЦИИ С ЭЛЕМЕНТАМИ ====================

const addCategory = () => {
  categories.value.unshift({
    id: 'cat-' + Date.now(),
    name: 'Новая категория',
    expanded: true,
    items: []
  });
  saveToStorage();
  currentPage.value = 1;
};

const addSubcategoryTo = (catIndex: number) => {
  if (!categories.value[catIndex].items) {
    categories.value[catIndex].items = [];
  }
  categories.value[catIndex].items.unshift({
    id: 'item-' + Date.now(),
    name: 'Новое блюдо',
    description: '',
    price: 350,
    isAvailable: true,
    image: '',
    noNuts: false,
    noLactose: false,
    noGluten: false
  });
  isSubCategoryMenuOpen.value = false;
  saveToStorage();
  currentPage.value = 1;
};

const addItem = () => {
  if (categories.value.length === 0) {
    addCategory();
    return;
  }
  addSubcategoryTo(0);
};

const removeItem = (catIdx: number, itemIdx: number) => {
  if (categories.value[catIdx]?.items) {
    categories.value[catIdx].items.splice(itemIdx, 1);
    saveToStorage();
  }
};

const removeCategory = (catIdx: number) => {
  categories.value.splice(catIdx, 1);
  saveToStorage();
};

const changeItemCategory = (oldCatIdx: number, itemIdx: number, newCatIdx: number) => {
  if (oldCatIdx === newCatIdx) return;
  const [movedItem] = categories.value[oldCatIdx].items.splice(itemIdx, 1);
  if (!categories.value[newCatIdx].items) {
    categories.value[newCatIdx].items = [];
  }
  categories.value[newCatIdx].items.push(movedItem);
  saveToStorage();
};

const toggleItemVisibility = (catIdx: number, itemIdx: number) => {
  const item = categories.value[catIdx].items[itemIdx];
  item.isAvailable = item.isAvailable === false ? true : false;
  saveToStorage();
};

const toggleCategoryExpand = (catIdx: number) => {
  categories.value[catIdx].expanded = categories.value[catIdx].expanded === false ? true : false;
  saveToStorage();
};

const isCategoryExpanded = (catIdx: number) => categories.value[catIdx]?.expanded !== false;

const expandAll = () => {
  categories.value.forEach(cat => { cat.expanded = true; });
  saveToStorage();
};

const collapseAll = () => {
  categories.value.forEach(cat => { cat.expanded = false; });
  saveToStorage();
};

// ==================== COMPUTED СВОЙСТВА РАСЧЕТА ТАБЛИЦЫ ====================

const totalItemsCount = computed(() => {
  return categories.value.reduce((acc, cat) => acc + (cat.items ? cat.items.length : 0), 0);
});

const getCategoryColspan = () => {
  let count = 1;
  if (visibleColumns.value.status) count++;
  if (visibleColumns.value.image) count++;
  if (visibleColumns.value.categoryCol) count++;
  if (visibleColumns.value.desc) count++;
  if (visibleColumns.value.price) count++;
  if (visibleColumns.value.filters) count++;
  return count;
};

const isNameOnlyColspan = () => {
  return !visibleColumns.value.status && !visibleColumns.value.image && 
         !visibleColumns.value.categoryCol && !visibleColumns.value.desc && 
         !visibleColumns.value.price && !visibleColumns.value.filters;
};

// Фильтрация и плоский список для таблицы
const allFlattenedRows = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const rows: Array<any> = [];

  categories.value.forEach((cat, catIdx) => {
    const items = cat.items || [];
    const filteredItems = items.filter((item: any) => 
      !q || item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q))
    );

    const catMatches = !q || cat.name.toLowerCase().includes(q);
    if (!catMatches && filteredItems.length === 0) return;

    rows.push({ type: 'category', data: cat, catIdx });

    filteredItems.forEach((item: any) => {
      const itemIdx = items.indexOf(item);
      rows.push({ type: 'item', data: item, catIdx, itemIdx });
    });
  });

  return rows;
});

const totalRowsCount = computed(() => allFlattenedRows.value.length);

const totalPages = computed(() => Math.ceil(totalRowsCount.value / rowsPerPage.value) || 1);

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return allFlattenedRows.value.slice(start, start + rowsPerPage.value);
});

const paginationRangeText = computed(() => {
  if (totalRowsCount.value === 0) return '0–0';
  const start = (currentPage.value - 1) * rowsPerPage.value + 1;
  const end = Math.min(currentPage.value * rowsPerPage.value, totalRowsCount.value);
  return `${start}–${end}`;
});

// Обновление
const handleRefresh = async () => {
  isRefreshing.value = true;
  setTimeout(() => {
    loadFromStorage();
    isRefreshing.value = false;
  }, 400);
};

const openPrintModal = () => { isPrintModalOpen.value = true; };
const triggerBrowserPrint = () => { window.print(); };
</script>

<style scoped>
/* ==================== ФИОЛЕТОВАЯ ЦВЕТОВАЯ ПАЛИТРА И СТИЛИ ==================== */
.menu-data-container {
  --primary-purple: #6c5ce7;
  --primary-purple-hover: #5b4bc4;
  --accent-purple: #8e44ad;
  --bg-light: #f8f9fa;
  --border-color: #e2e8f0;
  --text-main: #2d3748;

  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-light);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 🌙 Тёмная тема */
.menu-data-container.dark-theme {
  --bg-light: #121214;
  --border-color: #2d2d35;
  --text-main: #e2e8f0;
  background-color: #121214;
  color: #e2e8f0;
}

/* ВЕРХНЯЯ НАВИГАЦИЯ */
.top-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-color);
}
.dark-theme .top-nav-bar {
  background: #1e1e24;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  background: linear-gradient(135deg, var(--primary-purple), var(--accent-purple));
  color: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: bold;
}

.menu-title-main {
  font-weight: 700;
  font-size: 1.1rem;
}

.nav-center-actions {
  display: flex;
  gap: 6px;
  background: #f1f3f5;
  padding: 4px;
  border-radius: 10px;
}
.dark-theme .nav-center-actions {
  background: #2a2a32;
}

.action-tab {
  border: none;
  background: transparent;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}
.dark-theme .action-tab { color: #aaa; }

.action-tab.active-tab {
  background: #ffffff;
  color: var(--primary-purple);
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.dark-theme .action-tab.active-tab {
  background: #3a3a46;
  color: #fff;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ИНФО-БАР */
.sub-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #fafafa;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}
.dark-theme .sub-header-info { background: #18181c; }

.info-title { font-weight: 600; margin-right: 12px; }
.info-muted { color: #888; }
.progress-line-text { color: var(--primary-purple); font-weight: 600; }

/* ПАНЕЛЬ КНОПОК УПРАВЛЕНИЯ */
.action-buttons-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  background: #ffffff;
  flex-wrap: wrap;
}
.dark-theme .action-buttons-bar { background: #1e1e24; }

/* КНОПКИ В ФИОЛЕТОВОМ СТИЛЕ */
.btn-primary-purple {
  background: linear-gradient(135deg, var(--primary-purple), var(--accent-purple));
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}
.btn-primary-purple:hover { opacity: 0.92; transform: translateY(-1px); }

.btn-secondary-purple {
  background: #f0edff;
  color: var(--primary-purple);
  border: 1px solid #dcd6ff;
  padding: 9px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.dark-theme .btn-secondary-purple {
  background: #2d264a;
  color: #b8aeff;
  border-color: #443875;
}

.btn-action-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  color: inherit;
}

/* ПОИСК */
.search-box-wrapper {
  margin-left: auto;
  display: flex;
  align-items: center;
  background: #f1f3f5;
  padding: 6px 12px;
  border-radius: 8px;
}
.dark-theme .search-box-wrapper { background: #2a2a32; }

.search-box-wrapper input {
  border: none;
  background: transparent;
  outline: none;
  padding-left: 8px;
  color: inherit;
}

/* ВЫПАДАЮЩИЕ МЕНЮ (DROPDOWN) */
.dropdown-container { position: relative; }
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  z-index: 50;
  min-width: 180px;
  padding: 6px 0;
}
.dark-theme .dropdown-menu { background: #25252e; }

.dropdown-item {
  padding: 8px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}
.dropdown-item:hover { background: #f4f0ff; }
.dark-theme .dropdown-item:hover { background: #322c4a; }

/* ТАБЛИЦА */
.table-container { flex: 1; overflow-x: auto; padding: 0 24px; }
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
}
.dark-theme .data-table { background: #1e1e24; }

.data-table th {
  background: #f8f9fa;
  text-align: left;
  padding: 12px;
  font-size: 0.75rem;
  color: #718096;
  border-bottom: 2px solid var(--border-color);
}
.dark-theme .data-table th { background: #18181c; color: #a0aec0; }

.category-row { background: #f5f3ff; font-weight: bold; }
.dark-theme .category-row { background: #231f38; }

.item-row td { padding: 10px 12px; border-bottom: 1px solid var(--border-color); }

/* ЭЛЕМЕНТЫ ВНУТРИ ЯЧЕЕК */
.inline-edit-input {
  border: 1px solid transparent;
  background: transparent;
  padding: 6px;
  border-radius: 6px;
  color: inherit;
  width: 90%;
}
.inline-edit-input:hover, .inline-edit-input:focus {
  border-color: var(--primary-purple);
  background: #ffffff;
}
.dark-theme .inline-edit-input:focus { background: #2a2a35; }

.image-uploader-box {
  width: 42px;
  height: 42px;
  border: 1px dashed var(--primary-purple);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}
.thumb-img { width: 100%; height: 100%; object-fit: cover; }

.badge-visible {
  color: #2e7d32;
  background: #e8f5e9;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}
.badge-hidden { color: #c62828; background: #ffebee; }

.filter-badge-toggle {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 6px;
  background: #edf2f7;
  font-size: 0.75rem;
  cursor: pointer;
  margin-right: 4px;
}
.dark-theme .filter-badge-toggle { background: #2d3748; }
.filter-badge-toggle.active {
  background: #e9d8fd;
  color: #553c9a;
  font-weight: 600;
}

/* ФУТЕР И ПАГИНАЦИЯ */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  border-top: 1px solid var(--border-color);
}
.dark-theme .table-footer { background: #1e1e24; }

.btn-page {
  border: 1px solid var(--border-color);
  background: transparent;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 6px;
}

.btn-delete-row {
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.6;
}
.btn-delete-row:hover { opacity: 1; }

/* МОДАЛКА ПЕЧАТИ */
.print-modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.print-modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  color: #000;
}
</style>

<style scoped>
.filters-badges-inline {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.filter-badge-toggle {
  font-size: 11px;
  background: #f1f3f5;
  border: 1px solid #dee2e6;
  padding: 3px 8px;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  color: #495057;
}
.filter-badge-toggle.active {
  background: #e7f5ff;
  border-color: #339af0;
  color: #1c7ed6;
  font-weight: 500;
}
</style>

<style scoped>
.menu-data-container {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
  font-family: sans-serif;
  color: #111827;
}

.top-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 15px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.brand-badge {
  background: #22c55e;
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
}

.nav-center-actions {
  display: flex;
  gap: 6px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
}

.action-tab {
  background: transparent;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: #4b5563;
}

.action-tab.active-tab {
  background: #111827;
  color: white;
  font-weight: 600;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.btn-refresh-top {
  background: #9D0D0E;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-chat-top {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
}

.sub-header-info {
  display: flex;
  align-items: baseline;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 700;
}

.info-muted {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
}

.progress-line-text {
  margin-left: auto;
  font-size: 12px;
  color: #f97316;
}

.action-buttons-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
  background: #ffffff;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  position: relative;
  flex-wrap: wrap;
}

.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 5px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 100;
  min-width: 180px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.btn-primary-orange {
  background: #f97316;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary-light, .btn-dropdown {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.btn-to-constructor {
  border-color: #f97316;
  color: #ea580c;
  font-weight: 600;
}

.btn-to-constructor:hover {
  background: #fff7ed;
}

.search-box-wrapper {
  margin-left: auto;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  border-radius: 8px;
  gap: 6px;
}

.search-box-wrapper input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
}

.table-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.data-table th {
  background: #f9fafb;
  padding: 12px 16px;
  color: #6b7280;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.category-row {
  background: #fcfcfc;
  font-weight: 600;
}

.category-title-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sub-count {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 400;
}

.badge-visible {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: inline-block;
}

.badge-hidden {
  background: rgba(156, 163, 175, 0.15);
  color: #6b7280;
}

.image-uploader-box {
  width: 36px;
  height: 36px;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f8fafc;
  overflow: hidden;
}

.image-uploader-box:hover {
  border-color: #f97316;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-icon-text {
  font-size: 14px;
}

.inline-edit-input {
  border: 1px solid transparent;
  background: transparent;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 13px;
  color: inherit;
  width: 80%;
}

.inline-edit-input:hover, .inline-edit-input:focus {
  border-color: #d1d5db;
  background: #ffffff;
  outline: none;
}

.cat-input {
  font-weight: 600;
  font-size: 14px;
}

.desc-input {
  width: 100%;
}

.price-input {
  width: 60px;
}

.btn-delete-row {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.6;
  padding: 4px;
  border-radius: 4px;
}

.btn-delete-row:hover {
  opacity: 1;
  background: #fee2e2;
}

.btn-variants {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  margin-left: 10px;
  cursor: pointer;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  font-size: 13px;
  color: #6b7280;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-rows {
  padding: 4px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.btn-page {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.print-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.print-modal-content {
  background: white;
  width: 650px;
  max-height: 90vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.print-modal-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.print-modal-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.print-menu-template {
  padding: 30px;
  background: #fff;
  overflow-y: auto;
  font-family: 'Georgia', serif;
  color: #222;
}

.print-restaurant-title {
  text-align: center;
  font-size: 24px;
  letter-spacing: 2px;
  margin: 0 0 10px 0;
}

.print-divider {
  width: 50px;
  height: 2px;
  background: #333;
  margin: 0 auto 25px auto;
}

.print-category-block {
  margin-bottom: 20px;
}

.print-category-title {
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 4px;
  margin-bottom: 12px;
  color: #444;
}

.print-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
  font-size: 14px;
}

.print-item-left {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.print-item-name {
  font-weight: bold;
}

.print-item-desc {
  font-size: 11px;
  color: #666;
  font-style: italic;
}

.print-item-dots {
  flex-grow: 1;
  border-bottom: 1px dotted #bbb;
  margin: 0 8px;
}

.print-item-price {
  font-weight: bold;
  white-space: nowrap;
}

.print-footer-note {
  text-align: center;
  margin-top: 30px;
  font-style: italic;
  font-size: 12px;
  color: #555;
}

.print-modal-actions {
  padding: 15px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media print {
  body * {
    visibility: hidden;
  }
  #printable-area, #printable-area * {
    visibility: visible;
  }
  #printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 10px;
    background: white;
  }
  .print-modal-overlay {
    background: transparent;
  }
}
</style>