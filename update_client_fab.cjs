import fs from 'fs';

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// Replace HTML
const oldHtmlRegex = /<button v-if="!showCheckoutModal"\s*class="floating-waiter-fab"[\s\S]*?<\/button>/;

const newHtml = `<button v-if="!showCheckoutModal"
  class="floating-waiter-fab" 
  @click="openCallWaiterModalFromCart"
  :style="{ 
    color: restaurantInfo.primaryColor || '#10b981'
  }">
  <ConciergeBell :size="24" />
</button>`;

vue = vue.replace(oldHtmlRegex, newHtml);

// Replace CSS
const oldCssRegex = /\.floating-waiter-fab \{[\s\S]*?z-index: 20;\s*transition: bottom 0\.2s;\s*\}/;

const newCss = `.floating-waiter-fab {
  position: fixed;
  top: calc(16px + env(safe-area-inset-top));
  right: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 100;
  border: none;
}`;

vue = vue.replace(oldCssRegex, newCss);

fs.writeFileSync('src/views/ClientView.vue', vue);

