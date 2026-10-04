const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// 1. Add floating-waiter-fab HTML
const modalHTML = `        <button v-if="!showCheckoutModal" class="floating-waiter-fab" 
            @click="openCallWaiterModalFromCart"
            :style="{ 
              color: restaurantInfo.primaryColor || '#10b981',
              zIndex: 9999
            }">
            <ConciergeBell :size="24" />
        </button>

<!-- WAITER CALL MODAL -->`;
vue = vue.replace(/<!-- WAITER CALL MODAL -->/, modalHTML);

// 2. Add floating-waiter-fab CSS
const cssToInsert = `.floating-waiter-fab {
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  z-index: 100;
  transition: transform 0.2s;
}
.floating-waiter-fab:active {
  transform: scale(0.95);
}

.checkout-modal-overlay {`;
vue = vue.replace(/\.checkout-modal-overlay \{/, cssToInsert);

fs.writeFileSync('src/views/ClientView.vue', vue);
