import fs from 'fs';

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// Replace all `<button class="add-to-cart-btn"` with `<button v-if="store.orderMode !== 'CATALOG'" class="add-to-cart-btn"`
// Note: Some already have `v-else`, so we change to `v-else-if="store.orderMode !== 'CATALOG'"`
vue = vue.replace(/<button class="add-to-cart-btn"/g, `<button v-if="store.orderMode !== 'CATALOG'" class="add-to-cart-btn"`);
vue = vue.replace(/<button v-else class="add-to-cart-btn"/g, `<button v-else-if="store.orderMode !== 'CATALOG'" class="add-to-cart-btn"`);

fs.writeFileSync('src/views/ClientView.vue', vue);

