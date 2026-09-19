<template>
  <div class="settings-view">
    <!-- Верхняя панель со вкладок и кнопкой сохранения -->
    <div class="settings-top-bar">
      <div class="settings-tabs">
        <button class="settings-tab-btn close-btn" @click="$emit('close')">✕ Настройки</button>
        <button 
          class="settings-tab-btn" 
          :class="{ active: activeSubTab === 'profile' }" 
          @click="activeSubTab = 'profile'"
        >
          👤 Профиль
        </button>
        <button 
          class="settings-tab-btn" 
          :class="{ active: activeSubTab === 'payment' }" 
          @click="activeSubTab = 'payment'"
        >
          💳 Оплата
        </button>
        <button 
          class="settings-tab-btn" 
          :class="{ active: activeSubTab === 'tags' }" 
          @click="activeSubTab = 'tags'"
        >
          🏷️ Фильтры и теги
        </button>
        <button 
          class="settings-tab-btn" 
          :class="{ active: activeSubTab === 'trash' }" 
          @click="activeSubTab = 'trash'"
        >
          🗑️ Корзина
        </button>
      </div>
      <button class="btn-update-profile" @click="saveProfile">Обновить</button>
    </div>

    <!-- Содержимое вкладки "Профиль" -->
    <div v-if="activeSubTab === 'profile'" class="settings-content">
      
      <!-- Карточка 1: Данные учетной записи -->
      <div class="settings-card">
        <h3 class="card-title">Учетная запись</h3>
        <div class="form-group">
          <label>Электронная почта</label>
          <input type="email" v-model="profile.email" readonly class="disabled-input" />
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <p class="field-hint">
            Пароль не связан с этим адресом электронной почты, так как вы зарегистрировались с помощью <strong>Google</strong>
          </p>
        </div>
      </div>

      <!-- Карточка 2: Личные данные (Имя, Фамилия, Телефон) -->
      <div class="settings-card">
        <h3 class="card-title">Личные данные</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Имя</label>
            <input type="text" v-model="profile.firstName" placeholder="Имя" />
          </div>
          <div class="form-group">
            <label>Фамилия</label>
            <input type="text" v-model="profile.lastName" placeholder="Фамилия" />
          </div>
        </div>

        <div class="form-group">
          <label>Телефон (необязательно)</label>
          <div class="phone-input-group">
            <span class="phone-prefix">RU +7</span>
            <input type="tel" v-model="profile.phone" placeholder="(999) 000-00-00" />
          </div>
        </div>
      </div>

      <!-- Карточка 3: Данные бизнеса -->
      <div class="settings-card">
        <h3 class="card-title">Данные бизнеса</h3>
        <div class="form-group">
          <label>Название бизнеса</label>
          <input type="text" v-model="profile.businessName" placeholder="Мой ресторан" />
        </div>
        <div class="form-group">
          <div class="label-with-action">
            <label>Короткое имя в URL</label>
            <span class="action-hint">нажмите, чтобы изменить</span>
          </div>
          <div class="url-input-group">
            <span class="url-prefix">daur.menu.app/</span>
            <input type="text" v-model="profile.businessSlug" placeholder="my-restaurant" />
          </div>
        </div>
      </div>

      <!-- Карточка 4: Региональные настройки -->
      <div class="settings-card">
        <h3 class="card-title">Региональные настройки</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Часовой пояс</label>
            <select v-model="profile.timezone">
              <option value="Moscow (GMT+3)">Moscow (GMT+3)</option>
              <option value="Istanbul (GMT+3)">Istanbul (GMT+3)</option>
              <option value="UTC (GMT+0)">UTC (GMT+0)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Язык</label>
            <select v-model="profile.language">
              <option value="Русский">Русский</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Карточка 5: Расширенный вид ПК -->
      <div class="settings-card flex-between">
        <div class="toggle-text-block">
          <label class="toggle-label">Расширенный вид для ПК</label>
          <p class="field-hint">
            Включите более динамичный макет для больших экранов, отображающий изображения и описания рядом с названиями и ценами.
          </p>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="profile.wideView" />
          <span class="slider round"></span>
        </label>
      </div>

    </div>

    <!-- Заглушки для остальных вкладок -->
    <div v-else class="settings-content placeholder-tab">
      <div class="settings-card">
        <p>Раздел находится в разработке.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  businessName?: string;
  businessSlug?: string;
  timezone: string;
  language: string;
  wideView: boolean;
}

const props = withDefaults(
  defineProps<{
    profile: UserProfile;
    initialSubTab?: string;
  }>(),
  {
    initialSubTab: 'profile',
  }
);

const emit = defineEmits(['close', 'save']);

const activeSubTab = ref(props.initialSubTab);

const saveProfile = () => {
  emit('save', props.profile);
  alert('Профиль успешно обновлен!');
};
</script>

<style scoped>
.settings-view {
  max-width: 680px;
  margin: 0 auto;
  font-family: inherit;
  color: #111827;
}

.settings-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.settings-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.settings-tab-btn {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s ease;
}

.settings-tab-btn:hover {
  background: #f9fafb;
}

.settings-tab-btn.active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.btn-update-profile {
  background: #9D0D0E; /* Акцентный оранжевый цвет бренда */
  color: #ffffff;
  border: none;
  padding: 9px 22px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-update-profile:hover {
  background: #e64d00;
}

.settings-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #f3f4f6;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #111827;
}

.settings-card.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label, .toggle-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
}

.label-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-hint {
  font-size: 11px;
  color: #9D0D0E;
  cursor: pointer;
}

.form-group input, 
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  font-size: 14px;
  color: #111827;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, background-color 0.2s;
}

.form-group input:focus, 
.form-group select:focus {
  border-color: #9D0D0E;
  background-color: #ffffff;
}

.disabled-input {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
  cursor: not-allowed;
}

/* Группы для инпутов с префиксами (Телефон, URL) */
.phone-input-group,
.url-input-group {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  overflow: hidden;
}

.phone-input-group:focus-within,
.url-input-group:focus-within {
  border-color: #9D0D0E;
  background-color: #ffffff;
}

.phone-prefix,
.url-prefix {
  padding: 10px 0 10px 14px;
  font-size: 14px;
  color: #6b7280;
  white-space: nowrap;
  user-select: none;
}

.phone-input-group input,
.url-input-group input {
  border: none;
  background: transparent;
  padding-left: 8px;
}

.phone-input-group input:focus,
.url-input-group input:focus {
  border: none;
  box-shadow: none;
}

.field-hint {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  margin-top: 4px;
}

/* SWITCH TOGGLE */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #e5e7eb;
  transition: .3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background-color: #9D0D0E;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

.placeholder-tab {
  text-align: center;
  color: #6b7280;
  padding: 40px 0;
}
</style>