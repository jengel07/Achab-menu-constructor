const fs = require('fs');

const vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');
const templateMatch = vue.match(/<template>([\s\S]*?)<script setup/);
if (templateMatch) {
  const lines = templateMatch[1].split('\n');
  lines.forEach((line, i) => {
    if (line.includes('class="phone-mockup"') || line.includes('class="phone-screen"') || line.includes('class="phone-body"') || line.includes('floating-cart-bar') || line.match(/<\/div>/)) {
      console.log(`${i+1}: ${line.trim()}`);
    }
  });
}
