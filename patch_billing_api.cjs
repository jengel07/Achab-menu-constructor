const fs = require('fs');
let indexCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const newEndpoint = `
// GET /api/my-restaurant-billing
app.get('/api/my-restaurant-billing', authMiddleware, async (req, res) => {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { id: req.user.restaurantId },
      include: { tariff: true }
    });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    
    res.json({
      tariff: restaurant.tariff,
      tariffId: restaurant.tariffId,
      paidUntil: restaurant.paidUntil,
      paymentStatus: restaurant.paymentStatus
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch billing info' });
  }
});
`;

if (!indexCode.includes('/api/my-restaurant-billing')) {
  indexCode = indexCode.replace(/app\.listen\(/, newEndpoint + '\napp.listen(');
  fs.writeFileSync('daur-menu-backend/index.js', indexCode);
}

