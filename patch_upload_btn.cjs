const fs = require('fs');
let code = fs.readFileSync('src/Constructor.vue', 'utf8');

code = code.replace(
  /background-color: #6a2131;/g,
  `background-color: var(--accent);`
);

fs.writeFileSync('src/Constructor.vue', code);
console.log('Patched upload button color');

