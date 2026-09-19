const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const callWaiterCode = `
// --- WAITER CALL FEATURE ---
const callWaiterLocks = new Map();

app.post('/api/call-waiter', async (req, res) => {
  try {
    const { restaurantId, tableNumber, callType } = req.body;
    if (!restaurantId || !tableNumber || !callType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lockKey = \`\${restaurantId}_\${tableNumber}\`;
    const now = Date.now();
    const lastCall = callWaiterLocks.get(lockKey);

    if (lastCall && (now - lastCall < 180000)) {
      return res.status(429).json({ error: 'Too many requests. Please wait 3 minutes.' });
    }

    callWaiterLocks.set(lockKey, now);

    const menu = await db.menu.findFirst({ where: { restaurantId } });
    const info = menu?.info ? JSON.parse(menu.info) : {};
    const settings = info.orderSettings || {};

    if (settings.notifType === 'telegram' && settings.telegramWebhook) {
      let url = settings.telegramWebhook;
      
      const message = \`🔔 <b>Вызов официанта!</b>\\nСтол №\${tableNumber}\\nЗапрос: \${callType}\`;
      
      if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('text', message);
        urlObj.searchParams.set('parse_mode', 'HTML');
        
        fetch(urlObj.toString(), { method: 'GET' })
          .then(res => res.json())
          .then(data => console.log('Telegram waiter call sent:', data.ok))
          .catch(e => console.error('Telegram error:', e));
      }
    }

    if (global.io) {
      global.io.to(restaurantId).emit('waiter_call', {
        tableNumber,
        callType,
        timestamp: new Date()
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error calling waiter:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// ---------------------------
`;

code = code.replace("app.use(express.static(path.join(__dirname, 'public')));", callWaiterCode + "\napp.use(express.static(path.join(__dirname, 'public')));");
fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Restored call waiter');

