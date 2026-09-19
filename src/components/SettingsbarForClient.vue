<template>
  <div>
    <!-- Нижняя панель настроек -->
    <div class="floating-settings-bar" :style="{ backgroundColor: primaryColor || secondaryColor || '#9D0D0E' }">
      <button class="fs-icon-btn" @click="$emit('open', 'language')" title="Выбор языка">
        <Languages :size="20" stroke-width="2"/>
      </button>
      <div class="fs-divider"></div>

      <button class="fs-icon-btn" @click="$emit('open', 'filters')" title="Фильтры">
        <SlidersHorizontal :size="20" stroke-width="2"/>
      </button>
      <div class="fs-divider"></div>

      <button class="fs-icon-btn" @click="$emit('open', 'share')" title="Поделиться">
        <Share2 :size="20" stroke-width="2"/>
      </button>
      <div class="fs-divider"></div>

      <button class="fs-icon-btn" @click="$emit('toggle-view')" title="Режим отображения">
        <component :is="viewMode === 'list' ? LayoutGrid : (viewMode === 'grid' ? Square : List)" :size="20" stroke-width="2" />
      </button>
      <div class="fs-divider"></div>

      <button class="fs-icon-btn" @click="$emit('open', 'search')" title="Поиск">
        <Search :size="20" stroke-width="2"/>
      </button>
    </div>

    <!-- МОДАЛЬНОЕ ОКНО: КОРЗИНА -->
    <div v-if="activeModal === 'cart'" class="bottom-sheet-overlay" :class="{ 'theme-light': restaurantInfo.isDarkMode === false }" @click.self="$emit('close')">
      <div class="bottom-sheet">
        <div class="sheet-indicator"></div>
        <div class="sheet-header-flex">
          <h3>{{ tDyn('Ваш заказ') }}</h3>
          <button class="clear-filters-text-btn" @click="$emit('clear-cart')">{{ tDyn('Очистить') }}</button>
        </div>
        <div class="cart-items-list" style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
          <div v-for="cItem in cartItems" :key="cItem.id" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11px; font-weight: bold;">{{ getItemName(cItem) }}</div>
              <div style="font-size: 10px; color: #888;">{{ (cItem.price * cItem.quantity).toFixed(2) }} ₽</div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button @click="$emit('decrease', cItem.id)" style="padding: 2px 6px;">-</button>
              <span style="font-size: 11px;">{{ cItem.quantity }}</span>
              <button @click="$emit('increase', cItem.id)" style="padding: 2px 6px;">+</button>
            </div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; margin-top: 6px;">
          <span>{{ tDyn('Итого:') }}</span>
          <span>{{ totalPrice.toFixed(2) }} ₽</span>
        </div>
        <button class="show-results-btn" :style="{ backgroundColor: primaryColor || '#9D0D0E', color: '#fff' }" @click="$emit('checkout')">{{ tDyn('Оформить заказ') }}</button>
      </div>
    </div>

    <!-- МОДАЛЬНОЕ ОКНО: ЯЗЫК -->
    <LanguageModal 
      v-if="activeModal === 'language'"
      :current-lang="currentLang"
      :primary-color="primaryColor"
      :is-dark-mode="restaurantInfo.isDarkMode"
      title="Выберите язык"
      @close="$emit('close')"
      @select="(lang) => $emit('select-lang', lang)"
    />

    <!-- МОДАЛЬНОЕ ОКНО: ФИЛЬТРЫ -->
    <div v-if="activeModal === 'filters'" class="bottom-sheet-overlay" :class="{ 'theme-light': restaurantInfo.isDarkMode === false }" @click.self="$emit('close')">
      <div class="bottom-sheet">
        <div class="sheet-indicator"></div>
        <div class="sheet-header-flex">
          <h3>{{ tDyn('Фильтры') }}</h3>
          <button class="clear-filters-text-btn" @click="$emit('clear-filters')">{{ tDyn('Очистить') }}</button>
        </div>
        
        <div style="font-size: 11px; font-weight: bold; margin-top: 4px;">{{ tDyn('Пищевая ценность') }}</div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
          <template v-for="f in [
            { key: 'nutFree', icon: '🥜', label: 'Без орехов' },
            { key: 'glutenFree', icon: '🌾', label: 'Без глютена' },
            { key: 'vegetarian', icon: '🥗', label: 'Вегетарианское' },
            { key: 'vegan', icon: '🌱', label: 'Веганское' }
          ]" :key="f.key">
            <button 
              v-if="!restaurantInfo?.filterSettings || restaurantInfo.filterSettings[f.key] !== false"
              class="filter-option-btn" 
              :class="{ active: selectedFilters.includes(f.key) }"
              :style="selectedFilters.includes(f.key) ? { borderColor: primaryColor, backgroundColor: primaryColor, color: '#fff' } : {}"
              @click="$emit('toggle-filter', f.key)"
            >
              {{ f.icon }} {{ tDyn(f.label) }}
            </button>
          </template>
        </div>
