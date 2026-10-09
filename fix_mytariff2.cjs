const fs = require('fs');
let file = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');

const regex = /\/\* @ts-ignore \*\/\r?\nconst submitPayment = async \(months: any\) => \{[\s\S]*?submitting\.value = false;\r?\n  \}\r?\n\};/g;
file = file.replace(regex, '');

fs.writeFileSync('src/components/MyTariffContent.vue', file);
console.log('Removed submitPayment');
