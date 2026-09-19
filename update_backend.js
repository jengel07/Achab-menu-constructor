import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// 1. Add cron import
code = code.replace(/import ordersRouter from '.\/orders\.js';/, "import ordersRouter from './orders.js';\nimport cron from 'node-cron';");

// 2. Add cron job
const cronJob = `
// CRON: ᪠  ᬥ  BLOCKED   ⥪
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    //   TRIAL   
    await db.restaurant.updateMany({
      where: {
        status: 'TRIAL',
        trialEndsAt: { lt: now }
      },
      data: { status: 'BLOCKED' }
    });
    
    //   ACTIVE   
    await db.restaurant.updateMany({
      where: {
        status: 'ACTIVE',
        paidUntil: { lt: now }
      },
      data: { status: 'BLOCKED' }
    });
    console.log('CRON: checked and blocked expired subscriptions');
  } catch(e) {
    console.error('CRON Error:', e);
  }
});
`;
code = code.replace(/const app = express\(\);/, cronJob + '\nconst app = express();');

// 3. Update public APIs to block if BLOCKED
const publicMenuRegex = /app\.get\('\/api\/menu', async \(req, res\) => \{\n\s*try \{\n\s*const \{ restaurantId \} = req\.query; \n\n\s*const whereClause = restaurantId \? \{ restaurantId \} : \{\};\n\n\s*const menuRecord = await db\.menu\.findFirst\(\{[\s\S]*?\}\);/;
code = code.replace(publicMenuRegex, (match) => {
  return `app.get('/api/menu', async (req, res) => {
    try {
      const { restaurantId } = req.query; 
      
      const targetRestId = restaurantId;
      if (targetRestId) {
        const rest = await db.restaurant.findUnique({ where: { id: targetRestId } });
        if (rest && rest.status === 'BLOCKED') {
          return res.status(403).json({ error: 'Меню заведения заблокировано за неуплату' });
        }
      }

      const whereClause = restaurantId ? { restaurantId } : {};

      const menuRecord = await db.menu.findFirst({
        where: whereClause
      });`;
});

const activeBannersRegex = /app\.get\('\/api\/banners\/active\/:restaurantId', async \(req, res\) => \{\n\s*try \{/;
code = code.replace(activeBannersRegex, `app.get('/api/banners/active/:restaurantId', async (req, res) => {
    try {
      const rest = await db.restaurant.findUnique({ where: { id: req.params.restaurantId } });
      if (rest && rest.status === 'BLOCKED') return res.status(403).json({ error: 'Меню заведения заблокировано за неуплату' });
`);

// 4. Update Telegram message format exactly as requested
const oldMessageLine = /const message = `💰 <b>Новая заявка на оплату!<\/b>\\nЗаведение: \$\{restaurant\.name \|\| 'Без названия'}\\nСумма: \$\{amountStr\}`;/;
const newMessageLine = `const message = \`🔔 <b>Заявка на продление!</b>\\nЗаведение: \${restaurant.name || 'Без названия'}\\nКлиент хочет оплатить 1 месяц.\\nСвяжитесь с клиентом, проверьте перевод и подтвердите в админке.\`;`;
code = code.replace(oldMessageLine, newMessageLine);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Backend updated with cron, public blocks, and TG format');

