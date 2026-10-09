<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import type { RestaurantInfo } from '../types/menu';
import html2canvas from 'html2canvas';
import QrcodeVue from 'qrcode.vue';

const props = defineProps<{ modelValue: RestaurantInfo }>();
const emit = defineEmits(['update:model-value']);

const downloadFormat = ref('PNG');
const exportRef = ref<HTMLElement | null>(null);

const qrMode = ref('menu');
const wifiSsid = ref('');
const wifiPassword = ref('');
const qrText = ref(props.modelValue.qrSettings?.text || '');

watch(() => props.modelValue.qrSettings?.text, (newVal) => {
  if (qrText.value !== newVal) {
    qrText.value = newVal || '';
  }
});

const update = (key: string, value: any) => {
  emit('update:model-value', { 
    ...props.modelValue, 
    qrSettings: { ...props.modelValue.qrSettings, [key]: value } 
  });
};

// --- АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ ССЫЛКИ ---
const fixQrUrl = async () => {
  const currentUserRaw = localStorage.getItem('currentUser');
  let realRestaurantId = (props.modelValue as any).id || (props.modelValue as any).restaurantId;
  
  if (!realRestaurantId && currentUserRaw) {
    try {
      realRestaurantId = JSON.parse(currentUserRaw).restaurantId;
    } catch (e) {}
  }

  const currentUrl = props.modelValue.qrSettings?.url || '';

  
  const isOldLocalIp = currentUrl.includes('/client?id=') && !currentUrl.startsWith(window.location.origin);
  if (realRestaurantId && (!currentUrl || currentUrl.includes('preview=true') || currentUrl === 'https://example.com' || currentUrl.includes('undefined') || currentUrl.includes('localhost') || isOldLocalIp)) {
    
    let origin = window.location.origin;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const res = await fetch('/api/lan-ip');
        if (res.ok) {
          const data = await res.json();
          if (data.ip && data.ip !== 'localhost' && data.ip !== '127.0.0.1') {
            const port = window.location.port ? `:${window.location.port}` : '';
            origin = `${window.location.protocol}//${data.ip}${port}`;
          }
        }
      } catch (e) {
        console.warn('Could not fetch LAN IP', e);
      }
    }

    const autoUrl = `${origin}/client?id=${realRestaurantId}`;
    update('url', autoUrl);
  }
};

onMounted(fixQrUrl);
watch(() => props.modelValue.qrSettings?.url, fixQrUrl);

const currentQrValue = computed(() => {
  if (qrMode.value === 'wifi') {
    return `WIFI:S:${wifiSsid.value};T:WPA;P:${wifiPassword.value};;`;
  }
  return props.modelValue.qrSettings?.url || 'https://example.com';
});

