const fs = require('fs');

function updateUI(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Add the state variable for toggling the list
  if (!code.includes('const isOrdersListExpanded = ref(')) {
    code = code.replace(
      'const activeOrderIds = ref<string[]>([]);',
      'const isOrdersListExpanded = ref(false);\nconst activeOrderIds = ref<string[]>([]);'
    );
  }

  // Find the exact block we want to replace
  const startStr = '<div v-if="activeOrders.length > 0 && !showCheckoutModal" class="active-orders-wrapper"';
  let startIndex = code.indexOf(startStr);
  if (startIndex === -1) {
    console.log("Could not find start in", filePath);
    return;
  }

  // The block ends right before floating-cart-bar
  const endStr = '<div v-if="cartItems.length > 0 && !showCheckoutModal" class="floating-cart-bar"';
  let endIndex = code.indexOf(endStr);
  if (endIndex === -1) {
    console.log("Could not find end in", filePath);
    return;
  }

  const oldBlock = code.substring(startIndex, endIndex);

  // We need to extract the existing feedback HTML to preserve it exactly
  const feedbackStart = oldBlock.indexOf('<div v-if="order.status === \'done\' || order.status === \'archived\'"');
  if (feedbackStart === -1) {
    console.log("Could not find feedback block in", filePath);
    return;
  }
  
  // The feedback block closes just before the end of the order loop
  // The loop ends with three </div> tags:
  // 1. feedback widget container
  // 2. active-order-container
  // 3. active-orders-wrapper
  const feedbackEnd = oldBlock.lastIndexOf('</div>', oldBlock.lastIndexOf('</div>', oldBlock.lastIndexOf('</div>') - 1) - 1) + 6;
  const feedbackHtml = oldBlock.substring(feedbackStart, feedbackEnd);

  const replacement = `
<div v-if="activeOrders.length > 0 && !showCheckoutModal" style="position: absolute; top: 15px; right: 12px; z-index: 50; display: flex; flex-direction: column; align-items: flex-end; pointer-events: none;">
  
  <div v-if="!isOrdersListExpanded" class="orders-mini-icon" @click="isOrdersListExpanded = true" style="pointer-events: auto; position: relative; width: 44px; height: 44px; background: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer; color: #111;">
    <Receipt :size="20" stroke-width="2" />
    <span class="orders-badge" style="position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; min-width: 18px; height: 18px; border-radius: 9px; display: flex; justify-content: center; align-items: center; padding: 0 4px; box-sizing: border-box;">
      {{ activeOrders.length }}
    </span>
  </div>

  <div v-if="isOrdersListExpanded" class="expanded-panel" style="pointer-events: auto; width: calc(100vw - 24px); max-width: 400px; max-height: calc(100vh - 100px); overflow-y: auto; background: transparent; display: flex; flex-direction: column; gap: 8px; scrollbar-width: none;">
    <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
      <strong style="color: #111; font-size: 14px;">{{ tDyn('Мои заказы') }} ({{ activeOrders.length }})</strong>
      <button @click="isOrdersListExpanded = false" style="background: rgba(0,0,0,0.05); border: none; color: #333; padding: 4px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer;">
        <X :size="16" stroke-width="3" />
      </button>
    </div>

    <div v-for="order in activeOrders" :key="order.id" class="active-order-container" style="display: block;">
      <div class="floating-order-bar" @click="isOrderExpanded[order.id] = !isOrderExpanded[order.id]" style="margin-bottom: 8px;">
        <div class="order-bar-icon-wrapper" :class="'status-' + order.status">
          <Clock v-if="order.status === 'new'" :size="20" stroke-width="2" />
          <ChefHat v-else-if="order.status === 'progress'" :size="20" stroke-width="2" />
          <CheckCircle v-else-if="order.status === 'done' || order.status === 'archived'" :size="20" stroke-width="2" />
          <XCircle v-else :size="20" stroke-width="2" />
        </div>
        <div class="order-bar-text">
          <strong>{{ tDyn('Заказ') }} #{{ order.orderNumber || order.id.slice(-4) }}</strong>
          <span>{{ getOrderStatusText(order.status) }}</span>
        </div>
        <div class="order-bar-right">
          <button v-if="order.status === 'done' || order.status === 'archived' || order.status === 'cancelled'" class="close-order-btn" @click.stop="clearActiveOrder(order.id)">
            <X :size="14" stroke-width="3" />
          </button>
          <ChevronDown class="order-bar-chevron" :class="{ 'expanded': isOrderExpanded[order.id] }" :size="20" />
        </div>
      </div>

      <div v-if="isOrderExpanded[order.id] && order.items" class="order-receipt-card" style="margin-bottom: 8px; max-height: 300px; overflow-y: auto;">
        <div class="receipt-header">
          <strong>{{ tDyn('Чек заказа') }}</strong>
          <span>{{ new Date(order.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
        </div>
        <div class="receipt-items">
          <div v-for="item in order.items" :key="item.id" class="receipt-item">
            <span class="r-name">{{ item.quantity }}x {{ item.name }}</span>
            <span class="r-price">{{ Number(item.price * item.quantity).toFixed(2) }} ₽</span>
          </div>
        </div>
        <div class="receipt-total">
          <span>{{ tDyn('Итого') }}</span>
          <span>{{ Number(order.totalPrice || order.total).toFixed(2) }} ₽</span>
        </div>
      </div>

      ${feedbackHtml}

    </div>
  </div>
</div>
`;

  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  
  // Set isOrdersListExpanded = true on order creation
  if (code.includes('activeOrderIds.value.push(result.orderId);')) {
    code = code.replace(
      'activeOrderIds.value.push(result.orderId);',
      'activeOrderIds.value.push(result.orderId);\n      isOrdersListExpanded.value = true;'
    );
  }

  fs.writeFileSync(filePath, code);
  console.log('UI updated in', filePath);
}

updateUI('src/views/ClientView.vue');
// PhoneMockupContent.vue doesn't have activeOrders, skipping.

