import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const telegramFunction = `
// Отправка уведомления в Telegram
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
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      console.error('Ошибка при отправке в Telegram:', await response.text());
    } else {
      console.log('Уведомление в Telegram успешно отправлено');
    }
  } catch (err) {
    console.error('Ошибка сети при отправке в Telegram:', err.message);
  }
}
`;

// Inject function at the top level
code = code.replace(/const app = express\(\);/, telegramFunction + '\nconst app = express();');

const oldEndpoint = `// POST /api/my-restaurant-billing/request
app.post('/api/my-restaurant-billing/request', authMiddleware, async (req, res) => {
  try {
    const updated = await db.restaurant.update({
      where: { id: req.user.restaurantId },
      data: { status: 'PENDING_PAYMENT' }
    });
    res.json(updated);
  } catch(error) {
    res.status(500).json({ error: 'Failed to request payment' });
  }
});`;

const newEndpoint = `// POST /api/my-restaurant-billing/request
app.post('/api/my-restaurant-billing/request', authMiddleware, async (req, res) => {
  try {
    const { months } = req.body;
    
    // Получаем ресторан для названия
    const restaurant = await db.restaurant.findUnique({
      where: { id: req.user.restaurantId }
    });
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const updated = await db.restaurant.update({
      where: { id: req.user.restaurantId },
      data: { status: 'PENDING_PAYMENT' }
    });
    
    // Сумма
    const amountStr = months === 12 ? '20 000 ₽' : '2 000 ₽';
    
    // Формируем сообщение
    const message = \`💰 <b>Новая заявка на оплату!</b>\\nЗаведение: \${restaurant.name || 'Без названия'}\\nСумма: \${amountStr}\`;
    
    // Отправляем пуш
    await sendTelegramNotification(message);
    
    res.json(updated);
  } catch(error) {
    res.status(500).json({ error: 'Failed to request payment' });
  }
});`;

code = code.replace(oldEndpoint, newEndpoint);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Telegram notification code added successfully');

