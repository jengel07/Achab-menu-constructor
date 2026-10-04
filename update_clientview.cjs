import fs from 'fs';

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// 1. Fetch orderMode
if (!vue.includes('store.orderMode = data.orderMode')) {
    vue = vue.replace(
      'store.updateItems(data.items || []);',
      "store.updateItems(data.items || []);\n        store.orderMode = data.orderMode || 'ORDER';"
    );
}

// 2. Hide cart buttons for standard items
const cartBlock1 = /<div v-if="!item\.priceBottle && !item\.priceGlass">/g;
vue = vue.replace(cartBlock1, `<div v-if="!item.priceBottle && !item.priceGlass && store.orderMode !== 'CATALOG'">`);

// 3. Hide open variant modal button (which is also Add to Cart)
const cartBlock2 = /<div v-else>\s*<button class="add-to-cart-btn"/;
vue = vue.replace(cartBlock2, `<div v-else-if="store.orderMode !== 'CATALOG'">\n                      <button class="add-to-cart-btn"`);

// 4. Hide variant glass cart controls
const glassControls = /<div v-if="getItemQuantity\(selectedVariantItem\.id \+ '_glass'\) > 0" class="counter-controls"/;
vue = vue.replace(glassControls, `<div v-if="getItemQuantity(selectedVariantItem.id + '_glass') > 0 && store.orderMode !== 'CATALOG'" class="counter-controls"`);

const glassBtn = /<button v-else class="add-to-cart-btn"(:style="\{ backgroundColor: restaurantInfo\.primaryColor \|\| '#9D0D0E', width: 'auto', padding: '8px 16px', color: 'white' \}" @click="addToCart\(\{ \.\.\.selectedVariantItem, id: selectedVariantItem\.id \+ '_glass',)/;
vue = vue.replace(glassBtn, `<button v-else-if="store.orderMode !== 'CATALOG'" class="add-to-cart-btn"$1`);

// 5. Hide variant bottle cart controls
const bottleControls = /<div v-if="getItemQuantity\(selectedVariantItem\.id \+ '_bottle'\) > 0" class="counter-controls"/;
vue = vue.replace(bottleControls, `<div v-if="getItemQuantity(selectedVariantItem.id + '_bottle') > 0 && store.orderMode !== 'CATALOG'" class="counter-controls"`);

const bottleBtn = /<button v-else class="add-to-cart-btn"(:style="\{ backgroundColor: restaurantInfo\.primaryColor \|\| '#9D0D0E', width: 'auto', padding: '8px 16px', color: 'white' \}" @click="addToCart\(\{ \.\.\.selectedVariantItem, id: selectedVariantItem\.id \+ '_bottle',)/;
vue = vue.replace(bottleBtn, `<button v-else-if="store.orderMode !== 'CATALOG'" class="add-to-cart-btn"$1`);

// 6. Floating cart bar
const floatingCart = /<div v-if="cartItems\.length > 0 && !showCheckoutModal" class="floating-cart-bar"/;
vue = vue.replace(floatingCart, `<div v-if="cartItems.length > 0 && !showCheckoutModal && store.orderMode !== 'CATALOG'" class="floating-cart-bar"`);

fs.writeFileSync('src/views/ClientView.vue', vue);

