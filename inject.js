import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const injection = `
// ============================================================
// BILLING & TELEGRAM INJECTION
// ============================================================

async function sendTelegramNotification(message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.warn('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы в .env. Уведомление не отправлено.');
    return;
  }
  const url = \`https://api.telegram.org/bot\${botToken}/sendMessage\`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    });
    if (!response.ok) {
      const data = await response.json();
      console.error('Ошибка при отправке в Telegram:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('Сетевая ошибка при отправке в Telegram:', err.message);
  }
}

app.get('/api/my-restaurant-billing', authMiddleware, async (req, res) => {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { id: req.user.restaurantId },
      select: { id: true, name: true, status: true, paidUntil: true, trialEndsAt: true, createdAt: true }
    });
    if (!restaurant) return res.status(404).json({ error: 'Ресторан не найден' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/my-restaurant-billing/request', authMiddleware, async (req, res) => {
  try {
    const { months } = req.body;
    const restaurant = await db.restaurant.findUnique({ where: { id: req.user.restaurantId } });
    if (!restaurant) return res.status(404).json({ error: 'Ресторан не найден' });
    
    await db.restaurant.update({
      where: { id: restaurant.id },
      data: { status: 'PENDING_PAYMENT' }
    });

    const message = \`🔔 <b>Заявка на продление!</b>\\nЗаведение: \${restaurant.name || 'Без названия'}\\nКлиент хочет оплатить 1 месяц.\\nСвяжитесь с клиентом, проверьте перевод и подтвердите в админке.\`;
    await sendTelegramNotification(message);

    res.json({ success: true, message: 'Заявка отправлена' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера: ' + err.message });
  }
});

app.post('/api/superadmin/restaurants/:id/confirm-payment', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { months } = req.body;
    const restaurant = await db.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) return res.status(404).json({ error: 'Ресторан не найден' });
    
    const now = new Date();
    let currentPaidUntil = restaurant.paidUntil && restaurant.paidUntil > now ? restaurant.paidUntil : now;
    const newPaidUntil = new Date(currentPaidUntil.getTime());
    newPaidUntil.setMonth(newPaidUntil.getMonth() + (months || 1));

    await db.restaurant.update({
      where: { id: restaurant.id },
      data: { status: 'ACTIVE', paidUntil: newPaidUntil }
    });

    res.json({ success: true, paidUntil: newPaidUntil });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================

app.get('*', (req, res) => {`;

code = code.replace(/app\.get\('\*', \(req, res\) => \{/, injection);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Injection successful');

