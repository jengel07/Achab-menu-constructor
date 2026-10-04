import fs from 'fs';

let vue = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

// The store is used or we can use props? Let's check.
// If it doesn't use store, we can use `props.restaurantInfo?.orderSettings?.currentMode !== 'menu'` ?
// Wait, `orderMode` is now in `store.orderMode`. 
// PhoneMockupContent is imported in Constructor.vue and is part of the admin panel. 
// It DOES import `useMenuStore`? Let's just import it if missing.

if (!vue.includes('import { useMenuStore }')) {
    vue = vue.replace(/import \{.*?\} from 'vue';/, `$& \nimport { useMenuStore } from '../store/menuStore';`);
    vue = vue.replace(/const props = defineProps/, `const store = useMenuStore();\n  const props = defineProps`);
}

// 2. Hide cart buttons for standard items
const cartBlock1 = /<div v-if="getItemQuantity\(item\.id\) > 0" class="counter-controls"/g;
vue = vue.replace(cartBlock1, `<div v-if="getItemQuantity(item.id) > 0 && store.orderMode !== 'CATALOG'" class="counter-controls"`);

const cartBtn1 = /<button v-else class="add-to-cart-btn"(:style="\{ backgroundColor: currentRestaurantInfo\.primaryColor \|\| '#9D0D0E', width: '100%', padding: '6px 12px' \}" @click="item\.modifiers && item\.modifiers\.length > 0 \? modifierItem = item : addToCart\(item\)")>/g;
vue = vue.replace(cartBtn1, `<button v-else-if="store.orderMode !== 'CATALOG'" class="add-to-cart-btn"$1>`);

const floatingCart = /<div v-if="cartItems\.length > 0 && !showCheckoutModal" class="floating-cart-bar"/;
vue = vue.replace(floatingCart, `<div v-if="cartItems.length > 0 && !showCheckoutModal && store.orderMode !== 'CATALOG'" class="floating-cart-bar"`);

fs.writeFileSync('src/components/PhoneMockupContent.vue', vue);

