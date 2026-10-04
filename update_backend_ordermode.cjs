import fs from 'fs';

let backend = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// Update POST
const postRegex = /const \{ info, items, cats, generalSettings \} = req\.body;/;
backend = backend.replace(postRegex, `const { info, items, cats, generalSettings, orderMode } = req.body;`);

const menuUpdateDataRegex = /if \(generalSettings !== undefined\) menuUpdateData\.general_settings = JSON\.stringify\(generalSettings \|\| \{\}\);/;
backend = backend.replace(menuUpdateDataRegex, `if (generalSettings !== undefined) menuUpdateData.general_settings = JSON.stringify(generalSettings || {});\n      if (orderMode !== undefined) menuUpdateData.orderMode = orderMode;`);

// Update GET
const getReturnRegex = /generalSettings: menuRecord\?\.general_settings \? JSON\.parse\(menuRecord\.general_settings\) : \{\}/;
backend = backend.replace(getReturnRegex, `generalSettings: menuRecord?.general_settings ? JSON.parse(menuRecord.general_settings) : {},\n        orderMode: menuRecord?.orderMode || 'ORDER'`);

// Update Public GET
const publicGetReturnRegex = /generalSettings: menuRecord\?\.general_settings \? JSON\.parse\(menuRecord\.general_settings\) : \{\}/;
backend = backend.replace(publicGetReturnRegex, `generalSettings: menuRecord?.general_settings ? JSON.parse(menuRecord.general_settings) : {},\n        orderMode: menuRecord?.orderMode || 'ORDER'`);

fs.writeFileSync('daur-menu-backend/index.js', backend);

