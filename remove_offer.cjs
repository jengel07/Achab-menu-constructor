const fs = require('fs');
let code = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');

// Replace everything from `<div class="offer-section"` up to the end of the `pending-notice` div
const regex = /<div class="offer-section"[\s\S]*?<div v-else class="pending-notice">[\s\S]*?<\/div>\s*<\/div>/;
code = code.replace(regex, '</div>');

fs.writeFileSync('src/components/MyTariffContent.vue', code);
console.log('Removed offer section and pending notice');

