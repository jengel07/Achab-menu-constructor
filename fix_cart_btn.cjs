import fs from 'fs';

let vue = fs.readFileSync('src/components/SettingsbarForClient.vue', 'utf8');

// Make sure useMenuStore is imported
if (!vue.includes('useMenuStore')) {
  vue = vue.replace(
    `import { ref } from 'vue';`,
    `import { ref } from 'vue';\nimport { useMenuStore } from '../store/menuStore';`
  );
  vue = vue.replace(
    `const props = defineProps`,
    `const store = useMenuStore();\nconst props = defineProps`
  );
}

// Replace the checkout button
const oldBtn = `<button class="show-results-btn" :style="{ backgroundColor: primaryColor || '#9D0D0E', color: '#fff' }" @click="$emit('checkout')">{{ tDyn('Оформить заказ') }}</button>`;
const newBtn = `<button v-if="store.orderMode === 'CART'" class="show-results-btn" :style="{ backgroundColor: primaryColor || '#9D0D0E', color: '#fff' }" @click="$emit('call-waiter')">{{ tDyn('Позвать официанта') }}</button>
        <button v-else class="show-results-btn" :style="{ backgroundColor: primaryColor || '#9D0D0E', color: '#fff' }" @click="$emit('checkout')">{{ tDyn('Оформить заказ') }}</button>`;

vue = vue.replace(oldBtn, newBtn);

// Add call-waiter to emits
vue = vue.replace(
  `'increase', 'decrease', 'checkout', 'toggle-filter', 'clear-filters', 'update:searchQuery'`,
  `'increase', 'decrease', 'checkout', 'call-waiter', 'toggle-filter', 'clear-filters', 'update:searchQuery'`
);

fs.writeFileSync('src/components/SettingsbarForClient.vue', vue);

