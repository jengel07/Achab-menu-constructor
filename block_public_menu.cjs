import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /app\.get\('\/api\/menu', async \(req, res\) => \{\n  try \{\n    const \{ restaurantId \} = req\.query;/;
const replacement = `app.get('/api/menu', async (req, res) => {
  try {
    const { restaurantId } = req.query; 

    // Блокировка публичного меню при неоплате
    if (restaurantId) {
      const rest = await db.restaurant.findUnique({ where: { id: restaurantId } });
      if (rest) {
        if (rest.status === 'BLOCKED') {
          return res.status(403).json({ error: 'Меню недоступно: аккаунт заблокирован' });
        }
        const now = new Date();
        const paidDate = rest.paidUntil ? new Date(rest.paidUntil) : new Date(0);
        const trialDate = rest.trialEndsAt ? new Date(rest.trialEndsAt) : new Date(0);
        if (rest.status === 'TRIAL' && trialDate < now) {
          return res.status(403).json({ error: 'Меню недоступно: пробный период истек' });
        }
        if ((rest.status === 'PENDING_PAYMENT' || rest.status === 'ACTIVE') && paidDate < now) {
          return res.status(403).json({ error: 'Меню недоступно: требуется оплата' });
        }
      }
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Public menu blocked');

