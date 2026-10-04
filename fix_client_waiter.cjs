import fs from 'fs';

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// 1. Add tableNumber URL param support
vue = vue.replace(
  `tableNumber: savedForm.tableNumber || '',`,
  `tableNumber: urlParams.get('table') || savedForm.tableNumber || '',`
);

// 2. Add @call-waiter to SettingsbarForClient
vue = vue.replace(
  `@checkout="startCheckout"`,
  `@checkout="startCheckout"\n          @call-waiter="openCallWaiterModalFromCart"`
);

// 3. Define openCallWaiterModalFromCart function
const functionToInject = `
const openCallWaiterModalFromCart = () => {
  if (isWaiterLocked.value) return;
  // If no table number, prompt the user for it!
  if (!customerForm.value.tableNumber) {
    const tableNum = prompt(tDyn('Введите номер вашего стола:'));
    if (tableNum) {
      customerForm.value.tableNumber = tableNum;
      // save it to localStorage so it persists
      localStorage.setItem('customer_form_data', JSON.stringify(customerForm.value));
    } else {
      return; // user cancelled
    }
  }
  currentCallTable.value = customerForm.value.tableNumber;
  currentCallRestaurantId.value = (restaurantInfo.value as any)?.id || (restaurantInfo.value as any)?.restaurantId;
  showCallWaiterModal.value = true;
};
`;

vue = vue.replace(
  `const openCallWaiterModal = (order: any) => {`,
  `${functionToInject}\nconst openCallWaiterModal = (order: any) => {`
);

fs.writeFileSync('src/views/ClientView.vue', vue);

