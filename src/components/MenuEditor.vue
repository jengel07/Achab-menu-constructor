<script setup lang="ts">
import ModifiersEditor from './ModifiersEditor.vue';
import { ref, computed } from 'vue';
import type { MenuItem, MenuCategory } from '../types/menu';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ImagePlus, 
  AlertTriangle 
} from 'lucide-vue-next';
import { compressDishImage } from "../composables/useImageCompressor";


const fileInput = ref<HTMLInputElement | null>(null);

const isImageLoading = ref(false);
const showModifiersModal = ref(false);
const imageLoadError = ref<string | null>(null);

const props = defineProps<{
  items: MenuItem[];
  categories: MenuCategory[];
}>();

const emit = defineEmits<{
  (e: 'update-items', items: MenuItem[]): void;
  (e: 'update-categories', categories: MenuCategory[]): void;
}>();

// Синхронизация с сервером (с привязкой к ID ресторана)

  const promptNewCategory = () => {
    const name = prompt('Введите название новой категории:');
    if (!name || !name.trim()) return;
    const newCat = {
      id: 'cat-' + Date.now(),
      name: name.trim(),
      orderIndex: props.categories ? props.categories.length : 0
    };
    const newCats = [...(props.categories || []), newCat];
    emit('update-categories', newCats);
    if (editingItem.value) {
      editingItem.value.categoryId = newCat.id;
    }
  };
  
const syncWithServer = async (updatedItems: MenuItem[]) => {
  const dataToSave = {
    cats: props.categories,
    items: updatedItems
  };

  const currentUser = localStorage.getItem('currentUser');
  const restaurantId = currentUser ? JSON.parse(currentUser).restaurantId : null;
  const token = localStorage.getItem('authToken');
  let apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {
    apiUrl = `http://${window.location.hostname}:3000`;
  }

  try {
    if (restaurantId && token) {
      await axios.post(`${apiUrl}/api/menu/${restaurantId}`, dataToSave, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      console.warn('⚠️ restaurantId или токен не найдены');
    }
  } catch (e) {
    console.error('Ошибка сохранения на сервер', e);
  }
};

const searchQuery = ref('');
const selectedCategoryId = ref<string>('all');

// Дополнительные фильтры питания (без орехов, без лактозы, без глютена)
const dietaryFilters = ref({
  nutFree: false,
    glutenFree: false,
    vegetarian: false,
    vegan: false
});

const isModalOpen = ref(false);
const editingItem = ref<(Partial<MenuItem> & { image?: string; nutFree?: boolean; glutenFree?: boolean; vegetarian?: boolean; vegan?: boolean }) | null>(null);

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  imageLoadError.value = null;

  if (target.files && target.files[0]) {
    const file = target.files[0];

    if (!file.type.startsWith('image/')) {
      imageLoadError.value = 'Пожалуйста, выберите файл изображения (png, jpg).';
      return;
    }

    isImageLoading.value = true;

    try {
      // Сжимаем до 600×450, JPEG 75% — оптимально для карточек меню
      const compressed = await compressDishImage(file);
      if (editingItem.value) {
        editingItem.value.image = compressed;
      }
    } catch (err) {
      imageLoadError.value = 'Ошибка при обработке фото. Попробуйте ещё раз.';
    } finally {
      isImageLoading.value = false;
      // Сбрасываем input чтобы можно было загрузить тот же файл повторно
      if (fileInput.value) fileInput.value.value = '';
    }
  }
};


const filteredItems = computed(() => {
  return props.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
    const matchesCategory = selectedCategoryId.value === 'all' || String(item.categoryId) === String(selectedCategoryId.value);
    
    // Проверка фильтров питания
    const matchesNutFree = !dietaryFilters.value.nutFree || (item as any).nutFree;
    const matchesGlutenFree = !dietaryFilters.value.glutenFree || (item as any).glutenFree;
    const matchesVegetarian = !dietaryFilters.value.vegetarian || (item as any).vegetarian;
      const matchesVegan = !dietaryFilters.value.vegan || (item as any).vegan;

    return matchesSearch && matchesCategory && matchesNutFree && matchesGlutenFree && matchesVegetarian && matchesVegan;
  });
});

