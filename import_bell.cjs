import fs from 'fs';

let vue = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

vue = vue.replace(
  `import { Check, Receipt, ShoppingCart, Star, X } from 'lucide-vue-next';`,
  `import { Check, Receipt, ShoppingCart, Star, X, ConciergeBell } from 'lucide-vue-next';`
);

// Fallback in case it's different:
if (!vue.includes('ConciergeBell } from')) {
  vue = vue.replace(
    `import { ShoppingCart, Star, X } from 'lucide-vue-next';`,
    `import { ShoppingCart, Star, X, ConciergeBell } from 'lucide-vue-next';`
  );
}

fs.writeFileSync('src/components/PhoneMockupContent.vue', vue);

