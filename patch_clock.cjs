const fs = require('fs');
let code = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// Replace purple/blue gradient on new order status with solid brand color
code = code.replace(
  /\.order-bar-icon-wrapper\.status-new \{ background: linear-gradient\(135deg, #60a5fa, #9D0D0E\); \}/,
  '.order-bar-icon-wrapper.status-new { background: #9D0D0E; }'
);

// Replace green background on Step 1 (when status is new) with brand color
// The line is: :style="{ background: '#4caf50' }">
// Let's replace only the first occurrence which is for Step 1
code = code.replace(
  /:style="\{ background: '#4caf50' \}">/,
  `:style="{ background: (order.status === 'new' || order.status === 'open') ? '#9D0D0E' : '#4caf50' }">`
);

fs.writeFileSync('src/views/ClientView.vue', code);
console.log('Patched clock icons');

