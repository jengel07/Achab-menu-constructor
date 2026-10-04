import fs from 'fs';

let store = fs.readFileSync('src/store/menuStore.ts', 'utf8');

if (!store.includes('const orderMode = ref')) {
    store = store.replace(
      'const generalSettings = ref({',
      'const orderMode = ref("ORDER");\n  const generalSettings = ref({'
    );
    
    // Load from backend
    store = store.replace(
      'if (data.generalSettings && Object.keys(data.generalSettings).length)',
      'if (data.orderMode) orderMode.value = data.orderMode;\n      if (data.generalSettings && Object.keys(data.generalSettings).length)'
    );

    // Save to backend
    store = store.replace(
      'generalSettings: generalSettings.value,',
      'orderMode: orderMode.value,\n          generalSettings: generalSettings.value,'
    );
    
    store = store.replace(
      'generalSettings: generalSettings.value,\n      };',
      'orderMode: orderMode.value,\n        generalSettings: generalSettings.value,\n      };'
    );
    
    store = store.replace(
      '[restaurantInfo, categories, items, generalSettings]',
      '[restaurantInfo, categories, items, generalSettings, orderMode]'
    );
    
    store = store.replace(
      'generalSettings,\n    userInfo,',
      'generalSettings,\n    orderMode,\n    userInfo,'
    );
    
    // Also in loadFromLocalStorage:
    store = store.replace(
      'if (parsed.generalSettings) generalSettings.value',
      'if (parsed.orderMode) orderMode.value = parsed.orderMode;\n      if (parsed.generalSettings) generalSettings.value'
    );
    
    fs.writeFileSync('src/store/menuStore.ts', store);
}

