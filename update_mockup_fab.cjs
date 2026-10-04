import fs from 'fs';

let vue = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

// The PhoneMockupContent has the floating button injected right before the cart bar
// We will replace it
const oldHtmlRegex = /<button v-if="activeModal !== 'cart'"\s*class="floating-waiter-fab"[\s\S]*?<\/button>/g;

const newHtml = `<button v-if="activeModal !== 'cart'"
  class="floating-waiter-fab" 
  @click="handleWaiter"
  :style="{ 
    color: currentRestaurantInfo.primaryColor || '#10b981'
  }">
  <ConciergeBell :size="24" />
</button>`;

vue = vue.replace(oldHtmlRegex, newHtml);

const oldCssRegex = /\.floating-waiter-fab \{[\s\S]*?z-index: 20;\s*transition: bottom 0\.2s;\s*\}/;

const newCss = `.floating-waiter-fab {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
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

fs.writeFileSync('src/components/PhoneMockupContent.vue', vue);

