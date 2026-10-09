const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

file = file.replace(/<link rel="icon" type="image\/png" href="\/favicon\.png" \/>/g, '<link rel="icon" type="image/png" href="/favicon.png?v=2" />');

fs.writeFileSync('index.html', file);
console.log('Updated index.html with favicon cache buster');

