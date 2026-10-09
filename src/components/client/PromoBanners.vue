<template>
  <div v-if="banners.length > 0" class="promo-banners-container">
    <div class="banners-carousel" ref="carousel">
      <div 
        v-for="banner in banners" 
        :key="banner.id" 
        class="banner-slide"
      >
        <img :src="banner.imageUrl" alt="Promo" />
      </div>
    </div>
    
    <div v-if="banners.length > 1" class="carousel-indicators">
      <div 
        v-for="(banner, index) in banners" 
        :key="banner.id" 
        class="indicator"
        :class="{ active: currentIndex === index }"
      ></div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { bannersApi } from '../../api';

const props = defineProps({
  restaurantId: { type: String, required: false }
});

const banners = ref<any[]>([]);
const carousel = ref<HTMLElement | null>(null);
const currentIndex = ref(0);


const fetchBanners = async () => {
  if (!props.restaurantId) return;
  try {
    const res = await bannersApi.getActive(props.restaurantId);
    banners.value = res.banners || [];
  } catch (error) {
    console.error('Failed to load banners', error);
  }
};

onMounted(fetchBanners);
watch(() => props.restaurantId, fetchBanners);

let intervalId: any;
onMounted(() => {
  intervalId = setInterval(() => {
    if (!carousel.value || banners.value.length <= 1) return;
    const width = carousel.value.offsetWidth;
    let nextIndex = currentIndex.value + 1;
    if (nextIndex >= banners.value.length) nextIndex = 0;
    carousel.value.scrollTo({ left: width * nextIndex, behavior: 'smooth' });
  }, 5000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<style scoped>
.promo-banners-container {
  width: 100%;
  margin-bottom: 20px;
  position: relative;
}

.banners-carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  /* margin removed */
  /* border-radius removed */
}

.banners-carousel::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.banner-slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-slide img {
  width: 100%;
  height: auto;
  display: block;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-color, #333);
  opacity: 0.2;
  transition: opacity 0.3s, transform 0.3s;
}

.indicator.active {
  opacity: 0.8;
  transform: scale(1.3);
}
</style>