const toggleAvailability = (itemId: string | number) => {
  const updated = props.items.map(item => {
    if (item.id === itemId) {
      return { ...item, isAvailable: !item.isAvailable };
    }
    return item;
  });
  emit('update-items', updated);
  syncWithServer(updated);
};

const deleteItem = (itemId: string | number) => {
  if (confirm('Вы уверены, что хотите удалить это блюдо?')) {
    const updated = props.items.filter(item => item.id !== itemId);
    emit('update-items', updated);
    syncWithServer(updated);
  }
};

const openEditModal = (item?: MenuItem) => {
  if (item) {
    editingItem.value = { ...item };
  } else {
    const firstCat = props.categories && props.categories.length > 0 ? props.categories[0] : null;
    editingItem.value = {
      id: 'item-' + Date.now(),
      name: '',
      description: '',
      price: 150,
      image: '',
      categoryId: firstCat ? firstCat.id : '',
      isAvailable: true,
      nutFree: false,
    glutenFree: false,
    vegetarian: false,
    vegan: false,
      priceGlassLabel: '',
      priceBottleLabel: ''
    };
  }
  isModalOpen.value = true;
};

const saveItem = () => {
  if (!editingItem.value || !editingItem.value.name || isImageLoading.value) return;

  if (!editingItem.value.categoryId && props.categories && props.categories.length > 0) {
    editingItem.value.categoryId = props.categories[0].id;
  }

  const updatedItems = [...props.items];
  const index = updatedItems.findIndex(i => String(i.id) === String(editingItem.value?.id));

  if (index !== -1) {
    updatedItems[index] = { ...updatedItems[index], ...editingItem.value } as MenuItem;
  } else {
    updatedItems.push(editingItem.value as MenuItem);
  }

  emit('update-items', updatedItems);
  syncWithServer(updatedItems);
  closeModal();
};

const closeModal = () => {
  isModalOpen.value = false;
  editingItem.value = null;
  imageLoadError.value = null;
  isImageLoading.value = false;
  // Сбрасываем input чтобы один и тот же файл можно было загрузить в другое блюдо
  if (fileInput.value) fileInput.value.value = '';
};
</script>

