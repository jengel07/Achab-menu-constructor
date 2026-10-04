const fs = require('fs');

let mock = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');
mock = mock.replace(/<button v-if="activeModal !== 'cart' && store.orderMode === 'CATALOG'"/g, '<button v-if="activeModal !== \'cart\'"');
fs.writeFileSync('src/components/PhoneMockupContent.vue', mock);
