const fs = require('fs');
let file = fs.readFileSync('src/Constructor.vue', 'utf8');

// Insert a computed property for the restaurant ID
const computedScript = `
const currentRestId = computed(() => {
  const storeInfo = menuStore.restaurantInfo as any;
  if (storeInfo?.id) return storeInfo.id;
  if (storeInfo?.restaurantId) return storeInfo.restaurantId;
  try { return JSON.parse(localStorage.getItem('currentUser') || '{}').restaurantId; } catch { return ''; }
});
`;

file = file.replace(/const isBlocked = ref\(false\);/, computedScript + '\nconst isBlocked = ref(false);');

file = file.replace(/:restaurantId="\(menuStore\.restaurantInfo as any\)\.id \|\| \(menuStore\.restaurantInfo as any\)\.restaurantId \|\| JSON\.parse\(localStorage\.getItem\('currentUser'\) \|\| '\{\}'\)\.restaurantId"/g, ':restaurantId="currentRestId"');

fs.writeFileSync('src/Constructor.vue', file);
console.log('Fixed Constructor.vue localStorage in template');
