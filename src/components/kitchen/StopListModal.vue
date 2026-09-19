<template>
  <div class="modal-overlay" :class="{ 'light-theme': isLight }" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-titles">
          <h2>Стоп-лист</h2>
          <p>Управление доступностью блюд</p>
        </div>
        <button class="btn-close" @click="close"><X /></button>
      </div>

      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Поиск блюда..." 
          class="search-input"
        />
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          Загрузка меню...
        </div>
        <div v-else-if="error" class="error-state">
          {{ error }}
        </div>
        <div v-else>
          <div v-for="category in filteredCategories" :key="category.id" class="category-section">
            <h3 class="category-name">{{ category.name }}</h3>
            
            <div class="dishes-grid">
              <div 
                v-for="dish in getDishesForCategory(category.id)" 
                :key="dish.id" 
                class="dish-card"
                :class="{ 'is-disabled': !dish.isAvailable }"
                @click="toggleAvailability(dish)"
              >
                <div class="dish-info">
                  <span class="dish-name">{{ dish.name }}</span>
                  <span class="dish-status" :class="dish.isAvailable ? 'status-active' : 'status-stopped'">
                    {{ dish.isAvailable ? 'В наличии' : 'Стоп' }}
                  </span>
                </div>
                
                <label class="switch" @click.stop>
                  <input 
                    type="checkbox" 
                    :checked="dish.isAvailable" 
                    @change="toggleAvailability(dish)"
                  />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>
          
          <div v-if="filteredCategories.length === 0" class="empty-state">
            <span class="empty-emoji">🍽️</span>
            <p>Блюда не найдены</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { X } from 'lucide-vue-next';
import { staffMenuApi } from '../../api';

const props = defineProps({
  isLight: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const categories = ref<any[]>([]);
const items = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');

const fetchMenu = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await staffMenuApi.getMenu();
    categories.value = res.categories || [];
    items.value = res.items || [];
  } catch (err: any) {
    error.value = err.message || 'Ошибка загрузки меню';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMenu();
});

const close = () => {
  emit('close');
};

const getDishesForCategory = (categoryId: string | null) => {
  let list = items.value.filter(i => i.categoryId === categoryId);
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(i => i.name.toLowerCase().includes(q));
  }
  return list;
};

const filteredCategories = computed(() => {
  const cats = categories.value.filter(cat => getDishesForCategory(cat.id).length > 0);
  const uncategorized = items.value.filter(i => !i.categoryId);
  if (uncategorized.length > 0) {
    cats.push({ id: null, name: 'Без категории' });
  }
  return cats;
});

const toggleAvailability = async (dish: any) => {
  const originalState = dish.isAvailable;
  // Optimistic update
  dish.isAvailable = !originalState;
  
  try {
    await staffMenuApi.updateAvailability(dish.id, dish.isAvailable);
  } catch (err) {
    console.error('Ошибка сохранения:', err);
    // Revert on error
    dish.isAvailable = originalState;
    alert('Не удалось изменить статус блюда');
  }
};
</script>

<style scoped>
/* Dark Theme (Default) */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  --bg-color: #161821;
  --surface-color: #1e212d;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --accent-color: #9D0D0E;
  --danger-color: #ef4444;
  --success-color: #22c55e;
}

/* Light Theme */
.modal-overlay.light-theme {
  background: rgba(255, 255, 255, 0.4);
  --bg-color: #ffffff;
  --surface-color: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --accent-color: #2563eb;
}

.modal-content {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  width: 100%;
  max-width: 540px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.header-titles h2 {
  margin: 0 0 6px 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-titles p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.btn-close {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: var(--danger-color);
  color: white;
  border-color: var(--danger-color);
}

.search-container {
  padding: 16px 24px;
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
}

.search-input {
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.category-section {
  margin-bottom: 32px;
}

.category-name {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
}

.dishes-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dish-card:hover {
  border-color: var(--text-secondary);
}

.dish-card.is-disabled {
  opacity: 0.6;
  background: transparent;
  border-style: dashed;
}

.dish-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dish-name {
  font-weight: 600;
  font-size: 1.05rem;
}

.dish-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  width: fit-content;
}

.status-active {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success-color);
}

.status-stopped {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger-color);
}

/* Toggle Switch Styling */
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: relative;
  width: 52px;
  height: 28px;
  background-color: var(--border-color);
  border-radius: 34px;
  transition: .3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: .3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input:checked + .slider {
  background-color: var(--success-color);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}
</style>
