const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.vue')) {
            results.push(file);
        }
    });
    return results;
}

const vueFiles = walkDir('src/components');

let changed = 0;
vueFiles.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    let original = code;
    code = code.replace(/#646cff/gi, '#6a2131')
               .replace(/#6366f1/gi, '#6a2131')
               .replace(/#4f46e5/gi, '#521926')
               .replace(/#3b82f6/gi, '#6a2131')
               .replace(/rgba\(99,\s*102,\s*241/g, 'rgba(106, 33, 49');
    
    if (code !== original) {
      fs.writeFileSync(file, code);
      console.log('Updated colors in', file);
      changed++;
    }
});
console.log('Total files changed:', changed);

