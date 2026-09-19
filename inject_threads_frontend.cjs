const fs = require('fs');

let code = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// 1. Add refs for Thread IDs
if (!code.includes('const ordersThreadId')) {
  code = code.replace(
    "const telegramWebhook = ref(_saved.telegramWebhook ?? _saved.whatsappNumber ?? '');",
    "const telegramWebhook = ref(_saved.telegramWebhook ?? _saved.whatsappNumber ?? '');\n  const ordersThreadId = ref(_saved.ordersThreadId ?? '');\n  const waitersThreadId = ref(_saved.waitersThreadId ?? '');\n  const reviewsThreadId = ref(_saved.reviewsThreadId ?? '');"
  );
}

// 2. Add to save payload
if (!code.includes('ordersThreadId: ordersThreadId.value')) {
  code = code.replace(
    "telegramWebhook: telegramWebhook.value,",
    "telegramWebhook: telegramWebhook.value,\n      ordersThreadId: ordersThreadId.value,\n      waitersThreadId: waitersThreadId.value,\n      reviewsThreadId: reviewsThreadId.value,"
  );
}

// 3. Add to template
if (!code.includes('v-model="ordersThreadId"')) {
  const insertTemplate = `
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
`;
  
  // Find the exact injection point (after the telegramWebhook block)
  code = code.replace(/<p style="font-size: 10px; color: #888; margin-top: 4px;">([^<]+)<\/p>/, `<p style="font-size: 10px; color: #888; margin-top: 4px;">$1</p>${insertTemplate}`);
}

fs.writeFileSync('src/components/OrderSettingsEditor.vue', code);
console.log('Successfully updated OrderSettingsEditor.vue');

