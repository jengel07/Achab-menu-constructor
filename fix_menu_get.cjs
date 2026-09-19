const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const buggyLine = "const restaurant = await db.restaurant.findUnique({ where: { id: req.params.restaurantId } });";

code = code.replace(
  /app\.get\('\/api\/menu', async \(req, res\) => \{\s*try \{\s*const \{ restaurantId \} = req\.query;[\s\S]*?const whereClause = restaurantId \? \{ restaurantId \} : \{\};\s*const restaurant = await db\.restaurant\.findUnique\(\{ where: \{ id: req\.params\.restaurantId \} \}\);\s*const menuRecord = await db\.menu\.findFirst/m,
  `app.get('/api/menu', async (req, res) => {
  try {
    const { restaurantId } = req.query; 

    const whereClause = restaurantId ? { restaurantId } : {};

    const menuRecord = await db.menu.findFirst`
);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed public menu fetch');

