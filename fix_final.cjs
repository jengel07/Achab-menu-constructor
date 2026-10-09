const fs = require('fs');

let cstr = fs.readFileSync('src/Constructor.vue', 'utf8');
cstr = cstr.replace(/nutFree: true, glutenFree: true, vegetarian: true, vegan: true/g, 'nutFree: true, glutenFree: true, vegetarian: true, vegan: true, dairyFree: true');
fs.writeFileSync('src/Constructor.vue', cstr);

let cmm = fs.readFileSync('src/components/ClientModifiersModal.vue', 'utf8');
cmm = cmm.replace(/<X size="20"/g, '<X :size="20"');
cmm = cmm.replace(/<XCircle size="24"/g, '<XCircle :size="24"');
cmm = cmm.replace(/<CheckCircle size="24"/g, '<CheckCircle :size="24"');
cmm = cmm.replace(/<ShoppingCart size="20"/g, '<ShoppingCart :size="20"');
fs.writeFileSync('src/components/ClientModifiersModal.vue', cmm);

// Fix PhoneMockupContent and ClientView class/type bindings where `"full"` is used
// Wait, PhoneMockupContent.vue(141,18) and ClientView.vue(140,12)
let pmc = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');
// look for list' | 'grid' inside template or script that I missed
pmc = pmc.replace(/:viewMode="'list' \| 'grid'"/g, ""); // No, wait.
// Let's use regex to replace all `ref<'grid' | 'list'>` that might have had spaces differently.
pmc = pmc.replace(/ref<'list' \| 'grid'>/g, "ref<'list' | 'grid' | 'full'>");
pmc = pmc.replace(/ref<'grid' \| 'list'>/g, "ref<'grid' | 'list' | 'full'>");
fs.writeFileSync('src/components/PhoneMockupContent.vue', pmc);

let cv = fs.readFileSync('src/views/ClientView.vue', 'utf8');
cv = cv.replace(/ref<'list' \| 'grid'>/g, "ref<'list' | 'grid' | 'full'>");
cv = cv.replace(/ref<'grid' \| 'list'>/g, "ref<'grid' | 'list' | 'full'>");
fs.writeFileSync('src/views/ClientView.vue', cv);

console.log('Fixed final batch');
