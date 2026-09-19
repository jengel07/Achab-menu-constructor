const fs = require('fs');
let code = fs.readFileSync('src/Constructor.vue', 'utf8');

code = code.replace(
  /<img src="\/achab-logo\.jpg" alt="Achab" style="height: 32px; object-fit: contain; margin: 0;" \/>/g,
  `<img :src="isLightTheme ? '/logo-light.png' : '/logo-dark.png'" alt="Achab" style="height: 32px; object-fit: contain; margin: 0;" />`
);

fs.writeFileSync('src/Constructor.vue', code);
console.log('Constructor updated');

