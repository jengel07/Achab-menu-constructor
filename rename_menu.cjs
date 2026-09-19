const fs = require('fs');
let code = fs.readFileSync('src/Constructor.vue', 'utf8');

code = code.replace(/<span>Мой тариф \/ Оплата<\/span>/g, '<span>Мой тариф</span>');
code = code.replace(/<span>Оплата<\/span>/g, '<span>Способы оплаты</span>');

fs.writeFileSync('src/Constructor.vue', code);