const downloadQRCode = async () => {
  if (!exportRef.value) return;
  
  if (downloadFormat.value === 'PNG') {
    const canvas = await html2canvas(exportRef.value, {
      scale: 3,
      backgroundColor: props.modelValue?.qrSettings?.textBgColor || '#000000',
      useCORS: true
    });
    
    const link = document.createElement('a');
    link.download = `qr-${qrMode.value}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } else if (downloadFormat.value === 'SVG') {
    const svgElement = exportRef.value.querySelector('svg');
    if (!svgElement) return;

    const fullSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="272" height="300" viewBox="0 0 272 300">
        <rect width="100%" height="100%" rx="16" fill="${props.modelValue.qrSettings?.textBgColor || '#000000'}" />
        <g transform="translate(24, 24)">
          <rect width="224" height="224" rx="12" fill="${props.modelValue?.qrSettings?.bgColor || '#ffffff'}" />
          <g transform="translate(12, 12)">
            ${svgElement.outerHTML}
          </g>
        </g>
        <text x="136" y="276" 
            fill="${props.modelValue.qrSettings?.textColor || '#ffffff'}" 
            font-family="${props.modelValue.qrSettings?.fontFamily || 'Comfortaa'}" 
            font-size="16" 
            font-weight="bold" 
            text-anchor="middle">
          ${qrText.value}
        </text>
      </svg>
    `;

    const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qr-${qrMode.value}-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
};
</script>

<template>
  <div class="qr-page-wrapper">
    <!-- Общий контейнер в ряд: настройки и превью -->
    <div class="qr-editor-container">
      
      <!-- Карточка настроек -->
      <div class="controls-card">
        <h3>Настройки QR-кода</h3>
        
        <div class="control-group">
          <label>Тип QR-кода:</label>
          <div style="display: flex; gap: 10px; margin-top: 5px; margin-bottom: 10px;">
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="radio" v-model="qrMode" value="menu"> Меню
            </label>
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="radio" v-model="qrMode" value="wifi"> Wi-Fi
            </label>
          </div>
        </div>

        <template v-if="qrMode === 'menu'">
          <div class="control-group">
            <label>Ссылка для QR:</label> 
            <input 
              type="text" 
              :value="modelValue.qrSettings?.url" 
              @input="update('url', ($event.target as HTMLInputElement).value)"
              placeholder="https://example.com"
            >
          </div>
        </template>

        <template v-if="qrMode === 'wifi'">
          <div class="control-group">
            <label>Имя сети (SSID):</label> 
            <input type="text" v-model="wifiSsid" placeholder="MyCafe_Guest" />
          </div>
          <div class="control-group">
            <label>Пароль от Wi-Fi:</label> 
            <input type="text" v-model="wifiPassword" placeholder="Ваш пароль" />
          </div>
        </template>

        <div class="control-group">
          <label>Текст под QR:</label> 
          <input 
            type="text" 
            v-model="qrText"
            @input="update('text', qrText)"
          >
        </div>

        <div class="control-group">
          <label>Шрифт текста:</label>
          <select 
            :value="modelValue.qrSettings?.fontFamily || 'Comfortaa'" 
            @change="update('fontFamily', ($event.target as HTMLSelectElement).value)"
          >
            <option value="Comfortaa">Comfortaa</option>
            <option value="Lora">Lora (Elegant)</option>
            <option value="Playfair Display">Playfair Display (Classic)</option>
            <option value="Oswald">Oswald (Bold)</option>
            <option value="Caveat">Caveat (Handwritten)</option>
            <option value="Montserrat">Montserrat (Geometric)</option>
            <option value="Arvo">Arvo (Sturdy)</option>
            <option value="Lobster">Lobster (Bold Script)</option>
            <option value="Merriweather">Merriweather (Readable)</option>
            <option value="Anton">Anton (Impactful)</option>
          </select>
        </div>

        <div class="control-group">
          <label>Фон QR:</label> 
          <input 
            type="color" 
            :value="modelValue.qrSettings?.bgColor" 
            @input="update('bgColor', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <div class="control-group">
          <label>Квадраты:</label> 
          <input 
            type="color" 
            :value="modelValue.qrSettings?.squareColor" 
            @input="update('squareColor', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <div class="control-group">
          <label>Текст Фон:</label> 
          <input 
            type="color" 
            :value="modelValue.qrSettings?.textBgColor" 
            @input="update('textBgColor', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <div class="control-group">
          <label>Текст Цвет:</label> 
          <input 
            type="color" 
            :value="modelValue.qrSettings?.textColor" 
            @input="update('textColor', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <!-- Блок скачивания -->
        <div class="download-section">
          <div class="control-group">
            <label>Формат файла:</label>
            <select v-model="downloadFormat">
              <option value="PNG">PNG</option>
              <option value="SVG">SVG</option>
            </select>
          </div>
          <button class="download-btn" @click="downloadQRCode">
            📥 Скачать QR-код
          </button>
        </div>
      </div>

      <!-- Блок живого превью QR-кода справа -->
      <div class="preview-section">
        <span class="preview-title">Предпросмотр</span>
        <div 
          class="qr-card-export" 
          :style="{ background: modelValue.qrSettings?.textBgColor || '#000000' }"
          ref="exportRef"
        >
          <div class="qr-box-export" :style="{ background: modelValue.qrSettings?.bgColor || '#ffffff' }">
            <QrcodeVue 
              :value="currentQrValue" 
              :size="200" 
              :foreground="modelValue.qrSettings?.squareColor || '#000000'"
              :background="modelValue.qrSettings?.bgColor || '#ffffff'"
              level="H" 
              render-as="svg"
              :image-settings="{ src: modelValue.logo || '/favicon-02.png', width: 50, height: 50, excavate: true }"
            />
          </div>
          <div 
            class="qr-label-export" 
            :style="{ 
              color: modelValue.qrSettings?.textColor || '#ffffff',
              fontFamily: modelValue.qrSettings?.fontFamily || 'Comfortaa'
            }"
          >
            {{ qrText }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Главный контейнер выстраивает настройки и превью в ряд */
.qr-editor-container { 
  display: flex; 
  flex-direction: row;
  align-items: flex-start;
  gap: 24px; 
  flex-wrap: wrap;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.preview-title {
  font-size: 13px;
  color: var(--text-muted, #aaa);
  margin-left: 4px;
}

.controls-card {
  background: var(--card-bg, #c0c0c030);
  border: 1px solid var(--border-color, #333);
  padding: 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--text-main, #fff);
  width: 380px;
}

:global(.constructor-wrapper.light-theme) .controls-card {
  background: var(--card-bg, #ffffff) !important;
  border-color: var(--border-color, #545454) !important;
  color: var(--text-main, #333) !important;
}

.controls-card h3 {
  margin-bottom: 5px;
  font-size: 18px;  
  color: var(--text-main);
}
.control-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.control-group label {
  font-size: 14px;
  color: var(--text-muted, #ccc);
}

:global(.constructor-wrapper.light-theme) .control-group label {
  color: var(--text-muted, #666) !important;
}

.control-group input[type="text"],
.control-group select {
  background: var(--input-bg, #8e8d8d5b);
  border: 1px solid var(--border-color, #444);
  color: var(--text-main, #fff);
  padding: 8px 12px;
  border-radius: 6px;
  outline: none;
  width: 180px;
}

:global(.constructor-wrapper.light-theme) .control-group input[type="text"],
:global(.constructor-wrapper.light-theme) .control-group select {
  background: var(--input-bg, #f4f5f7) !important;
  border-color: var(--border-color, #555555) !important;
  color: var(--text-main, #333) !important;
}

.control-group select {
  cursor: pointer;
}
.control-group input[type="color"] {
  border: none;
  width: 40px;
  height: 32px;
  cursor: pointer;
  background: transparent;
  border-radius: 4px;
}
.download-section {
  margin-top: 10px;
  border-top: 1px solid var(--border-color, #333);
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.download-btn {
  background: #ff5722;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}
.download-btn:hover {
  background: #f4511e;
}

.qr-card-export {
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: max-content;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin: 0 auto;
}
.qr-box-export {
  padding: 12px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.qr-label-export {
  margin-top: 12px;
  font-weight: bold;
  font-size: 15px;
  width: 100%;
  word-break: break-word;
}
</style>