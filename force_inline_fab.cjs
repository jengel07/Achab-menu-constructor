import fs from 'fs';

let vue = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

// Ensure button has high z-index and explicit styles just in case
vue = vue.replaceAll(
  `<button v-if="activeModal !== 'cart'"\n  class="floating-waiter-fab" \n  @click="handleWaiter"\n  :style="{ \n    color: currentRestaurantInfo.primaryColor || '#10b981'\n  }">`,
  `<button v-if="activeModal !== 'cart'"\n  class="floating-waiter-fab" \n  @click="handleWaiter"\n  :style="{ \n    color: currentRestaurantInfo.primaryColor || '#10b981',\n    position: 'absolute',\n    top: '16px',\n    right: '16px',\n    width: '44px',\n    height: '44px',\n    borderRadius: '50%',\n    backgroundColor: '#ffffff',\n    display: 'flex',\n    justifyContent: 'center',\n    alignItems: 'center',\n    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',\n    cursor: 'pointer',\n    zIndex: 9999,\n    border: 'none'\n  }">`
);

fs.writeFileSync('src/components/PhoneMockupContent.vue', vue);

