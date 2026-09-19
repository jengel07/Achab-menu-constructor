const fs = require('fs');
let code = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

code = code.replace(/#3b82f6/gi, '#9D0D0E');

fs.writeFileSync('src/views/KitchenOrders.vue', code);
console.log('Patched progress color in KitchenOrders.vue');

