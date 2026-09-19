import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// 1. Cron job
code = code.replace("import ordersRouter from './orders.js';", "import ordersRouter from './orders.js';\nimport cron from 'node-cron';");
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
code = code.replace("const app = express();", cronJob + '\nconst app = express();');

// 2. authMiddleware
const oldAuth = `export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { restaurantId, email, role?, staffId? }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}`;

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

code = code.replace(oldAuth, newAuth);

// 3. Telegram message
const oldMsg = "const message = `💰 <b>Новая заявка на оплату!</b>\\nЗаведение: ${restaurant.name || 'Без названия'}\\nСумма: ${amountStr}`;";
const newMsg = "const message = `🔔 <b>Заявка на продление!</b>\\nЗаведение: ${restaurant.name || 'Без названия'}\\nКлиент хочет оплатить 1 месяц.\\nСвяжитесь с клиентом, проверьте перевод и подтвердите в админке.`;";
code = code.replace(oldMsg, newMsg);

// 4. Public Menu Block
const oldMenu = `app.get('/api/menu', async (req, res) => {
  try {
    const { restaurantId } = req.query; 

    const whereClause = restaurantId ? { restaurantId } : {};`;
const newMenu = `app.get('/api/menu', async (req, res) => {
  try {
    const { restaurantId } = req.query; 
    if (restaurantId) {
       const rest = await db.restaurant.findUnique({ where: { id: restaurantId }});
       if (rest && rest.status === 'BLOCKED') return res.status(403).json({ error: 'Меню заведения заблокировано за неуплату' });
    }
    const whereClause = restaurantId ? { restaurantId } : {};`;
code = code.replace(oldMenu, newMenu);

const oldBanner = `app.get('/api/banners/active/:restaurantId', async (req, res) => {
  try {`;
const newBanner = `app.get('/api/banners/active/:restaurantId', async (req, res) => {
  try {
    const rest = await db.restaurant.findUnique({ where: { id: req.params.restaurantId }});
    if (rest && rest.status === 'BLOCKED') return res.status(403).json({ error: 'Меню заведения заблокировано за неуплату' });`;
code = code.replace(oldBanner, newBanner);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed backend properly');

