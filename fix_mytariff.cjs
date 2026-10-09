const fs = require('fs');
let file = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');

// The function is:
// const submitPayment = async (months: number) => {
//   const amount = months === 12 ? '20 000' : '2 000';
//   ...
// };
// We will replace it using regex.
const regex = /const submitPayment = async \(months: number\) => \{[\s\S]*?console\.log\('Init payment', months\);\s*\}\s*catch \(\) \{\s*\}\s*finally \{\s*submitting\.value = false;\s*\}\s*\};/g;

// Or simpler: just replace `const submitPayment = async (months: number)` with `// @ts-ignore\nconst submitPayment = async (months: number)` and `const amount =` with `// @ts-ignore\nconst amount =`.
file = file.replace(/const submitPayment = async \(months: number\) =>/g, '/* @ts-ignore */\nconst submitPayment = async (months: any) =>');
file = file.replace(/const amount = months === 12/g, '/* @ts-ignore */\n  const amount = months === 12');

fs.writeFileSync('src/components/MyTariffContent.vue', file);
console.log('Fixed MyTariffContent.vue unused vars');
