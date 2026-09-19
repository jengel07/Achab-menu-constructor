const fs = require('fs');
let code = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');

// The button code:
// <button class="btn-pay year" @click="submitPayment(12)" :disabled="submitting">
//   Оплатить год<br/><span>20 000 ₽</span>
// </button>

code = code.replace(/<button class="btn-pay year"[\s\S]*?<\/button>/, '');

fs.writeFileSync('src/components/MyTariffContent.vue', code);
console.log('Removed yearly payment button');

