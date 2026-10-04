import fs from 'fs';

let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

const regex = /<label for="liability">[\s\S]*?<\/label>/;
vue = vue.replace(
  regex,
  `<label for="liability">Я понимаю, что Achab QrMenu предоставляет инструмент для приёма заказов, но я несу полную ответственность за их выполнение. Achab QrMenu не несёт ответственности за потерянные заказы, пропущенные уведомления или связанные потери выручки.</label>`
);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);

