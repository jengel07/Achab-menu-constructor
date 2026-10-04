import fs from 'fs';

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// 1. Update loadClientMenu to fetch orderMode
if (!vue.includes('store.orderMode = data.orderMode')) {
    vue = vue.replace(
      'store.updateItems(data.items || []);',
      "store.updateItems(data.items || []);\n        store.orderMode = data.orderMode || 'ORDER';"
    );
}

// 2. Hide "Add to cart" and "+ -" buttons if orderMode === 'CATALOG'
// We have several add-to-cart buttons. We can wrap them in v-if="store.orderMode !== 'CATALOG'"
const cartBtnPatterns = [
    /<div v-if="getItemQuantity\(item\.id\) > 0" class="counter-controls">/g,
    /<button v-else class="add-to-cart-btn" :style="\{ backgroundColor: restaurantInfo\.primaryColor \|\| '#9D0D0E', width: '100%', padding: '6px 12px' \}" @click="item\.modifiers && item\.modifiers\.length > 0 \? modifierItem = item : addToCart\(item\)">/g,
    /<button class="add-to-cart-btn" :style="\{ backgroundColor: restaurantInfo\.primaryColor \|\| '#9D0D0E', width: '100%', padding: '6px 12px' \}" @click="openVariantModal\(item\)">/g,
    /<div v-if="getItemQuantity\(selectedVariantItem\.id \+ '_glass'\) > 0" class="counter-controls" style="margin-bottom: 12px;">/g,
    /<button v-else class="add-to-cart-btn" :style="\{ backgroundColor: restaurantInfo\.primaryColor \|\| '#9D0D0E', width: 'auto', padding: '8px 16px', color: 'white' \}" @click="addToCart\(\{ \.\.\.selectedVariantItem, id: selectedVariantItem\.id \+ '_glass', price: selectedVariantItem\.priceGlass, name: \(\(selectedVariantItem\.name\?\.ru \|\| selectedVariantItem\.name\) \+ ' \(' \+ \(selectedVariantItem\.priceBottleLabel \|\| tDyn\('бокал'\)\) \+ '\)'\) \}\)">/g,
    /<div v-if="getItemQuantity\(selectedVariantItem\.id \+ '_bottle'\) > 0" class="counter-controls">/g,
    /<button v-else class="add-to-cart-btn" :style="\{ backgroundColor: restaurantInfo\.primaryColor \|\| '#9D0D0E', width: 'auto', padding: '8px 16px', color: 'white' \}" @click="addToCart\(\{ \.\.\.selectedVariantItem, id: selectedVariantItem\.id \+ '_bottle', price: selectedVariantItem\.priceBottle, name: \(\(selectedVariantItem\.name\?\.ru \|\| selectedVariantItem\.name\) \+ ' \(' \+ \(selectedVariantItem\.priceBottleLabel \|\| tDyn\('бутылка'\)\) \+ '\)'\) \}\)">/g,
    /<div v-if="cartItems\.length > 0 && !showCheckoutModal" class="floating-cart-bar"/g
];

// Wait, doing this via string replacement might be very fragile.
// Better approach: Since ALL of these add to cart / counter buttons only show if you can order,
// and there's a floating cart bar, what if we just add a condition to them?
// Actually, I can just find `class="counter-controls"` and `class="add-to-cart-btn"`.

