<template>
  <div class="order-hub-container" :class="{ 'light-theme': isLightTheme }">

    <!-- ══ HEADER ══ -->
    <header class="hub-header">
      <div class="hub-counters">
        <button v-for="tab in orderTabs" :key="tab.key" class="counter-badge"
          :class="[tab.key, { active: currentTab === tab.key }]" @click="currentTab = tab.key">
          <span class="dot"></span>
          <span class="count-num">{{ getOrderCountByStatus(tab.key) }}</span>
          {{ tab.label }}
        </button>
      </div>
      <div class="hub-actions">
        <div class="hub-mode-pill" :class="currentMode">
          {{ modePillLabel }}
        </div>
        <button class="btn-action-top" style="background: #dc2626; color: white; border: none; margin-right: 8px;" @click="deleteAllOrders">🗑 Очистить заказы</button>
        <button class="btn-action-top" @click="isOrderSettingsOpen = true">⚙️ Настройки</button>
        <button class="btn-action-top refresh-btn" :class="{ rotating: isRefreshing }" @click="doRefresh">
          🔄 Обновить
        </button>
      </div>
    </header>

    <!-- ══ MAIN ORDERS AREA ══ -->
    <main class="hub-main-workspace">
      <div v-if="isLoading" class="hub-loading">
        <div class="hub-spinner"></div> Загрузка заказов…
      </div>
      <div v-else-if="filteredOrders.length === 0" class="no-orders-placeholder">
        <div class="no-orders-icon">{{ noOrdersIcon }}</div>
        <p>Нет заказов в разделе «{{ currentTabLabel }}»</p>
        <span v-if="currentMode !== 'order'" class="no-orders-hint">
          Включите режим «Заказ» в настройках, чтобы принимать заказы от клиентов
        </span>
      </div>
      <div v-else-if="currentTab === 'archived'" class="orders-list archive-list">
        <div v-for="group in groupedArchivedOrders" :key="group.date" class="archive-group" style="margin-bottom: 24px; width: 100%;">
          <h3 class="archive-date" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; color: #4b5563;">{{ group.date }}</h3>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div v-for="order in group.orders" :key="order.id" class="order-card-item receipt-style archived" style="opacity: 0.8;">
              <div class="order-card-header">
                <div class="order-id-group">
                  <span class="order-id">#{{ order.orderNumber || String(order.id).slice(-4).padStart(4,'0') }}</span>
                  <button class="btn-delete-order" @click="deleteOrder(order.id)" title="Удалить чек" style="background: transparent; border: none; font-size: 16px; cursor: pointer;">🗑️</button>
                  <button class="btn-delete-order" @click="deleteOrder(order.id)" title="Удалить чек" style="background: transparent; border: none; font-size: 16px; cursor: pointer;">🗑️</button>
                <span class="order-type-badge" :class="order.type || 'onsite'">
                    {{ getOrderTypeLabel(order.type) }}
                  </span>
                </div>
                <span class="order-time">{{ new Date(order.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'}) }}</span>
              </div>
              <div class="order-customer-info">
                <div v-if="order.customerName" class="info-row">
                  <span class="icon">👤</span> {{ order.customerName }} <a v-if="order.customerPhone" :href="`tel:${order.customerPhone}`" class="phone-link">{{ order.customerPhone }}</a>
                </div>
                <div class="info-row">
                  <span class="icon">📍</span> 
                  <span v-if="order.type === 'delivery'">{{ order.address || 'Адрес не указан' }}</span>
                  <span v-else-if="order.type === 'table'">Стол {{ order.tableNumber || '?' }}</span>
                  <span v-else>Самовывоз</span>
                </div>
                <div v-if="order.comment" class="info-row note">
                  <span class="icon">💬</span> {{ order.comment }}
                </div>
              </div>
              <div class="order-items-list">
                <div v-for="item in order.items" :key="item.id" class="order-item-row">
                  <span class="item-name"><b>{{ item.quantity }}x</b> {{ item.name }}</span>
                  <span class="item-price">{{ Number(item.price * item.quantity).toFixed(2) }} ₽</span>
                </div>
              </div>
              <div class="order-card-footer">
                <span class="order-total">Итого: {{ Number(order.total || order.totalPrice || 0).toFixed(2) }} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="orders-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card-item receipt-style">

          <div class="order-card-header">
            <div class="order-id-group">
              <span class="order-id">#{{ order.orderNumber || String(order.id).slice(-4).padStart(4,'0') }}</span>
              <span class="order-type-badge" :class="order.type || 'onsite'">
                {{ getOrderTypeLabel(order.type) }}
              </span>
            </div>
            <div class="order-timer-badge">⏱️ {{ getElapsedTime(order) }}</div>
          </div>

          <!-- Location / Customer details -->
          <div class="order-location-info">
            <template v-if="order.type === 'onsite'">
              <strong>Стол №{{ order.tableNumber || '—' }}</strong>
            </template>
            <template v-else>
              <div v-if="order.customerName || order.customerPhone" class="customer-info">
                <b>{{ order.customerName }}</b>
                <span v-if="order.customerPhone"> ({{ order.customerPhone }})</span>
              </div>
              <div v-if="order.type === 'delivery' && order.address">🚴 {{ order.address }}</div>
              <div v-if="order.type === 'pickup'">📦 Самовывоз</div>
            </template>
            <div v-if="order.comment" class="order-note">💬 {{ order.comment }}</div>
          </div>

          <!-- Items -->
          <div class="order-items-summary">
            <div v-for="(item, idx) in order.items" :key="idx" class="order-item-row">
              <span><b>{{ item.quantity }}×</b> {{ item.name }}</span>
              <span>{{ (Number(item.price) * Number(item.quantity)).toFixed(2) }} ₽</span>
            </div>
          </div>

          <div class="order-card-footer">
            <span class="order-total">Итого: {{ Number(order.total || order.totalPrice || 0).toFixed(2) }} ₽</span>
            <div class="order-actions-btns">
              <template v-if="order.status === 'new'">
                <button class="btn-cancel-order" @click="changeStatus(order.id, 'cancelled')">✕ Отменить</button>
                <button class="btn-progress-order" @click="changeStatus(order.id, 'progress')">Начать ➔</button>
              </template>
              <template v-else-if="order.status === 'progress'">
                <button class="btn-cancel-order" @click="changeStatus(order.id, 'cancelled')">✕</button>
                <button class="btn-done-order" @click="changeStatus(order.id, 'done')">Готово ✓</button>
              </template>
              <template v-else-if="order.status === 'cancelled'">
                <button class="btn-restore-order" @click="changeStatus(order.id, 'new')">↺ Вернуть</button>
              </template>
              <template v-else-if="order.status === 'done'">
                  <button class="btn-done-order" style="background: #521926;" @click="changeStatus(order.id, 'archived')">🔒 Закрыть чек</button>
                </template>
              </div>
          </div>

        </div>
      </div>
    </main>

    <!-- ══ SETTINGS MODAL ══ -->
    <div v-if="isOrderSettingsOpen" class="modal-overlay" @click.self="isOrderSettingsOpen = false">
      <div class="modal-content order-settings-modal">
        <div class="modal-header">
          <h2>Настройки заказов</h2>
          <button class="close-btn" @click="isOrderSettingsOpen = false">✕</button>
        </div>

        <!-- Mode tabs -->
        <div class="mode-tabs">
          <button v-for="m in modes" :key="m.id" :class="{ active: orderMode === m.id }"
            @click="setOrderMode(m.id)">
            {{ m.icon }} {{ m.label }}
          </button>
        </div>

        <!-- ── MODE: MENU ── -->
        <div v-if="orderMode === 'menu'" class="mode-description-card">
          <div class="mode-card-icon">📖</div>
          <h3>Классическое меню</h3>
          <p>Гости могут просматривать ваши позиции, но <b>не могут</b> добавлять их в корзину или оформить заказ.</p>
          <div v-if="currentMode === 'menu'" class="mode-active-badge">✓ Активный режим</div>
          <button v-else class="btn-set-mode" @click="applyMode('menu')">Включить этот режим</button>
        </div>

        <!-- ── MODE: CART ── -->
        <div v-if="orderMode === 'cart'" class="mode-description-card">
          <div class="mode-card-icon">🛒</div>
          <h3>Список желаемого</h3>
          <p>Гости могут <b>добавлять позиции в корзину</b>, отслеживать избранное и видеть общую стоимость. Заказы не отправляются.</p>
          <div v-if="currentMode === 'cart'" class="mode-active-badge">✓ Активный режим</div>
          <button v-else class="btn-set-mode" @click="applyMode('cart')">Включить этот режим</button>
        </div>

        <!-- ── MODE: ORDER ── -->
        <template v-if="orderMode === 'order'">
          <!-- Step 1 — agreement -->
          <template v-if="!isActivated">
            <div class="mode-description-card">
              <div class="mode-card-icon">📄</div>
              <h3>Принятие заказов</h3>
              <p>Принимай заказы клиентов прямо в Dashboard. Быстрый и простой способ увеличить выручку.</p>
            </div>
            <div class="mode-description-card warning-card">
              <div class="checkbox-row">
                <input type="checkbox" id="liability" v-model="isLiabilityAgreed" />
                <label for="liability">Я понимаю, что сервис предоставляет инструмент для заказов, но я несу полную
                  ответственность за выполнение заказов и потерянные уведомления.</label>
              </div>
            </div>
            <div class="modal-footer-actions">
              <button class="btn-cancel" @click="isOrderSettingsOpen = false">Отмена</button>
              <button class="btn-activate" :disabled="!isLiabilityAgreed" @click="activateOrdering">
                Активировать заказы ➔
              </button>
            </div>
          </template>

          <!-- Step 2 — full settings -->
          <template v-else>
            <div class="activated-settings-scroll">
              <p class="order-top-text">Принимай заказы клиентов прямо в Dashboard и по email.</p>

              <!-- Самовывоз -->
              <div class="setting-block">
                <div class="setting-row-switch">
                  <div class="setting-label-with-icon"><span class="block-icon">📦</span><span>Самовывоз</span></div>
                  <label class="switch"><input type="checkbox" v-model="pickupActive" @change="saveSettings" /><span
                      class="slider round"></span></label>
                </div>
                <span class="status-text">{{ pickupActive ? 'Включено' : 'Отключено' }}</span>
                <template v-if="pickupActive">
                  <div class="range-group">
                    <div class="range-label"><span>Время приготовления</span><span class="highlight-orange">{{
                        pickupTime }} мин</span></div>
                    <input type="range" min="5" max="120" step="5" v-model.number="pickupTime" class="range-input"
                      @change="saveSettings" />
                  </div>
                  <div class="input-group">
                    <label>Адрес самовывоза</label>
                    <input type="text" placeholder="Введите адрес" v-model="pickupAddress" class="text-input"
                      @blur="saveSettings" />
                  </div>
                </template>
              </div>

              <!-- Доставка -->
              <div class="setting-block">
                <div class="setting-row-switch">
                  <div class="setting-label-with-icon"><span class="block-icon">🚲</span><span>Доставка</span></div>
                  <label class="switch"><input type="checkbox" v-model="deliveryActive" @change="saveSettings" /><span
                      class="slider round"></span></label>
                </div>
                <span class="status-text">{{ deliveryActive ? 'Включено' : 'Отключено' }}</span>
                <template v-if="deliveryActive">
                  <div class="range-group">
                    <div class="range-label"><span>Время доставки</span><span class="highlight-orange">{{ deliveryTime
                        }} мин</span></div>
                    <input type="range" min="10" max="120" step="5" v-model.number="deliveryTime" class="range-input"
                      @change="saveSettings" />
                  </div>
                  <div class="row-inputs-three">
                    <div class="input-group"><label>Стоимость</label>
                      <div class="input-with-unit"><input type="number" v-model.number="deliveryFee" class="text-input"
                          @blur="saveSettings" /><span>₽</span></div>
                    </div>
                    <div class="input-group"><label>Мин. заказ</label>
                      <div class="input-with-unit"><input type="number" v-model.number="minOrder" class="text-input"
                          @blur="saveSettings" /><span>₽</span></div>
                    </div>
                    <div class="input-group"><label>Бесплатно от</label>
                      <div class="input-with-unit"><input type="number" v-model.number="freeFrom" class="text-input"
                          @blur="saveSettings" /><span>₽</span></div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- На месте -->
              <div class="setting-block">
                <div class="setting-row-switch">
                  <div class="setting-label-with-icon"><span class="block-icon">🍽️</span><span>На месте</span></div>
                  <label class="switch"><input type="checkbox" v-model="onsiteActive" @change="saveSettings" /><span
                      class="slider round"></span></label>
                </div>
                <span class="status-text">{{ onsiteActive ? 'Включено' : 'Отключено' }}</span>
              </div>

              <!-- Часы работы -->
              <div class="setting-block">
                <div class="setting-label-with-icon mb-12"><span class="block-icon">⏱️</span><span>Часы
                    работы</span></div>
                <div v-for="day in workDays" :key="day.name" class="work-day-row">
                  <div class="day-switch-left">
                    <label class="switch"><input type="checkbox" v-model="day.active"
                        @change="saveSettings" /><span class="slider round"></span></label>
                    <span :class="{ 'text-muted': !day.active }">{{ day.name }}</span>
                  </div>
                  <span class="day-action-right">{{ day.active ? 'Открыто' : 'Закрыто' }}</span>
                </div>
              </div>

              <!-- Уведомления -->
              <div class="setting-block">
                <div class="setting-label-with-icon mb-12"><span class="block-icon">🔔</span><span>Уведомления</span>
                </div>
                <div class="notification-tabs">
                  <button :class="{ active: notifType === 'dashboard' }"
                    @click="notifType = 'dashboard'">📋 Dashboard</button>
                  <button :class="{ active: notifType === 'telegram' }"
                    @click="notifType = 'telegram'">✈️ Telegram</button>
                </div>
                <div v-if="notifType === 'telegram'" class="input-group mt-16">
                  <label>Ссылка Telegram Бота (Webhook / sendMessage)</label>
                  <div class="phone-input-wrapper">
                    <input type="text" v-model="telegramWebhook" placeholder="https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<ID>"
                      class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                  </div>
                  <p style="font-size: 10px; color: #888; margin-top: 4px;">Скопируйте URL с chat_id. Мы автоматически добавим к нему &text=...</p>
                    <label class="mt-8">ID темы заказов (message_thread_id)</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="ordersThreadId" placeholder="Например: 12345" class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>

                    <label class="mt-8">ID темы официантов (message_thread_id)</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="waitersThreadId" placeholder="Например: 12346" class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>

                    <label class="mt-8">ID темы отзывов (message_thread_id)</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="reviewsThreadId" placeholder="Например: 12347" class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>
                    
                    <p style="font-size: 10px; color: #888; margin-top: 6px;">Укажите ID веток, куда будут приходить соответствующие уведомления. Если не указывать, сообщения придут в общий чат.</p>

                </div>
                <div class="setting-row-switch mt-16">
                  <div class="notif-text-desc"><span>Уведомлять по email</span>
                    <p>Копия каждого заказа на почту</p>
                  </div>
                  <label class="switch"><input type="checkbox" v-model="emailNotif"
                      @change="saveSettings" /><span class="slider round"></span></label>
                </div>
                <div v-if="emailNotif" class="input-group mt-8">
                  <input type="email" v-model="emailAddress" placeholder="email@example.com (Оставьте пустым для админской почты)" class="text-input" @blur="saveSettings" />
                </div>
              </div>

              <button class="btn-activate" style="width: 100%; margin-top: 16px; margin-bottom: 8px;" @click="manualSave">Сохранить</button>
              <button class="btn-deactivate" @click="deactivateOrdering">Отключить приём заказов</button>
            </div>
          </template>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { RestaurantInfo } from '../types/menu';
import { ordersApi } from '../api';

const props = defineProps<{ modelValue: RestaurantInfo }>();
const emit = defineEmits(['update:modelValue']);

const isLightTheme = computed(() => {
  return typeof document !== 'undefined' &&
    !!document.querySelector('.constructor-wrapper.light-theme, .light-theme');
});

// ═══════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════
const SETTINGS_KEY = 'order_hub_settings';

const orderTabs = [
  { key: 'new' as const, label: 'Новые' },
  { key: 'progress' as const, label: 'В работе' },
  { key: 'done' as const, label: 'Готовы' },
  { key: 'cancelled' as const, label: 'Отменено' },
  { key: 'archived' as const, label: 'Архив' },
];

const modes = [
  { id: 'menu', icon: '📖', label: 'Меню' },
  { id: 'cart', icon: '🛒', label: 'Корзина' },
  { id: 'order', icon: '📄', label: 'Заказ' },
];

// ═══════════════════════════════════════════════════════
// LOAD/SAVE SETTINGS
// ═══════════════════════════════════════════════════════
const _loadSettings = () => {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { return {}; }
};

const _saved = (props.modelValue as any).orderSettings || _loadSettings();

// ═══════════════════════════════════════════════════════
// ORDER MODE (controls ClientView behaviour)
// ═══════════════════════════════════════════════════════
const currentMode = ref<'menu' | 'cart' | 'order'>(_saved.currentMode || 'order');
const orderMode = ref<string>(_saved.currentMode || 'order');

const modePillLabel = computed(() => ({
  menu: '📖 Только просмотр',
  cart: '🛒 Корзина',
  order: '📄 Приём заказов',
}[currentMode.value]));

const applyMode = (mode: 'menu' | 'cart' | 'order') => {
  currentMode.value = mode;
  saveSettings();
};

// ═══════════════════════════════════════════════════════
// TIMER (Инициализация перенесена наверх, чтобы избежать ошибок)
// ═══════════════════════════════════════════════════════
const now = ref(Date.now());
let timerInterval: any = null;

const getElapsedTime = (orderOrTime: any) => {
  if (!orderOrTime) return '00:00';
  
  let order = orderOrTime;
  let createdAt = orderOrTime;
  if (typeof orderOrTime === 'object') {
    createdAt = orderOrTime.createdAt;
  }
  
  if (!createdAt) return '00:00';

  let startMs: number;
  if (typeof createdAt === 'number') {
    startMs = createdAt;
  } else if (typeof createdAt === 'string' && (createdAt.includes('T') || createdAt.includes('-'))) {
    startMs = new Date(createdAt).getTime();
  } else if (typeof createdAt === 'string' && createdAt.includes(':')) {
    const [h, m] = createdAt.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    startMs = d.getTime();
  } else {
    return '00:00';
  }

  let endMs = now.value; // use reactive now
  
  if (typeof order === 'object' && (order.status === 'archived' || order.status === 'cancelled')) {
    if (order.updatedAt) {
      endMs = new Date(order.updatedAt).getTime();
    }
  }

  const diff = Math.max(0, endMs - startMs);
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// ═══════════════════════════════════════════════════════
// ORDERS STATE
// ═══════════════════════════════════════════════════════
const allOrders = ref<any[]>([]);
const isLoading = ref(false);
const isRefreshing = ref(false);
const currentTab = ref<'new' | 'progress' | 'done' | 'cancelled' | 'archived'>('new');


    
      







const filteredOrders = computed(() =>
  allOrders.value.filter(o =>
    o.status === currentTab.value ||
    (currentTab.value === 'new' && o.status === 'open')
  )
);

    
      
  
const groupedArchivedOrders = computed(() => {
  if (currentTab.value !== 'archived') return [];
  const groups: Record<string, any[]> = {};
  
  filteredOrders.value.forEach((order: any) => {
    const dateObj = new Date(order.createdAt);
    const dateKey = dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(order);
  });
  
  return Object.keys(groups).map(date => ({
    date,
    orders: groups[date]
  }));
});

const getOrderCountByStatus = (status: string) =>
  allOrders.value.filter(o =>
    o.status === status || (status === 'new' && o.status === 'open')
  ).length;

const currentTabLabel = computed(() =>
  orderTabs.find(t => t.key === currentTab.value)?.label || ''
);

const noOrdersIcon = computed(() =>
  ({ new: '🆕', progress: '⏳', done: '✅', cancelled: '❌', archived: '📦' })[currentTab.value] || '📋'
);


const deleteOrder = async (id: string) => {
  if (!confirm('Точно удалить этот чек навсегда?')) return;
  try {
    await ordersApi.delete(id);
    await fetchOrders();
  } catch (e: any) {
    alert('Ошибка удаления: ' + e.message);
  }
};

const deleteAllOrders = async () => {
  if (!confirm('ВНИМАНИЕ! Это удалит ВСЕ заказы из базы навсегда (включая архив). Продолжить?')) return;
  try {
    await ordersApi.deleteAll();
    await fetchOrders();
  } catch (e: any) {
    alert('Ошибка удаления: ' + e.message);
  }
};

const knownOrderIds = ref<Set<string>>(new Set());
let isFirstLoad = true;

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); 
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.8);
    osc.stop(ctx.currentTime + 0.8);
  } catch(e) {
    console.error("Audio playback failed", e);
  }
};

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const data = await ordersApi.getAll() as any[];
    allOrders.value = data.map((o: any) => ({
      ...o,
      total: Number(o.totalPrice ?? o.total ?? 0),
    }));
    
    if (!isFirstLoad) {
      const hasNew = data.some(o => !knownOrderIds.value.has(o.id) && o.status === 'new');
      if (hasNew) playBeep();
    }
    knownOrderIds.value = new Set(data.map(o => o.id));
    isFirstLoad = false;
    
  } catch (e) {
    console.error('Ошибка загрузки заказов:', e);
  } finally {
    isLoading.value = false;
  }
};

