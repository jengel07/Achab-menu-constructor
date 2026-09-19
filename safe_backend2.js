import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

code = code.replace(/import ordersRouter from '\.\/orders\.js';/, "import ordersRouter from './orders.js';\nimport cron from 'node-cron';");

const cronJob = `
// CRON
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    await db.restaurant.updateMany({
      where: { status: 'TRIAL', trialEndsAt: { lt: now } },
      data: { status: 'BLOCKED' }
    });
    await db.restaurant.updateMany({
      where: { status: 'ACTIVE', paidUntil: { lt: now } },
      data: { status: 'BLOCKED' }
    });
  } catch(e) {}
});
`;
code = code.replace(/const app = express\(\);/, cronJob + '\nconst app = express();');

const newAuth = `export async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    
    if (req.user && req.user.restaurantId) {
      const rest = await db.restaurant.findUnique({ where: { id: req.user.restaurantId } });
      if (!rest) return res.status(401).json({ error: 'Учетная запись ресторана была удалена' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}`;
code = code.replace(/export function authMiddleware\(req, res, next\) \{[\s\S]*?jwt\.verify[\s\S]*?catch \(err\) \{[\s\S]*?\}\n\}/, newAuth);

const newMsg = "const message = `🔔 <b>Заявка на продление!</b>\\nЗаведение: ${restaurant.name || 'Без названия'}\\nКлиент хочет оплатить 1 месяц.\\nСвяжитесь с клиентом, проверьте перевод и подтвердите в админке.`;";
code = code.replace(/const message = `💰[\s\S]*?`;/, newMsg);

code = code.replace(/app\.get\('\/api\/menu', async \(req, res\) => \{\s*try \{\s*const \{ restaurantId \} = req\.query;/,
`app.get('/api/menu', async (req, res) => {
  try {
    const { restaurantId } = req.query; 
    if (restaurantId) {
       const rest = await db.restaurant.findUnique({ where: { id: restaurantId }});
       if (rest && rest.status === 'BLOCKED') return res.status(403).json({ error: 'Меню заведения заблокировано за неуплату' });
    }`);

code = code.replace(/app\.get\('\/api\/banners\/active\/:restaurantId', async \(req, res\) => \{\s*try \{/,
`app.get('/api/banners/active/:restaurantId', async (req, res) => {
  try {
    const rest = await db.restaurant.findUnique({ where: { id: req.params.restaurantId }});
    if (rest && rest.status === 'BLOCKED') return res.status(403).json({ error: 'Меню заведения заблокировано за неуплату' });`);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed backend properly using regex');

