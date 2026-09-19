import fs from 'fs';

let apiCode = fs.readFileSync('src/api.ts', 'utf8');
apiCode = apiCode.replace(
  /deleteRestaurant: \(id: string\) =>\s*request<\{ success: boolean \}>\(\`\/api\/superadmin\/restaurants\/\$\{id\}\`, \{ method: 'DELETE' \}\),/,
  `deleteRestaurant: (id: string) => request<{ success: boolean }>(\`/api/superadmin/restaurants/\${id}\`, { method: 'DELETE' }),\n  toggleBlockRestaurant: (id: string, block: boolean) => request<{ success: boolean }>(\`/api/superadmin/restaurants/\${id}/toggle-block\`, { method: 'POST', body: JSON.stringify({ block }) }),`
);
fs.writeFileSync('src/api.ts', apiCode);

let backendCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');
const endpointCode = `
app.post('/api/superadmin/restaurants/:id/toggle-block', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { block } = req.body;
    const restaurant = await db.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) return res.status(404).json({ error: 'Ресторан не найден' });
    if (restaurant.email === SUPERADMIN_EMAIL) return res.status(403).json({ error: 'Нельзя блокировать суперадмина' });
    
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

backendCode = backendCode.replace(/app\.get\('\*', \(req, res\) => \{/, endpointCode + "\napp.get('*', (req, res) => {");
fs.writeFileSync('daur-menu-backend/index.js', backendCode);

console.log('API and Backend updated');

