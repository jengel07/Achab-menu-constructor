const fs = require('fs');
const filePath = 'src/views/ClientView.vue';
let code = fs.readFileSync(filePath, 'utf8');

const trackerHtml = `
      <div v-if="isOrderExpanded[order.id] && order.items" class="order-tracker-card" style="margin-bottom: 8px; background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; pointer-events: auto;">
        
        <div style="background: #f4f4f4; text-align: center; padding: 12px; font-weight: 600; font-size: 15px; color: #111;">
          {{ tDyn('Заказ №') }}{{ order.orderNumber || order.id.slice(-4) }}
        </div>

        <div style="padding: 24px 16px;">
          <!-- Main Icon -->
          <div style="display: flex; justify-content: center; margin-bottom: 12px;">
            <div style="width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; color: #6a2131;">
              <ChefHat v-if="order.status === 'progress'" :size="64" stroke-width="1.5" />
              <CheckCircle v-else-if="order.status === 'done' || order.status === 'archived'" :size="64" stroke-width="1.5" />
              <Clock v-else-if="order.status === 'new' || order.status === 'open'" :size="64" stroke-width="1.5" />
              <XCircle v-else :size="64" stroke-width="1.5" />
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="margin: 0 0 6px 0; font-size: 24px; color: #111;">
              {{ order.status === 'progress' ? tDyn('Готовится') : (order.status === 'done' || order.status === 'archived' ? tDyn('Готов') : (order.status === 'cancelled' ? tDyn('Отменен') : tDyn('Отправлен'))) }}
            </h2>
            <p style="margin: 0; font-size: 13px; color: #666;">
              {{ order.status === 'progress' ? tDyn('Повар уже готовит ваше блюдо') : (order.status === 'done' || order.status === 'archived' ? tDyn('Блюдо готово к подаче') : (order.status === 'cancelled' ? tDyn('Заказ был отменен') : tDyn('Ожидаем подтверждения кухни'))) }}
            </p>
          </div>

          <!-- Stepper -->
          <div v-if="order.status !== 'cancelled'" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; position: relative;">
            
            <div style="position: absolute; top: 16px; left: 10%; right: 10%; height: 3px; background: #e0e0e0; z-index: 1;"></div>
            
            <!-- Progress lines filling the stepper -->
            <div style="position: absolute; top: 16px; left: 10%; height: 3px; background: #4caf50; z-index: 2; transition: width 0.3s;"
                 :style="{ width: (order.status === 'progress' ? '50%' : (order.status === 'done' || order.status === 'archived' ? '100%' : '0%')) }">
            </div>

            <!-- Step 1: Sent -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 3; flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"
                   :style="{ background: '#4caf50' }">
                <Check v-if="order.status === 'progress' || order.status === 'done' || order.status === 'archived'" :size="18" stroke-width="3"/>
                <Clock v-else :size="18" stroke-width="2"/>
              </div>
              <span style="font-size: 10px; font-weight: 600;" :style="{ color: '#333' }">{{ tDyn('Отправлен') }}</span>
            </div>

            <!-- Step 2: Accepted (Bundled with progress visually for simplicity, or lit if progress/done) -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 3; flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"
                   :style="{ background: (order.status === 'progress' || order.status === 'done' || order.status === 'archived') ? '#4caf50' : '#e0e0e0' }">
                <Check v-if="order.status === 'progress' || order.status === 'done' || order.status === 'archived'" :size="18" stroke-width="3"/>
                <span v-else style="color: #888; font-weight: bold; font-size: 14px;">2</span>
              </div>
              <span style="font-size: 10px; font-weight: 600;" :style="{ color: (order.status === 'progress' || order.status === 'done' || order.status === 'archived') ? '#333' : '#888' }">{{ tDyn('Принят') }}</span>
            </div>

            <!-- Step 3: Cooking -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 3; flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"
                   :style="{ 
                      background: (order.status === 'done' || order.status === 'archived') ? '#4caf50' : (order.status === 'progress' ? '#6a2131' : '#e0e0e0'),
                      boxShadow: order.status === 'progress' ? '0 0 0 4px rgba(106, 33, 49, 0.2)' : 'none'
                   }">
                <Check v-if="order.status === 'done' || order.status === 'archived'" :size="18" stroke-width="3"/>
                <Clock v-else-if="order.status === 'progress'" :size="18" stroke-width="2"/>
                <span v-else style="color: #888; font-weight: bold; font-size: 14px;">3</span>
              </div>
              <span style="font-size: 10px; font-weight: 600;" :style="{ color: (order.status === 'done' || order.status === 'archived' || order.status === 'progress') ? (order.status === 'progress' ? '#6a2131' : '#333') : '#888' }">{{ tDyn('Готовится') }}</span>
            </div>

            <!-- Step 4: Ready -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 3; flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"
                   :style="{ 
                      background: (order.status === 'done' || order.status === 'archived') ? '#6a2131' : '#e0e0e0',
                      boxShadow: (order.status === 'done' || order.status === 'archived') ? '0 0 0 4px rgba(106, 33, 49, 0.2)' : 'none'
                   }">
                <Check v-if="order.status === 'done' || order.status === 'archived'" :size="18" stroke-width="3"/>
                <span v-else style="color: #888; font-weight: bold; font-size: 14px;">4</span>
              </div>
              <span style="font-size: 10px; font-weight: 600;" :style="{ color: (order.status === 'done' || order.status === 'archived') ? '#6a2131' : '#888' }">{{ tDyn('Готов / Подаем') }}</span>
            </div>
          </div>

          <div style="height: 1px; background: #eee; margin: 0 0 16px 0;"></div>

          <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #111;">{{ tDyn('Ваш заказ:') }}</h3>
          
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
            <div v-for="item in order.items" :key="item.id" style="display: flex; font-size: 14px; color: #222;">
              <span style="width: 24px; color: #666;">{{ item.quantity }}x</span>
              <span style="flex: 1;">{{ item.name }}</span>
            </div>
          </div>

          <button style="width: 100%; padding: 14px; background: #eeeeee; color: #111; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s;"
                  onmouseover="this.style.background='#e0e0e0'" onmouseout="this.style.background='#eeeeee'">
            {{ tDyn('Позвать официанта') }}
          </button>

        </div>
      </div>
`;