<template>
  <div class="menu-editor">
    <div class="toolbar">
      <div class="filter-group" style="flex-direction: column; align-items: stretch; gap: 12px;">
        <div style="display: flex; gap: 12px; width: 100%;">
          <div style="position: relative; flex-grow: 1; display: flex; align-items: center;">
            <Search :size="18" stroke-width="2" style="position: absolute; left: 12px; color: var(--text-muted, #888);" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Поиск блюда..." 
              class="search-input"
              style="padding-left: 38px; width: 100%; box-sizing: border-box;"
            />
          </div>
          
          <select v-model="selectedCategoryId" class="category-select">
            <option value="all">Все категории</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div v-show="false" class="dietary-filters-toolbar" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #e9ecef;">
          <span style="font-size: 13px; font-weight: 600; color: #495057; margin-right: 4px;">Питание:</span>
          
          <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; background: #fff; padding: 6px 12px; border-radius: 6px; border: 1px solid #ced4da;">
            <input type="checkbox" v-model="dietaryFilters.noNuts" />
            🥜 Без орехов
          </label>

          <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; background: #fff; padding: 6px 12px; border-radius: 6px; border: 1px solid #ced4da;">
            <input type="checkbox" v-model="dietaryFilters.noLactose" />
            🥛 Без лактозы
          </label>

          <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; background: #fff; padding: 6px 12px; border-radius: 6px; border: 1px solid #ced4da;">
            <input type="checkbox" v-model="dietaryFilters.noGluten" />
            🌾 Без глютена
          </label>

          <button 
            v-if="dietaryFilters.noNuts || dietaryFilters.noLactose || dietaryFilters.noGluten" 
            @click="dietaryFilters.noNuts = false; dietaryFilters.noLactose = false; dietaryFilters.noGluten = false"
            style="background: none; border: none; color: #521926; font-size: 12px; cursor: pointer; text-decoration: underline; margin-left: auto;"
          >
            очистить
          </button>
        </div>
      </div>

      <button @click="openEditModal()" class="btn-add" style="display: flex; align-items: center; gap: 6px; white-space: nowrap; align-self: flex-start;">
        <Plus :size="16" stroke-width="2.5" /> Добавить блюдо
      </button>
    </div>

    <div v-if="filteredItems.length > 0" class="items-grid">
      <div 
        v-for="item in filteredItems" 
        :key="item.id" 
        class="item-card"
        :class="{ 'not-available': !item.isAvailable }"
      >
        <div class="card-image-wrapper" v-if="item.image">
          <img :src="item.image" :alt="item.name" class="card-thumb" />
        </div>

        <div class="card-header">
          <span class="category-badge">
            {{ categories.find(c => String(c.id) === String(item.categoryId))?.name || 'Без категории' }}
          </span>
          <div class="actions">
            <button @click="openEditModal(item)" class="action-btn edit-btn" title="Редактировать">
              <Pencil :size="15" stroke-width="2" />
            </button>
            <button @click="deleteItem(item.id)" class="action-btn delete-btn" title="Удалить">
              <Trash2 :size="15" stroke-width="2" />
            </button>
          </div>
        </div>

        <div class="card-body">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-desc">{{ item.description }}</p>
          
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;" v-if="(item as any).nutFree || (item as any).glutenFree || (item as any).vegetarian || (item as any).vegan">
            <span v-if="(item as any).nutFree" style="font-size: 14px;" title="Без орехов">🥜</span>
            <span v-if="(item as any).glutenFree" style="font-size: 14px;" title="Без глютена">🌾</span>
            <span v-if="(item as any).vegetarian" style="font-size: 14px;" title="Вегетарианское">🥗</span>
            <span v-if="(item as any).vegan" style="font-size: 14px;" title="Веганское">🌱</span>
          </div>
        </div>

        <div class="card-footer">
          <span class="item-price">
            <template v-if="!item.priceBottle && !item.priceGlass">{{ item.price }} ₽  
  </template>
            <template v-else>{{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽</template>
          </span>
          
          <label class="switch">
            <input 
              type="checkbox" 
              :checked="item.isAvailable" 
              @change="toggleAvailability(item.id)"
            />
            <span class="slider round"></span>
            <span class="switch-label">{{ item.isAvailable ? 'Активно' : 'В стопе' }}</span>
          </label>
        </div>
      </div>
    </div>

    <div v-else class="empty-results">
      <p>Ничего не найдено по вашему запросу 🧐</p>
    </div>

    <div v-if="isModalOpen && editingItem" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <h2 class="modal-title">
          {{ props.items.some(i => String(i.id) === String(editingItem?.id)) ? 'Редактировать блюдо' : 'Новое блюдо' }}
        </h2>
      
        <div class="form-group">
          <label>Фото блюда</label>
          <div 
            class="image-upload-area" 
            :class="{ 'is-loading': isImageLoading, 'has-error': imageLoadError }"
            @click="!isImageLoading && fileInput?.click()"
          >
            <div v-if="isImageLoading" class="loading-overlay">
              <div class="spinner"></div>
              <span class="loading-text">Обработка...</span>
            </div>

            <div v-else-if="imageLoadError" class="error-message">
              <span style="display: flex; align-items: center; gap: 4px;"><AlertTriangle :size="16" /> {{ imageLoadError }}</span>
              <span class="retry-text">Нажмите, чтобы попробовать снова</span>
            </div>

            <template v-else>
              <img v-if="editingItem.image" :src="editingItem.image" class="preview-img" alt="Превью" />
              <span v-else style="display: flex; align-items: center; gap: 6px;">
                <ImagePlus :size="20" stroke-width="1.5" /> Нажмите для загрузки фото
              </span>
            </template>

            <input 
              type="file" 
              ref="fileInput" 
              @change="handleImageUpload" 
              accept="image/*" 
              style="display: none" 
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>Название блюда</label>
          <input v-model="editingItem.name" type="text" placeholder="Например, Яичница с ветчиной" />
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="editingItem.description" placeholder="Ингредиенты, особенности вкуса..." rows="3"></textarea>
        </div>

        
          <div class="form-group">
            <button type="button" class="btn-secondary" style="width: 100%; border-style: dashed; padding: 12px;" @click="showModifiersModal = true">
              ⚙️ Настроить опции и добавки ({{ editingItem.modifiers ? editingItem.modifiers.length : 0 }} групп)
            </button>
          </div>
  
          <div class="form-group">
            <label>Диетические теги</label>
            <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
              <label class="compact-tag-toggle" :class="{ active: editingItem.nutFree }">
                <input type="checkbox" v-model="editingItem.nutFree" style="display: none;" />
                <span class="tag-icon">🥜</span>
                <span class="tag-text">Без орехов</span>
              </label>
              <label class="compact-tag-toggle" :class="{ active: editingItem.glutenFree }">
                <input type="checkbox" v-model="editingItem.glutenFree" style="display: none;" />
                <span class="tag-icon">🌾</span>
                <span class="tag-text">Без глютена</span>
              </label>
              <label class="compact-tag-toggle" :class="{ active: editingItem.vegetarian }">
                <input type="checkbox" v-model="editingItem.vegetarian" style="display: none;" />
                <span class="tag-icon">🥗</span>
                <span class="tag-text">Вег.</span>
              </label>
              <label class="compact-tag-toggle" :class="{ active: editingItem.vegan }">
                <input type="checkbox" v-model="editingItem.vegan" style="display: none;" />
                <span class="tag-icon">🌱</span>
                <span class="tag-text">Веган</span>
              </label>
            </div>
          </div>

        <div class="form-row">
          <div class="form-group">
            <label>Цена (₽)</label>
            <input v-model.number="editingItem.price" type="number" min="0" placeholder="Стандартная цена" />
          </div>
          
          <div class="form-group">
            <label>Опция 1: Название и Цена (₽)</label>
            <div style="display: flex; gap: 8px;">
              <input v-model="editingItem.priceGlassLabel" type="text" placeholder="Бокал, 0.5л..." style="flex: 1; min-width: 0;" />
              <input v-model.number="editingItem.priceGlass" type="number" min="0" placeholder="Цена" style="width: 80px; flex-shrink: 0;" />
            </div>
          </div>
          
          <div class="form-group">
            <label>Опция 2: Название и Цена (₽)</label>
            <div style="display: flex; gap: 8px;">
              <input v-model="editingItem.priceBottleLabel" type="text" placeholder="Бутылка, 1л..." style="flex: 1; min-width: 0;" />
              <input v-model.number="editingItem.priceBottle" type="number" min="0" placeholder="Цена" style="width: 80px; flex-shrink: 0;" />
            </div>
          </div>

          <div class="form-group">
            <label>Категория</label>
            <div style="display: flex; gap: 8px;">
              <select v-model="editingItem.categoryId" v-if="categories && categories.length > 0" style="flex: 1;">
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <div v-else style="color: #e74c3c; font-size: 13px; padding: 6px 0; flex: 1;">
                ⚠️ Нет категорий!
              </div>
              <button type="button" class="btn-secondary" style="flex-shrink: 0; padding: 0 12px; height: 42px;" @click="promptNewCategory">+ Новая</button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeModal" class="btn-cancel">Отмена</button>
          <button @click="saveItem" class="btn-save">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
<ModifiersEditor 
      v-if="showModifiersModal" 
      :modifiers="editingItem.modifiers || []" 
      @close="showModifiersModal = false"
      @save="mods => { editingItem.modifiers = mods; showModifiersModal = false; }" 
    />
  </template>

<style scoped>
.menu-editor {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-grow: 1;
  max-width: 600px;
}

.search-input {
  background: var(--bg-input, #1e1e1e);
  border: 1px solid var(--border-color, #2e2e2e);
  padding: 10px 16px;
  border-radius: 8px;
  color: var(--text-main, white);
  font-size: 0.95rem;
}

.category-select {
  background: var(--bg-input, #1e1e1e);
  border: 1px solid var(--border-color, #2e2e2e);
  padding: 10px 16px;
  border-radius: 8px;
  color: var(--text-main, white);
  font-size: 0.95rem;
  cursor: pointer;
}

.btn-add {
  background: var(--accent, #9D0D0E);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-add:hover {
  opacity: 0.9;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.item-card {
  background: var(--bg-card, #1e1e1e);
  border: 1px solid var(--border-color, #2e2e2e);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  transition: transform 0.2s, border-color 0.2s;
  overflow: hidden;
}

.card-image-wrapper {
  width: calc(100% + 32px);
  height: 140px;
  margin: -16px -16px 12px -16px;
  overflow: hidden;
}

.card-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent, #4a4a4a);
}

.item-card.not-available {
  opacity: 0.6;
  border-style: dashed;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-badge {
  background: var(--badge-bg, rgba(255, 255, 255, 0.05));
  color: var(--badge-color, #a0a0a0);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
}

.actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #a0a0a0);
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}

.action-btn:hover {
  background: var(--action-hover, rgba(255, 255, 255, 0.1));
  color: var(--text-main, #fff);
}

.card-body {
  margin-bottom: 16px;
  flex-grow: 1;
}

.item-name {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main, white);
}

.item-desc {
  margin: 0;
  color: var(--text-muted, #888888);
  font-size: 0.85rem;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color, #2e2e2e);
  padding-top: 12px;
}

.item-price {
  font-weight: 700;
  color: var(--accent, #9D0D0E);
  font-size: 1.1rem;
}

.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  width: 34px;
  height: 20px;
  background-color: var(--slider-bg, #444);
  transition: .2s;
  border-radius: 34px;
  position: relative;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .2s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--accent, #9D0D0E);
}

input:checked + .slider:before {
  transform: translateX(14px);
}

.switch-label {
  font-size: 0.75rem;
  color: var(--text-muted, #a0a0a0);
  user-select: none;
}

.empty-results {
  text-align: center;
  padding: 40px;
  color: var(--text-muted, #666);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: var(--bg-card, #1e1e1e);
  border: 1px solid var(--border-color, #2e2e2e);
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  color: var(--text-main, white);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  margin: 0;
  font-size: 1.4rem;
  color: var(--text-main, white);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.form-group label {
  font-size: 0.85rem;
  color: var(--text-muted, #a0a0a0);
  word-break: break-word;
  white-space: normal;
}

.form-group input, .form-group textarea, .form-group select {
  background: var(--bg-input-inner, #141414);
  border: 1px solid var(--border-color, #2e2e2e);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-main, white);
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.btn-generate-ai {
  margin-top: 8px;
  background: var(--bg-input-inner, #1e1e24);
  color: var(--accent, #9D0D0E);
  border: 1px dashed var(--accent, #9D0D0E);
  border-radius: 8px;
  padding: 8px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-generate-ai:hover {
  background: var(--accent, #9D0D0E);
  color: #fff;
}
.btn-generate-ai:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--border-color, #333);
  color: var(--text-muted, #a0a0a0);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: var(--action-hover, rgba(255, 255, 255, 0.05));
}

.btn-save {
  background: var(--accent, #9D0D0E);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover {
  opacity: 0.9;
}

.image-upload-area {
  width: 100%;
  height: 140px;
  border: 2px dashed var(--border-dashed, #333);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  color: var(--text-muted, #666);
  background: var(--bg-input-inner, #141414);
  position: relative;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-upload-area.is-loading {
  cursor: wait;
  border-color: var(--accent, #9D0D0E);
}

.image-upload-area.has-error {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
  background: var(--loading-overlay-bg, rgba(20, 20, 20, 0.8));
  position: absolute;
  top: 0;
  left: 0;
}

.loading-text {
  font-size: 0.8rem;
  color: var(--accent, #9D0D0E);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(100, 108, 255, 0.2);
  border-top-color: var(--accent, #9D0D0E);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  text-align: center;
  font-size: 0.85rem;
}

.retry-text {
  font-size: 0.75rem;
  color: var(--text-muted, #888);
  margin-top: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 500px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.compact-tag-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-card, #2d2d2d);
  border: 1px solid var(--border-color, #3d3d3d);
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;
}
.compact-tag-toggle.active {
  background: rgba(106, 33, 49, 0.15);
  border-color: #9D0D0E;
  color: #818cf8;
}
.tag-icon { font-size: 14px; }

</style>