const doRefresh = async () => {
  isRefreshing.value = true;
  await fetchOrders();
  setTimeout(() => (isRefreshing.value = false), 600);
};

const changeStatus = async (id: string, status: string) => {
  const order = allOrders.value.find(o => o.id === id);
  if (order) order.status = status;
  try {
    await ordersApi.updateStatus(id, status);
  } catch {
    await fetchOrders(); // rollback on error
  }
};

// Auto-refresh every 15 seconds
let pollInterval: any = null;

onMounted(() => {
  fetchOrders();
  pollInterval = setInterval(fetchOrders, 15_000);
  timerInterval = setInterval(() => { now.value = Date.now(); }, 1000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
  if (timerInterval) clearInterval(timerInterval);
});

// ═══════════════════════════════════════════════════════
// ORDER TYPE LABELS
// ═══════════════════════════════════════════════════════
const getOrderTypeLabel = (type?: string) =>
  ({ onsite: '🍽️ НА МЕСТЕ', delivery: '🚲 ДОСТАВКА', pickup: '📦 САМОВЫВОЗ' })[type || 'onsite'] || '🍽️ НА МЕСТЕ';

// ═══════════════════════════════════════════════════════
// SETTINGS MODAL
// ═══════════════════════════════════════════════════════
const isOrderSettingsOpen = ref(false);
const isLiabilityAgreed = ref(false);
const isActivated = ref(_saved.isActivated ?? true);

// Delivery/pickup settings
const pickupActive = ref(_saved.pickupActive ?? false);
const pickupTime = ref(_saved.pickupTime ?? 25);
const pickupAddress = ref(_saved.pickupAddress ?? '');
const deliveryActive = ref(_saved.deliveryActive ?? true);
const deliveryTime = ref(_saved.deliveryTime ?? 30);
const deliveryFee = ref(_saved.deliveryFee ?? 0);
const minOrder = ref(_saved.minOrder ?? 0);
const freeFrom = ref(_saved.freeFrom ?? 0);
const onsiteActive = ref(_saved.onsiteActive ?? true);
const notifType = ref(_saved.notifType ?? 'dashboard');
const telegramWebhook = ref(_saved.telegramWebhook ?? _saved.whatsappNumber ?? '');
  const ordersThreadId = ref(_saved.ordersThreadId ?? '');
  const waitersThreadId = ref(_saved.waitersThreadId ?? '');
  const reviewsThreadId = ref(_saved.reviewsThreadId ?? '');
const emailNotif = ref(_saved.emailNotif ?? false);
const emailAddress = ref(_saved.emailAddress ?? '');

const workDays = ref(_saved.workDays ?? [
  { name: 'Понедельник', active: true },
  { name: 'Вторник', active: true },
  { name: 'Среда', active: true },
  { name: 'Четверг', active: true },
  { name: 'Пятница', active: true },
  { name: 'Суббота', active: true },
  { name: 'Воскресенье', active: false },
]);

const setOrderMode = (mode: string) => {
  orderMode.value = mode;
};

const activateOrdering = () => {
  isActivated.value = true;
  applyMode('order');
};

const deactivateOrdering = () => {
  isActivated.value = false;
  applyMode('menu');
};

// Persist ALL settings to localStorage so ClientView can read them locally
const saveSettings = () => {
  const data = {
    currentMode: currentMode.value,
    isActivated: isActivated.value,
    pickupActive: pickupActive.value,
    pickupTime: pickupTime.value,
    pickupAddress: pickupAddress.value,
    deliveryActive: deliveryActive.value,
    deliveryTime: deliveryTime.value,
    deliveryFee: deliveryFee.value,
    minOrder: minOrder.value,
    freeFrom: freeFrom.value,
    onsiteActive: onsiteActive.value,
    notifType: notifType.value,
    telegramWebhook: telegramWebhook.value,
      ordersThreadId: ordersThreadId.value,
      waitersThreadId: waitersThreadId.value,
      reviewsThreadId: reviewsThreadId.value,
    emailNotif: emailNotif.value,
    emailAddress: emailAddress.value,
    workDays: workDays.value,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  localStorage.setItem('menu_order_mode', currentMode.value);
  
  // Also emit to parent to save to backend
  emit('update:modelValue', { ...props.modelValue, orderSettings: data });
};

// Save on first load to ensure ClientView always has a value
saveSettings();

const manualSave = () => {
  saveSettings();
  alert('✅ Настройки заказов успешно сохранены!');
};
</script>

<style scoped>
/* ── Container ── */
.order-hub-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: inherit;
  background-color: #121212;
  color: #fff;
  transition: background-color 0.2s, color 0.2s;
}

/* ── Header ── */
.hub-header {
  background-color: #1a1a1a;
  border-bottom: 1px solid #2d2d2d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.hub-counters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

.counter-badge {
  background: #262626;
  border: 1px solid #333;
  color: #a0aec0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.counter-badge:hover { border-color: #555; color: #fff; }
.counter-badge.active { background: #2d2d2d; color: #fff; border-color: #555; }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.counter-badge.new .dot { background: #f97316; }
.counter-badge.progress .dot { background: #9D0D0E; }
.counter-badge.done .dot { background: #10b981; }
.counter-badge.cancelled .dot { background: #ef4444; }
.count-num {
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
  color: #fff;
  background: rgba(0,0,0,0.3);
  min-width: 18px;
  text-align: center;
}

.hub-actions { display: flex; gap: 10px; align-items: center; }

.hub-mode-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}
.hub-mode-pill.menu { background: rgba(106, 33, 49,0.15); color: #a5b4fc; border: 1px solid rgba(106, 33, 49,0.3); }
.hub-mode-pill.cart { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
.hub-mode-pill.order { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }

.btn-action-top {
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-action-top:hover { background: #3a3a3a; }
.refresh-btn { background: #1e40af !important; border-color: #2563eb !important; color: #fff !important; }
.refresh-btn:hover { background: #1d4ed8 !important; }
.refresh-btn.rotating { animation: spin 0.6s linear; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Main workspace ── */
.hub-main-workspace {
  background-color: #18181b;
  flex: 1;
  padding: 24px;
  transition: background-color 0.2s;
}

/* Loading */
.hub-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 80px;
  color: #6b7280;
  font-size: 15px;
}
.hub-spinner {
  width: 24px; height: 24px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #9D0D0E;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* No orders */
.no-orders-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 240px;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}
.no-orders-icon { font-size: 40px; margin-bottom: 4px; }
.no-orders-hint { font-size: 12px; max-width: 280px; line-height: 1.5; margin-top: 4px; opacity: 0.7; }

/* Orders list */
.orders-list { display: flex; flex-direction: column; gap: 16px; max-width: 780px; }

/* Receipt card */
.receipt-style {
  background: #fff;
  color: #111;
  border-radius: 12px;
  padding: 18px 22px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  border: 1px solid #e5e7eb;
}
.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 10px;
  margin-bottom: 10px;
}
.order-id-group { display: flex; align-items: center; gap: 10px; }
.order-id { font-weight: 800; font-size: 16px; color: #111; }
.order-type-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.order-type-badge.onsite { background: #fef3c7; color: #92400e; }
.order-type-badge.delivery { background: #dbeafe; color: #1e40af; }
.order-type-badge.pickup { background: #d1fae5; color: #065f46; }
.order-timer-badge {
  font-size: 12px;
  font-weight: 700;
  color: #d97706;
  background: #fffbe3;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid #fef3c7;
}
.order-location-info {
  font-size: 13px;
  color: #374151;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.customer-info { font-size: 14px; color: #111; }
.order-note { font-style: italic; color: #dc2626; font-size: 12px; }
.order-items-summary { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; font-size: 14px; }
.order-item-row { display: flex; justify-content: space-between; color: #1f2937; }
.order-card-footer {
  border-top: 1px dashed #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  margin-top: 4px;
}
.order-total { font-weight: 800; font-size: 16px; color: #111; }
.order-actions-btns { display: flex; gap: 8px; }
.btn-cancel-order { background: #fee2e2; color: #dc2626; border: none; padding: 6px 12px; border-radius: 7px; cursor: pointer; font-size: 12px; font-weight: 600; }
.btn-cancel-order:hover { background: #fecaca; }
.btn-progress-order { background: #1e293b; color: #fff; border: none; padding: 8px 16px; border-radius: 7px; cursor: pointer; font-size: 13px; font-weight: 700; }
.btn-progress-order:hover { background: #334155; }
.btn-done-order { background: #10b981; color: #fff; border: none; padding: 8px 16px; border-radius: 7px; cursor: pointer; font-size: 13px; font-weight: 700; }
.btn-done-order:hover { background: #059669; }
.btn-restore-order { background: #f3f4f6; color: #374151; border: none; padding: 6px 14px; border-radius: 7px; cursor: pointer; font-size: 13px; }

/* ── Modal ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content.order-settings-modal {
  background: #1a1a1a;
  color: #f3f4f6;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  padding: 24px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  border: 1px solid #2d2d2d;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
.close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280; transition: color 0.15s; }
.close-btn:hover { color: #fff; }

/* Mode tabs */
.mode-tabs { display: flex; background: #262626; padding: 4px; border-radius: 12px; margin-bottom: 20px; gap: 2px; }
.mode-tabs button { flex: 1; background: transparent; border: none; padding: 10px; font-size: 14px; color: #6b7280; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.15s; }
.mode-tabs button.active { background: #374151; color: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }

/* Mode description cards */
.mode-description-card {
  background: #262626;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
}
.mode-card-icon { font-size: 36px; margin-bottom: 10px; }
.mode-description-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 8px; }
.mode-description-card p { font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 0 0 14px; }
.mode-active-badge {
  display: inline-block;
  background: rgba(16,185,129,0.15);
  color: #34d399;
  border: 1px solid rgba(16,185,129,0.3);
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}
.btn-set-mode {
  background: #9D0D0E;
  color: #fff;
  border: none;
  padding: 9px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-set-mode:hover { background: #521926; }

/* Warning card */
.warning-card { text-align: left; }
.checkbox-row { display: flex; align-items: flex-start; gap: 10px; }
.checkbox-row input { margin-top: 3px; flex-shrink: 0; }
.checkbox-row label { font-size: 13px; color: #9ca3af; line-height: 1.5; cursor: pointer; }

/* Modal footer */
.modal-footer-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
.btn-cancel { background: #374151; color: #9ca3af; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-activate { background: #9D0D0E; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 700; transition: background 0.15s; }
.btn-activate:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-activate:not(:disabled):hover { background: #521926; }
.btn-deactivate { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; width: 100%; margin-top: 8px; transition: background 0.15s; }
.btn-deactivate:hover { background: rgba(239,68,68,0.2); }

/* Activated settings */
.activated-settings-scroll { overflow-y: auto; max-height: 60vh; padding-right: 4px; display: flex; flex-direction: column; gap: 0; }
.order-top-text { font-size: 13px; color: #9ca3af; margin-bottom: 16px; line-height: 1.5; }
.setting-block { background: #222225; border: 1px solid #2d2d2d; padding: 16px; border-radius: 12px; margin-bottom: 12px; }
.setting-label-with-icon { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 15px; }
.block-icon { font-size: 18px; }
.setting-row-switch { display: flex; justify-content: space-between; align-items: center; }
.status-text { display: block; font-size: 12px; color: #6b7280; margin: 6px 0 10px; }
.range-group { margin: 12px 0; }
.range-label { display: flex; justify-content: space-between; font-size: 13px; color: #9ca3af; margin-bottom: 8px; }
.highlight-orange { color: #f97316; font-weight: 700; }
.range-input { width: 100%; accent-color: #f97316; }
.text-input { padding: 8px 12px; border: 1px solid #3f3f46; border-radius: 8px; font-size: 14px; outline: none; width: 100%; background: #27272a; color: #f3f4f6; transition: border-color 0.2s; box-sizing: border-box; }
.text-input:focus { border-color: #9D0D0E; }
.input-with-unit { display: flex; align-items: center; border: 1px solid #3f3f46; border-radius: 8px; background: #27272a; overflow: hidden; }
.input-with-unit span { padding: 0 10px; font-size: 12px; color: #6b7280; background: #323238; height: 100%; display: flex; align-items: center; flex-shrink: 0; }
.input-with-unit input { border: none; background: transparent; color: #f3f4f6; width: 100%; padding: 8px; outline: none; }
.input-group { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; }
.input-group label { font-size: 12px; color: #6b7280; font-weight: 600; }
.row-inputs-three { display: flex; gap: 8px; }
.row-inputs-three .input-group { flex: 1; }
.work-day-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #2d2d2d; font-size: 13px; }
.work-day-row:last-child { border-bottom: none; }
.day-switch-left { display: flex; align-items: center; gap: 10px; }
.day-action-right { font-size: 12px; color: #6b7280; }
.notification-tabs { display: flex; background: #262626; padding: 3px; border-radius: 8px; gap: 3px; }
.notification-tabs button { flex: 1; background: transparent; border: none; padding: 8px; font-size: 13px; color: #6b7280; border-radius: 6px; cursor: pointer; font-weight: 600; }
.notification-tabs button.active { background: #374151; color: #fff; }
.phone-input-wrapper { display: flex; align-items: center; border: 1px solid #3f3f46; border-radius: 8px; overflow: hidden; background: #27272a; }
.country-select { padding: 0 10px; background: #323238; border-right: 1px solid #3f3f46; font-size: 16px; height: 100%; display: flex; align-items: center; }
.phone-input { border: none !important; border-radius: 0 !important; }
.notif-text-desc span { font-size: 13px; font-weight: 600; display: block; }
.notif-text-desc p { font-size: 11px; color: #6b7280; margin: 2px 0 0; }

/* Switch */
.switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background: #4b5563; transition: .25s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background: #fff; transition: .25s; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
input:checked + .slider { background: #10b981; }
input:checked + .slider:before { transform: translateX(20px); }

/* Misc */
.mb-12 { margin-bottom: 12px; }
.mt-16 { margin-top: 16px; }
.text-muted { color: #6b7280; }

/* ── Light theme ── */
.order-hub-container.light-theme { background-color: #f8fafc; color: #1e293b; }
.order-hub-container.light-theme .hub-header { background-color: #fff; border-bottom-color: #e2e8f0; }
.order-hub-container.light-theme .hub-main-workspace { background-color: #f1f5f9; }
.order-hub-container.light-theme .counter-badge { background: #f1f5f9; border-color: #cbd5e1; color: #64748b; }
.order-hub-container.light-theme .counter-badge.active { background: #e2e8f0; color: #0f172a; border-color: #94a3b8; }
.order-hub-container.light-theme .count-num { color: #0f172a; background: rgba(0,0,0,0.08); }
.order-hub-container.light-theme .btn-action-top { background: #fff; border-color: #cbd5e1; color: #334155; }
.order-hub-container.light-theme .hub-loading { color: #94a3b8; }
.order-hub-container.light-theme .no-orders-placeholder { color: #64748b; }
</style>