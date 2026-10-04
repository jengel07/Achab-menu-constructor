import fs from 'fs';

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// Replace the v-if condition for floating-waiter-fab
vue = vue.replace(
  `<button v-if="!showCheckoutModal && store.orderMode !== 'CATALOG'" \n  class="floating-waiter-fab"`,
  `<button v-if="!showCheckoutModal"\n  class="floating-waiter-fab"`
);

// Also handle the inline version if it was single-line
vue = vue.replace(
  `<button v-if="!showCheckoutModal && store.orderMode !== 'CATALOG'" class="floating-waiter-fab"`,
  `<button v-if="!showCheckoutModal" class="floating-waiter-fab"`
);

fs.writeFileSync('src/views/ClientView.vue', vue);