// Replace the old order-receipt-card
const oldStart = '<div v-if="isOrderExpanded[order.id] && order.items" class="order-receipt-card"';
const oldEnd = '</div>\n\n        <div v-if="order.status === \'done\'';

let startIndex = code.indexOf(oldStart);
if (startIndex !== -1) {
  // Find the exact end of the order-receipt-card.
  // It has a <div class="receipt-header">, <div class="receipt-items">, <div class="receipt-total">
  // So we can search for the third closing div after receipt-total.
  let currentIdx = startIndex;
  let closingDivsFound = 0;
  let inString = false;
  let stringChar = '';
  // Quick regex replacement for the whole block is safer if we match up to the next feedback block
  const pattern = /<div v-if="isOrderExpanded\[order\.id\] && order\.items" class="order-receipt-card"[\s\S]*?<div class="receipt-total">[\s\S]*?<\/div>\s*<\/div>\s*/;
  if (pattern.test(code)) {
    code = code.replace(pattern, trackerHtml + '\n\n        ');
    // Also we need to make sure the <Check> icon from lucide-vue-next is imported.
    if (!code.includes('Check,')) {
      code = code.replace("import { Clock,", "import { Clock, Check,");
      if (!code.includes('Check,')) {
         code = code.replace("import { ", "import { Check, ");
      }
    }
    fs.writeFileSync(filePath, code);
    console.log('Updated tracker UI successfully.');
  } else {
    console.log('Regex did not match perfectly.');
  }
} else {
  console.log('Could not find starting tag.');
}

