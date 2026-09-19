import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

code = code.replace(/app\.get\('\/api\/my-restaurant-billing', authMiddleware, async \(req, res\) => \{[\s\S]*?select: \{ id: true, name: true, status: true, paidUntil: true, trialEndsAt: true, createdAt: true \}\n    \}\);\n\n\napp\.post\('\/api\/superadmin\/restaurants\/:id\/confirm-payment'/m, 
`app.get('/api/my-restaurant-billing', authMiddleware, async (req, res) => {
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

app.post('/api/superadmin/restaurants/:id/confirm-payment'`);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed cut-off endpoint');

