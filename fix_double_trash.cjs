const fs = require('fs');
let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// The pattern has TWO identical lines. We replace the DOUBLE with SINGLE.
const doubleTrash = `<button class="btn-delete-order" @click="deleteOrder(order.id)" title="Удалить чек" style="background: transparent; border: none; font-size: 16px; cursor: pointer;">🗑️</button>
                  <button class="btn-delete-order" @click="deleteOrder(order.id)" title="Удалить чек" style="background: transparent; border: none; font-size: 16px; cursor: pointer;">🗑️</button>`;

const singleTrash = `<button class="btn-delete-order" @click="deleteOrder(order.id)" title="Удалить чек" style="background: transparent; border: none; font-size: 16px; cursor: pointer;">🗑️</button>`;

vue = vue.replace(doubleTrash, singleTrash);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);
console.log('Fixed double trash icon');
