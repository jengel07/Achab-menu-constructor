<template>
  <div 
    class="floating-settings-bar" 
    :style="barStyle"
  >
    <!-- Язык -->
    <button class="fs-icon-btn" @click="$emit('open-modal', 'language')" :title="selectedLanguage || 'Язык'">
      <span class="fs-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </span>
    </button>
    <div class="fs-divider" :style="{ backgroundColor: dividerColor }"></div>

    <!-- Фильтры -->
    <button class="fs-icon-btn" @click="$emit('open-modal', 'filters')" title="Фильтры">
      <span class="fs-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
      </span>
    </button>
    <div class="fs-divider" :style="{ backgroundColor: dividerColor }"></div>

    <!-- Поделиться -->
    <button class="fs-icon-btn" @click="$emit('open-modal', 'share')" title="Поделиться">
      <span class="fs-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </span>
    </button>
    <div class="fs-divider" :style="{ backgroundColor: dividerColor }"></div>

    <!-- Переключение вида: Сетка / Список -->
    <button class="fs-icon-btn" @click="$emit('toggle-view')" :title="viewMode === 'grid' ? 'Сделать списком' : 'Сделать сеткой'">
      <span class="fs-icon">
        <svg v-if="viewMode === 'grid'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      </span>
    </button>
    <div class="fs-divider" :style="{ backgroundColor: dividerColor }"></div>

    <!-- Поиск -->
    <button class="fs-icon-btn" @click="$emit('open-modal', 'search')" title="Поиск">
      <span class="fs-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  backgroundColor?: string;
  primaryColor?: string; 
  selectedLanguage?: string;
  isVisible?: boolean;
  viewMode?: 'grid' | 'list';
}>();

defineEmits<{
  (e: 'open-modal', modalName: string): void;
  (e: 'toggle-view'): void;
}>();

// Функция для вычисления контрастного цвета (черный или белый)
const getContrastColor = (hex: string) => {
  if (!hex || !hex.startsWith('#')) return '#FFFFFF';
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 >= 128 ? '#000000' : '#FFFFFF';
  } catch {
    return '#FFFFFF';
  }
};

// Выбираем цвет фона для плашки (приоритет primaryColor, затем backgroundColor, либо дефолтный)
const activeBgColor = computed(() => props.primaryColor || props.backgroundColor || '#9D0D0E');

// Автоматически определяем цвет текста (черный или белый) в зависимости от фона
const textColor = computed(() => getContrastColor(activeBgColor.value));

// Цвет разделителей (полупрозрачный вариант текста)
const dividerColor = computed(() => {
  return textColor.value === '#000000' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)';
});

// Итоговые стили для плашки
const barStyle = computed(() => ({
  backgroundColor: activeBgColor.value,
  color: textColor.value
}));
</script>

<style scoped>
.floating-settings-bar {
  position: absolute;
  bottom: 15px;
  left: 10px;
  right: 10px;
  border-radius: 30px;
  padding: 6px 12px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  z-index: 15;
  box-sizing: border-box;
  overflow: hidden;
  transition: transform 0.3s ease, opacity 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}

.floating-settings-bar.bar-hidden {
  transform: translateY(100px);
  opacity: 0;
  pointer-events: none;
}

.fs-icon-btn {
  background: transparent;
  border: none;
  color: inherit; /* Наследует цвет текста плашки */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  flex: 1;
  min-width: 0;
  border-radius: 20px;
  transition: background-color 0.2s ease;
}

.fs-icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.fs-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fs-icon svg {
  stroke: currentColor;
}

.fs-divider {
  width: 1px;
  height: 14px;
  flex-shrink: 0;
  margin: 0 2px;
  transition: background-color 0.3s ease;
}
</style>