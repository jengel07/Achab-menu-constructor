import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createWorker } from 'tesseract.js';
import { parseMenuText } from './menuParser.js';
import db from './db.js';
import ordersRouter from './orders.js';

import os from 'os';

dotenv.config();

const app = express();

app.get('/api/lan-ip', (req, res) => {
  let lanIp = 'localhost';
  
  if (process.env.FRONTEND_URL) {
    try {
      const url = new URL(process.env.FRONTEND_URL);
      lanIp = url.hostname;
    } catch (e) {}
  }

  if (lanIp === 'localhost') {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          lanIp = net.address;
        }
      }
    }
  }
  res.json({ ip: lanIp });
});
const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
const SALT_ROUNDS = 12;




// ============================================================
// MIDDLEWARES
// ============================================================

app.use(cors({
  origin: true, // <-- Автоматически разрешает любой источник, сохраняя работу credentials
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Логгер запросов
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ============================================================
// JWT MIDDLEWARE — защита приватных роутов
// ============================================================

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { restaurantId, email, role?, staffId? }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Токен недействителен или истёк' });
  }
}

// Middleware: только для администраторов (блокирует повара и официанта)
export function adminOnly(req, res, next) {
  const role = req.user?.role;
  if (role === 'cook' || role === 'waiter' || role === 'barista') {
    return res.status(403).json({ error: 'Доступ запрещён для данной роли' });
  }
  next();
}

// ============================================================
// СТОП-ЛИСТ (ДЛЯ ПЕРСОНАЛА)
// ============================================================

// GET /api/staff/menu - Получение меню для стоп-листа
app.get('/api/staff/menu', authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const categories = await db.category.findMany({
      where: { restaurantId },
      orderBy: { orderIndex: 'asc' }
    });
    const dishes = await db.dish.findMany({
      where: { restaurantId },
      orderBy: { name: 'asc' }
    });
    res.json({ categories, items: dishes });
  } catch (error) {
    console.error('Ошибка получения меню персоналом:', error.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/staff/dishes/:id/availability - Обновление доступности блюда
app.patch('/api/staff/dishes/:id/availability', authMiddleware, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const dish = await db.dish.findFirst({
      where: { id, restaurantId }
    });

    if (!dish) {
      return res.status(404).json({ error: 'Блюдо не найдено' });
    }

    await db.dish.update({
      where: { id },
      data: { isAvailable }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления стоп-листа:', error.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


// ============================================================
// EMAIL (SMTP)
// ============================================================

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465 || process.env.SMTP_SECURE === 'true', // true для 465 порта, false для 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Ошибка настройки SMTP:', error.message);
  } else {
    console.log('✅ Почтовый сервер готов к отправке писем');
  }
});

// ============================================================
// РОУТЕР ЗАКАЗОВ
// POST — публичный (клиент без токена), GET/PATCH — только для авторизованных
// ============================================================

// POST /api/orders — публичный, клиент оформляет заказ без токена
app.post('/api/orders', (req, res, next) => {
  req.url = '/';
  ordersRouter(req, res, next);
});

// GET /api/orders/:id — публичный для проверки статуса клиентом
app.get('/api/orders/:id', (req, res, next) => {
  req.url = `/${req.params.id}`;
  ordersRouter(req, res, next);
});

// GET /api/orders и PATCH /api/orders/:id/status — защищены JWT

app.patch('/api/orders/:id/feedback', (req, res, next) => {
  req.url = `/${req.params.id}/feedback`;
  ordersRouter(req, res, next);
});

app.use('/api/orders', authMiddleware, ordersRouter);

// ============================================================
// ПЕРЕВОДЧИК (Публичный)
// ============================================================
app.post('/api/translate', async (req, res) => {
  try {
    const { texts, targetLang } = req.body;
    if (!texts || !targetLang) return res.status(400).json({ error: 'Missing parameters' });
    
    const translate = (await import('google-translate-api-x')).default;
    const result = await translate(texts, { to: targetLang });
    
    // Если передан массив, result — это массив объектов, иначе один объект
    const translations = Array.isArray(result) ? result.map(r => r.text) : [result.text];
    
    res.json({ success: true, translations });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ
// ============================================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
  }

  try {
    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newRestaurant = await db.restaurant.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        menus: { create: {} },
      },
    });

    const token = jwt.sign(
      { restaurantId: newRestaurant.id, email: newRestaurant.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      restaurantId: newRestaurant.id,
      name: newRestaurant.name,
    });
  } catch (err) {
    console.error('❌ Ошибка регистрации:', err.message);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }
    res.status(500).json({ error: 'Ошибка регистрации: ' + err.message });
  }
});

