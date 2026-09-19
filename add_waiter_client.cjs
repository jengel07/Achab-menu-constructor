const fs = require('fs');
const filePath = 'src/views/ClientView.vue';
let code = fs.readFileSync(filePath, 'utf8');

const callWaiterMethods = `
// --- WAITER CALL LOGIC ---
const showCallWaiterModal = ref(false);
const currentCallTable = ref('');
const currentCallRestaurantId = ref('');

// Retrieve lock timestamp from localStorage
const storedLock = localStorage.getItem('waiter_lock_until');
const waiterLockUntil = ref(storedLock ? parseInt(storedLock, 10) : 0);

const isWaiterLocked = computed(() => {
  return waiterLockUntil.value > Date.now();
});

const openCallWaiterModal = (order: any) => {
  if (isWaiterLocked.value) return;
  currentCallTable.value = order.tableNumber || customerForm.value.tableNumber;
  currentCallRestaurantId.value = order.restaurantId || (restaurantInfo.value as any).id;
  if (!currentCallTable.value) {
    alert(tDyn('Неизвестен номер стола.'));
    return;
  }
  showCallWaiterModal.value = true;
};

const submitWaiterCall = async (callType: string) => {
  if (isWaiterLocked.value) return;
  
  try {
    const res = await fetch(\`\${API_URL}/api/call-waiter\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: currentCallRestaurantId.value,
        tableNumber: currentCallTable.value,
        callType
      })
    });
    
    if (res.ok) {
      const lockTime = Date.now() + 180000; // 3 minutes
      waiterLockUntil.value = lockTime;
      localStorage.setItem('waiter_lock_until', lockTime.toString());
      showCallWaiterModal.value = false;
    } else {
      const data = await res.json();
      alert(data.error || tDyn('Произошла ошибка'));
    }
  } catch (err) {
    console.error(err);
    alert(tDyn('Ошибка сети'));
  }
};
// ------------------------
`;

const callWaiterModalHtml = `
    <!-- WAITER CALL MODAL -->
    <div v-if="showCallWaiterModal" class="bottom-sheet-overlay" @click.self="showCallWaiterModal = false">
      <div class="bottom-sheet" style="background: white; padding: 24px; border-radius: 20px 20px 0 0; color: #111;">
        <div style="width: 40px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 0 auto 16px;"></div>
        <h3 style="margin: 0 0 16px 0; font-size: 18px; text-align: center;">{{ tDyn('Позвать официанта') }}</h3>
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button @click="submitWaiterCall('Принести счет (картой)')" class="waiter-option-btn">💳 {{ tDyn('Принести счет (картой)') }}</button>
          <button @click="submitWaiterCall('Принести счет (наличными)')" class="waiter-option-btn">💵 {{ tDyn('Принести счет (наличными)') }}</button>
          <button @click="submitWaiterCall('Позвать кальянщика')" class="waiter-option-btn">💨 {{ tDyn('Позвать кальянщика') }}</button>
          <button @click="submitWaiterCall('Просто подойти')" class="waiter-option-btn">🙋 {{ tDyn('Просто подойти') }}</button>
        </div>
      </div>
    </div>
`;

// Insert the methods before `return { ... }` or at the end of the script setup block.
// Wait, this is `<script setup lang="ts">`.
// We can insert `callWaiterMethods` right before `onMounted(() => {`
if (!code.includes('submitWaiterCall')) {
  code = code.replace('onMounted(() => {', callWaiterMethods + '\n  onMounted(() => {');
}

// Insert the modal HTML just before the closing </div> of `client-wrapper`
if (!code.includes('WAITER CALL MODAL')) {
  code = code.replace(/<\/div>\s*<\/template>/, callWaiterModalHtml + '\n  </div>\n</template>');
}

// Replace the hardcoded "Позвать официанта" button inside the order tracker
const oldButton = `<button style="width: 100%; padding: 14px; background: #eeeeee; color: #111; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s;"
                  onmouseover="this.style.background='#e0e0e0'" onmouseout="this.style.background='#eeeeee'">
            {{ tDyn('Позвать официанта') }}
          </button>`;

const newButton = `<button 
            @click="openCallWaiterModal(order)"
            :disabled="isWaiterLocked"
            style="width: 100%; padding: 14px; color: #111; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
            :style="{ background: isWaiterLocked ? '#d1ffd6' : '#eeeeee', color: isWaiterLocked ? '#10b981' : '#111' }">
            <span v-if="isWaiterLocked">✓ {{ tDyn('Официант уже в пути') }}</span>
            <span v-else>{{ tDyn('Позвать официанта') }}</span>
          </button>`;

code = code.replace(oldButton, newButton);

// Also add styles for the modal options
if (!code.includes('.waiter-option-btn')) {
  code = code.replace('</style>', `
.waiter-option-btn {
  padding: 16px;
  background: #f4f5f7;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #111;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}
.waiter-option-btn:hover { background: #e2e8f0; }
</style>`);
}

fs.writeFileSync(filePath, code);
console.log('Updated ClientView.vue with Waiter logic.');

