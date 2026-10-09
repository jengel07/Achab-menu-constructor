const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

file = file.replace(/href="\/favicon\.png\?v=2"/g, 'href="/favicon.png?v=3"');

fs.writeFileSync('index.html', file);
console.log('Updated index.html to v=3');

