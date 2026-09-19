const fs = require('fs');

let code = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// 1. Revert template
const templateSearch = `                  <div v-if="notifType === 'telegram'" class="input-group mt-16">
                    <label>Токен бота (Telegram Bot Token)</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="telegramBotToken" placeholder="123456789:AAExxxxxxx" class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>
                    
                    <label class="mt-8">Chat ID для Заказов</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="ordersChatId" placeholder="-100xxxxxxxxx" class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>

                    <label class="mt-8">Chat ID для Вызова Официанта</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="waitersChatId" placeholder="-100xxxxxxxxx" class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>

                    <label class="mt-8">Chat ID для Отзывов</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="reviewsChatId" placeholder="-100xxxxxxxxx" class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>
                    
                    <p style="font-size: 10px; color: #888; margin-top: 6px;">Укажите ID чатов, куда будут приходить соответствующие уведомления. Если указать только для заказов, остальные будут приходить туда же.</p>
                  </div>`;
                  
const templateReplace = `                  <div v-if="notifType === 'telegram'" class="input-group mt-16">
                    <label>Вэбхук Telegram бота (Webhook / sendMessage)</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="telegramWebhook" placeholder="https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<ID>"
                        class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>
                    <p style="font-size: 10px; color: #888; margin-top: 4px;">Нужен URL с chat_id. Мы подставим в конец &text=...</p>
                  </div>`;

code = code.replace(templateSearch, templateReplace);

// 2. Revert refs
const refSearch = `  const notifType = ref(_saved.notifType ?? 'dashboard');
  const telegramBotToken = ref(_saved.telegramBotToken ?? '');
  const ordersChatId = ref(_saved.ordersChatId ?? '');
  const waitersChatId = ref(_saved.waitersChatId ?? '');
  const reviewsChatId = ref(_saved.reviewsChatId ?? '');
  const emailNotif = ref(_saved.emailNotif ?? false);`;
  
const refReplace = `  const notifType = ref(_saved.notifType ?? 'dashboard');
  const telegramWebhook = ref(_saved.telegramWebhook ?? _saved.whatsappNumber ?? '');
  const emailNotif = ref(_saved.emailNotif ?? false);`;

code = code.replace(refSearch, refReplace);

// 3. Revert save payload
const saveSearch = `      notifType: notifType.value,
      telegramBotToken: telegramBotToken.value,
      ordersChatId: ordersChatId.value,
      waitersChatId: waitersChatId.value,
      reviewsChatId: reviewsChatId.value,
      emailNotif: emailNotif.value,`;

const saveReplace = `      notifType: notifType.value,
      telegramWebhook: telegramWebhook.value,
      emailNotif: emailNotif.value,`;
      
code = code.replace(saveSearch, saveReplace);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', code);
console.log('Reverted OrderSettingsEditor.vue');