<button class="show-results-btn" :style="{ backgroundColor: primaryColor || '#9D0D0E', color: '#fff', marginTop: '8px' }" @click="$emit('close')">{{ tDyn('Показать результаты') }}</button>
        <div class="modal-footer-text">© Проект от Web-Visual-World | 2024</div>
      </div>
    </div>

    <!-- МОДАЛЬНОЕ ОКНО: ПОДЕЛИТЬСЯ -->
    <div v-if="activeModal === 'share'" class="bottom-sheet-overlay" :class="{ 'theme-light': restaurantInfo.isDarkMode === false }" @click.self="$emit('close')">
      <div class="bottom-sheet share-sheet">
        <div class="sheet-indicator"></div>
        <div class="share-modal-header">
          <h3>{{ tDyn('Поделиться ссылкой') }}</h3>
          <button class="close-modal-x" @click="$emit('close')">✕</button>
        </div>

        <!-- Карточка-превью меню -->
        <div class="share-preview-card">
          <img v-if="restaurantInfo.coverImage" :src="restaurantInfo.coverImage" alt="Cover" class="share-card-img" />
          <div v-else class="share-card-placeholder">🍽️</div>
          <div class="share-card-info">
            <span class="share-card-url">{{ fullShareUrl }}</span>
            <span class="share-card-desc">{{ tDyn('Меню ресторана ·') }} {{ restaurantInfo.name || 'Jazzve' }}</span>
          </div>
        </div>

        <div class="share-section-title">{{ tDyn('Поделиться с помощью') }}</div>
        
        <div class="share-social-grid">
          <button class="social-btn" @click="shareTo('telegram')">
            <Send :size="18" class="social-lucide-icon tg" stroke-width="2"/> Telegram
          </button>
          <button class="social-btn" @click="shareTo('whatsapp')">
            <PhoneCall :size="18" class="social-lucide-icon wa" stroke-width="2"/> WhatsApp
          </button>
          <button class="social-btn" @click="openStoryPreview">
            <Instagram :size="18" class="social-lucide-icon ins" stroke-width="2"/> {{ tDyn('Сторис') }}
          </button>
          <button class="social-btn" @click="shareTo('vk')">
            <Share2 :size="18" class="social-lucide-icon vk" stroke-width="2"/> VK
          </button>
          <button class="social-btn" @click="shareTo('facebook')">
            <Facebook :size="18" class="social-lucide-icon fb" stroke-width="2"/> Facebook
          </button>
          <button class="social-btn" @click="shareTo('max')">
            <Globe :size="18" class="social-lucide-icon max" stroke-width="2"/> Max
          </button>
          <button class="social-btn" @click="shareTo('gmail')">
            <Mail :size="18" class="social-lucide-icon gm" stroke-width="2"/> Gmail
          </button>
          <button class="social-btn" @click="copyLink">
            <Copy :size="18" class="social-lucide-icon cp" stroke-width="2"/> Скопировать ссылку
          </button>
        </div>
      </div>
    </div>

    <!-- МОДАЛЬНОЕ ОКНО: ИНТЕРАКТИВНОЕ ПРЕВЬЮ СТОРИС -->
    <div v-if="activeModal === 'story-preview'" class="bottom-sheet-overlay" :class="{ 'theme-light': restaurantInfo.isDarkMode === false }" @click.self="$emit('close')">
      <div class="bottom-sheet story-preview-sheet">
        <div class="sheet-indicator"></div>
        <div class="share-modal-header">
          <h3>Шаблон для Instagram Сторис</h3>
          <button class="close-modal-x" @click="$emit('open', 'share')">✕</button>
        </div>

        <!-- Мини-макет сторис прямо в окне -->
        <div class="story-mockup-container" :style="{ borderColor: primaryColor || '#9D0D0E' }">
          <div class="story-mockup-content">
            <span class="story-mockup-tag">МЕНЮ РЕСТОРАНА</span>
            <span class="story-mockup-title" :style="{ color: primaryColor || '#9D0D0E' }">
              {{ restaurantInfo.name || 'Jazzve' }}
            </span>
            <span class="story-mockup-hint">Переходите по ссылке в профиле или сканируйте</span>
          </div>
        </div>

        <!-- Инструкция -->
        <p class="story-instruction">
          1. Нажмите кнопку ниже, чтобы скачать макет.<br>
          2. Откройте <b>Instagram</b> -> Создайте Сторис -> Выберите картинку из галереи.
        </p>

        <!-- Кнопка скачивания -->
        <button class="show-results-btn" :style="{ backgroundColor: primaryColor || '#9D0D0E', color: '#fff' }" @click="downloadStoryImage">
          📥 Скачать картинку для Instagram
        </button>
      </div>
    </div>

    <!-- МОДАЛЬНОЕ ОКНО: ПОИСК -->
    <div v-if="activeModal === 'search'" class="bottom-sheet-overlay" :class="{ 'theme-light': restaurantInfo.isDarkMode === false }" @click.self="$emit('close')">
      <div class="bottom-sheet">
        <div class="sheet-indicator"></div>
        <h3>Поиск по меню</h3>
        <input 
          type="text" 
          :value="searchQuery" 
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)" 
          placeholder="Введите название блюда..." 
          class="search-input"
        />
        <button class="show-results-btn" :style="{ backgroundColor: primaryColor || '#9D0D0E', color: '#fff', marginTop: '8px' }" @click="$emit('close')">Найти</button>
      </div>
    </div>

    <!-- Кастомное уведомление -->
    <transition name="fade">
      <div v-if="showNotification" class="toast-notification">
        {{ notificationText }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  Languages, SlidersHorizontal, Share2, LayoutGrid, List, Search, Square, 
  Send, PhoneCall, Instagram, Facebook, Globe, Mail, Copy 
} from 'lucide-vue-next';
import LanguageModal from './LanguageModal.vue';

