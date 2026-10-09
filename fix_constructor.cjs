const fs = require('fs');
let file = fs.readFileSync('src/Constructor.vue', 'utf8');

file = file.replace(/tab === 'banners' \? 'Баннеры' : tab === 'banners' \? 'Баннеры' :/g, "tab === 'banners' ? 'Баннеры' :");
file = file.replace(/tariff: 'Мой тариф',\r?\n\s*tariff: 'Мой тариф',/g, "tariff: 'Мой тариф',");

fs.writeFileSync('src/Constructor.vue', file);
console.log('Fixed Constructor.vue duplicates');
