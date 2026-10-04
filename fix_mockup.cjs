const fs = require('fs');

let vue = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

const oldBtn = `<button @click="handleCheckout" class="checkout-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor }" style="width: 100%; margin-top: 16px; padding: 12px; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              {{ tDyn('Оформить заказ') }}
            </button>`;

const newBtn = `<button v-if="store.orderMode === 'CART'" @click="handleWaiter" class="checkout-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor }" style="width: 100%; margin-top: 16px; padding: 12px; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              {{ tDyn('Позвать официанта') }}
            </button>
            <button v-else @click="handleCheckout" class="checkout-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor }" style="width: 100%; margin-top: 16px; padding: 12px; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              {{ tDyn('Оформить заказ') }}
            </button>`;

vue = vue.replace(oldBtn, newBtn);

const functionToInject = `
const handleWaiter = () => {
  alert('В реальном меню откроется окно вызова официанта.');
};
`;

vue = vue.replace(
  `const handleCheckout = () => {`,
  `${functionToInject}\nconst handleCheckout = () => {`
);

fs.writeFileSync('src/components/PhoneMockupContent.vue', vue);
