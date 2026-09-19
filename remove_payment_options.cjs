const fs = require('fs');
let code = fs.readFileSync('src/Constructor.vue', 'utf8');

// The payment view starts with `<p class="smenu-section-desc">Выберите способы оплаты...</p>` and has 3 setting rows.
// We will replace everything from `<p class="smenu-section-desc">` up to the divider we added before `<MyTariffContent />`

code = code.replace(/<p class="smenu-section-desc">Выб[\s\S]*?<div class="smenu-divider" style="margin: 20px 0; border-bottom: 1px solid #e5e7eb;"><\/div>/, '');

// Also let's rename the sidebar button just to "Подписка" or "Оплата тарифа" instead of "Оплата и Подписка" to make it cleaner since guest payment is gone.
code = code.replace(/<span>Оплата и Подписка<\/span>/, '<span>Моя подписка</span>');
code = code.replace(/payment: 'Оплата и Подписка'/, "payment: 'Моя подписка'");

fs.writeFileSync('src/Constructor.vue', code);
console.log('Removed guest payment toggles');

