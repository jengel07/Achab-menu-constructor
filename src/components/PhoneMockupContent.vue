<template>
  <div class="preview-container">
    <!-- Полноэкранный режим превью, если открыто -->
    <div v-if="isFullscreenPreview" class="fullscreen-preview-overlay">
      <div class="fullscreen-preview-header">
        <span>📱 Мобильное превью меню</span>
        <button class="close-fullscreen-btn" @click="isFullscreenPreview = false">✕ Закрыть предпросмотр</button>
      </div>
      <div class="fullscreen-phone-wrapper">
        <div class="phone-mockup fullscreen-mode">
          <div class="phone-screen">
            <!-- Тот же самый контент телефона -->
            <template v-if="currentScreen === 'menu'">
              <div class="phone-body" @scroll="handlePhoneScroll" :style="{ backgroundColor: currentRestaurantInfo.backgroundColor, color: currentRestaurantInfo.textColor }">
            <div class="phone-header" @click="triggerFileUpload('cover')" :style="{ 
                cursor: 'pointer', 
                backgroundColor: currentRestaurantInfo.secondaryColor, 
                backgroundImage: currentRestaurantInfo.coverImage 
                  ? (currentRestaurantInfo.showCoverGradient !== false 
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${currentRestaurantInfo.coverImage})` 
                    : `url(${currentRestaurantInfo.coverImage})`) 
                  : 'none', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
              }">
                <div class="phone-avatar-wrapper">
                  <div class="phone-avatar-placeholder" @click.stop="triggerFileUpload('avatar')" style="cursor: pointer;">
                    <span v-if="!currentRestaurantInfo.avatarImage">🍽️</span>
                    <img v-else :src="currentRestaurantInfo.avatarImage" alt="Аватар" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                </div>
                <div class="phone-logo">{{ currentRestaurantInfo.name || t('restaurantName') }}</div>
              </div>

                <div v-if="activeTab === 'qrcode'" class="phone-qr-preview">
                  <div 
                    class="qr-card-preview" 
                    :style="{ background: currentRestaurantInfo.qrSettings?.textBgColor || '#000000' }"
                  >
                    <div class="qr-box-preview" :style="{ background: currentRestaurantInfo.qrSettings?.bgColor || '#ffffff' }">
                      <QrcodeVue 
                        :value="shareUrl" 
                        :size="150" 
                        :background="currentRestaurantInfo.qrSettings?.bgColor || '#ffffff'" 
                        :foreground="currentRestaurantInfo.qrSettings?.squareColor || '#000000'" 
                        level="H" 
                      />
                    </div>
                    <div 
                      class="qr-label-preview" 
                      :style="{ 
                        color: currentRestaurantInfo.qrSettings?.textColor || '#ffffff',
                        fontFamily: currentRestaurantInfo.qrSettings?.fontFamily || 'Comfortaa'
                      }"
                    >
                      {{ currentRestaurantInfo.qrSettings?.text }}
                    </div>
                  </div>
                </div>
                
                <div v-else>
                  <div v-if="currentRestaurantInfo.isWifiEnabled" class="phone-wifi-btn" @click="isWifiExpanded = !isWifiExpanded">
                    <div class="wifi-icon-box">ℹ️</div>
                    <div class="wifi-label" :style="{ color: currentRestaurantInfo.textColor }">
                      <div class="title">{{ t('wifiTitle') }}</div>
                      <div v-if="isWifiExpanded" class="subtitle" style="margin-top: 5px;">
                        <div>{{ t('wifiNetwork') }}: {{ currentRestaurantInfo.wifiName || t('wifiNotSet') }}</div>
                        <div style="font-weight: bold; margin-top: 2px;">{{ t('wifiPassword') }}: {{ currentRestaurantInfo.wifiPassword }}</div>
                      </div>
                    </div>
                    <div class="chevron" :style="{ transform: isWifiExpanded ? 'rotate(90deg)' : 'rotate(0deg)', color: currentRestaurantInfo.textColor }">›</div>
                  </div>

                  <!-- Категории меню -->
                  <PromoBanners :restaurantId="computedRestaurantId" />
                    <div class="phone-categories">
                    <button 
                      class="phone-cat-badge" 
                      :class="{ active: selectedCategory === null }"
                      @click="selectedCategory = null"
                      :style="{ backgroundColor: selectedCategory === null ? currentRestaurantInfo.primaryColor : 'rgba(255,255,255,0.1)' }"
                    >
                      {{ t('allCategories') }}
                    </button>
                    <button 
                      v-for="cat in currentCategories" 
                      :key="cat.id" 
                      class="phone-cat-badge" 
                      :class="{ active: selectedCategory === cat.name }"
                      @click="selectedCategory = selectedCategory === cat.name ? null : cat.name"
                      :style="{ backgroundColor: selectedCategory === cat.name ? currentRestaurantInfo.primaryColor : 'rgba(255,255,255,0.1)' }"
                    >
                      {{ getLocalizedCategoryName(cat.name) }}
                    </button>
                  </div>

                  <div v-if="filteredItems.length === 0" class="empty-search-notice">
                    {{ t('emptySearch') }}
                  </div>

                  <div v-else :class="viewMode === 'grid' ? 'menu-items-grid-phone' : (viewMode === 'full' ? 'menu-items-full-phone' : 'menu-items-list-phone')">
                    <div v-for="item in filteredItems" :key="item.id" :class="viewMode === 'grid' ? 'menu-card' : (viewMode === 'full' ? 'menu-card-full' : 'menu-list-row')">
                      <img v-if="viewMode === 'grid'" :src="item.image || 'placeholder.jpg'" alt="Блюдо" />
                      <div class="card-content">
                        <div class="card-text-block">
                          <h3>{{ getLocalizedItemName(item.name) }}</h3>
                          <span v-if="viewMode === 'list'" class="price" :style="{ color: currentRestaurantInfo.primaryColor || '#9D0D0E', whiteSpace: 'nowrap' }">
                            <template v-if="!item.priceBottle && !item.priceGlass">{{ Number(item.price || 0).toFixed(2) }} ₽</template>
                            <template v-else>{{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽</template>
                          </span>
                        </div>
                        <div class="card-bottom-row" style="flex-direction: column; gap: 8px;">
                          <span v-if="viewMode === 'grid' || viewMode === 'full'" class="price" :style="{ color: currentRestaurantInfo.primaryColor || '#9D0D0E', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' }">
                            <template v-if="!item.priceBottle && !item.priceGlass">
                              {{ Number(item.price || 0).toFixed(2) }} ₽
                            </template>
                            <template v-else>
                              {{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽
                            </template>
                          </span>
                          
                          <div v-if="!item.priceBottle && !item.priceGlass">
                            <div v-if="getItemQuantity(item.id) > 0" class="counter-controls" :style="{ borderColor: currentRestaurantInfo.primaryColor || '#9D0D0E' }">
                              <button class="counter-btn" @click="decreaseQuantity(item.id)">-</button>
                              <span class="counter-value">{{ getItemQuantity(item.id) }}</span>
                              <button class="counter-btn" @click="increaseQuantity(item.id)">+</button>
                            </div>
                            <button v-else class="add-to-cart-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor || '#9D0D0E', width: '100%', padding: '6px 12px' }" @click="item.modifiers && item.modifiers.length > 0 ? modifierItem = item : addToCart(item)">+ {{ item.modifiers && item.modifiers.length > 0 ? tDyn('опции') : tDyn('добавить') }}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <SettingsbarForClient 
                :primaryColor="currentRestaurantInfo.primaryColor"
                :secondaryColor="currentRestaurantInfo.secondaryColor"
                :currentLang="selectedLanguage"
                :viewMode="viewMode"
                :activeModal="activeModal"
                :cartItems="cartItems"
                :totalPrice="totalPrice"
                :searchQuery="searchQuery"
                :selectedFilters="selectedFilters"
                :restaurantInfo="currentRestaurantInfo"
                :getItemName="getLocalizedItemName"
                :tDyn="tDyn"
                @open="(m: any) => activeModal = m"
                @close="activeModal = 'none'"
                @toggle-view="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
                @select-lang="(lang: string) => selectedLanguage = lang"
                @clear-cart="cartItems = []"
                @increase="increaseQuantity"
                @decrease="decreaseQuantity"
                @checkout="handleCheckout"
                @toggle-filter="toggleFilter"
                @clear-filters="clearAllFilters"
                @update:searchQuery="(val: string) => searchQuery = val"
              />

              <div v-if="cartItems.length > 0 && activeModal !== 'cart'" class="floating-cart-bar" @click="activeModal = 'cart'" :style="{ backgroundColor: currentRestaurantInfo.primaryColor || '#10b981', zIndex: 20 }">
                <span class="cart-title">{{ tDyn('Посмотреть корзину') }}</span>
                <span class="cart-total">{{ totalPrice.toFixed(2) }} ₽</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Стандартная кнопка запуска превью в панели конструктора -->
    <button class="preview-copy-btn" @click="openPreview">🔗 Предпросмотр</button>
    
    <div class="phone-mockup">
      <div class="phone-screen">
        
        <!-- ЭКРАН МЕНЮ -->
        <template v-if="currentScreen === 'menu'">
          <div class="phone-body" @scroll="handlePhoneScroll" :style="{ backgroundColor: currentRestaurantInfo.backgroundColor, color: currentRestaurantInfo.textColor }">
          <div class="phone-header" @click="triggerFileUpload('cover')" :style="{ 
            cursor: 'pointer', 
            backgroundColor: currentRestaurantInfo.secondaryColor, 
            backgroundImage: currentRestaurantInfo.coverImage 
              ? (currentRestaurantInfo.showCoverGradient !== false 
                ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${currentRestaurantInfo.coverImage})` 
                : `url(${currentRestaurantInfo.coverImage})`) 
              : 'none', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }">
            <div class="phone-avatar-wrapper">
              <div class="phone-avatar-placeholder" @click.stop="triggerFileUpload('avatar')" style="cursor: pointer;">
                <span v-if="!currentRestaurantInfo.avatarImage">🍽️</span>
                <img v-else :src="currentRestaurantInfo.avatarImage" alt="Аватар" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            </div>
            <div class="phone-logo">{{ currentRestaurantInfo.name || t('restaurantName') }}</div>
          </div>

            <div v-if="activeTab === 'qrcode'" class="phone-qr-preview">
              <div 
                class="qr-card-preview" 
                :style="{ background: currentRestaurantInfo.qrSettings?.textBgColor || '#000000' }"
              >
                <div class="qr-box-preview" :style="{ background: currentRestaurantInfo.qrSettings?.bgColor || '#ffffff' }">
                  <QrcodeVue 
                    :value="shareUrl" 
                    :size="150" 
                    :background="currentRestaurantInfo.qrSettings?.bgColor || '#ffffff'" 
                    :foreground="currentRestaurantInfo.qrSettings?.squareColor || '#000000'" 
                    level="H" 
                  />
                </div>
                <div 
                  class="qr-label-preview" 
                  :style="{ 
                    color: currentRestaurantInfo.qrSettings?.textColor || '#ffffff',
                    fontFamily: currentRestaurantInfo.qrSettings?.fontFamily || 'Comfortaa'
                  }"
                >
                  {{ currentRestaurantInfo.qrSettings?.text }}
                </div>
              </div>
            </div>
            
            <div v-else>
              <div v-if="currentRestaurantInfo.isWifiEnabled" class="phone-wifi-btn" @click="isWifiExpanded = !isWifiExpanded">
                <div class="wifi-icon-box">ℹ️</div>
                <div class="wifi-label" :style="{ color: currentRestaurantInfo.textColor }">
                  <div class="title">{{ t('wifiTitle') }}</div>
                  <div v-if="isWifiExpanded" class="subtitle" style="margin-top: 5px;">
                    <div>{{ t('wifiNetwork') }}: {{ currentRestaurantInfo.wifiName || t('wifiNotSet') }}</div>
                    <div style="font-weight: bold; margin-top: 2px;">{{ t('wifiPassword') }}: {{ currentRestaurantInfo.wifiPassword }}</div>
                  </div>
                </div>
                <div class="chevron" :style="{ transform: isWifiExpanded ? 'rotate(90deg)' : 'rotate(0deg)', color: currentRestaurantInfo.textColor }">›</div>
              </div>

              <!-- Категории меню -->
              <PromoBanners :restaurantId="computedRestaurantId" />
                    <div class="phone-categories">
                <button 
                  class="phone-cat-badge" 
                  :class="{ active: selectedCategory === null }"
                  @click="selectedCategory = null"
                  :style="{ backgroundColor: selectedCategory === null ? currentRestaurantInfo.primaryColor : 'rgba(255,255,255,0.1)' }"
                >
                  {{ t('allCategories') }}
                </button>
                <button 
                  v-for="cat in currentCategories" 
                  :key="cat.id" 
                  class="phone-cat-badge" 
                  :class="{ active: selectedCategory === cat.name }"
                  @click="selectedCategory = selectedCategory === cat.name ? null : cat.name"
                  :style="{ backgroundColor: selectedCategory === cat.name ? currentRestaurantInfo.primaryColor : 'rgba(255,255,255,0.1)' }"
                >
                  {{ getLocalizedCategoryName(cat.name) }}
                </button>
              </div>

              <div v-if="filteredItems.length === 0" class="empty-search-notice">
                {{ t('emptySearch') }}
              </div>

              <div v-else :class="viewMode === 'grid' ? 'menu-items-grid-phone' : 'menu-items-list-phone'">
                <div v-for="item in filteredItems" :key="item.id" :class="viewMode === 'grid' ? 'menu-card' : 'menu-list-row'">
                  <img v-if="viewMode === 'grid'" :src="item.image || 'placeholder.jpg'" alt="Блюдо" />
                  <div class="card-content">
                    <div class="card-text-block">
                      <h3>{{ getLocalizedItemName(item.name) }}</h3>
                      <span v-if="viewMode === 'list'" class="price" :style="{ color: currentRestaurantInfo.primaryColor || '#9D0D0E', whiteSpace: 'nowrap' }">
                        <template v-if="!item.priceBottle && !item.priceGlass">{{ Number(item.price || 0).toFixed(2) }} ₽</template>
                        <template v-else>{{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽</template>
                      </span>
                    </div>
                    <div class="card-bottom-row" style="flex-direction: column; gap: 8px;">
                      <span v-if="viewMode === 'grid'" class="price" :style="{ color: currentRestaurantInfo.primaryColor || '#9D0D0E', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' }">
                        <template v-if="!item.priceBottle && !item.priceGlass">
                          {{ Number(item.price || 0).toFixed(2) }} ₽
                        </template>
                        <template v-else>
                          {{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽
                        </template>
                      </span>
                      
                      <div v-if="!item.priceBottle && !item.priceGlass">
                        <div v-if="getItemQuantity(item.id) > 0" class="counter-controls" :style="{ borderColor: currentRestaurantInfo.primaryColor || '#9D0D0E' }">
                          <button class="counter-btn" @click="decreaseQuantity(item.id)">-</button>
                          <span class="counter-value">{{ getItemQuantity(item.id) }}</span>
                          <button class="counter-btn" @click="increaseQuantity(item.id)">+</button>
                        </div>
                        <button v-else class="add-to-cart-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor || '#9D0D0E', width: '100%', padding: '6px 12px' }" @click="item.modifiers && item.modifiers.length > 0 ? modifierItem = item : addToCart(item)">+ {{ item.modifiers && item.modifiers.length > 0 ? tDyn('опции') : tDyn('добавить') }}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SettingsbarForClient 
            :primaryColor="currentRestaurantInfo.primaryColor"
            :secondaryColor="currentRestaurantInfo.secondaryColor"
            :currentLang="selectedLanguage"
            :viewMode="viewMode"
            :activeModal="activeModal"
            :cartItems="cartItems"
            :totalPrice="totalPrice"
            :searchQuery="searchQuery"
            :selectedFilters="selectedFilters"
            :restaurantInfo="currentRestaurantInfo"
            :getItemName="getLocalizedItemName"
            :tDyn="tDyn"
            @open="(m: any) => activeModal = m"
            @close="activeModal = 'none'"
            @toggle-view="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
            @select-lang="(lang: string) => selectedLanguage = lang"
            @clear-cart="cartItems = []"
            @increase="increaseQuantity"
            @decrease="decreaseQuantity"
            @checkout="handleCheckout"
            @toggle-filter="toggleFilter"
            @clear-filters="clearAllFilters"
            @update:searchQuery="(val: string) => searchQuery = val"
          />

          <div v-if="cartItems.length > 0 && activeModal !== 'cart'" class="floating-cart-bar" @click="activeModal = 'cart'" :style="{ backgroundColor: currentRestaurantInfo.primaryColor || '#10b981', zIndex: 20 }">
            <span class="cart-title">{{ tDyn('Посмотреть корзину') }}</span>
            <span class="cart-total">{{ totalPrice.toFixed(2) }} ₽</span>
          </div>
        </template>

        <!-- ЭКРАН КОРЗИНЫ -->
        <template v-else-if="currentScreen === 'cart'">
          <div class="cart-screen-header">
            <button class="cart-close-btn" @click="currentScreen = 'menu'">✕</button>
            <h2>{{ t('cartHeader') }}</h2>
            <button class="cart-clear-all-btn" @click="cartItems = []">🗑️</button>
          </div>

          <div class="cart-screen-body">
            <div class="closed-notice" v-html="t('closedNotice')"></div>

            <div class="cart-items-list">
              <div v-for="item in cartItems" :key="item.id" class="cart-item-row">
                <div class="cart-item-info">
                  <div class="cart-item-name">{{ getLocalizedItemName(item.name) }}</div>
                  <div class="cart-item-price">RUB {{ (item.price * item.quantity).toFixed(2) }}</div>
                </div>
                <div class="cart-item-actions" :style="{ backgroundColor: currentRestaurantInfo.primaryColor }">
                  <button @click="decreaseQuantity(item.id)">🗑️</button>
                  <span class="cart-item-qty">{{ item.quantity }}</span>
                  <button @click="increaseQuantity(item.id)">+</button>
                </div>
              </div>
            </div>

            <button @click="handleCheckout" class="checkout-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor }" style="width: 100%; margin-top: 16px; padding: 12px; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              Оформить заказ
            </button>

            <div class="add-more-link" @click="currentScreen = 'menu'" style="margin-top: 12px; text-align: center; cursor: pointer;">
              {{ t('addMore') }}
            </div>
          </div>

          <div class="cart-screen-footer">
            <div class="subtotal-row">
              <span>{{ t('subtotal') }}</span>
              <span class="subtotal-sum">RUB {{ totalPrice.toFixed(2) }}</span>
            </div>
            <div class="powered-by">{{ t('poweredBy') }}</div>
          </div>
        </template>

      </div>
    </div>
  </div>

  <ClientModifiersModal 
    v-if="modifierItem" 
    :item="modifierItem" 
    :restaurantInfo="currentRestaurantInfo" 
    @close="modifierItem = null" 
    @add-to-cart="(finalItem) => { addToCart(finalItem); modifierItem = null; }" 
  />
</template>

<script setup lang="ts">
import ClientModifiersModal from './ClientModifiersModal.vue';
import { ref, computed, reactive } from 'vue';

const computedRestaurantId = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return props.restaurantInfo?.id || props.restaurantInfo?.restaurantId || user.restaurantId;
  } catch (e) {
    return props.restaurantInfo?.id || props.restaurantInfo?.restaurantId;
  }
});
import QrcodeVue from 'qrcode.vue';
import PromoBanners from './client/PromoBanners.vue';

import SettingsbarForClient from './SettingsbarForClient.vue';




const handleCheckout = () => {
  if (cartItems.value.length === 0) return;
  
  cartItems.value = [];
  currentScreen.value = 'menu';
  alert('Заказ успешно оформлен и отправлен в дашборд!');
};

const props = defineProps<{
  restaurantInfo?: any;
  items?: any[];
  categories?: any[];
}>();

// Реактивные локальные данные с подстраховкой из localStorage для режима превью
const savedRestaurantInfo = localStorage.getItem('preview_restaurantInfo');
const savedItems = localStorage.getItem('preview_items');
const savedCategories = localStorage.getItem('preview_categories');

const currentRestaurantInfo = computed(() => {
  if (props.restaurantInfo && Object.keys(props.restaurantInfo).length > 0) {
    return props.restaurantInfo;
  }
  if (savedRestaurantInfo) {
    try { return JSON.parse(savedRestaurantInfo); } catch { /* ignore */ }
  }
  return {};
});

const currentItems = computed(() => {
  if (props.items && props.items.length > 0) {
    return props.items;
  }
  if (savedItems) {
    try { return JSON.parse(savedItems); } catch { /* ignore */ }
  }
  return [];
});

const currentCategories = computed(() => {
  if (props.categories && props.categories.length > 0) {
    return props.categories;
  }
  if (savedCategories) {
    try { return JSON.parse(savedCategories); } catch { /* ignore */ }
  }
  return [];
});

const currentScreen = ref<'menu' | 'cart'>('menu');
const activeTab = ref<'menu' | 'qrcode'>('menu');
const modifierItem = ref<any>(null);
const activeModal = ref<'none' | 'language' | 'search' | 'filters' | 'share' | 'cart' | 'checkout'>('none');
const viewMode = ref<'grid' | 'list'>('grid');
const selectedCategory = ref<string | null>(null);
const searchQuery = ref('');
const selectedLanguage = ref('Русский');
const selectedFilters = ref<string[]>([]);
const isWifiExpanded = ref(false);
const shareUrl = ref(window.location.origin);
const isFullscreenPreview = ref(false);

const cartItems = ref<any[]>([]);

const translations: Record<string, Record<string, string>> = {
  'Русский': {
    restaurantName: 'Мой Ресторан',
    wifiTitle: 'Информация WiFi',
    wifiNetwork: 'Сеть',
    wifiPassword: 'Пароль',
    wifiNotSet: 'Не задано',
    addBtn: '+ добавить',
    cartTitle: 'Посмотреть корзину',
    subtotal: 'Подытог',
    closedNotice: 'Мы сейчас закрыты.<br>Откроемся в понедельник.',
    addMore: '+ Добавить еще товары',
    cartHeader: 'Корзина',
    langTitle: 'Язык',
    filtersTitle: 'Фильтры',
    searchTitle: 'Поиск по меню',
    searchPlaceholder: 'Введите название блюда...',
    emptySearch: 'Ничего не найдено',
    nutritionTitle: 'Питание',
    clearFilters: 'очистить',
    showResults: 'Показать результаты',
    categoriesTitle: 'Категории',
    allCategories: 'Все категории',
    poweredBy: '© Проект от Web-Visual-World | 2024'
  },
  'English': {
    restaurantName: 'My Restaurant',
    wifiTitle: 'WiFi Information',
    wifiNetwork: 'Network',
    wifiPassword: 'Password',
    wifiNotSet: 'Not set',
    addBtn: '+ add',
    cartTitle: 'View Cart',
    subtotal: 'Subtotal',
    closedNotice: 'We are currently closed.<br>We will open on Monday.',
    addMore: '+ Add more items',
    cartHeader: 'Cart',
    langTitle: 'Language',
    filtersTitle: 'Filters',
    searchTitle: 'Search menu',
    searchPlaceholder: 'Enter dish name...',
    emptySearch: 'Nothing found',
    nutritionTitle: 'Dietary',
    clearFilters: 'clear',
    showResults: 'Show results',
    categoriesTitle: 'Categories',
    allCategories: 'All categories',
    poweredBy: '© Проект от Web-Visual-World | 2024'
  },
  'Deutsch': {
    restaurantName: 'Mein Restaurant',
    wifiTitle: 'WiFi Information',
    wifiNetwork: 'Netzwerk',
    wifiPassword: 'Passwort',
    wifiNotSet: 'Nicht festgelegt',
    addBtn: '+ hinzufügen',
    cartTitle: 'Warenkorb ansehen',
    subtotal: 'Zwischensumme',
    closedNotice: 'Wir haben derzeit geschlossen.<br>Wir öffnen am Montag.',
    addMore: '+ Weitere Artikel hinzufügen',
    cartHeader: 'Warenkorb',
    langTitle: 'Sprache',
    filtersTitle: 'Filter',
    searchTitle: 'Menü durchsuchen',
    searchPlaceholder: 'Gericht eingeben...',
    emptySearch: 'Nichts gefunden',
    nutritionTitle: 'Ernährung',
    clearFilters: 'löschen',
    showResults: 'Ergebnisse anzeigen',
    categoriesTitle: 'Kategorien',
    allCategories: 'Alle Kategorien',
    poweredBy: '© Проект от Web-Visual-World | 2024'
  },
  'Аҧсшәа': {
    restaurantName: 'Аресторан',
    wifiTitle: 'Wi-Fi Информация',
    wifiNetwork: 'Ашьаҭа',
    wifiPassword: 'Ажәамаҵәа',
    wifiNotSet: 'Иҟазҵам',
    addBtn: '+ аҿыц',
    cartTitle: 'Акарзина ахәаԥшра',
    subtotal: 'Абжьара',
    closedNotice: 'Ҳара ҳаҷы зҵәоуп.<br>Ашәахьа аартхоит.',
    addMore: '+ Иацҵатәуп атоварқәа',
    cartHeader: 'Акарзина',
    langTitle: 'Абызшәа',
    filtersTitle: 'Афильтрқәа',
    searchTitle: 'Аҧшаара',
    searchPlaceholder: 'Иҧшаа аџьынџь...',
    emptySearch: 'Даҽаԥшаам',
    nutritionTitle: 'Адырҩара',
    clearFilters: 'иқәгатәуп',
    showResults: 'Аихьӡарақәа аарԥштәуп',
    categoriesTitle: 'Акатегориақәа',
    allCategories: 'Зегьы акатегориақәа',
    poweredBy: '© Проект от Web-Visual-World | 2024'
  }
};

const dishTranslations: Record<string, Record<string, { name: string, category: string }>> = {
  'Том Ям': {
    'Русский': { name: 'Том Ям', category: 'Основные блюда' },
    'English': { name: 'Tom Yum', category: 'Main dishes' },
    'Deutsch': { name: 'Tom Yam', category: 'Hauptgerichte' },
    'Аҧсшәа': { name: 'Атом Иам', category: 'Ихадоу аџьынџьқәа' }
  },
  'Картошка фри': {
    'Русский': { name: 'Картошка фри', category: 'Основные блюда' },
    'English': { name: 'French Fries', category: 'Main dishes' },
    'Deutsch': { name: 'Pommes Frites', category: 'Hauptgerichte' },
    'Аҧсшәа': { name: 'Акартошька фри', category: 'Ихадоу аџьынџьқәа' }
  },
  'Спагети Карбонара': {
    'Русский': { name: 'Спагети Карбонара', category: 'Основные блюда' },
    'English': { name: 'Spaghetti Carbonara', category: 'Main dishes' },
    'Deutsch': { name: 'Spaghetti Carbonara', category: 'Hauptgerichte' },
    'Аҧсшәа': { name: 'Аспагетти Карбонара', category: 'Ихадоу аџьынџьқәа' }
  }
};

const categoryTranslations: Record<string, Record<string, string>> = {
  'Основные блюда': { 'Русский': 'Основные блюда', 'English': 'Main dishes', 'Deutsch': 'Hauptgerichte', 'Аҧсшәа': 'Ихадоу аџьынџьқәа' },
  'Напитки': { 'Русский': 'Напитки', 'English': 'Beverages', 'Deutsch': 'Getränke', 'Аҧсшәа': 'Амаҷқәа' },
  'Блюда на завтрак': { 'Русский': 'Блюда на завтрак', 'English': 'Breakfast dishes', 'Deutsch': 'Frühstücksgerichte', 'Аҧсшәа': 'Ахьаҵа аџьынџьқәа' },
  'Гарниры': { 'Русский': 'Гарниры', 'English': 'Side dishes', 'Deutsch': 'Beilagen', 'Аҧсшәа': 'Ахьыҩқәа' },
  'Десерты': { 'Русский': 'Десерты', 'English': 'Desserts', 'Deutsch': 'Desserts', 'Аҧсшәа': 'Адесертқәа' },
  'Первые блюда': { 'Русский': 'Первые блюда', 'English': 'First courses', 'Deutsch': 'Suppen & Vorspeisen', 'Аҧсшәа': 'Актәи аџьынџьқәа' },
  'Соусы': { 'Русский': 'Соусы', 'English': 'Sauces', 'Deutsch': 'Saucen', 'Аҧсшәа': 'Асоусқәа' },
  'Салаты': { 'Русский': 'Салаты', 'English': 'Salads', 'Deutsch': 'Salate', 'Аҧсшәа': 'Асалатқәа' },
  'Итальянские блюда': { 'Русский': 'Итальянские блюда', 'English': 'Italian dishes', 'Deutsch': 'Italienische Gerichte', 'Аҧсшәа': 'Италиатәи аџьынџьқәа' },
  'Холодные закуски': { 'Русский': 'Холодные закуски', 'English': 'Cold appetizers', 'Deutsch': 'Kalte Vorspeisen', 'Аҧсшәа': 'Шьаҟатәи аҩкаақәа' },
  'Кавказская кухня': { 'Русский': 'Кавказская кухня', 'English': 'Caucasian cuisine', 'Deutsch': 'Kaukasische Küche', 'Аҧсшәа': 'Кавказтәи аҟазшьа' },
  'Выпечка': { 'Русский': 'Выпечка', 'English': 'Bakery', 'Deutsch': 'Gebäck', 'Аҧсшәа': 'Ахьыҟара' },
  'Морепродукты': { 'Русский': 'Морепродукты', 'English': 'Seafood', 'Deutsch': 'Meeresfrüchte', 'Аҧсшәа': 'Амшын атоварқәа' }
};

let pendingTranslations: {text: string, lang: string, targetCode: string}[] = [];
let batchTimeout: ReturnType<typeof setTimeout> | null = null;

const processBatch = async () => {
  batchTimeout = null;
  const batch = [...pendingTranslations];
  pendingTranslations = [];
  
  if (batch.length === 0) return;
  
  const byLang: Record<string, { items: string[], langStr: string }> = {};
  for (const item of batch) {
    if (!byLang[item.targetCode]) byLang[item.targetCode] = { items: [], langStr: item.lang };
    byLang[item.targetCode].items.push(item.text);
  }
  
  for (const [targetCode, group] of Object.entries(byLang)) {
    try {
      const res = await fetch(`http://localhost:3000/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: group.items, targetLang: targetCode })
      });
      const data = await res.json();
      if (data.success && data.translations) {
        if (!translationCache[group.langStr]) translationCache[group.langStr] = {};
        for (let i = 0; i < group.items.length; i++) {
          translationCache[group.langStr][group.items[i]] = data.translations[i];
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      for (const t of group.items) {
        translateQueue.delete(`${group.langStr}:${t}`);
      }
    }
  }
};

const performTranslation = async (text: string, targetLangCode: string) => {
  if (!text || targetLangCode === 'ru' || targetLangCode === 'Русский') return;
  const lang = targetLangCode;
  
  if (translationCache[lang]?.[text]) return;
  
  const cacheKey = `${lang}:${text}`;
  if (translateQueue.has(cacheKey)) return;
  translateQueue.add(cacheKey);

  const langCodeMap: Record<string, string> = {
    'English': 'en',
    'Deutsch': 'de',
    'Аҧсшәа': 'ab',
    'Русский': 'ru'
  };
  const targetCode = langCodeMap[lang] || lang;
  if (targetCode === 'ru') {
    translateQueue.delete(cacheKey);
    return;
  }

  pendingTranslations.push({ text, lang: targetLangCode, targetCode });
  
  if (!batchTimeout) {
    batchTimeout = setTimeout(processBatch, 200);
  }
};

const getMappedLang = (lang: string) => {
  const map: Record<string, string> = {
    'en': 'English', 'de': 'Deutsch', 'ab': 'Аҧсшәа', 'ru': 'Русский'
  };
  return map[lang] || lang;
};

const t = (key: string) => {
  const lang = getMappedLang(selectedLanguage.value);
  return translations[lang]?.[key] || translations['Русский'][key] || key;
};

const savedCache = localStorage.getItem('translationCache_mockup');
  const translationCache = reactive<Record<string, Record<string, string>>>(
    savedCache ? JSON.parse(savedCache) : {
      'en': {}, 'de': {}, 'ab': {}, 'ru': {},
      'English': {}, 'Deutsch': {}, 'Аҧсшәа': {}, 'Русский': {}
    }
  );

const translateQueue = new Set<string>();

const tDyn = (ruText: string) => {
  if (!ruText) return '';
  const langCode = selectedLanguage.value;
  if (langCode === 'ru' || langCode === 'Русский') return ruText;
  if (translationCache[langCode]?.[ruText]) return translationCache[langCode][ruText];
  
  performTranslation(ruText, langCode);
  return ruText;
};

const getLocalizedCategoryName = (name: string) => {
  const lang = getMappedLang(selectedLanguage.value);
  return categoryTranslations[name]?.[lang] || name;
};

const getLocalizedItemName = (name: string) => {
  const lang = getMappedLang(selectedLanguage.value);
  return dishTranslations[name]?.[lang]?.name || name;
};

const getItemQuantity = (itemId: number | string) => {
  const found = cartItems.value.find(i => i.id === itemId);
  return found ? found.quantity : 0;
};

const addToCart = (item: any) => {
  const existing = cartItems.value.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.value.push({ ...item, quantity: 1 });
  }
};

const increaseQuantity = (itemId: number | string) => {
  const existing = cartItems.value.find(i => i.id === itemId);
  if (existing) existing.quantity += 1;
};

const decreaseQuantity = (itemId: number | string) => {
  const existing = cartItems.value.find(i => i.id === itemId);
  if (existing) {
    if (existing.quantity > 1) {
      existing.quantity -= 1;
    } else {
      cartItems.value = cartItems.value.filter(i => i.id !== itemId);
    }
  }
};

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const filteredItems = computed(() => {
  return currentItems.value.filter((item: any) => {
    if (item.isAvailable === false || item.isAvailable === 0) return false;
    const matchesCategory = selectedCategory.value === null || item.categoryId === selectedCategory.value || item.category === selectedCategory.value;
    const matchesSearch = searchQuery.value === '' || item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});

const triggerFileUpload = (_type: string) => {};
const handlePhoneScroll = () => {};
const clearAllFilters = () => { selectedFilters.value = []; };
const toggleFilter = (filter: string) => {
  const idx = selectedFilters.value.indexOf(filter);
  if (idx > -1) selectedFilters.value.splice(idx, 1);
  else selectedFilters.value.push(filter);
};

const openPreview = () => {
  // Сохраняем актуальные данные в localStorage
  if (props.restaurantInfo) localStorage.setItem('preview_restaurantInfo', JSON.stringify(props.restaurantInfo));
  if (props.items) localStorage.setItem('preview_items', JSON.stringify(props.items));
  if (props.categories) localStorage.setItem('preview_categories', JSON.stringify(props.categories));

  // Открываем страницу клиента в новой вкладке (замените '/client' на ваш путь к клиентской части)
  const targetUrl = `${window.location.origin}/client?preview=true`;
  window.open(targetUrl, '_blank');
};
</script>

<style scoped>
.fullscreen-preview-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.85); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.fullscreen-preview-header { width: 100%; max-width: 480px; display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; color: #fff; font-weight: bold; }
.close-fullscreen-btn { background: #ff4d4f; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.fullscreen-phone-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; padding-bottom: 20px; }
.phone-mockup.fullscreen-mode { transform: scale(1.1); }
.floating-cart-bar { position: absolute; bottom: calc(12px + 45px + 4px); left: 12px; right: 12px; color: white; border-radius: 24px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: bold; cursor: pointer; z-index: 20; box-shadow: 0 4px 15px rgba(0,0,0,0.4); box-sizing: border-box; }
.menu-items-full-phone { display: flex; flex-direction: column; gap: 12px; padding: 0 16px 100px; }
.menu-card-full {
  background: #ffffff;
  color: #111111;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.menu-card-full img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
}
.menu-card-full .card-content {
  padding: 12px 4px 4px;
}
.menu-card-full .card-text-block h3 {
  font-size: 15px;
  margin: 0 0 6px 0;
  font-weight: bold;
}
.menu-card-full .card-text-block p {
  font-size: 12px;
  color: #555;
  margin: 0 0 16px 0;
  line-height: 1.4;
}
.menu-card-full .card-bottom-row {
  display: flex;
  flex-direction: row !important;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.menu-card-full .add-to-cart-btn {
  width: auto;
  padding: 8px 20px;
  font-size: 12px;
}
.menu-card-full .counter-controls {
  width: auto;
  min-width: 90px;
}
</style>
