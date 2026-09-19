const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const oldAuth = `export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { restaurantId, email, role?, staffId? }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}`;

const newAuth = `export async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 

    // Проверяем, существует ли ресторан
    if (req.user && req.user.restaurantId) {
      const restaurantExists = await db.restaurant.findUnique({
        where: { id: req.user.restaurantId }
      });
      if (!restaurantExists) {
        return res.status(401).json({ error: 'Учетная запись ресторана была удалена' });
      }
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}`;

code = code.replace(/export function authMiddleware[\s\S]*?catch \(err\) \{\s*return res\.status\(401\)[\s\S]*?\}\n\}/, newAuth);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed authMiddleware to check DB');

