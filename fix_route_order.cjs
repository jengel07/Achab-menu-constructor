const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// 1. Extract the billing endpoints block
const billingRegex = /\/\/ GET \/api\/my-restaurant-billing[\s\S]*?Failed to confirm payment' \}\);\s*\}\s*\}\);/g;
const billingMatches = code.match(billingRegex);
if (billingMatches && billingMatches.length > 0) {
  const billingCode = billingMatches[0];
  
  // 2. Remove the billing block from its current location
  code = code.replace(billingRegex, '');

  // 3. Insert it right before the SPA catch-all `app.get('*', (req, res) => {`
  code = code.replace(/app\.get\('\*',\s*\(req,\s*res\)\s*=>\s*\{/, billingCode + '\n\napp.get(\'*\', (req, res) => {');

  fs.writeFileSync('daur-menu-backend/index.js', code);
  console.log('Fixed endpoints order');
} else {
  console.log('Could not find billing endpoints block');
}

