const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');

const regex = /const urlObj = new URL\(url\);\s*urlObj\.searchParams\.set\('text', orderText\);\s*urlObj\.searchParams\.set\('parse_mode', 'HTML'\);\s*if \(restaurantData && restaurantData\.ordersThreadId\) \{/g;

code = code.replace(regex, `const urlObj = new URL(url);
          urlObj.searchParams.set('text', orderText);
          urlObj.searchParams.set('parse_mode', 'HTML');
          
          const restaurantData = await db.restaurant.findUnique({ where: { id: restaurantId } });
          
          if (restaurantData && restaurantData.ordersThreadId) {`);

fs.writeFileSync('daur-menu-backend/orders.js', code);
console.log('Fixed reference error in orders.js');

