<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content modifiers-modal">
      <div class="modal-header">
        <h3 class="modal-title">{{ item.name?.ru || item.name }}</h3>
        <button type="button" class="close-btn" @click="$emit('close')">
          <X size="20" stroke-width="2" />
        </button>
      </div>
      
      <div class="modal-body">
        <div v-for="(group, gIdx) in modifiers" :key="group.id" class="modifier-group">
          <div class="group-header">
            <div class="group-name">
              {{ group.name }} 
              <span v-if="group.type === 'radio'" class="req-badge">*</span>
            </div>
            <div class="group-hint" v-if="group.type === 'radio'">
              Выберите один вариант
            </div>
            <div class="group-hint" v-else>
              Можно выбрать несколько
            </div>
          </div>
          
          <div class="options-list">
            <label 
              v-for="opt in group.options" 
              :key="opt.id" 
              class="option-row"
              :class="{ 
                'selected': group.type === 'radio' ? selections[group.id] === opt.id : selections[group.id]?.includes(opt.id)
              }"
            >
              <div class="opt-icon-wrapper">
                <!-- Radio/Checkbox visually hidden -->
                <input 
                  :type="group.type === 'radio' ? 'radio' : 'checkbox'"
                  :name="'mod_' + group.id"
                  :value="opt.id"
                  v-model="selections[group.id]"
                  class="mod-input-hidden"
                />
                
                <div v-if="group.type === 'radio'" class="custom-radio">
                  <div class="radio-dot" v-if="selections[group.id] === opt.id"></div>
                </div>
                
                <div v-else class="custom-checkbox">
                  <Check size="14" stroke-width="3" v-if="selections[group.id]?.includes(opt.id)" />
                </div>
              </div>

              <span class="opt-name">{{ opt.name }}</span>
              <span v-if="opt.price > 0" class="opt-price">
                <template v-if="isAbsoluteGroup(group)">{{ opt.price }} ₽</template>
                <template v-else>+{{ opt.price }} ₽</template>
              </span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button type="button" class="add-to-cart-btn" @click="addToCart" :disabled="!isReady">
          Добавить за {{ totalPrice }} ₽
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Check } from 'lucide-vue-next';

const props = defineProps<{
  item: any;
}>();

const emit = defineEmits(['close', 'add-to-cart']);

const modifiers = computed(() => props.item.modifiers || []);

const isAbsoluteGroup = (group: any) => {
  if (group.isAbsolute !== undefined) return group.isAbsolute;
  const n = (group.name || '').toLowerCase();
  return group.type === 'radio' && (n.includes('размер') || n.includes('объем') || n.includes('порци'));
};

// State
const selections = ref<Record<string, any>>({});

// Init selections
const initSelections = () => {
  const init: Record<string, any> = {};
  modifiers.value.forEach((group: any) => {
    if (group.type === 'radio') {
      init[group.id] = group.options[0]?.id || null;
    } else {
      init[group.id] = [];
    }
  });
  selections.value = init;
};

watch(() => props.item, initSelections, { immediate: true });

const isReady = computed(() => {
  for (const group of modifiers.value) {
    if (group.type === 'radio' && !selections.value[group.id]) {
      return false;
    }
  }
  return true;
});

const totalPrice = computed(() => {
  let base = Number(props.item.price) || 0;
  
  // First pass: find absolute group
  for (const group of modifiers.value) {
    if (isAbsoluteGroup(group)) {
      const selectedId = selections.value[group.id];
      const opt = group.options.find((o: any) => o.id === selectedId);
      if (opt && Number(opt.price) > 0) {
        base = Number(opt.price);
      }
    }
  }

  // Second pass: add everything else
  for (const group of modifiers.value) {
    if (isAbsoluteGroup(group)) continue;
    
    if (group.type === 'radio') {
      const selectedId = selections.value[group.id];
      const opt = group.options.find((o: any) => o.id === selectedId);
      if (opt) base += Number(opt.price) || 0;
    } else {
      const selectedIds = selections.value[group.id] || [];
      selectedIds.forEach((sid: string) => {
        const opt = group.options.find((o: any) => o.id === sid);
        if (opt) base += Number(opt.price) || 0;
      });
    }
  }
  return base.toFixed(2);
});

const addToCart = () => {
  if (!isReady.value) return;

  const selectedOptions = [];
  for (const group of modifiers.value) {
    if (group.type === 'radio') {
      const selectedId = selections.value[group.id];
      const opt = group.options.find((o: any) => o.id === selectedId);
      if (opt) selectedOptions.push({ ...opt, groupName: group.name });
    } else {
      const selectedIds = selections.value[group.id] || [];
      selectedIds.forEach((sid: string) => {
        const opt = group.options.find((o: any) => o.id === sid);
        if (opt) selectedOptions.push({ ...opt, groupName: group.name });
      });
    }
  }

  // Use a hash of selected options to distinguish cart items
  const optsHash = selectedOptions.map(o => o.id).sort().join('_');
  
  const finalItem = {
    ...props.item,
    id: props.item.id + (optsHash ? '_' + optsHash : ''),
    price: parseFloat(totalPrice.value),
    selectedModifiers: selectedOptions
  };

  emit('add-to-cart', finalItem);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modifiers-modal {
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  color: #1e293b;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* For desktop screens */
@media (min-width: 600px) {
  .modal-overlay {
    align-items: center;
  }
  .modifiers-modal {
    border-radius: 20px;
    width: 90%;
    animation: zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes zoomIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  z-index: 1;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #64748b;
  cursor: pointer;
  transition: 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

.modifier-group {
  padding: 24px;
  border-bottom: 8px solid #f8fafc;
}
.modifier-group:last-child {
  border-bottom: none;
}

.group-header {
  margin-bottom: 16px;
}

.group-name {
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
  display: flex;
  align-items: center;
}

.req-badge {
  color: #ef4444;
  margin-left: 4px;
  font-size: 20px;
  line-height: 0.5;
}

.group-hint {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-row {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 16px;
  background: #fff;
  border: 2px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s ease;
  user-select: none;
}

.option-row:hover {
  border-color: #e2e8f0;
}

.option-row.selected {
  border-color: #9D0D0E;
  background: #eff6ff;
}

.mod-input-hidden {
  display: none;
}

.opt-icon-wrapper {
  margin-right: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
}

.option-row.selected .custom-radio {
  border-color: #9D0D0E;
}

.radio-dot {
  width: 10px;
  height: 10px;
  background: #9D0D0E;
  border-radius: 50%;
}

.custom-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid #cbd5e1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  transition: 0.2s;
}

.option-row.selected .custom-checkbox {
  background: #9D0D0E;
  border-color: #9D0D0E;
}

.opt-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
}

.opt-price {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.option-row.selected .opt-price {
  color: #9D0D0E;
}

.modal-footer {
  padding: 20px 24px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.02);
}

.add-to-cart-btn {
  width: 100%;
  background: #0f172a;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.add-to-cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.add-to-cart-btn:active {
  transform: translateY(0);
}

.add-to-cart-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
