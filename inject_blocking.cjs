import fs from 'fs';

let code = fs.readFileSync('src/Constructor.vue', 'utf8');

if (!code.includes('isBlocked')) {
  // Add isBlocked computed property
  code = code.replace(/const currentRestaurant = computed\(\(\) => menuStore\.restaurant\);/, 
    "const currentRestaurant = computed(() => menuStore.restaurant);\nconst isBlocked = computed(() => currentRestaurant.value?.status === 'BLOCKED');");

  // Add Watcher to force 'payment' view if blocked
  code = code.replace(/onMounted\(async \(\) => \{/,
    `watch(isBlocked, (blocked) => {
  if (blocked) {
    sidebarView.value = 'payment';
  }
}, { immediate: true });

onMounted(async () => {`);

  // Inject HTML Banner and locking logic
  code = code.replace(/<div class="sidebar" v-show="!isMobileView \|\| !isMobile">/, 
    `<div v-if="isBlocked" style="position: fixed; top: 0; left: 0; right: 0; background: #dc3545; color: white; padding: 15px; text-align: center; z-index: 9999; font-weight: bold; font-size: 16px;">
      ВНИМАНИЕ: Ваш аккаунт заблокирован за неуплату. Оплатите подписку для восстановления доступа (публичное меню также скрыто).
    </div>
    <div class="sidebar" v-show="!isMobileView || !isMobile" :style="isBlocked ? 'pointer-events: none; opacity: 0.5;' : ''">`);
    
  code = code.replace(/<div class="editor-content">/,
    `<div class="editor-content" :style="isBlocked && sidebarView !== 'payment' ? 'pointer-events: none; opacity: 0.5;' : ''">`);

  fs.writeFileSync('src/Constructor.vue', code);
  console.log('Constructor.vue blocked logic injected');
} else {
  console.log('Constructor.vue already has blocked logic');
}

