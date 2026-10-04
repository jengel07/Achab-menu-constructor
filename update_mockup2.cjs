import fs from 'fs';

let vue = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

vue = vue.replace(/<button class="add-to-cart-btn"/g, `<button v-if="store.orderMode !== 'CATALOG'" class="add-to-cart-btn"`);
vue = vue.replace(/<button v-else class="add-to-cart-btn"/g, `<button v-else-if="store.orderMode !== 'CATALOG'" class="add-to-cart-btn"`);

fs.writeFileSync('src/components/PhoneMockupContent.vue', vue);