export interface Props {
  activeModal: string;
  primaryColor: string;
  secondaryColor: string;
  viewMode: 'grid' | 'list';
  currentLang: string;
  cartItems: any[];
  totalPrice: number;
  searchQuery: string;
  selectedFilters: string[];
  restaurantInfo: any;
  getItemName: (item: any) => string;
  tDyn?: (key: string) => string;
  restaurantName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tDyn: (key: string) => key,
  restaurantName: 'Restaurant'
});

const emit = defineEmits([
  'open', 'close', 'toggle-view', 'select-lang', 'clear-cart', 
  'increase', 'decrease', 'checkout', 'toggle-filter', 'clear-filters', 'update:searchQuery'
]);

const fullShareUrl = window.location.href;
const showNotification = ref(false);
const notificationText = ref('Ссылка скопирована в буфер обмена!');

const showToast = (text: string) => {
  notificationText.value = text;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 2500);
};

const copyLink = () => {
  navigator.clipboard.writeText(fullShareUrl).then(() => {
    showToast('Ссылка скопирована в буфер обмена!');
  });
};

const openStoryPreview = () => {
  emit('open', 'story-preview');
};

const downloadStoryImage = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
  gradient.addColorStop(0, '#1e1e1e');
  gradient.addColorStop(1, '#111111');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('МЕНЮ РЕСТОРАНА', 540, 700);

  ctx.fillStyle = props.primaryColor || '#9D0D0E';
  ctx.font = 'bold 84px sans-serif';
  ctx.fillText(props.restaurantInfo.name || 'Jazzve', 540, 820);

  ctx.fillStyle = '#aaaaaa';
  ctx.font = '38px sans-serif';
  ctx.fillText('Переходите по ссылке в профиле или сканируйте', 540, 1100);

  const link = document.createElement('a');
  link.download = 'instagram-story-menu.png';
  link.href = canvas.toDataURL('image/png');
  link.click();

  showToast('Картинка скачана! Откройте Instagram -> Создайте Сторис -> Выберите из галереи');
};

const shareTo = (platform: string) => {
  const url = encodeURIComponent(fullShareUrl);
  const text = encodeURIComponent('Посмотрите меню ресторана ' + (props.restaurantInfo.name || 'Jazzve'));
  
  if (platform === 'telegram') {
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  } else if (platform === 'whatsapp') {
    window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
  } else if (platform === 'vk') {
    window.open(`https://vk.com/share.php?url=${url}&title=${text}`, '_blank');
  } else if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  } else if (platform === 'max') {
    window.open('https://max.ru', '_blank');
  } else if (platform === 'gmail') {
    window.open(`mailto:?subject=${text}&body=${url}`);
  } else {
    copyLink();
  }
};
</script>

