<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content modifiers-modal">
      <div class="modal-header">
        <h3>Опции и добавки</h3>
        <button type="button" class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <p class="desc">Здесь можно добавить размеры, сиропы, добавки и т.д.</p>
        
        <div v-for="(group, gIdx) in localModifiers" :key="group.id" class="modifier-group">
          <div class="group-header">
            <input v-model="group.name" placeholder="Название (напр. Размер)" class="group-name-input" />
            <select v-model="group.type" class="group-type-select">
              <option value="radio">Один вариант (Радио)</option>
              <option value="checkbox">Несколько (Галочки)</option>
            </select>
            <button type="button" class="btn-icon text-red" @click="removeGroup(gIdx)" title="Удалить группу">🗑️</button>
          </div>
          <div class="group-settings" v-if="group.type === 'radio'">
            <label class="checkbox-label" style="font-size: 13px; display: flex; align-items: center; gap: 6px; margin: 8px 0 12px 0; color: #475569; cursor: pointer;">
              <input type="checkbox" v-model="group.isAbsolute" />
              Заменяет базовую цену блюда (например, для размеров)
            </label>
          </div>
          
          <div class="options-list">
            <div v-for="(opt, oIdx) in group.options" :key="opt.id" class="option-row">
              <input v-model="opt.name" placeholder="Название (напр. Маленький)" class="opt-name" />
              <div class="price-input">
                <span v-if="!group.isAbsolute">+</span>
                <input v-model.number="opt.price" type="number" min="0" placeholder="0" class="opt-price" />
                <span>₽</span>
              </div>
              <button type="button" class="btn-icon" @click="removeOption(gIdx, oIdx)">❌</button>
            </div>
            <button type="button" class="add-opt-btn" @click="addOption(gIdx)">+ Добавить вариант</button>
          </div>
        </div>
        
        <button type="button" class="btn-secondary add-group-btn" @click="addGroup">+ Добавить группу опций</button>
      </div>
      
      <div class="modal-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">Отмена</button>
        <button type="button" class="btn-primary" @click="save">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  modifiers: any[];
}>();

const emit = defineEmits(['close', 'save']);

const localModifiers = ref<any[]>([]);

import { onMounted } from 'vue';
onMounted(() => {
  if (props.modifiers) {
    localModifiers.value = JSON.parse(JSON.stringify(props.modifiers));
  } else {
    localModifiers.value = [];
  }
});

const addGroup = () => {
  localModifiers.value.push({
    id: 'grp-' + Date.now(),
    name: '',
    type: 'radio',
    options: []
  });
};

const removeGroup = (idx: number) => {
  localModifiers.value.splice(idx, 1);
};

const addOption = (gIdx: number) => {
  localModifiers.value[gIdx].options.push({
    id: 'opt-' + Date.now(),
    name: '',
    price: 0
  });
};

const removeOption = (gIdx: number, oIdx: number) => {
  localModifiers.value[gIdx].options.splice(oIdx, 1);
};

const save = () => {
  emit('save', JSON.parse(JSON.stringify(localModifiers.value)));
};
</script>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
}
.modal-body {
  padding: 16px;
  overflow-y: auto;
}
.modal-actions {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modifiers-modal {
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.desc {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
}
.modifier-group {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}
.group-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.group-name-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-weight: 600;
}
.group-type-select {
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.opt-name {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
.price-input {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #cbd5e1;
  padding: 0 8px;
  border-radius: 4px;
}
.opt-price {
  width: 50px;
  border: none;
  padding: 6px 0;
  outline: none;
  text-align: right;
}
.add-opt-btn {
  background: none;
  border: 1px dashed #cbd5e1;
  color: #9D0D0E;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 4px;
}
.add-opt-btn:hover {
  background: #eff6ff;
}
.add-group-btn {
  width: 100%;
  padding: 10px;
  border-style: dashed;
}
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}
.text-red {
  color: #ef4444;
}
</style>

