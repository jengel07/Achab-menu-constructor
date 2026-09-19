const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /const menu = await db\.menu\.findFirst\(\{ where: \{ restaurantId \} \}\);\s*const info = menu\?\.info \? JSON\.parse\(menu\.info\) : \{\};\s*const settings = info\.orderSettings || \{\};\s*const menu = await db\.menu\.findFirst\(\{ where: \{ restaurantId \} \}\);\s*const info = menu\?\.info \? JSON\.parse\(menu\.info\) : \{\};\s*const settings = info\.orderSettings || \{\};/;

const replacement = `    const menu = await db.menu.findFirst({ where: { restaurantId } });
    const info = menu?.info ? JSON.parse(menu.info) : {};
    const settings = info.orderSettings || {};`;

code = code.replace(regex, replacement);
fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Cleaned duplicate menu declaration');

