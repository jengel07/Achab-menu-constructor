const fs = require('fs');
let code = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');

// The a tag was:
// <a href="https://t.me/achab_notify_bot" target="_blank" rel="noopener noreferrer" class="btn-pay" style="text-decoration: none;">
//   Оплатить месяц<br/><span>2 000 ₽</span>
// </a>

code = code.replace(/<a href="https:\/\/t\.me\/achab_notify_bot" target="_blank" rel="noopener noreferrer" class="btn-pay" style="text-decoration: none;">[\s\S]*?<\/a>/, 
`<button class="btn-pay" @click="handlePaymentClick" :disabled="submitting">
            Оплатить месяц<br/><span>2 000 ₽</span>
          </button>`);

// Add handlePaymentClick logic
const scriptEnd = `const submitPayment = async (months: number) => {`;
code = code.replace(scriptEnd, `
const handlePaymentClick = async () => {
  window.open('https://t.me/achab_notify_bot', '_blank');
  await submitPayment(1);
};

const submitPayment = async (months: number) => {`);

// Also change the confirm dialog since we already opened telegram, or maybe remove confirm?
// "Контроллер на бэкенде меняет status ресторана на PENDING_PAYMENT." 
// Let's remove confirm
code = code.replace(/if \(!confirm\([\s\S]*?\) return;/, '');

fs.writeFileSync('src/components/MyTariffContent.vue', code);
console.log('Fixed MyTariffContent.vue');

