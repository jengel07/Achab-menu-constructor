const fs = require('fs');

let file = fs.readFileSync('src/style.css', 'utf8');

file = file.replace(/justify-content: flex-end;/g, 'justify-content: flex-start;');
file = file.replace(/transform: translateX\(100\%\);/g, 'transform: translateX(-100%);');
file = file.replace(/box-shadow: -4px 0 24px rgba\(0, 0, 0, 0\.4\);/g, 'box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);');
file = file.replace(/box-shadow: -4px 0 24px rgba\(0, 0, 0, 0\.12\);/g, 'box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);');

fs.writeFileSync('src/style.css', file);
console.log('Fixed smenu-panel to slide from left');

