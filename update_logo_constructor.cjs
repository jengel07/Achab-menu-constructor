const fs = require('fs');

let code = fs.readFileSync('src/Constructor.vue', 'utf8');
code = code.replace(/<h2 class="brand-title" style="margin: 0;">[^<]*<\/h2>/, '<img src="/achab-logo.png" alt="Achab" style="height: 32px; object-fit: contain; margin: 0;" />');
fs.writeFileSync('src/Constructor.vue', code);
console.log('Updated Constructor.vue logo');

