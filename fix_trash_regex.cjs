const fs = require('fs');
let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// Use regex to match all btn-delete-order lines with trash bins
const regex = /<button class="btn-delete-order"[^>]*>🗑️<\/button>\s*<button class="btn-delete-order"[^>]*>🗑️<\/button>/g;

if (regex.test(vue)) {
  vue = vue.replace(regex, '<button class="btn-delete-order" @click="deleteOrder(order.id)" title="Удалить чек" style="background: transparent; border: none; font-size: 16px; cursor: pointer;">🗑️</button>');
  fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);
  console.log('Fixed with regex');
} else {
  console.log('Regex did not match');
}

