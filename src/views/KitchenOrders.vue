<template>
  <div class="kitchen-page" :class="{ 'light-theme': isLight }">
    <!-- HEADER -->
    <header class="k-header">
      <div class="k-title-block">
        <span class="k-logo">🍳</span>
        <div>
          <h1 class="k-title">Панель заказов</h1>
          <span class="k-role">{{ roleLabel }} · {{ staffName }}</span>
        </div>
      </div>

      <div class="k-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="k-tab"
          :class="[tab.key, { active: currentTab === tab.key }]"
          @click="currentTab = tab.key"
        >
          <span class="k-tab-count">{{ countByStatus(tab.key) }}</span>
          {{ tab.label }}
        </button>
      </div>

      <div class="k-header-actions">
        <button class="k-btn-icon btn-stoplist" @click="showStopList = true" title="Стоп-лист">
          <AlertOctagon :size="18" />
          <span class="btn-text">Стоп-лист</span>
        </button>
        <button class="k-btn-icon" :title="isLight ? 'Тёмная тема' : 'Светлая тема'" @click="isLight = !isLight">
          <Moon v-if="isLight" :size="18" />
          <Sun v-else :size="18" />
        </button>
        <button class="k-btn-icon" :class="{ rotating: loading }" @click="fetchOrders" title="Обновить">
          <RefreshCw :size="18" />
        </button>
        <button class="k-btn-icon btn-logout" @click="logout" title="Выйти">
          <LogOut :size="18" />
        </button>
      </div>
    </header>

    <!-- AUTO-REFRESH indicator -->
    <div class="k-autorefresh-bar">
      <span class="pulse-dot"></span>
      Автообновление каждые 15 сек · последнее: {{ lastRefreshedStr }}
    </div>

    <!-- MAIN -->
    <main class="k-main">
      <!-- Error -->
      <div v-if="error" class="k-alert error">⚠️ {{ error }}</div>

      <!-- Loading skeleton -->
      <div v-if="loading && orders.length === 0" class="k-loading">
        <div v-for="i in 3" :key="i" class="skeleton-card"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredOrders.length === 0" class="k-empty">
        <div class="k-empty-icon">{{ currentTabMeta?.emptyIcon || '📭' }}</div>
        <p>{{ currentTabMeta?.emptyText || 'Нет заказов' }}</p>
      </div>

      <!-- Orders grid -->
      <div v-else-if="currentTab === 'archived'" class="k-archive-container">
        <div v-for="group in groupedArchivedOrders" :key="group.date" class="k-archive-group">
          <h3 class="k-archive-date">{{ group.date }}</h3>
          <div class="k-orders-grid">
            <div
              v-for="order in group.orders"
              :key="order.id"
              class="k-card archived"
            >
              <!-- Card header -->
              <div class="k-card-head">
                <div class="k-card-id-row">
                  <span class="k-order-num">#{{ order.orderNumber || String(order.id).slice(-4) }}</span>
                  <span class="k-type-badge" :class="order.type">{{ typeLabel(order.type) }}</span>
                </div>
                <span class="k-time">{{ new Date(order.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'}) }}</span>
              </div>

              <!-- Customer info -->
              <div class="k-card-info">
                <div v-if="order.customerName" class="k-info-row">
                  👤 <strong>{{ order.customerName }}</strong>
                  <span v-if="order.customerPhone">
                    📞 <a :href="`tel:${order.customerPhone}`">{{ order.customerPhone }}</a>
                  </span>
                </div>

                <div class="k-info-row">
                  📍 <span v-if="order.type === 'delivery'">{{ order.address || 'Адрес не указан' }}</span>
                  <span v-else-if="order.type === 'table'">Стол {{ order.tableNumber || '?' }}</span>
                  <span v-else>С собой</span>
                </div>
                
                <div v-if="order.scheduledTime" class="k-info-row">
                  ⏰ <strong>На время: {{ order.scheduledTime }}</strong>
                </div>
                <div v-if="order.comment" class="k-info-row k-comment">
                  💬 {{ order.comment }}
                </div>
              </div>

              
              <div v-if="order.status === 'done' || order.status === 'archived'" class="k-timing-info">
                <div class="k-timing-text">Время заказа: {{ formatTime(order.createdAt) }} • Завершен: {{ formatTime(order.updatedAt) }}</div>
                <div class="k-timing-badge">⏱️ Выполнен за {{ getDiffMins(order.createdAt, order.updatedAt) }} мин</div>
              </div>
              <!-- Order items -->
              <div class="k-card-items">
                <div v-for="item in order.items" :key="item.id" class="k-item-row">
                  <div class="k-item-qty">{{ item.quantity }}x</div>
                  <div class="k-item-name">{{ item.name }}</div>
                </div>
              </div>
              
              <div class="k-card-total">
                <span>Итого:</span>
                <strong>{{ order.totalPrice }} ₽</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="k-orders-grid">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="k-card"
          :class="order.status"
        >
          <!-- Card header -->
          <div class="k-card-head">
            <div class="k-card-id-row">
              <span class="k-order-num">#{{ order.orderNumber || String(order.id).slice(-4) }}</span>
              <span class="k-type-badge" :class="order.type">{{ typeLabel(order.type) }}</span>
            </div>
            <span class="k-time">⏱ {{ elapsed(order) }}</span>
          </div>

          <!-- Customer info -->
          <div class="k-card-info">
            <div v-if="order.customerName" class="k-info-row">
              👤 <strong>{{ order.customerName }}</strong>
              <span v-if="order.customerPhone">
                · <a :href="`tel:${order.customerPhone}`">📞 {{ order.customerPhone }}</a>
              </span>
            </div>

            <div class="k-info-row">
              <template v-if="order.type === 'delivery'">
                🚴 {{ order.address || 'Адрес не указан' }}
                </template>
              <template v-else-if="order.type === 'pickup'">
                📦 Самовывоз
              </template>
              <template v-else>
                🍽️ Стол №{{ order.tableNumber || '—' }}
              </template>
            </div>

            <div v-if="order.comment" class="k-info-row note">
              💬 {{ order.comment }}
            </div>

            <div v-if="order.scheduledTime" class="k-info-row">
              🕐 На время: {{ order.scheduledTime }}
            </div>
          </div>

          
            <div v-if="order.status === 'done' || order.status === 'archived'" class="k-timing-info">
              <div class="k-timing-text">Время заказа: {{ formatTime(order.createdAt) }} • Завершен: {{ formatTime(order.updatedAt) }}</div>
              <div class="k-timing-badge">⏱️ Выполнен за {{ getDiffMins(order.createdAt, order.updatedAt) }} мин</div>
            </div>
            <!-- Items -->
          <div class="k-card-items">
            <div v-for="item in order.items" :key="item.id" class="k-item-row">
              <span><b>{{ item.quantity }}×</b> {{ item.name }}</span>
              <span class="k-item-price">{{ (item.price * item.quantity).toFixed(0) }} ₽</span>
            </div>
          </div>

          <!-- Total -->
          <div class="k-card-total">
            Итого: <strong>{{ Number(order.totalPrice).toFixed(0) }} ₽</strong>
          </div>

          <!-- Rejection note (for cancelled) -->
          <div v-if="order.status === 'cancelled' && order.rejectionNote" class="k-rejection-note">
            ❌ Причина отклонения: <em>{{ order.rejectionNote }}</em>
          </div>

          <!-- Actions -->
          <div class="k-card-actions">
            <!-- New orders -->
            <template v-if="order.status === 'new'">
              <button class="k-btn accept" @click="acceptOrder(order)">✅ Принять</button>
              <button class="k-btn reject" @click="openRejectModal(order)">❌ Отклонить</button>
            </template>

            <!-- In progress -->
            <template v-else-if="order.status === 'progress'">
              <button class="k-btn done" @click="changeStatus(order.id, 'done')">✔ Готово</button>
              <button class="k-btn reject" @click="openRejectModal(order)">❌ Отклонить</button>
            </template>
            
            <!-- Done -->
            <template v-else-if="order.status === 'done' && role !== 'cook'">
              <button class="k-btn" style="background: #4f46e5; color: white; border: none;" @click="changeStatus(order.id, 'archived')">🔒 Закрыть чек</button>
            </template>
          </div>
        </div>
      </div>
    </main>

    <!-- REJECT MODAL -->
    <div v-if="rejectModal.open" class="k-modal-overlay" @click.self="rejectModal.open = false">
      <div class="k-modal">
        <h3>Отклонить заказ #{{ rejectModal.order?.orderNumber || rejectModal.order?.id?.slice(-4) }}</h3>
        <p class="k-modal-sub">Укажите причину отклонения (обязательно)</p>
        <textarea
          v-model="rejectModal.note"
          class="k-modal-textarea"
          placeholder="Например: нет ингредиентов, закрыты, технический перерыв..."
          rows="4"
        ></textarea>
        <div class="k-modal-actions">
          <button class="k-btn cancel-btn" @click="rejectModal.open = false">Отмена</button>
          <button
            class="k-btn reject confirm-reject"
            :disabled="!rejectModal.note.trim()"
            @click="confirmReject"
          >
            Подтвердить отклонение
          </button>
        </div>
      </div>
    </div>
  </div>
    <StopListModal v-if="showStopList" :is-light="isLight" @close="showStopList = false" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { LogOut, RefreshCw, Moon, Sun, AlertOctagon } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ordersApi } from '../api'
import StopListModal from '../components/kitchen/StopListModal.vue'

const router = useRouter()

const orders = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const currentTab = ref<string>('new')
const showStopList = ref(false)
const isLight = ref(true)
const lastRefreshed = ref<Date | null>(null)
let refreshTimer: ReturnType<typeof setInterval> | null = null

const rejectModal = ref<{ open: boolean; order: any | null; note: string }>(
  { open: false, order: null, note: '' }
)

const savedUser = (() => {
  try { return JSON.parse(localStorage.getItem('currentUser') || '{}') } catch { return {} }
})()
const staffName = savedUser.name || 'Персонал'
const role = savedUser.role || ''
const roleLabel = role === 'cook' ? '👨‍🍳 Повар' : role === 'waiter' ? '🧑‍🍽️ Официант' : role === 'barista' ? '☕ Бармен' : '👤 Сотрудник'

const tabs = [
  { key: 'new',       label: 'Новые',     emptyIcon: '📭', emptyText: 'Нет новых заказов' },
  { key: 'progress',  label: 'В работе',  emptyIcon: '🔧', emptyText: 'Нет заказов в работе' },
  { key: 'done',      label: 'Готовы',    emptyIcon: '✅', emptyText: 'Нет готовых заказов' },
  { key: 'cancelled', label: 'Отклонены', emptyIcon: '🚫', emptyText: 'Нет отклонённых заказов' },
]

if (role !== 'cook') {
  tabs.push({ key: 'archived', label: 'Архив', emptyIcon: '📦', emptyText: 'Архив пуст' })
}

const currentTabMeta = computed(() => tabs.find(t => t.key === currentTab.value))
const filteredOrders = computed(() => orders.value.filter(o => o.status === currentTab.value))
const countByStatus = (status: string) => orders.value.filter(o => o.status === status).length

const groupedArchivedOrders = computed(() => {
  if (currentTab.value !== 'archived') return [];
  const groups: Record<string, any[]> = {};
  
  filteredOrders.value.forEach(order => {
    // order.createdAt is usually ISO string
    const dateObj = new Date(order.createdAt);
    const dateKey = dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(order);
  });
  
  // Return sorted by date descending? They are already sorted by backend, so just preserve order of keys
  return Object.keys(groups).map(date => ({
    date,
    orders: groups[date]
  }));
});


function typeLabel(type: string) {
  if (type === 'delivery') return '🚴 Доставка'
  if (type === 'pickup')   return '📦 Самовывоз'
  return '🍽 Зал'
}


function formatTime(dateString: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function getDiffMins(start: string, end: string) {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.round((e - s) / 60000);
}

function elapsed(order: any) {
  if (!order.createdAt) return '—';
  let end = Date.now();
  if (order.status === 'archived' || order.status === 'cancelled') {
    if (order.updatedAt) {
      end = new Date(order.updatedAt).getTime();
    }
  }
  const diff = Math.floor((end - new Date(order.createdAt).getTime()) / 1000)
  if (diff < 60) return `${diff}с`
  if (diff < 3600) return `${Math.floor(diff / 60)}мин`
  return `${Math.floor(diff / 3600)}ч ${Math.floor((diff % 3600) / 60)}мин`
}

const lastRefreshedStr = computed(() => {
  if (!lastRefreshed.value) return '—'
  return lastRefreshed.value.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

const orderStatuses = ref<Map<string, string>>(new Map());
let isFirstLoad = true;

// Глобальный контекст для звука, инициализируется по клику
let audioCtx: AudioContext | null = null;
const initAudio = () => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Воспроизводим тишину для разблокировки на iOS
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {
      console.error("Audio init failed", e);
    }
  }
};

const playBeep = () => {
  try {
    if (!audioCtx) initAudio();
    if (audioCtx?.state === 'suspended') audioCtx.resume();
    
    const ctx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
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

async function fetchOrders() {
  loading.value = true
  error.value = ''
  try {
    const data = await ordersApi.getAll() as any[]
    
    if (!isFirstLoad) {
      let shouldBeep = false;
      for (const o of data) {
        const oldStatus = orderStatuses.value.get(o.id);
        const isNewToCook = role === 'cook' && (o.status === 'new' || o.status === 'open') && oldStatus !== o.status;
        const isNewToWaiter = (role === 'waiter' || role === 'barista') && (o.status === 'new' || o.status === 'open' || o.status === 'done') && oldStatus !== o.status;
        
        if (isNewToCook || isNewToWaiter) {
          shouldBeep = true;
          break;
        }
      }
      if (shouldBeep) {
         playBeep();
      }
    }
    
    const newMap = new Map();
    data.forEach(o => newMap.set(o.id, o.status));
    orderStatuses.value = newMap;
    
    isFirstLoad = false;
    
    orders.value = data
    lastRefreshed.value = new Date()
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки заказов'
  } finally {
    loading.value = false
  }
}

async function changeStatus(id: string, status: string, note?: string) {
  try {
    await ordersApi.updateStatusWithNote(id, status, note)
    await fetchOrders()
  } catch (e: any) {
    error.value = e.message || 'Ошибка обновления статуса'
  }
}

function acceptOrder(order: any) {
  changeStatus(order.id, 'progress')
}

function openRejectModal(order: any) {
  rejectModal.value = { open: true, order, note: '' }
}

async function confirmReject() {
  if (!rejectModal.value.note.trim()) return
  await changeStatus(rejectModal.value.order.id, 'cancelled', rejectModal.value.note.trim())
  rejectModal.value.open = false
  currentTab.value = 'cancelled'
}

function logout() {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => {
  fetchOrders()
  refreshTimer = setInterval(fetchOrders, 15000)
  window.addEventListener('click', initAudio, { once: true })
  window.addEventListener('touchstart', initAudio, { once: true })
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  window.removeEventListener('click', initAudio)
  window.removeEventListener('touchstart', initAudio)
})
</script>

<style scoped>
.kitchen-page {
  min-height: 100vh;
  background: #0f1117;
  color: #e4e6ef;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}
.kitchen-page.light-theme {
  background: #f4f6f9;
  color: #1a1d2e;
}
.k-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #1a1d2e;
  border-bottom: 1px solid #2d3148;
  gap: 16px;
}
.light-theme .k-header { background: #fff; border-color: #e2e5f0; }
.k-title-block { display: flex; align-items: center; gap: 12px; }
.k-logo { font-size: 24px; }
.k-title { font-size: 16px; font-weight: 700; margin: 0; white-space: nowrap; }
.k-role { font-size: 11px; color: #8b90b5; white-space: nowrap; }
.light-theme .k-role { color: #6b7080; }

.k-tabs { 
  display: flex; 
  gap: 8px; 
  flex: 1; 
  overflow-x: auto; 
  scrollbar-width: none;
  padding-bottom: 2px;
}
.k-tabs::-webkit-scrollbar { display: none; }
.k-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border: 1.5px solid transparent;
  border-radius: 24px;
  cursor: pointer;
  font-size: 13px; font-weight: 600;
  background: #23263b; color: #8b90b5;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.light-theme .k-tab { background: #f0f2f8; color: #6b7080; }
.k-tab-count {
  background: #333660; color: #fff;
  border-radius: 12px; padding: 2px 6px; font-size: 11px;
}
.k-tab.new.active { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,.12); }
.k-tab.progress.active { border-color: #9D0D0E; color: #9D0D0E; background: rgba(59,130,246,.12); }
.k-tab.done.active { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.12); }
.k-tab.cancelled.active { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,.12); }

.k-header-actions { display: flex; gap: 8px; align-items: center; }
.k-btn-icon {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  background: #23263b; border: 1px solid #333660; color: #8b90b5;
  border-radius: 10px; padding: 8px; font-size: 13px; cursor: pointer;
  transition: all 0.2s;
}
.light-theme .k-btn-icon { background: #f0f2f8; border-color: #e2e5f0; color: #475569; }
.k-btn-icon:hover { background: #2d3148; color: #fff; }
.light-theme .k-btn-icon:hover { background: #e2e8f0; color: #0f172a; }

.btn-stoplist { background: rgba(245,158,11,.1); color: #f59e0b; border-color: rgba(245,158,11,.3); padding: 8px 12px; }
.btn-stoplist:hover { background: rgba(245,158,11,.2) !important; color: #f59e0b !important; }
.btn-logout { background: rgba(239,68,68,.1); color: #ef4444; border-color: rgba(239,68,68,.3); }
.btn-logout:hover { background: rgba(239,68,68,.2) !important; color: #ef4444 !important; }

.k-btn-icon.rotating svg { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Mobile layout adjustments */
@media (max-width: 768px) {
  .k-header { flex-direction: column; align-items: stretch; padding: 16px; gap: 16px; }
  .k-title-block { justify-content: space-between; }
  .k-header-actions { justify-content: space-between; }
  .btn-text { display: none; }
  .k-btn-icon { flex: 1; padding: 10px; }
  .k-tabs { padding-bottom: 4px; }
}

.k-autorefresh-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 24px; font-size: 11px; color: #6b7280;
  background: #12141f; border-bottom: 1px solid #1e2133;
}
.light-theme .k-autorefresh-bar { background: #f8f9fc; border-color: #e5e7eb; }
.pulse-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #22c55e; animation: pulse 2s infinite; display: inline-block;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
.k-main { flex: 1; padding: 20px 24px; overflow-y: auto; }
.k-alert.error {
  background: rgba(239,68,68,.15); border: 1px solid #ef4444;
  color: #fca5a5; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
}
.k-loading { display: flex; gap: 16px; flex-wrap: wrap; }
.skeleton-card {
  flex: 1 1 280px; height: 200px; border-radius: 12px;
  background: linear-gradient(90deg, #1e2133 25%, #252839 50%, #1e2133 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }
.k-empty { text-align: center; padding: 80px 20px; color: #4b5280; }
.k-empty-icon { font-size: 52px; margin-bottom: 12px; }
.k-orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.k-card {
  background: #1a1d2e; border: 1.5px solid #2d3148;
  border-radius: 12px; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.light-theme .k-card { background: #fff; border-color: #e2e5f0; }
.k-card.new       { border-color: #f59e0b44; }
.k-card.progress  { border-color: #9D0D0E44; }
.k-card.done      { border-color: #22c55e44; }
.k-card.cancelled { border-color: #ef444444; opacity: 0.75; }
.k-card-head { display: flex; justify-content: space-between; align-items: center; }
.k-card-id-row { display: flex; align-items: center; gap: 8px; }
.k-order-num { font-size: 18px; font-weight: 800; }
.k-type-badge { font-size: 11px; padding: 3px 8px; border-radius: 10px; font-weight: 600; }
.k-type-badge.delivery { background: #1e3a5f; color: #60a5fa; }
.k-type-badge.pickup   { background: #1a3020; color: #4ade80; }
.k-type-badge.onsite   { background: #2d2010; color: #fb923c; }
.k-time { font-size: 12px; color: #6b7280; }
.k-card-info { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
.k-info-row { display: flex; flex-wrap: wrap; gap: 4px; align-items: baseline; }
.k-info-row a { color: #60a5fa; text-decoration: none; }
.k-info-row.note {
  background: rgba(250,204,21,.08); border-left: 3px solid #fbbf24;
  padding: 4px 8px; border-radius: 0 4px 4px 0; font-style: italic; color: #fcd34d;
}
.light-theme .k-info-row.note { background: #fefce8; color: #92400e; }
.k-card-items { border-top: 1px solid #252839; padding-top: 10px; display: flex; flex-direction: column; gap: 5px; }
.light-theme .k-card-items { border-color: #f1f3f9; }
.k-item-row { display: flex; justify-content: space-between; font-size: 13px; }
.k-item-price { color: #9ca3af; }
.k-card-total { font-size: 14px; font-weight: 600; text-align: right; }
.k-rejection-note {
  background: rgba(239,68,68,.1); border: 1px solid #ef444440;
  border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #fca5a5;
}
.light-theme .k-rejection-note { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
.k-card-actions { display: flex; gap: 8px; }
.k-btn {
  flex: 1; padding: 10px 0; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s;
}
.k-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.k-btn:hover:not(:disabled) { opacity: 0.85; }
.k-btn.accept { background: #166534; color: #86efac; }
.k-btn.reject { background: #7f1d1d; color: #fca5a5; }
.k-btn.done   { background: #1e40af; color: #93c5fd; }
.k-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; backdrop-filter: blur(4px);
}
.k-modal {
  background: #1a1d2e; border: 1.5px solid #2d3148;
  border-radius: 14px; padding: 28px; width: 480px; max-width: 95vw;
}
.k-modal h3 { margin: 0 0 4px; font-size: 18px; }
.k-modal-sub { margin: 0 0 16px; font-size: 13px; color: #9ca3af; }
.k-modal-textarea {
  width: 100%; background: #0f1117; border: 1.5px solid #2d3148;
  border-radius: 8px; color: #e4e6ef; padding: 12px; font-size: 14px;
  resize: vertical; box-sizing: border-box;
}
.k-modal-textarea:focus { outline: none; border-color: #ef4444; }
.k-modal-actions { display: flex; gap: 10px; margin-top: 14px; justify-content: flex-end; }
.k-btn.cancel-btn { background: #374151; color: #d1d5db; max-width: 120px; }
.k-btn.confirm-reject { background: #991b1b; color: #fecaca; max-width: 220px; }

  .k-archive-container { display: flex; flex-direction: column; gap: 24px; }
  .k-archive-group { display: flex; flex-direction: column; gap: 12px; }
  .k-archive-date { margin: 0; font-size: 16px; font-weight: bold; color: #8b90b5; border-bottom: 1px solid #2d3148; padding-bottom: 8px; }
  .light-theme .k-archive-date { color: #4b5563; border-color: #e5e7eb; }
  
  .k-card.archived { opacity: 0.6; background: #12141f; border-color: #2d3148; }
  .light-theme .k-card.archived { opacity: 0.8; background: #f9fafb; border-color: #e5e7eb; }
  
  .k-card-total { display: flex; justify-content: space-between; border-top: 1px solid #2d3148; margin-top: 12px; padding-top: 12px; font-size: 14px; }
  .light-theme .k-card-total { border-color: #e5e7eb; }

.k-timing-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
  margin-bottom: 4px;
}
.k-timing-text {
  font-size: 12px;
  color: #d1d5db;
}
.light-theme .k-timing-text {
  color: #374151;
}
.k-timing-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  width: fit-content;
}
.light-theme .k-timing-badge {
  background: #dcfce7;
  color: #166534;
}

</style>

