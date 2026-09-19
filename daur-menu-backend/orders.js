import express from 'express';
import db from './db.js';

const router = express.Router();

// ============================================================
// GET / — список заказов ресторана (защищён через app-level authMiddleware)
// ============================================================
router.get('/', async (req, res) => {
  try {
    const orders = await db.order.findMany({
      where: { restaurantId: req.user.restaurantId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    const formattedOrders = orders.map(order => ({
      ...order,
      totalPrice: Number(order.totalPrice),
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error('❌ Ошибка при получении заказов:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// POST / — создание нового заказа (ПУБЛИЧНЫЙ — клиент без токена)
// req.user может быть undefined, берём restaurantId из тела или БД
// ============================================================
router.post('/', async (req, res) => {
  try {
    const {
      items,
      total,
      type,
      customerName,
      customerPhone,
      tableNumber,
      address,
      comment,
      scheduledTime,
      restaurantId: bodyRestaurantId,
    } = req.body;

    // Авторизованный пользователь → его restaurantId
    // Гость без токена → из тела запроса или первый ресторан в БД
    let restaurantId = req.user?.restaurantId || bodyRestaurantId;

    if (!restaurantId) {
      const firstRestaurant = await db.restaurant.findFirst();
      if (!firstRestaurant) {
        return res.status(400).json({ success: false, error: 'Ресторан не найден' });
      }
      restaurantId = firstRestaurant.id;
    }

    // Создаём заказ с вложенными позициями
    const newOrder = await db.order.create({
      data: {
        orderNumber: String(Date.now()).slice(-4),
        type: type || 'onsite',
        status: 'new',
        tableNumber: tableNumber ? String(tableNumber) : null,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        address: address || null,
        comment: comment || null,
        scheduledTime: scheduledTime || null,
        totalPrice: Number(total) || 0,
        restaurantId,
        items: {
          create: (items || []).map(item => ({
            name: String(item.name),
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
          })),
        },
      },
      include: { items: true },
    });

    // ── Автоматические уведомления ──
    try {
      const menu = await db.menu.findFirst({ where: { restaurantId } });
      const info = menu?.info ? JSON.parse(menu.info) : {};
      const settings = info.orderSettings || {};
      
      const itemsList = (items || []).map(item => `▫️ ${item.name} — ${item.quantity} шт.`).join('\n');
      const orderTypeStr = type === 'onsite' ? '🍽 В заведении' : (type === 'pickup' ? '📦 Самовывоз' : '🚴 Доставка');
      const timeStr = scheduledTime ? `\n⏰ Ко времени: <b>${scheduledTime}</b>` : '';
      const commentStr = comment ? `\n💬 Комментарий: <i>${comment}</i>` : '';

      const orderText = `🔔 <b>Новый заказ #${newOrder.orderNumber}</b>

${orderTypeStr}
👤 Клиент: <b>${customerName || 'Не указан'}</b>
📞 Телефон: ${customerPhone ? `<a href="tel:${customerPhone.replace(/\D/g, '')}">${customerPhone}</a>` : 'Не указан'}
📍 Адрес/Стол: <b>${address || tableNumber || 'Не указан'}</b>${timeStr}${commentStr}

📝 <b>Состав заказа:</b>
${itemsList || 'Нет позиций'}

💰 <b>Итого: ${Number(total).toFixed(0)} ₽</b>`;

      // Версия для Email (без HTML-тегов Telegram, так как там text)
      if (settings.notifType === 'telegram' && settings.telegramWebhook) {
        let url = settings.telegramWebhook;
        
        if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
          const urlObj = new URL(url);
          urlObj.searchParams.set('text', orderText);
          urlObj.searchParams.set('parse_mode', 'HTML');
          
          const restaurantData = await db.restaurant.findUnique({ where: { id: restaurantId } });
          
          if (restaurantData && restaurantData.ordersThreadId) {
            urlObj.searchParams.set('message_thread_id', restaurantData.ordersThreadId);
          }
          
          url = urlObj.toString();
          
          fetch(url)
              .then(r => r.json())
              .then(data => {
                if (!data.ok) {
                   console.error('[ORDERS TG] Failed:', JSON.stringify(data));
                   if (data.parameters?.migrate_to_chat_id) {
                     urlObj.searchParams.set('chat_id', data.parameters.migrate_to_chat_id);
                     return fetch(urlObj.toString()).then(r => r.json());
                   }
                }
                return data;
              })
              .then(data => console.log('[ORDERS TG] Final:', data))
              .catch(e => console.error('[ORDERS TG] Error:', e));
        } else {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: newOrder.orderNumber,
              type, customerName, customerPhone, address, tableNumber,
              total, text: orderText
            })
          }).catch(e => console.error('Webhook error:', e));
        }
      }

      const emailText = orderText.replace(/<[^>]+>/g, '');

      if (settings.emailNotif) {
         import('./index.js').then(module => {
            if (module.transporter) {
              const toEmail = settings.emailAddress || process.env.SMTP_USER;
              module.transporter.sendMail({
                from: `"${info.name || 'Уведомления'}" <${process.env.SMTP_USER}>`,
                to: toEmail,
                subject: `Новый заказ #${newOrder.orderNumber}`,
                text: emailText
              }).catch(e => console.error("Email send error", e));
            }
         });
      }
      
      
    } catch(notifErr) {
      console.error("Ошибка при отправке уведомлений:", notifErr);
    }

    res.status(201).json({
      success: true,
      orderId: newOrder.id,
      order: newOrder,
      message: 'Заказ успешно сохранён',
    });
  } catch (err) {
    console.error('❌ Ошибка при сохранении заказа:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id — публичный доступ для клиента к своему заказу
router.get('/:id', async (req, res) => {
  try {
    const order = await db.order.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PATCH /:id/status — обновление статуса (защищён через app-level authMiddleware)
// ============================================================
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionNote } = req.body;

    const allowedStatuses = ['new', 'progress', 'done', 'cancelled', 'archived'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Недопустимый статус. Допустимые: ${allowedStatuses.join(', ')}` });
    }

    // Проверяем, что заказ принадлежит этому ресторану
    const order = await db.order.findUnique({ where: { id } });
    if (!order || order.restaurantId !== req.user.restaurantId) {
      return res.status(403).json({ error: 'Заказ не найден или доступ запрещён' });
    }

    const updateData = { status };
    if (status === 'cancelled' && rejectionNote) {
      updateData.rejectionNote = rejectionNote;
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, updatedOrder });
  } catch (err) {
    console.error('❌ Ошибка при обновлении статуса:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ============================================================
// DELETE /api/orders/all - Удалить все заказы ресторана
// ============================================================
router.delete('/all', async (req, res) => {
  try {
    await db.order.deleteMany({
      where: { restaurantId: req.user.restaurantId },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка удаления всех заказов:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// DELETE /api/orders/:id - Удалить один заказ
// ============================================================
router.delete('/:id', async (req, res) => {
  try {
    await db.order.delete({
      where: { id: req.params.id, restaurantId: req.user.restaurantId },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка удаления заказа:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ============================================================
// PATCH /:id/feedback
// ============================================================
router.patch('/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    
    const order = await db.order.findUnique({ 
      where: { id },
      include: { restaurant: true } 
    });
    
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        rating: Number(rating),
        feedback: String(feedback)
      }
    });

    // Send to Telegram if configured
    try {
      const menu = await db.menu.findFirst({ where: { restaurantId: order.restaurantId } });
      const info = menu?.info ? JSON.parse(menu.info) : {};
      const settings = info.orderSettings || {};
      
            if (settings.notifType === 'telegram' && settings.telegramWebhook) {
        let url = settings.telegramWebhook;
        
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        const textMsg = `📝 <b>Новый отзыв на заказ #${order.orderNumber}</b>\n\nОценка: ${stars}\nКомментарий: <i>${feedback || 'Без текста'}</i>`;
        
        if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
          const urlObj = new URL(url);
          urlObj.searchParams.set('text', textMsg);
          urlObj.searchParams.set('parse_mode', 'HTML');
          
          if (order.restaurant && order.restaurant.reviewsThreadId) {
            urlObj.searchParams.set('message_thread_id', order.restaurant.reviewsThreadId);
          }
          
          url = urlObj.toString();
          
          fetch(url)
              .then(r => r.json())
              .then(data => {
                if (!data.ok) {
                   console.error('[FEEDBACK TG] Failed:', JSON.stringify(data));
                   if (data.parameters?.migrate_to_chat_id) {
                     urlObj.searchParams.set('chat_id', data.parameters.migrate_to_chat_id);
                     return fetch(urlObj.toString()).then(r => r.json());
                   }
                }
                return data;
              })
              .then(data => console.log('[FEEDBACK TG] Final:', data))
              .catch(e => console.error('[FEEDBACK TG] Error:', e));
        } else {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'feedback',
              orderId: order.orderNumber,
              rating,
              feedback
            })
          }).catch(e => console.error('Webhook error:', e));
        }
      }
    } catch(err) {
      console.error('Error sending feedback to TG:', err);
    }
    
    res.json({ success: true, updatedOrder });
  } catch (err) {
    console.error('Ошибка обновления отзыва:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;