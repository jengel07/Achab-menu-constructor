import fs from 'fs';

let vue = fs.readFileSync('src/Constructor.vue', 'utf8');

// The label ends with: tab === 'qrcode' ? 'QR-код меню' : 'Настройка заказов' }}
vue = vue.replace(/tab === 'qrcode' \? 'QR-код меню' : 'Настройка заказов' \}\}/g, `tab === 'qrcode' ? 'QR-код меню' : tab === 'orders' ? 'Настройка заказов' : 'Предпросмотр' }}`);

fs.writeFileSync('src/Constructor.vue', vue);

