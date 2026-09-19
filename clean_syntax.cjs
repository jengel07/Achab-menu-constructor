import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /  const url = `https:\/\/api\.telegram\.org\/bot\$\{botToken\}\/sendMessage`;[\s\S]*?\}\n\}\n/;
code = code.replace(regex, '');

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Cleaned index.js syntax');

