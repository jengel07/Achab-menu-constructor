const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');
vue = vue.replace(/<button v-if="!showCheckoutModal"\s*class="floating-waiter-fab"/g, '<button v-if="!showCheckoutModal && store.orderMode === \'CATALOG\'" class="floating-waiter-fab"');
fs.writeFileSync('src/views/ClientView.vue', vue);

let mock = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');
mock = mock.replace(/<button v-if="activeModal !== 'cart'"\s*class="floating-waiter-fab"/g, '<button v-if="activeModal !== \'cart\' && store.orderMode === \'CATALOG\'" class="floating-waiter-fab"');
fs.writeFileSync('src/components/PhoneMockupContent.vue', mock);

