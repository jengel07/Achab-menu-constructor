import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const billingEndpoint = `
// GET /api/my-restaurant-billing
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

// POST /api/superadmin/restaurants/:id/toggle-block
app.post('/api/superadmin/restaurants/:id/toggle-block', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { block } = req.body;
    const restaurant = await db.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) return res.status(404).json({ error: 'Ресторан не найден' });
    if (restaurant.email === SUPERADMIN_EMAIL) return res.status(403).json({ error: 'Себя блокировать нельзя' });
    
    await db.restaurant.update({
      where: { id: restaurant.id },
      data: { status: block ? 'BLOCKED' : 'ACTIVE' }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

code = code.replace(/app\.use\(express\.static\(path\.join\(__dirname, 'public'\)\)\);/, billingEndpoint + "\napp.use(express.static(path.join(__dirname, 'public')));");
fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Added missing endpoints');