<style scoped>
/* Стили для панели и модалок */
.floating-settings-bar {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  color: white;
  border-radius: 24px;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
  z-index: 15;
  box-sizing: border-box;
}
.fs-icon-btn {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  flex: 1;
  min-width: 0;
  transition: transform 0.1s ease;
}
.fs-divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin: 0 4px;
}
.bottom-sheet-overlay, .share-modal-overlay {
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
  --modal-title-text: #ccc;
  --modal-story-bg: linear-gradient(135deg, #1e1e1e, #111111);
  --modal-story-instr-bg: #252525;
}

.bottom-sheet-overlay.theme-light, .share-modal-overlay.theme-light {
  --modal-bg: #ffffff;
  --modal-text: #171717;
  --modal-indicator: #e5e5e5;
  --modal-btn-bg: #f5f5f5;
  --modal-btn-border: #e0e0e0;
  --modal-btn-text: #171717;
  --modal-secondary-text: #666;
  --modal-title-text: #444;
  --modal-story-bg: linear-gradient(135deg, #f0f0f0, #ffffff);
  --modal-story-instr-bg: #f9f9f9;
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
.sheet-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sheet-header-flex h3, .bottom-sheet h3 {
  font-size: 13px;
  margin: 0;
  color: #9D0D0E;
}
.clear-filters-text-btn {
  background: transparent;
  border: none;
  color: var(--modal-secondary-text);
  font-size: 10px;
  cursor: pointer;
  text-decoration: underline;
}
.show-results-btn, .filter-option-btn {
  background: var(--modal-btn-bg);
  color: var(--modal-btn-text);
  border: 1px solid var(--modal-btn-border);
  border-radius: 8px;
  padding: 8px;
  font-size: 10px;
  cursor: pointer;
  text-align: left;
}
.search-input {
  width: 100%;
  padding: 6px;
  font-size: 10px;
  border-radius: 6px;
  border: 1px solid var(--modal-btn-border);
  background: var(--modal-btn-bg);
  color: var(--modal-btn-text);
  margin-top: 6px;
  box-sizing: border-box;
}
.show-results-btn {
  border: none;
  text-align: center;
  font-weight: bold;
}
.modal-footer-text {
  text-align: center;
  font-size: 8px;
  color: var(--modal-secondary-text);
  margin-top: 4px;
}
/* Стили для расширенного окна «Поделиться» */
.windows-share-dialog {
  background: var(--modal-bg);
  color: var(--modal-text);
  width: 100%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}
.share-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close-modal-x {
  background: none;
  border: none;
  color: var(--modal-secondary-text);
  cursor: pointer;
  font-size: 14px;
}
.share-preview-card {
  background: var(--modal-btn-bg);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 4px 0;
  border: 1px solid var(--modal-btn-border);
}
.share-card-img, .share-card-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--modal-indicator);
}
.share-card-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.share-card-url {
  font-size: 10px;
  color: var(--modal-btn-text);
  font-weight: bold;
}
.share-card-desc {
  font-size: 9px;
  color: var(--modal-secondary-text);
}
.share-section-title {
  font-size: 11px;
  font-weight: bold;
  margin-top: 4px;
  color: var(--modal-title-text);
}
.share-social-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 4px;
}
.social-btn {
  background: var(--modal-btn-bg);
  border: 1px solid var(--modal-btn-border);
  border-radius: 8px;
  padding: 6px 4px;
  color: var(--modal-btn-text);
  font-size: 9px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.social-btn:hover {
  opacity: 0.8;
}
.social-lucide-icon {
  margin-bottom: 2px;
}

/* Стили для интерактивного превью сторис */
.story-mockup-container {
  width: 100%;
  height: 140px;
  background: var(--modal-story-bg);
  border-radius: 10px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
}
.story-mockup-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.story-mockup-tag {
  font-size: 8px;
  color: var(--modal-secondary-text);
  letter-spacing: 1px;
}
.story-mockup-title {
  font-size: 16px;
  font-weight: bold;
}
.story-mockup-hint {
  font-size: 7px;
  color: var(--modal-secondary-text);
}
.story-instruction {
  font-size: 9px;
  color: var(--modal-secondary-text);
  margin: 4px 0;
  line-height: 1.3;
  background: var(--modal-story-instr-bg);
  padding: 8px;
  border-radius: 6px;
}

/* Всплывающее уведомление (Toast) */
.toast-notification {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 30, 30, 0.95);
  color: #fff;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 11px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 1000;
  pointer-events: none;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>

```