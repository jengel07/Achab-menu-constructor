import TelegramBot from 'node-telegram-bot-api';
import db from './db.js';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_CHAT_ID;

let bot = null;

if (botToken) {
  bot = new TelegramBot(botToken, { polling: true });

  console.log('Telegram Bot started in polling mode');

  bot.onText(/^\/start$/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Привет! Пожалуйста, начните процесс оплаты прямо из панели администратора (кнопка "Оплатить").');
  });

  // Handle /start REST_{id}
  bot.onText(/^\/start REST_(.+)$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const restaurantId = match[1];

    try {
      const restaurant = await db.restaurant.findUnique({ where: { id: restaurantId } });
      if (!restaurant) {
        return bot.sendMessage(chatId, 'К сожалению, ресторан не найден в системе.');
      }

      // Save user's chat ID and update status
      await db.restaurant.update({
        where: { id: restaurant.id },
        data: { 
          ownerTelegramId: chatId.toString(),
          status: 'PENDING_PAYMENT'
        }
      });

      const text = `Оплата подписки для заведения <b>${restaurant.name || 'Без названия'}</b>.\n\nПожалуйста, переведите 2000 ₽ по реквизитам:\nНомер: +79996555365\nБанк: Т-банк\n\nПосле перевода отправьте фото чека прямо в этот чат.`;
      
      bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    } catch (err) {
      console.error('Ошибка в боте /start:', err.message);
      bot.sendMessage(chatId, 'Произошла ошибка при привязке. Попробуйте еще раз позже.');
    }
  });

  // Handle photos (receipts)
  bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;

    try {
      // Find restaurant by ownerTelegramId
      const restaurant = await db.restaurant.findFirst({
        where: { ownerTelegramId: chatId.toString() }
      });

      if (!restaurant) {
        // Not a known restaurant owner
        return; 
      }

      // Get the highest resolution photo
      const photo = msg.photo[msg.photo.length - 1];
      const fileId = photo.file_id;

      // Send confirmation to user
      bot.sendMessage(chatId, 'Чек получен! Ожидайте подтверждения администратором.');

      // Forward photo to Admin
      if (adminChatId) {
        const caption = `🧾 <b>Новый чек на проверку!</b>\nЗаведение: ${restaurant.name || 'Без названия'}\nEmail: ${restaurant.email}\n\nПодтвердите оплату в супер-админке.`;
        bot.sendPhoto(adminChatId, fileId, { caption, parse_mode: 'HTML' });
      }
    } catch (err) {
      console.error('Ошибка обработки фото:', err.message);
    }
  });
} else {
  console.warn('TELEGRAM_BOT_TOKEN не задан, бот отключен.');
}

export function notifyPaymentApproved(ownerTelegramId) {
  if (bot && ownerTelegramId) {
    bot.sendMessage(ownerTelegramId, '✅ Ваша оплата успешно подтверждена! Подписка продлена, доступ к системе восстановлен.').catch(err => console.error('Ошибка отправки уведомления об успехе:', err.message));
  }
}

export default bot;

