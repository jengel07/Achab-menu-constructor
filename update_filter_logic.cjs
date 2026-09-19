const fs = require('fs');

function updateFilterLogic(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  const oldLogicRegex = /if\s*\(selectedFilters\.value\.length\s*>\s*0\)\s*\{\s*result\s*=\s*result\.filter\(\(item:\s*any\)\s*=>\s*\{\s*return\s*selectedFilters\.value\.some\(f\s*=>\s*\{[\s\S]*?\}\)\s*\}\)\s*\}/;

  const newLogic = `if (selectedFilters.value.length > 0) {
    result = result.filter((item: any) => {
      // Use "every" if you want items to match ALL selected filters, or "some" for ANY.
      // Usually dietary filters are strict (if I select vegan AND glutenFree, I want both).
      // But let's keep "some" if that was the original intention, or switch to "every" for better UX.
      // Let's use "every" because if I click GlutenFree and Vegan, I expect food that is BOTH.
      return selectedFilters.value.every(f => {
        if (f === 'nutFree') return item.nutFree || item.noNuts || item.isNutFree || (Array.isArray(item.tags) && item.tags.includes('nutFree'));
        if (f === 'glutenFree') return item.glutenFree || item.noGluten || item.isGlutenFree || (Array.isArray(item.tags) && item.tags.includes('glutenFree'));
        if (f === 'vegetarian') return item.vegetarian || item.isVegetarian || (Array.isArray(item.tags) && item.tags.includes('vegetarian'));
        if (f === 'vegan') return item.vegan || item.isVegan || (Array.isArray(item.tags) && item.tags.includes('vegan'));
        return false;
      });
    });
  }`;

  if (oldLogicRegex.test(code)) {
    code = code.replace(oldLogicRegex, newLogic);
    fs.writeFileSync(filePath, code);
    console.log('Updated filtering logic in', filePath);
  } else {
    console.log('Could not find filtering logic to replace in', filePath);
  }
}

updateFilterLogic('src/views/ClientView.vue');
updateFilterLogic('src/components/PhoneMockupContent.vue');

