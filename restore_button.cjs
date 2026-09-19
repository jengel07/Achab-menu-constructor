const fs = require('fs');
let code = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');

// We need to inject the button right below the status-card
const insertionPoint = '      </div>\n\n      </div>';
const replacement = `      </div>

      <div class="offer-section">
        <div class="offer-card" style="margin-top: 20px;">
          <h3 style="margin-bottom: 15px;">Продление подписки</h3>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
            Для оплаты тарифа перейдите в наш официальный Telegram-бот.
          </p>
          <a href="https://t.me/achab_notify_bot" target="_blank" rel="noopener noreferrer" class="btn-pay" style="text-decoration: none;">
            Оплатить месяц<br/><span>2 000 ₽</span>
          </a>
        </div>
      </div>
    </div>`;

code = code.replace(insertionPoint, replacement);

fs.writeFileSync('src/components/MyTariffContent.vue', code);
console.log('Restored payment button with Telegram link');

