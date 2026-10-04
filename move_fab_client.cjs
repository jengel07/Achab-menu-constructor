import fs from 'fs';

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// 1. Remove the button from its current wrong location
const buttonRegex = /<button v-if="!showCheckoutModal"[\s\S]*?class="floating-waiter-fab"[\s\S]*?<\/button>/;
const buttonMatch = vue.match(buttonRegex);

if (buttonMatch) {
  const buttonHtml = buttonMatch[0];
  vue = vue.replace(buttonRegex, '');

  // 2. Insert it before <div v-if="cartItems.length > 0 ... class="floating-cart-bar"
  // Wait, in ClientView.vue, the cart bar is also OUTSIDE .phone-screen?!
  // Let's check where floating-cart-bar is.
}

fs.writeFileSync('src/views/ClientView.vue', vue);

