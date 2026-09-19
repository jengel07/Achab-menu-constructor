const fs = require('fs');
let code = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');

// Replace phone
code = code.replace(/\+7 \(999\) 123-45-67/, '+7 999 655-53-65');

// Replace bank
code = code.replace(/Банк: Сбербанк или Тинькофф<br\/>Получатель: Иван И\./, 'Банк: Т-Банк<br/>Получатель: Дженифер Г.');

fs.writeFileSync('src/components/MyTariffContent.vue', code);
console.log('Updated bank details');

