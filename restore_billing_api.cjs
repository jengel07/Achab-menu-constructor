import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

if (!code.includes('my-restaurant-billing')) {
  const billingEndpoint = `
app.get('/api/my-restaurant-billing', authMiddleware, async (req, res) => {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { id: req.user.restaurantId },
      select: { id: true, name: true, status: true, paidUntil: true, trialEndsAt: true, createdAt: true }
    });
    if (!restaurant) return res.status(404).json({ error: 'Ресторан не найден' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;
  code = code.replace(/app\.post\('\/api\/superadmin\/restaurants\/:id\/toggle-block'/, billingEndpoint + "\napp.post('/api/superadmin/restaurants/:id/toggle-block'");
  fs.writeFileSync('daur-menu-backend/index.js', code);
  console.log('Added my-restaurant-billing endpoint');
} else {
  console.log('my-restaurant-billing already exists');
}

