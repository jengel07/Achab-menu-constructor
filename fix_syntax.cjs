const fs = require('fs');

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /\n    if \(\!restaurant\) return res\.status\(404\)\.json\(\{ error: 'Ресторан не найден' \}\);[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Ошибка сервера: ' \+ err\.message \}\);\n  \}\n\}\);\n/;

code = code.replace(regex, '');
fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed syntax again');
