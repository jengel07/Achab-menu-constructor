const fs = require('fs');

let vue = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

const tDynReplaceRegex = /const handleWaiter = \(\) => \{\s*alert\('[^']+'\);\s*\};/;

const replacementLogic = `
const showCallWaiterModal = ref(false);
const currentCallTable = ref('');

const handleWaiter = () => {
  if (isWaiterLocked.value) {
    alert(tDyn ? tDyn('Подождите немного перед следующим вызовом.') : 'Подождите немного перед следующим вызовом.');
    return;
  }
  const tableNum = prompt(tDyn ? tDyn('Ваш столик:') : 'Ваш столик:');
  if (tableNum) {
    currentCallTable.value = tableNum;
    showCallWaiterModal.value = true;
  }
};

const waiterLockUntil = ref(parseInt(localStorage.getItem('waiter_lock_until') || '0'));
const isWaiterLocked = computed(() => waiterLockUntil.value > Date.now());

const submitWaiterCall = async (callType: string) => {
  if (isWaiterLocked.value) return;
  
  try {
    const API_URL = (import.meta as any).env.VITE_API_URL || '';
    const res = await fetch(\`\${API_URL}/api/call-waiter\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: computedRestaurantId.value,
        tableNumber: currentCallTable.value,
        callType
      })
    });
    
    if (res.ok) {
      const lockTime = Date.now() + 180000;
      waiterLockUntil.value = lockTime;
      localStorage.setItem('waiter_lock_until', lockTime.toString());
      showCallWaiterModal.value = false;
      alert('Уведомление отправлено!');
    } else {
      alert('Ошибка при вызове');
    }
  } catch (err) {
    console.error(err);
    alert('Ошибка при вызове');
  }
};
`;

vue = vue.replace(tDynReplaceRegex, replacementLogic);

// Add the HTML modal inside PhoneMockupContent.vue
const htmlInsertRegex = /<template v-else-if="currentScreen === 'cart'">/;

const modalHtml = `
          <!-- WAITER CALL MODAL -->
          <div v-if="showCallWaiterModal" class="bottom-sheet-overlay" @click.self="showCallWaiterModal = false" style="position: absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index: 10000; display:flex; flex-direction:column; justify-content:flex-end;">
            <div class="bottom-sheet" style="background: white; padding: 24px; border-radius: 20px 20px 0 0; color: #111;">
              <div style="width: 40px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 0 auto 16px;"></div>
              <h3 style="margin: 0 0 16px 0; font-size: 18px; text-align: center;">{{ tDyn ? tDyn('Позвать официанта') : 'Позвать официанта' }}</h3>
              
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button @click="submitWaiterCall('Подойдите ко мне (счет)')" class="waiter-option-btn" style="background:#f4f4f5; padding:12px; border-radius:12px; border:none; font-weight:600;">💸 {{ tDyn ? tDyn('Подойдите ко мне (счет)') : 'Подойдите ко мне (счет)' }}</button>
                <button @click="submitWaiterCall('Подойдите ко мне (с меню)')" class="waiter-option-btn" style="background:#f4f4f5; padding:12px; border-radius:12px; border:none; font-weight:600;">📖 {{ tDyn ? tDyn('Подойдите ко мне (с меню)') : 'Подойдите ко мне (с меню)' }}</button>
                <button @click="submitWaiterCall('Зову кальянщика')" class="waiter-option-btn" style="background:#f4f4f5; padding:12px; border-radius:12px; border:none; font-weight:600;">💨 {{ tDyn ? tDyn('Зову кальянщика') : 'Зову кальянщика' }}</button>
                <button @click="submitWaiterCall('Просто так')" class="waiter-option-btn" style="background:#f4f4f5; padding:12px; border-radius:12px; border:none; font-weight:600;">👋 {{ tDyn ? tDyn('Просто так') : 'Просто так' }}</button>
              </div>
            </div>
          </div>
          
          <template v-else-if="currentScreen === 'cart'">`;

vue = vue.replace(htmlInsertRegex, modalHtml);

fs.writeFileSync('src/components/PhoneMockupContent.vue', vue);
