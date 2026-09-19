<script setup lang="ts">
import { ref } from 'vue';
import type { RestaurantInfo } from '@/types/menu';
import { compressCoverImage, compressAvatarImage } from "../composables/useImageCompressor";

const props = defineProps<{
  modelValue: RestaurantInfo & { showCoverGradient?: boolean };
}>();

const emit = defineEmits(['update:modelValue']);

// Создаем refs для инпутов
const avatarInput = ref<HTMLInputElement | null>(null);
const coverInput = ref<HTMLInputElement | null>(null);

// Функции для вызова клика
const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const triggerCoverUpload = () => {
  coverInput.value?.click();
};

defineExpose({ triggerAvatarUpload, triggerCoverUpload });

// Универсальный обновлятор полей
const updateField = (field: string, value: any) => {
  const updatedData = { ...props.modelValue, [field]: value };
  emit('update:modelValue', updatedData);
};

const handleFileUpload = async (event: Event, type: 'cover' | 'avatar') => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    // Обложка: 1200×400, аватар: 200×200, оба JPEG 80%
    const compressed = type === 'cover'
      ? await compressCoverImage(file)
      : await compressAvatarImage(file);
    updateField(type === 'cover' ? 'coverImage' : 'avatarImage', compressed);
  } catch {
    console.error('Ошибка сжатия изображения');
  }
};
</script>


<template>
  <div class="branding-editor">
    <h3>Брендинг и лого</h3>

    <!-- Поле ввода названия ресторана -->
    <div class="form-group">
      <label>Название ресторана</label>
      <input 
        type="text" 
        :value="modelValue.name" 
        @input="(e) => updateField('name', (e.target as HTMLInputElement).value)" 
        placeholder="Введите название ресторана" 
        class="restaurant-name-input"
      />
    </div>

    <!-- Фоновое изображение (обложка) -->
    <div class="form-group">
      <label>Фоновое изображение (обложка)</label>
      <div class="image-upload-container cover-upload" 
           :style="{ 
             backgroundImage: modelValue.coverImage 
               ? (modelValue.showCoverGradient !== false 
                   ? `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${modelValue.coverImage})` 
                   : `url(${modelValue.coverImage})`) 
               : 'none' 
            }">
        <label class="upload-btn">
          <input ref="coverInput" type="file" accept="image/*" @change="(e) => handleFileUpload(e, 'cover')" hidden />
          {{ modelValue.coverImage ? 'Изменить обложку' : 'Загрузить обложку' }}
        </label>
        <div v-if="!modelValue.coverImage" class="placeholder-text">1200x400px</div>
      </div>
    </div>

    <!-- Чекбокс управления градиентом в настройках -->
    <div class="form-group checkbox-group" v-if="modelValue.coverImage">
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          :checked="modelValue.showCoverGradient !== false" 
          @change="(e) => updateField('showCoverGradient', (e.target as HTMLInputElement).checked)"
        />
        <span>Добавить затемняющий градиент для читаемости текста</span>
      </label>
    </div>

    <!-- Аватар ресторана -->
    <div class="form-group">
      <label>Аватар ресторана</label>
      <div class="avatar-wrapper">
        <div class="avatar-circle" :style="modelValue.avatarImage ? { backgroundImage: `url(${modelValue.avatarImage})` } : {}">
          <span v-if="!modelValue.avatarImage">🍽️</span>
          
          <label class="avatar-overlay">
            <input ref="avatarInput" type="file" accept="image/*" @change="(e) => handleFileUpload(e, 'avatar')" hidden />
            <span>{{ modelValue.avatarImage ? 'Изменить' : 'Выбрать' }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.branding-editor { display: flex; flex-direction: column; gap: 24px; padding: 16px; }
.branding-editor h3 { color: var(--text-main); }
.form-group label { display: block; margin-bottom: 8px; color: var(--text-muted, #a0a0a0); font-size: 14px; }

/* Стиль для инпута названия */
.restaurant-name-input {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--input-bg, #ffffff);
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.restaurant-name-input:focus {
  border-color: #9D0D0E;
}

.image-upload-container {
  border: 2px dashed var(--border-color, #ccc); border-radius: 12px; display: flex;
  flex-direction: column; justify-content: center; align-items: center;
  background-color: var(--input-bg, #ffffff); background-size: cover;
  background-position: center; position: relative; overflow: hidden;
}

.cover-upload { width: 100%; height: 150px; justify-content: flex-end; }
.placeholder-text { color: #888; font-size: 12px; margin-top: 4px; position: absolute; pointer-events: none; }

/* Стили для чекбокса настройки градиента */
.checkbox-group {
  margin-top: -12px;
}
.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: var(--text-main) !important;
  font-size: 13px !important;
  user-select: none;
}
.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #9D0D0E;
  cursor: pointer;
}

.avatar-wrapper { display: flex; align-items: center; gap: 16px; }
.avatar-circle { 
  width: 100px; height: 100px; border-radius: 50%; 
  background-size: cover; background-position: center; 
  display: flex; justify-content: center; align-items: center; 
  font-size: 40px; color: #555; background-color: var(--border-color, #eee);
  position: relative; overflow: hidden; border: 2px solid var(--border-color, #ccc);
  cursor: pointer;
}

.avatar-overlay {
  position: absolute; inset: 0; display: flex; 
  justify-content: center; align-items: center;
  background: rgba(0, 0, 0, 0.6); color: white;
  font-size: 12px; cursor: pointer; opacity: 0;
  transition: opacity 0.2s; pointer-events: auto; 
}

.avatar-circle:hover .avatar-overlay { opacity: 1; }
.avatar-circle:not(:has([style*="background-image"])) .avatar-overlay { opacity: 0.6; }

.upload-btn { 
  cursor: pointer; background-color: rgba(0, 0, 0, 0.5); 
  color: white; padding: 6px 12px; border-radius: 6px; 
  font-size: 12px; margin: 8px; transition: background 0.2s; 
}
.upload-btn:hover { background-color: rgba(0, 0, 0, 0.7); }
</style>