const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// 1. Add openCallWaiterModalFromCart right before openCallWaiterModal
const newOpenFunction = `
const openCallWaiterModalFromCart = () => {
  currentCallTable.value = customerForm.value.tableNumber || '';
  currentCallRestaurantId.value = (restaurantInfo.value as any).id;
  showCallWaiterModal.value = true;
};

const openCallWaiterModal`;

vue = vue.replace(/const openCallWaiterModal/g, newOpenFunction);

// 2. Fix submitWaiterCall to save the table number and validate it
const oldSubmit = `const submitWaiterCall = async (callType: string) => {
  if (isWaiterLocked.value) return;
  
  try {`;

const newSubmit = `const submitWaiterCall = async (callType: string) => {
  if (isWaiterLocked.value) return;
  
  if (!currentCallTable.value) {
    alert(tDyn('Пожалуйста, укажите ваш столик.'));
    return;
  }
  
  if (currentCallTable.value !== customerForm.value.tableNumber) {
    customerForm.value.tableNumber = currentCallTable.value;
    localStorage.setItem('customer_form', JSON.stringify(customerForm.value));
  }
  
  try {`;

vue = vue.replace(oldSubmit, newSubmit);

fs.writeFileSync('src/views/ClientView.vue', vue);

