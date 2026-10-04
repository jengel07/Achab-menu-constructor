import fs from 'fs';

let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// Replace the text in Step 2
vue = vue.replace(
  /<p class="order-top-text">.*?<\/p>/,
  `<p class="order-top-text">Принимай заказы клиентов прямо в Achab QrMenu и по email. Быстрый и простой способ увеличить выручку без лишних заморочек.</p>`
);

// Just in case, replace the Step 1 text again if my previous script failed due to encoding
vue = vue.replace(
  /<p>Принимай заказы клиентов прямо в Dashboard.*?<\/p>/,
  `<p>Принимай заказы клиентов прямо в Achab QrMenu и по email. Быстрый и простой способ увеличить выручку без лишних заморочек.</p>`
);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);

