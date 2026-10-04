import fs from 'fs';

let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// 1. Add imports
vue = vue.replace(
  "import { ref, computed, onMounted, onUnmounted } from 'vue';",
  "import { ref, computed, onMounted, onUnmounted } from 'vue';\nimport { useMenuStore } from '../store/menuStore';\nimport { CheckCircle } from 'lucide-vue-next';"
);

// 2. Setup menuStore
vue = vue.replace(
  "const emit = defineEmits(['update:model-value']);",
  "const emit = defineEmits(['update:model-value']);\nconst menuStore = useMenuStore();"
);
vue = vue.replace(
  "const emit = defineEmits(['update:modelValue']);",
  "const emit = defineEmits(['update:modelValue']);\nconst menuStore = useMenuStore();"
);

// 3. Setup orderMode mapping
vue = vue.replace(
  "const currentMode = ref<'menu' | 'cart' | 'order'>(_saved.currentMode || 'order');",
  `const currentMode = ref<'menu' | 'cart' | 'order'>(
  menuStore.orderMode === 'CATALOG' ? 'menu' : 
  menuStore.orderMode === 'CART' ? 'cart' : 
  menuStore.orderMode === 'ORDER' ? 'order' : 
  (_saved.currentMode || 'order')
);`
);

// 4. applyMode override
const applyModeRegex = /const applyMode = \(mode: 'menu' \| 'cart' \| 'order'\) => \{\s*currentMode\.value = mode;\s*saveSettings\(\);\s*\};/;
vue = vue.replace(
  applyModeRegex,
  `const showToast = ref(false);
const applyMode = async (mode: 'menu' | 'cart' | 'order') => {
  currentMode.value = mode;
  saveSettings();
  
  const modeMap = { menu: 'CATALOG', cart: 'CART', order: 'ORDER' };
  menuStore.orderMode = modeMap[mode];
  
  try {
    await menuStore.saveToBackend();
    showToast.value = true;
    setTimeout(() => { showToast.value = false; }, 3000);
  } catch (err) {
    console.error('Failed to save mode', err);
  }
};`
);

// 5. Add toast HTML at the END of the template
const endOfTemplateRegex = /<\/div>\s*<\/div>\s*<\/div>\s*<\/template>/;
vue = vue.replace(endOfTemplateRegex, 
`        </div>
      </div>
    </div>
    <div v-if="showToast" class="toast-notification">
      <CheckCircle :size="16" /> Режим работы успешно сохранен
    </div>
  </template>`
);

// 6. Add CSS
vue += `
<style scoped>
.toast-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 10000;
  animation: slideInUp 0.3s ease;
}
@keyframes slideInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
`;

fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);

