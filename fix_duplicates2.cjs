import fs from 'fs';
import crypto from 'crypto';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// We just replace the formatting blocks for cats and items
code = code.replace(
  /const formattedCats = cats\.map\(\(cat, index\) => \(\{\s*id: cat\.id,\s*name: cat\.name \|\| '.*?',\s*restaurantId: restaurantId,\s*orderIndex: index\s*\}\)\);/g,
  `const seenCatIds = new Set();
   const formattedCats = cats.map((cat, index) => {
     let catId = cat.id;
     if (!catId || seenCatIds.has(catId)) catId = require('crypto').randomUUID();
     seenCatIds.add(catId);
     return {
       id: catId,
       name: cat.name || 'Без названия',
       restaurantId: restaurantId,
       orderIndex: index
     };
   });`
);

code = code.replace(
  /const formattedDishes = items\.map\(\(dish, index\) => \(\{\s*id: dish\.id,\s*name: dish\.name \|\| '.*?',/g,
  `const seenDishIds = new Set();
   const formattedDishes = items.map((dish, index) => {
     let dishId = dish.id;
     if (!dishId || seenDishIds.has(dishId)) dishId = require('crypto').randomUUID();
     seenDishIds.add(dishId);
     return {
       id: dishId,
       name: dish.name || 'Без названия',`
);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Patched duplicate IDs in index.js');

