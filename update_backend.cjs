const fs = require('fs');

const indexPath = 'daur-menu-backend/index.js';
let indexCode = fs.readFileSync(indexPath, 'utf8');

const newEndpoints = `
// --- TARIFFS ---
app.get('/api/tariffs', async (req, res) => {
  try {
    const tariffs = await db.tariff.findMany();
    res.json(tariffs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tariffs' });
  }
});

app.post('/api/tariffs', async (req, res) => {
  try {
    const tariff = await db.tariff.create({ data: req.body });
    res.json(tariff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tariff' });
  }
});

app.put('/api/tariffs/:id', async (req, res) => {
  try {
    const tariff = await db.tariff.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(tariff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tariff' });
  }
});

app.delete('/api/tariffs/:id', async (req, res) => {
  try {
    await db.tariff.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tariff' });
  }
});

// --- PAYMENT REQUESTS ---
app.get('/api/payment-requests', async (req, res) => {
  try {
    const requests = await db.paymentRequest.findMany({
      include: { restaurant: true, tariff: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment requests' });
  }
});

app.post('/api/payment-requests', async (req, res) => {
  try {
    const pr = await db.paymentRequest.create({ data: req.body });
    res.json(pr);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment request' });
  }
});

app.put('/api/payment-requests/:id/confirm', async (req, res) => {
  try {
    const pr = await db.paymentRequest.update({
      where: { id: req.params.id },
      data: { status: 'approved' },
      include: { tariff: true }
    });
    
    // Update restaurant paidUntil
    const restaurant = await db.restaurant.findUnique({ where: { id: pr.restaurantId } });
    let currentPaidUntil = restaurant.paidUntil ? new Date(restaurant.paidUntil) : new Date();
    if (currentPaidUntil < new Date()) currentPaidUntil = new Date();
    
    currentPaidUntil.setMonth(currentPaidUntil.getMonth() + pr.months);
    
    await db.restaurant.update({
      where: { id: pr.restaurantId },
      data: {
        tariffId: pr.tariffId,
        paidUntil: currentPaidUntil,
        paymentStatus: 'active'
      }
    });

    res.json(pr);
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm request' });
  }
});

app.put('/api/payment-requests/:id/reject', async (req, res) => {
  try {
    const pr = await db.paymentRequest.update({
      where: { id: req.params.id },
      data: { status: 'rejected' }
    });
    res.json(pr);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// --- RESTAURANT TARIFF UPDATE ---
app.put('/api/superadmin/restaurants/:id/tariff', async (req, res) => {
  try {
    const { tariffId, months } = req.body;
    const restaurant = await db.restaurant.findUnique({ where: { id: req.params.id } });
    
    let currentPaidUntil = restaurant.paidUntil ? new Date(restaurant.paidUntil) : new Date();
    if (currentPaidUntil < new Date()) currentPaidUntil = new Date();
    
    currentPaidUntil.setMonth(currentPaidUntil.getMonth() + parseInt(months));
    
    const updated = await db.restaurant.update({
      where: { id: req.params.id },
      data: {
        tariffId,
        paidUntil: currentPaidUntil,
        paymentStatus: 'active'
      },
      include: { tariff: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update restaurant tariff' });
  }
});
`;

if (!indexCode.includes('/api/tariffs')) {
  // insert before the end
  indexCode = indexCode.replace(/app\.listen\(/, newEndpoints + '\napp.listen(');
  fs.writeFileSync(indexPath, indexCode);
  console.log("Backend endpoints added.");
} else {
  console.log("Backend endpoints already exist.");
}

