import fs from 'fs';

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const injectHtml = `
<button v-if="!showCheckoutModal && store.orderMode !== 'CATALOG'" 
  class="floating-waiter-fab" 
  @click="openCallWaiterModalFromCart"
  :style="{ 
    backgroundColor: '#ffffff', 
    color: restaurantInfo.primaryColor || '#10b981',
    bottom: (cartItems.length > 0) ? 'calc(12px + 45px + 4px + 52px)' : 'calc(12px + 45px + 4px)',
    border: '2px solid ' + (restaurantInfo.primaryColor || '#10b981')
  }">
  <ConciergeBell :size="20" />
  <span style="font-size: 13px; font-weight: bold; margin-left: 6px;">{{ tDyn('Позвать официанта') }}</span>
</button>
<div v-if="cartItems.length > 0 && !showCheckoutModal && store.orderMode !== 'CATALOG'" class="floating-cart-bar"`;

vue = vue.replace(
  `<div v-if="cartItems.length > 0 && !showCheckoutModal && store.orderMode !== 'CATALOG'" class="floating-cart-bar"`,
  injectHtml
);

const injectCss = `
.floating-waiter-fab {
  position: absolute;
  right: 12px;
  height: 42px;
  border-radius: 21px;
  padding: 0 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  cursor: pointer;
  z-index: 20;
  transition: bottom 0.2s;
}
.floating-cart-bar { position: absolute;`;

vue = vue.replace(
  `.floating-cart-bar { position: absolute;`,
  injectCss
);

fs.writeFileSync('src/views/ClientView.vue', vue);

