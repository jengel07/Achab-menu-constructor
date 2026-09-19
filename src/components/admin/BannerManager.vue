<template>
  <div class="banner-manager">
    <div class="manager-header">
      <h2>Баннеры с акциями</h2>
      <p>Эти баннеры будут отображаться в верхней части меню у ваших клиентов в виде карусели.</p>
    </div>

    <div class="upload-section">
      <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="onFileSelected" />
      <button class="smenu-btn-primary" @click="triggerFileInput" :disabled="uploading">
        <Upload :size="18" style="margin-right: 8px;" />
        {{ uploading ? 'Загрузка...' : 'Добавить баннер' }}
      </button>
      <div v-if="error" class="error-text">{{ error }}</div>
    </div>

    <div v-if="loading" class="loading-state">Загрузка баннеров...</div>

    <div v-else-if="banners.length === 0" class="empty-state">
      <div style="font-size: 32px; margin-bottom: 8px;">🖼️</div>
      <p>У вас пока нет ни одного баннера.</p>
    </div>

    <div v-else class="banners-list">
      <div v-for="(banner, index) in banners" :key="banner.id" class="banner-card">
        <div class="banner-image">
          <img :src="banner.imageUrl" alt="Promo banner" />
        </div>
        
        <div class="banner-actions">
          <label class="switch-wrap">
            <span class="switch-label">{{ banner.isActive ? 'Активно' : 'Скрыто' }}</span>
            <label class="switch">
              <input type="checkbox" :checked="banner.isActive" @change="toggleStatus(banner)" />
              <span class="slider round"></span>
            </label>
          </label>
          
          <button class="btn-delete" @click="deleteBanner(banner.id)" title="Удалить">
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Upload, Trash2 } from 'lucide-vue-next';
import { bannersApi } from '../../api';

const props = defineProps({
  restaurantId: { type: String, required: true }
});

const fileInput = ref<HTMLInputElement | null>(null);
const banners = ref<any[]>([]);
const loading = ref(true);
const uploading = ref(false);
const error = ref('');

const loadBanners = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await bannersApi.getAll(props.restaurantId);
    banners.value = res.banners || [];
  } catch (err: any) {
    error.value = err.message || 'Ошибка загрузки баннеров';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadBanners();
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file = target.files[0];
  
  // Convert to base64
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    const base64 = reader.result as string;
    await uploadBanner(base64);
    // Reset file input
    if (fileInput.value) fileInput.value.value = '';
  };
};

const uploadBanner = async (base64: string) => {
  uploading.value = true;
  error.value = '';
  try {
    const res = await bannersApi.create(props.restaurantId, {
      imageUrl: base64,
      order: banners.value.length
    });
    banners.value.push(res.banner);
  } catch (err: any) {
    error.value = err.message || 'Ошибка при загрузке';
  } finally {
    uploading.value = false;
  }
};

const toggleStatus = async (banner: any) => {
  const oldState = banner.isActive;
  banner.isActive = !oldState;
  try {
    await bannersApi.update(banner.id, { isActive: banner.isActive });
  } catch (err) {
    banner.isActive = oldState;
    alert('Не удалось изменить статус');
  }
};

const deleteBanner = async (id: string) => {
  if (!confirm('Точно удалить этот баннер?')) return;
  try {
    await bannersApi.remove(id);
    banners.value = banners.value.filter(b => b.id !== id);
  } catch (err) {
    alert('Ошибка при удалении');
  }
};
</script>

<style scoped>
.banner-manager {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.manager-header {
  margin-bottom: 24px;
}

.manager-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  color: #111827;
}

.manager-header p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.upload-section {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.hidden {
  display: none;
}

.error-text {
  color: #ef4444;
  font-size: 0.9rem;
}

.smenu-btn-primary {
  display: flex;
  align-items: center;
  background: #9D0D0E;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.smenu-btn-primary:hover {
  opacity: 0.9;
}

.smenu-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px dashed #d1d5db;
}

.banners-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.banner-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.banner-image {
  flex: 1;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  min-width: 120px;
}

.switch-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.switch-label {
  font-size: 0.85rem;
  color: #4b5563;
  font-weight: 500;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #22c55e;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.btn-delete {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #fecaca;
}
</style>

