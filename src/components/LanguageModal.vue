<template>
  <div class="bottom-sheet-overlay" :class="{ 'theme-light': isDarkMode === false }" @click.self="$emit('close')">
    <div class="bottom-sheet">
      <div class="sheet-indicator"></div>
      <h3>{{ title }}</h3>
      <div class="lang-grid">
        <button 
          v-for="lang in languages" 
          :key="lang.code"
          class="lang-option-btn" 
          :class="{ active: currentLang === lang.code }" 
          :style="currentLang === lang.code ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#fff' } : {}" 
          @click="$emit('select', lang.code)"
        >
          {{ lang.flag }} {{ lang.name }}
        </button>
      </div>
      <div class="modal-footer-text">© Проект от Web-Visual-World | 2024</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentLang: string;
  primaryColor: string;
  title: string;
  isDarkMode?: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'select', langCode: string): void;
}>();

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ab', name: 'Аԥсшәа', flag: '🟢' },
];
</script>

<style scoped>
.bottom-sheet-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  --modal-bg: #1e1e1e;
  --modal-text: #fff;
  --modal-indicator: #444;
  --modal-btn-bg: #2a2a2a;
  --modal-btn-border: #3a3a3a;
  --modal-btn-text: #fff;
  --modal-secondary-text: #aaa;
}

.bottom-sheet-overlay.theme-light {
  --modal-bg: #ffffff;
  --modal-text: #171717;
  --modal-indicator: #e5e5e5;
  --modal-btn-bg: #f5f5f5;
  --modal-btn-border: #e0e0e0;
  --modal-btn-text: #171717;
  --modal-secondary-text: #666;
}

.bottom-sheet {
  background: var(--modal-bg);
  color: var(--modal-text);
  width: 100%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sheet-indicator {
  width: 28px;
  height: 3px;
  background: var(--modal-indicator);
  border-radius: 2px;
  align-self: center;
}

.bottom-sheet h3 {
  font-size: 13px;
  margin: 0;
  color: #9D0D0E;
}

.lang-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 6px;
}

.lang-option-btn {
  background: var(--modal-btn-bg);
  color: var(--modal-btn-text);
  border: 1px solid var(--modal-btn-border);
  border-radius: 8px;
  padding: 8px;
  font-size: 10px;
  cursor: pointer;
  text-align: left;
}

.lang-option-btn.active {
  border-color: transparent;
}

.modal-footer-text {
  text-align: center;
  font-size: 8px;
  color: var(--modal-secondary-text);
  margin-top: 4px;
}
</style>