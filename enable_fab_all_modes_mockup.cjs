import fs from 'fs';

let vue = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

// Replace the v-if condition for floating-waiter-fab
vue = vue.replaceAll(
  `<button v-if="activeModal !== 'cart' && store.orderMode !== 'CATALOG'" \n  class="floating-waiter-fab"`,
  `<button v-if="activeModal !== 'cart'" \n  class="floating-waiter-fab"`
);

vue = vue.replaceAll(
  `<button v-if="activeModal !== 'cart' && store.orderMode !== 'CATALOG'" class="floating-waiter-fab"`,
  `<button v-if="activeModal !== 'cart'" class="floating-waiter-fab"`
);

fs.writeFileSync('src/components/PhoneMockupContent.vue', vue);

