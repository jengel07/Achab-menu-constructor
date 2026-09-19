const fs = require('fs');

const path = 'src/components/SettingsbarForClient.vue';
let code = fs.readFileSync(path, 'utf8');

const replacement = `
        <div style="font-size: 11px; font-weight: bold; margin-top: 4px;">{{ tDyn('Пищевая ценность') }}</div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
          <template v-for="f in [
            { key: 'nutFree', icon: '🥜', label: 'Без орехов' },
            { key: 'glutenFree', icon: '🌾', label: 'Без глютена' },
            { key: 'vegetarian', icon: '🥗', label: 'Вегетарианское' },
            { key: 'vegan', icon: '🌱', label: 'Веганское' }
          ]" :key="f.key">
            <button 
              v-if="!restaurantInfo?.filterSettings || restaurantInfo.filterSettings[f.key] !== false"
              class="filter-option-btn" 
              :class="{ active: selectedFilters.includes(f.key) }"
              :style="selectedFilters.includes(f.key) ? { borderColor: primaryColor, backgroundColor: primaryColor, color: '#fff' } : {}"
              @click="$emit('toggle-filter', f.key)"
            >
              {{ f.icon }} {{ tDyn(f.label) }}
            </button>
          </template>
        </div>
`;

// Find the section to replace
code = code.replace(
  /<div style="font-size: 11px; font-weight: bold; margin-top: 4px;">\{\{\s*tDyn\('Пищевая ценность'\)\s*\}\}<\/div>[\s\S]*?(?=<button class="show-results-btn)/,
  replacement
);

fs.writeFileSync(path, code);
console.log('Updated SettingsbarForClient.vue');