// POST /api/auth/login — единый вход для администраторов и персонала
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    // 1. Ищем администратора в таблице Restaurant
    const adminUser = await db.restaurant.findUnique({ where: { email } });

    if (adminUser) {
      const isPasswordValid = await bcrypt.compare(password, adminUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Неверный логин или пароль' });
      }

      const token = jwt.sign(
        { restaurantId: adminUser.id, email: adminUser.email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        token,
        restaurantId: adminUser.id,
        name: adminUser.name,
        role: 'admin',
      });
    }

    // 2. Ищем сотрудника (повар / официант) в таблице Staff
    const staffUser = await db.staff.findUnique({ where: { email } });

    if (!staffUser) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const isPasswordValid = await bcrypt.compare(password, staffUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // Нормализуем роль: "Повар" → "cook", "Официант" → "waiter"
    const roleMap = {
      'cook': 'cook',
      'waiter': 'waiter',
      'barista': 'barista',
      'Повар': 'cook',
      'Официант': 'waiter',
      'Бариста': 'barista',
    };
    const normalizedRole = roleMap[staffUser.role] || staffUser.role;

    const token = jwt.sign(
      {
        restaurantId: staffUser.restaurantId,
        email: staffUser.email,
        role: normalizedRole,
        staffId: staffUser.id,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      token,
      restaurantId: staffUser.restaurantId,
      name: staffUser.name,
      role: normalizedRole,
    });
  } catch (err) {
    console.error('❌ Ошибка входа:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// POST /api/auth/refresh — обновление токена
app.post('/api/auth/refresh', authMiddleware, async (req, res) => {
  try {
    const token = jwt.sign(
      { restaurantId: req.user.restaurantId, email: req.user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: 'Не удалось обновить токен' });
  }
});

// ============================================================
// МЕНЮ (защищено JWT — только свой ресторан)
// ============================================================

// GET /api/menu — публичный, для клиентского просмотра

// ============================================================
// БАННЕРЫ С АКЦИЯМИ
// ============================================================

app.get('/api/banners/:restaurantId', authMiddleware, adminOnly, async (req, res) => {
  if (req.user.restaurantId !== req.params.restaurantId) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  try {
    const banners = await db.promotionBanner.findMany({
      where: { restaurantId: req.params.restaurantId },
      orderBy: { order: 'asc' }
    });
    res.json({ banners });
  } catch (error) {
    console.error('Ошибка получения баннеров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/banners/active/:restaurantId', async (req, res) => {
  try {
    const banners = await db.promotionBanner.findMany({
      where: { restaurantId: req.params.restaurantId, isActive: true },
      orderBy: { order: 'asc' }
    });
    res.json({ banners });
  } catch (error) {
    console.error('Ошибка получения активных баннеров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/banners/:restaurantId', authMiddleware, adminOnly, async (req, res) => {
  if (req.user.restaurantId !== req.params.restaurantId) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  try {
    const { imageUrl, targetItemId, order } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Необходимо изображение' });
    }
    const banner = await db.promotionBanner.create({
      data: {
        restaurantId: req.params.restaurantId,
        imageUrl,
        targetItemId: targetItemId || null,
        order: order || 0,
        isActive: true
      }
    });
    res.status(201).json({ banner });
  } catch (error) {
    console.error('Ошибка создания баннера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.patch('/api/banners/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const bannerId = req.params.id;
    const { isActive, targetItemId, order } = req.body;
    
    const banner = await db.promotionBanner.findUnique({ where: { id: bannerId } });
    if (!banner || banner.restaurantId !== req.user.restaurantId) {
      return res.status(404).json({ error: 'Баннер не найден' });
    }

    const updated = await db.promotionBanner.update({
      where: { id: bannerId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(targetItemId !== undefined && { targetItemId }),
        ...(order !== undefined && { order })
      }
    });
    res.json({ banner: updated });
  } catch (error) {
    console.error('Ошибка обновления баннера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/banners/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const bannerId = req.params.id;
    
    const banner = await db.promotionBanner.findUnique({ where: { id: bannerId } });
    if (!banner || banner.restaurantId !== req.user.restaurantId) {
      return res.status(404).json({ error: 'Баннер не найден' });
    }

    await db.promotionBanner.delete({ where: { id: bannerId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления баннера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.get('/api/menu', async (req, res) => {
  try {
    const { restaurantId } = req.query; 

    const whereClause = restaurantId ? { restaurantId } : {};

    const menuRecord = await db.menu.findFirst({
      where: whereClause
    });

    const targetRestId = restaurantId || menuRecord?.restaurantId;
    const dishRecords = targetRestId ? await db.dish.findMany({ where: { restaurantId: targetRestId } }) : [];

    if (!menuRecord && dishRecords.length === 0) {
      return res.json({ restaurantInfo: {}, categories: [], items: [], generalSettings: {} });
    }

    res.json({
      restaurantInfo: {
        ...(menuRecord?.info ? JSON.parse(menuRecord.info) : {}),
        id: targetRestId
      },
      categories: menuRecord?.cats ? JSON.parse(menuRecord.cats) : [],
      items: dishRecords.length > 0 ? dishRecords : (menuRecord?.items ? JSON.parse(menuRecord.items) : []),
      generalSettings: menuRecord?.general_settings ? JSON.parse(menuRecord.general_settings) : {},
    });
  } catch (err) {
    console.error('❌ Ошибка чтения публичного меню:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/menu/:restaurantId — защищён JWT, только для администратора
app.get('/api/menu/:restaurantId', authMiddleware, adminOnly, async (req, res) => {
  // Пользователь может читать только своё меню
  if (req.user.restaurantId !== req.params.restaurantId) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }

  try {
    const menuRecord = await db.menu.findFirst({
      where: { restaurantId: req.params.restaurantId },
    });

    const dishRecords = await db.dish.findMany({ where: { restaurantId: req.params.restaurantId } });

    if (!menuRecord && dishRecords.length === 0) {
      return res.json({ restaurantInfo: {}, categories: [], items: [], generalSettings: {} });
    }

    res.json({
      restaurantInfo: {
        ...(menuRecord?.info ? JSON.parse(menuRecord.info) : {}),
        id: req.params.restaurantId
      },
      categories: menuRecord?.cats ? JSON.parse(menuRecord.cats) : [],
      items: dishRecords.length > 0 ? dishRecords : (menuRecord?.items ? JSON.parse(menuRecord.items) : []),
      generalSettings: menuRecord?.general_settings ? JSON.parse(menuRecord.general_settings) : {},
    });
  } catch (err) {
    console.error('❌ Ошибка чтения меню:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/menu/:restaurantId — только для администратора
app.post('/api/menu/:restaurantId', authMiddleware, adminOnly, async (req, res) => {
  if (req.user.restaurantId !== req.params.restaurantId) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }

  const { info, items, cats, generalSettings } = req.body;
  const restaurantId = req.params.restaurantId;

    try {
    // Используем транзакцию Prisma, чтобы всё выполнилось безопасно
    await db.$transaction(async (tx) => {
      // 1. Общие настройки и инфо ресторана (оставляем в Menu или Restaurant)
      const menuUpdateData = {};
      if (info !== undefined) menuUpdateData.info = JSON.stringify(info || {});
      if (cats !== undefined) menuUpdateData.cats = JSON.stringify(cats || []);
      if (generalSettings !== undefined) menuUpdateData.general_settings = JSON.stringify(generalSettings || {});

      if (info && info.orderSettings) {
        await tx.restaurant.update({
          where: { id: restaurantId },
          data: {
            ordersThreadId: info.orderSettings.ordersThreadId !== undefined ? info.orderSettings.ordersThreadId : undefined,
            waitersThreadId: info.orderSettings.waitersThreadId !== undefined ? info.orderSettings.waitersThreadId : undefined,
            reviewsThreadId: info.orderSettings.reviewsThreadId !== undefined ? info.orderSettings.reviewsThreadId : undefined
          }
        });
      }

      if (Object.keys(menuUpdateData).length > 0) {
        await tx.menu.updateMany({
          where: { restaurantId },
          data: menuUpdateData,
        });
      }

      // Синхронизируем категории в таблицу Category, чтобы работал внешний ключ (Foreign Key) для Dish
      if (cats !== undefined) {
        await tx.category.deleteMany({
          where: { restaurantId },
        });

        if (cats && cats.length > 0) {
          const formattedCats = cats.map((cat, index) => ({
            id: cat.id,
            name: cat.name || 'Без названия',
            restaurantId: restaurantId,
            orderIndex: index
          }));
          await tx.category.createMany({
            data: formattedCats,
          });
        }
      }

      // 2. Если пришли блюда (items !== undefined), полностью обновляем список блюд
      if (items !== undefined) {
        await tx.dish.deleteMany({
          where: { restaurantId },
        });

        if (items.length > 0) {
          console.log("First item modifiers received:", items[0] && items[0].modifiers);
          const formattedDishes = items.map(dish => ({
            id: dish.id, // Сохраняем оригинальный ID для корзины и фронта
            name: dish.name || 'Без названия',
            price: parseFloat(dish.price) || 0,
            priceGlass: parseFloat(dish.priceGlass) || null,
            priceGlassLabel: dish.priceGlassLabel || null,
            priceBottle: parseFloat(dish.priceBottle) || null,
            priceBottleLabel: dish.priceBottleLabel || null,
            description: dish.description || '',
            image: dish.image || '',
            categoryId: dish.categoryId || null,
            restaurantId: restaurantId,
            isAvailable: dish.isAvailable ?? true,
            noNuts: dish.noNuts ?? dish.nutFree ?? false,
            noLactose: dish.noLactose ?? dish.lactoseFree ?? false,
            noGluten: dish.noGluten ?? dish.glutenFree ?? false,
            vegetarian: dish.vegetarian ?? false,
            vegan: dish.vegan ?? false,
              modifiers: dish.modifiers || null
          }));

          await tx.dish.createMany({
            data: formattedDishes,
          });
        }
      } // CLOSE items !== undefined block
    }); // CLOSE tx

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Ошибка сохранения меню:', err.message);
    res.status(500).json({ error: 'Ошибка сохранения меню: ' + err.message });
  }
});

// ============================================================
// УПРАВЛЕНИЕ СОТРУДНИКАМИ (защищено JWT)
// ============================================================

// POST /api/staff — создать сотрудника с паролем (и опционально отправить email)
app.post('/api/staff', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Имя, email и пароль обязательны' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Пароль должен быть не менее 6 символов' });
    }

    // Нормализуем роль: chef → cook
    const roleMap = { chef: 'cook', cook: 'cook', waiter: 'waiter', barista: 'barista', admin: 'admin' };
    const normalizedRole = roleMap[role] || role || 'cook';

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      let newStaff = await db.staff.findUnique({ where: { email } });
      if (newStaff) {
        if (newStaff.restaurantId !== req.user.restaurantId) {
          return res.status(403).json({ success: false, message: 'Этот email уже используется в другом заведении.' });
        }
        newStaff = await db.staff.update({
          where: { email },
          data: { name, password: hashedPassword, role: normalizedRole }
        });
      } else {
        newStaff = await db.staff.create({
          data: { name, email, password: hashedPassword, role: normalizedRole, restaurantId: req.user.restaurantId }
        });
      }

    // Отправляем email с учётными данными (не критично — игнорируем ошибку)
    try {
      const restaurantData = await db.restaurant.findUnique({ where: { id: req.user?.restaurantId || restaurantId } }).catch(()=>null);
        const restName = restaurantData?.name || 'нашу команду';
        await transporter.sendMail({
        from: `"${restName}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Добро пожаловать в команду ${restName}!`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 500px;">
            <h2>Вас добавили в команду ${restName}!</h2>
            <p>Роль: <strong>${normalizedRole === 'cook' ? 'Повар' : normalizedRole === 'waiter' ? 'Официант' : normalizedRole === 'barista' ? 'Бариста' : normalizedRole}</strong></p>
            <p>Для входа на кухонный экран используйте:</p>
            <ul>
              <li>Email: <b>${email}</b></li>
              <li>Пароль: <b>${password}</b></li>
            </ul>
            <p>Ссылка для входа: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}">Войти</a></p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn('⚠️ Не удалось отправить email сотруднику:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      staff: {
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        status: newStaff.status,
      },
    });
  } catch (err) {
    console.error('❌ Ошибка создания сотрудника:', err.message);
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Сотрудник с таким email уже существует' });
    }
    res.status(500).json({ success: false, message: 'Ошибка сервера: ' + err.message });
  }
});

// GET /api/staff — список сотрудников ресторана
app.get('/api/staff', authMiddleware, adminOnly, async (req, res) => {
  try {
    const staffList = await db.staff.findMany({
      where: { restaurantId: req.user.restaurantId },
      select: { id: true, name: true, email: true, role: true, status: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, staff: staffList });
  } catch (err) {
    console.error('❌ Ошибка получения персонала:', err.message);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// DELETE /api/staff/:id — удалить сотрудника
app.delete('/api/staff/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const staffMember = await db.staff.findUnique({ where: { id: req.params.id } });
    if (!staffMember || staffMember.restaurantId !== req.user.restaurantId) {
      return res.status(404).json({ success: false, message: 'Сотрудник не найден' });
    }
    await db.staff.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Ошибка удаления сотрудника:', err.message);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// POST /api/staff/invite — устаревший алиас (оставлен для совместимости)
app.post('/api/staff/invite', authMiddleware, adminOnly, async (req, res) => {
  res.status(410).json({ success: false, message: 'Используйте POST /api/staff' });
});

// ============================================================
// OCR-ПАРСИНГ (защищено JWT)
// ============================================================

app.post('/api/parse-menu', authMiddleware, adminOnly, upload.array('menuFiles', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Файлы не загружены' });
  }

  try {
    let combinedText = '';
    const worker = await createWorker('rus');
    
    for (const file of req.files) {
      if (file.mimetype.startsWith('image/')) {
        const { data: { text } } = await worker.recognize(file.buffer);
        combinedText += text + '\n\n';
      }
    }
    
    await worker.terminate();

    const parsedData = parseMenuText(combinedText);
    res.json(parsedData);
  } catch (error) {
    console.error('❌ Ошибка OCR:', error);
    res.status(500).json({ error: 'Не удалось распознать меню: ' + error.message });
  }
});

// ============================================================
// СУПЕРАДМИН — только для SUPERADMIN_EMAIL из .env
// ============================================================

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;

/** Middleware: проверяет что токен принадлежит суперадмину */
function superAdminOnly(req, res, next) {
  console.log(`[SUPERADMIN CHECK] Token email: ${req.user?.email}, Env email: ${SUPERADMIN_EMAIL}`);
  if (!SUPERADMIN_EMAIL) {
    return res.status(500).json({ error: 'SUPERADMIN_EMAIL не задан в .env' });
  }
  if (req.user?.email !== SUPERADMIN_EMAIL) {
    return res.status(403).json({ error: 'Доступ запрещён. Требуется суперадмин.' });
  }
  next();
}

// GET /api/superadmin/stats — общая статистика платформы
app.get('/api/superadmin/stats', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const [restaurantCount, staffCount, orderCount] = await Promise.all([
      db.restaurant.count(),
      db.staff.count(),
      db.order.count(),
    ]);
    res.json({ success: true, restaurantCount, staffCount, orderCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/superadmin/restaurants — список всех ресторанов
app.get('/api/superadmin/restaurants', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const restaurants = await db.restaurant.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        _count: { select: { staff: true, orders: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, restaurants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/superadmin/restaurants/:id — удалить ресторан со всеми данными
app.delete('/api/superadmin/restaurants/:id', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const restaurant = await db.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) {
      return res.status(404).json({ error: 'Ресторан не найден' });
    }
    if (restaurant.email === SUPERADMIN_EMAIL) {
      return res.status(403).json({ error: 'Нельзя удалить суперадмина' });
    }

    await db.restaurant.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления ресторана: ' + err.message });
  }
});

// Суперадмин: войти под чужим рестораном
app.post('/api/superadmin/login-as', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const targetRestaurant = await db.restaurant.findUnique({ where: { id: restaurantId } });
    if (!targetRestaurant) return res.status(404).json({ error: 'Ресторан не найден' });

    const token = jwt.sign(
      { restaurantId: targetRestaurant.id, email: targetRestaurant.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      restaurantId: targetRestaurant.id,
      name: targetRestaurant.name,
      role: 'admin'
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка: ' + err.message });
  }
});

// GET /api/superadmin/staff — все сотрудники платформы
app.get('/api/superadmin/staff', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const staff = await db.staff.findMany({
      select: {
        id: true, name: true, email: true, role: true, status: true,
        restaurant: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/superadmin/staff — создать сотрудника для ЛЮБОГО ресторана
app.post('/api/superadmin/staff', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { name, email, password, role, restaurantId } = req.body;

    if (!name || !email || !password || !restaurantId) {
      return res.status(400).json({ error: 'name, email, password, restaurantId — обязательны' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }

    // Проверяем что ресторан существует
    const restaurant = await db.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) {
      return res.status(404).json({ error: 'Ресторан не найден' });
    }

    const roleMap = { chef: 'cook', cook: 'cook', waiter: 'waiter', barista: 'barista', admin: 'admin' };
    const normalizedRole = roleMap[role] || role || 'cook';

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      let newStaff = await db.staff.findUnique({ where: { email } });
      if (newStaff) {
        if (newStaff.restaurantId !== restaurantId) {
          return res.status(403).json({ success: false, message: 'Этот email уже используется в другом заведении.' });
        }
        newStaff = await db.staff.update({
          where: { email },
          data: { name, password: hashedPassword, role: normalizedRole }
        });
      } else {
        newStaff = await db.staff.create({
          data: { name, email, password: hashedPassword, role: normalizedRole, restaurantId }
        });
      }

    // Отправляем email с учётными данными
    try {
      const restaurantData = await db.restaurant.findUnique({ where: { id: req.user?.restaurantId || restaurantId } }).catch(()=>null);
        const restName = restaurantData?.name || 'нашу команду';
        await transporter.sendMail({
        from: `"${restaurant.name || 'нашу команду'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Добро пожаловать в команду ${restaurant.name || 'нашу команду'}!`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 500px;">
            <h2>Вас добавили в команду ${restName}!</h2>
            <p>Ресторан: <strong>${restaurant.name || restaurant.email}</strong></p>
            <p>Роль: <strong>${normalizedRole === 'cook' ? 'Повар' : normalizedRole === 'waiter' ? 'Официант' : normalizedRole === 'barista' ? 'Бариста' : normalizedRole}</strong></p>
            <p>Для входа используйте:</p>
            <ul>
              <li>Email: <b>${email}</b></li>
              <li>Пароль: <b>${password}</b></li>
            </ul>
            <p>Ссылка для входа: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}">Войти</a></p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn('⚠️ Не удалось отправить email сотруднику:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      staff: {
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        status: newStaff.status,
      },
    });
  } catch (err) {
    console.error('❌ Ошибка создания сотрудника:', err.message);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Сотрудник с таким email уже существует' });
    }
    res.status(500).json({ error: err.message });
  }
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// ЗАПУСК СЕРВЕРА
// ============================================================

// Отдача статики фронтенда (папка public)

// --- WAITER CALL FEATURE ---
const callWaiterLocks = new Map();

app.post('/api/call-waiter', async (req, res) => {
  try {
    const { restaurantId, tableNumber, callType } = req.body;
    if (!restaurantId || !tableNumber || !callType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lockKey = `${restaurantId}_${tableNumber}`;
    const now = Date.now();
    const lastCall = callWaiterLocks.get(lockKey);

    if (lastCall && (now - lastCall < 180000)) {
      return res.status(429).json({ error: 'Too many requests. Please wait 3 minutes.' });
    }

    callWaiterLocks.set(lockKey, now);

    const menu = await db.menu.findFirst({ where: { restaurantId } });
    const info = menu?.info ? JSON.parse(menu.info) : {};
    const settings = info.orderSettings || {};

    const restaurantData = await db.restaurant.findUnique({ where: { id: restaurantId } });
    if (settings.notifType === 'telegram' && settings.telegramWebhook) {
      let url = settings.telegramWebhook;
      
      const message = `🔔 <b>Вызов официанта!</b>\nСтол №${tableNumber}\nЗапрос: ${callType}`;
      
      if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('text', message);
        urlObj.searchParams.set('parse_mode', 'HTML');
        
        if (restaurantData && restaurantData.waitersThreadId) {
          urlObj.searchParams.set('message_thread_id', restaurantData.waitersThreadId);
        }
        
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

app.use(express.static(path.join(__dirname, 'public')));

// Fallback для SPA (Vue Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});