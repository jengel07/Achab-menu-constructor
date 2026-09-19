<script setup lang="ts">
import { useMenuStore } from '../store/menuStore';

const store = useMenuStore();
</script>

<template>
  <div class="general-settings">
    <h3>Общие данные</h3>

    <!-- Переключатель Wi-Fi -->
    <div class="wifi-toggle-container">
      <div class="toggle-header">
        <label>Включить Wi-Fi</label>
        <input type="checkbox" v-model="store.generalSettings.wifiEnabled" />
      </div>
      <p class="description">
        Позвольте вашим клиентам подключаться к вашей сети Wi-Fi. 
        Если вы отключите эту функцию, кнопка Wi-Fi не будет отображаться.
      </p>
    </div>

    <!-- Поля Wi-Fi отображаются только если функция включена -->
    <div v-if="store.generalSettings.wifiEnabled" class="wifi-fields">
      <div class="form-group">
        <label>Название сети (SSID)</label>
        <input 
          type="text" 
          v-model="store.generalSettings.wifiSsid" 
          placeholder="Введите название вашей сети" 
        />
      </div>
      <div class="form-group">
        <label>Пароль</label>
        <input 
          type="text" 
          v-model="store.generalSettings.wifiPassword" 
          placeholder="Введите ваш пароль" 
        />
      </div>
    </div>

    <!-- Ссылка на Яндекс Отзывы -->
    <div class="form-group" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
      <label>Ссылка на Яндекс Отзывы (появляется при оценке 4-5 звезд)</label>
      <input 
        type="text" 
        v-model="store.generalSettings.yandexReviewLink" 
        placeholder="Например: https://yandex.ru/maps/org/..." 
        style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #ddd; font-size: 14px;"
      />
      <p class="description" style="margin-top: 6px; font-size: 12px; color: #777;">
        Если клиент поставит 4 или 5 звезд при оформлении заказа, ему будет предложена кнопка "Оставить отзыв на Яндекс Картах".
      </p>
    </div>
  </div>
</template>

<style scoped>
.general-settings { display: flex; flex-direction: column; gap: 20px; padding: 16px; }
.general-settings h3 { color: var(--text-main); }
.form-group { margin-top: 15px; }
.form-group label { display: block; margin-bottom: 8px; color: var(--text-muted, #a0a0a0); font-size: 14px; }

.wifi-toggle-container { background: var(--card-bg, #d7d7d761); border: 1px solid var(--border-color, #333); padding: 15px; border-radius: 8px; }
.toggle-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.toggle-header label { font-weight: bold; color: var(--text-main); }
.description { font-size: 12px; color: var(--text-muted, #777); margin: 0; line-height: 1.4; }

input[type="text"] { 
  width: 100%; padding: 12px; background: var(--input-bg, #d7d7d761); border: 1px solid var(--border-color, #333); 
  border-radius: 8px; color: var(--text-main); box-sizing: border-box; 
}
input[type="text"]:focus { border-color: #9D0D0E; outline: none; }
</style>