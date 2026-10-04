const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// Force pointer-events and add alert
vue = vue.replace(
  /class="floating-cart-bar" @click="activeModal = 'cart'" :style="{ backgroundColor: restaurantInfo\.primaryColor \|\| '#10b981' }"/,
  `class="floating-cart-bar" @click="activeModal = 'cart'" :style="{ backgroundColor: restaurantInfo.primaryColor || '#10b981', pointerEvents: 'auto' }"`
);

fs.writeFileSync('src/views/ClientView.vue', vue);
