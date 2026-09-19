import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /if \(cats \&\& cats\.length > 0\) \{\n\s*const formattedCats = cats\.map\(\(cat, index\) => \(\{\n\s*id: cat\.id,\n\s*name: cat\.name \|\| 'Без названия',\n\s*restaurantId: restaurantId,\n\s*orderIndex: index\n\s*\}\)\);\n\s*await tx\.category\.createMany\(\{\n\s*data: formattedCats,\n\s*\}\);\n\s*\}/;

const replacement = `if (cats && cats.length > 0) {
            const seenIds = new Set();
            const formattedCats = [];
            for (let i = 0; i < cats.length; i++) {
               let catId = cats[i].id;
               if (seenIds.has(catId) || !catId) {
                  catId = require('crypto').randomUUID(); // Fix duplicate IDs
               }
               seenIds.add(catId);
               formattedCats.push({
                 id: catId,
                 name: cats[i].name || 'Без названия',
                 restaurantId: restaurantId,
                 orderIndex: i
               });
            }
            await tx.category.createMany({
              data: formattedCats,
            });
          }`;

if (code.includes('formattedCats = cats.map')) {
  code = code.replace(regex, replacement);
  
  const dishRegex = /if \(items \&\& items\.length > 0\) \{\n\s*const formattedDishes = items\.map\(\(dish, index\) => \(\{\n\s*id: dish\.id,\n\s*name: dish\.name \|\| 'Без названия',/;
  
  const dishReplacement = `if (items && items.length > 0) {
            const seenDishIds = new Set();
            const formattedDishes = items.map((dish, index) => {
              let dishId = dish.id;
              if (seenDishIds.has(dishId) || !dishId) {
                 dishId = require('crypto').randomUUID();
              }
              seenDishIds.add(dishId);
              return {
              id: dishId,
              name: dish.name || 'Без названия',`;
              
  code = code.replace(dishRegex, dishReplacement);
  
  fs.writeFileSync('daur-menu-backend/index.js', code);
  console.log('Fixed category duplicate IDs');
} else {
  console.log('Could not find regex match');
}
