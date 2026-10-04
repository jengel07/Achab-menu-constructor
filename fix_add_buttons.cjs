const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// 1. Fix counter-controls
vue = vue.replace(
  /<div v-if="getItemQuantity\((.*?)\) > 0" class="counter-controls"/g,
  '<div v-if="getItemQuantity($1) > 0 && store.orderMode !== \'CATALOG\'" class="counter-controls"'
);

// 2. Fix add-to-cart-btn that are v-else
vue = vue.replace(
  /<button v-else class="add-to-cart-btn"/g,
  '<button v-else-if="store.orderMode !== \'CATALOG\'" class="add-to-cart-btn"'
);

// 3. Fix add-to-cart-btn that are NOT v-else
vue = vue.replace(
  /<button class="add-to-cart-btn"/g,
  '<button v-if="store.orderMode !== \'CATALOG\'" class="add-to-cart-btn"'
);

fs.writeFileSync('src/views/ClientView.vue', vue);
