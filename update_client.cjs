const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// 1. Revert floating button hide logic
vue = vue.replace(
  /<button v-if="!showCheckoutModal && store.orderMode === 'CATALOG'"\s*class="floating-waiter-fab"/g,
  '<button v-if="!showCheckoutModal" class="floating-waiter-fab"'
);

// 2. Add reactive `now`
const importVueRegex = /import \{ ref, computed, onMounted, onUnmounted, reactive, watch \} from 'vue';/;
if (!importVueRegex.test(vue)) {
  vue = vue.replace(/import \{ ref, computed, onMounted, onUnmounted, reactive \} from 'vue';/, "import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue';");
}

const timerSetup = `
const now = ref(Date.now());
let timerInterval: any = null;

onMounted(() => {
  timerInterval = setInterval(() => {
    now.value = Date.now();
  }, 1000);
`;
vue = vue.replace(/onMounted\(\(\) => \{/, timerSetup);

const timerTeardown = `
onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
`;
vue = vue.replace(/onUnmounted\(\(\) => \{/, timerTeardown);

// 3. Update isWaiterLocked and remaining time
vue = vue.replace(
  /const isWaiterLocked = computed\(\(\) => \{\s*return waiterLockUntil\.value > Date\.now\(\);\s*\}\);/,
  `const isWaiterLocked = computed(() => {
  return waiterLockUntil.value > now.value;
});

const waiterLockRemaining = computed(() => {
  if (!isWaiterLocked.value) return '00:00';
  const diff = Math.floor((waiterLockUntil.value - now.value) / 1000);
  const m = Math.floor(diff / 60).toString().padStart(2, '0');
  const s = (diff % 60).toString().padStart(2, '0');
  return \`\${m}:\${s}\`;
});`
);

// 4. Remove `if (isWaiterLocked.value) return;` from open modal functions
vue = vue.replace(/const openCallWaiterModalFromCart = \(\) => \{\s*if \(isWaiterLocked\.value\) return;/, 'const openCallWaiterModalFromCart = () => {');
vue = vue.replace(/const openCallWaiterModal = \(order: any\) => \{\s*if \(isWaiterLocked\.value\) return;/, 'const openCallWaiterModal = (order: any) => {');

// 5. Update lock time from 3 minutes to 5 minutes
vue = vue.replace(/const lockTime = Date\.now\(\) \+ 180000; \/\/ 3 minutes/, 'const lockTime = Date.now() + 300000; // 5 minutes');

// 6. Update the Modal template (matched correctly)
const modalRegex = /<!-- WAITER CALL MODAL -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const newModal = `<!-- WAITER CALL MODAL -->
    <div v-if="showCallWaiterModal" class="bottom-sheet-overlay" @click.self="showCallWaiterModal = false" style="z-index: 10000;">
      <div class="bottom-sheet" style="background: white; padding: 24px; border-radius: 20px 20px 0 0; color: #111;">
        <div style="width: 40px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 0 auto 16px;"></div>
        <h3 style="margin: 0 0 16px 0; font-size: 18px; text-align: center;">{{ tDyn('Позвать официанта') }}</h3>
        
        <template v-if="isWaiterLocked">
          <div style="text-align: center; padding: 20px 0;">
            <div style="font-size: 48px; font-weight: bold; color: #9D0D0E; margin-bottom: 16px;">
              {{ waiterLockRemaining }}
            </div>
            <p style="font-size: 14px; color: #555; line-height: 1.5; margin: 0;">
              {{ tDyn('Ожидайте официанта в течении 5 минут, если по истичении этого времени официант не подошлел - нажмите еще раз') }}
            </p>
          </div>
        </template>
        
        <template v-else>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #555; text-align: center;">{{ tDyn('Ваш столик') }}</label>
            <input v-model="currentCallTable" type="text" :placeholder="tDyn('Например: 5')" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #ddd; font-size: 16px; outline: none; box-sizing: border-box; text-align: center; background: #f9f9f9; color: #111;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;" :style="{ opacity: currentCallTable ? 1 : 0.5, pointerEvents: currentCallTable ? 'auto' : 'none' }">
            <button @click="submitWaiterCall('Принести меню (счет)')" class="waiter-option-btn">🧾 {{ tDyn('Принести меню (счет)') }}</button>
            <button @click="submitWaiterCall('Убрать со стола (грязное)')" class="waiter-option-btn">🍽️ {{ tDyn('Убрать со стола (грязное)') }}</button>
            <button @click="submitWaiterCall('Нужна пепельница')" class="waiter-option-btn">🚬 {{ tDyn('Нужна пепельница') }}</button>
            <button @click="submitWaiterCall('Сделать заказ')" class="waiter-option-btn">🛎️ {{ tDyn('Сделать заказ') }}</button>
          </div>
        </template>
      </div>
    </div>`;
vue = vue.replace(modalRegex, newModal);

// Also remove disabled from button
vue = vue.replace(/:disabled="isWaiterLocked"/g, '');

fs.writeFileSync('src/views/ClientView.vue', vue);
