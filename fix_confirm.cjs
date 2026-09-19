import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /const now = new Date\(\);[\s\S]*?newPaidUntil\.setMonth\(newPaidUntil\.getMonth\(\) \+ \(months \|\| 1\)\);/;
const replacement = `const now = new Date();
    // Оплата строго на 30 дней от текущего момента (по требованиям)
    const newPaidUntil = new Date();
    newPaidUntil.setDate(newPaidUntil.getDate() + 30);`;

code = code.replace(regex, replacement);
fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed confirm-payment logic');

