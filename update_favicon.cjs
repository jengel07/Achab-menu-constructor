const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

file = file.replace(/<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/g, '<link rel="icon" type="image/png" href="/favicon.png" />');

fs.writeFileSync('index.html', file);
console.log('Updated index.html with new favicon');

