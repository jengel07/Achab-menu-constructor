const fs = require('fs');

let code = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

const templateSearch = `                  <div v-if="notifType === 'telegram'" class="input-group mt-16">
                    <label>Вэбхук Telegram бота (Webhook / sendMessage)</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="telegramWebhook" placeholder="https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<ID>"
                        class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>
                    <p style="font-size: 10px; color: #888; margin-top: 4px;">Нужен URL с chat_id. Мы подставим в конец &text=...</p>
                  </div>`;
                  
const templateReplace = `                  <div v-if="notifType === 'telegram'" class="input-group mt-16">
                    <label>Вэбхук Telegram бота (Webhook / sendMessage)</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="telegramWebhook" placeholder="https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<ID>"
                        class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>
                    
                    <label class="mt-8">ID темы заказов (message_thread_id)</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="ordersThreadId" placeholder="Например: 12345" class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>

                    <label class="mt-8">ID темы официантов (message_thread_id)</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="waitersThreadId" placeholder="Например: 12346" class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>

                    <label class="mt-8">ID темы отзывов (message_thread_id)</label>
                    <div class="phone-input-wrapper">
                      <input type="text" v-model="reviewsThreadId" placeholder="Например: 12347" class="text-input" style="padding-left: 10px;" @blur="saveSettings" />
                    </div>
                    
                    <p style="font-size: 10px; color: #888; margin-top: 6px;">Укажите ID веток, куда будут приходить соответствующие уведомления. Если не указывать, сообщения придут в общий чат.</p>
                  </div>`;

code = code.replace(templateSearch, templateReplace);

const refSearch = `  const notifType = ref(_saved.notifType ?? 'dashboard');
  const telegramWebhook = ref(_saved.telegramWebhook ?? _saved.whatsappNumber ?? '');
  const emailNotif = ref(_saved.emailNotif ?? false);`;

const refReplace = `  const notifType = ref(_saved.notifType ?? 'dashboard');
  const telegramWebhook = ref(_saved.telegramWebhook ?? _saved.whatsappNumber ?? '');
  const ordersThreadId = ref(_saved.ordersThreadId ?? '');
  const waitersThreadId = ref(_saved.waitersThreadId ?? '');
  const reviewsThreadId = ref(_saved.reviewsThreadId ?? '');
  const emailNotif = ref(_saved.emailNotif ?? false);`;

code = code.replace(refSearch, refReplace);

const saveSearch = `      notifType: notifType.value,
      telegramWebhook: telegramWebhook.value,
      emailNotif: emailNotif.value,`;

const saveReplace = `      notifType: notifType.value,
      telegramWebhook: telegramWebhook.value,
      ordersThreadId: ordersThreadId.value,
      waitersThreadId: waitersThreadId.value,
      reviewsThreadId: reviewsThreadId.value,
      emailNotif: emailNotif.value,`;

code = code.replace(saveSearch, saveReplace);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', code);
console.log('OrderSettingsEditor.vue updated with Thread IDs');

