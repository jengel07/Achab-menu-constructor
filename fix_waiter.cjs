const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const modalRegex = /<!-- WAITER CALL MODAL -->\s*<div v-if="showCallWaiterModal" class="bottom-sheet-overlay" @click\.self="showCallWaiterModal = false">\s*<div class="bottom-sheet" style="background: white; padding: 24px; border-radius: 20px 20px 0 0; color: #111;">\s*<div style="width: 40px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 0 auto 16px;"><\/div>\s*<h3 style="margin: 0 0 16px 0; font-size: 18px; text-align: center;">\{\{ tDyn\('Позвать официанта'\) \}\}<\/h3>\s*<div style="display: flex; flex-direction: column; gap: 8px;">\s*<button @click="submitWaiterCall\('Принести меню \(счет\)'\)" class="waiter-option-btn">🧾 \{\{ tDyn\('Принести меню \(счет\)'\) \}\}<\/button>\s*<button @click="submitWaiterCall\('Убрать со стола \(грязное\)'\)" class="waiter-option-btn">🍽️ \{\{ tDyn\('Убрать со стола \(грязное\)'\) \}\}<\/button>\s*<button @click="submitWaiterCall\('Нужна пепельница'\)" class="waiter-option-btn">🚬 \{\{ tDyn\('Нужна пепельница'\) \}\}<\/button>\s*<button @click="submitWaiterCall\('Сделать заказ'\)" class="waiter-option-btn">🛎️ \{\{ tDyn\('Сделать заказ'\) \}\}<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/;

const newModal = `<!-- WAITER CALL MODAL -->
    <div v-if="showCallWaiterModal" class="bottom-sheet-overlay" @click.self="showCallWaiterModal = false" style="z-index: 10000;">
      <div class="bottom-sheet" style="background: white; padding: 24px; border-radius: 20px 20px 0 0; color: #111;">
        <div style="width: 40px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 0 auto 16px;"></div>
        <h3 style="margin: 0 0 16px 0; font-size: 18px; text-align: center;">{{ tDyn('Позвать официанта') }}</h3>
        
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
      </div>
    </div>`;

vue = vue.replace(modalRegex, newModal);

// Also remove prompt from openCallWaiterModalFromCart
const fnRegex = /const openCallWaiterModalFromCart = \(\) => \{[\s\S]*?showCallWaiterModal\.value = true;\s*\};/;
const newFn = `const openCallWaiterModalFromCart = () => {
  if (isWaiterLocked.value) return;
  currentCallTable.value = customerForm.value.tableNumber || '';
  currentCallRestaurantId.value = (restaurantInfo.value as any)?.id || (restaurantInfo.value as any)?.restaurantId;
  showCallWaiterModal.value = true;
};`;
vue = vue.replace(fnRegex, newFn);

// Also update submitWaiterCall to save table
const submitRegex = /const submitWaiterCall = async \(callType: string\) => \{\s*if \(isWaiterLocked\.value\) return;/;
const newSubmit = `const submitWaiterCall = async (callType: string) => {
  if (isWaiterLocked.value) return;
  
  if (!currentCallTable.value) {
    alert(tDyn('Пожалуйста, укажите номер столика'));
    return;
  }
  
  if (currentCallTable.value !== customerForm.value.tableNumber) {
    customerForm.value.tableNumber = currentCallTable.value;
    localStorage.setItem('customer_form', JSON.stringify(customerForm.value));
  }`;
vue = vue.replace(submitRegex, newSubmit);

fs.writeFileSync('src/views/ClientView.vue', vue);
