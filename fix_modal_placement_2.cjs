const fs = require('fs');

let code = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const startIdx = code.indexOf('<!-- WAITER CALL MODAL -->');
if (startIdx !== -1) {
  // Find the end marker
  const endMarker = "🙋 {{ tDyn('Просто подойти') }}</button>";
  const markerIdx = code.indexOf(endMarker, startIdx);
  if (markerIdx !== -1) {
    let endIdx = markerIdx;
    for (let i = 0; i < 3; i++) {
      endIdx = code.indexOf('</div>', endIdx + 1);
    }
    endIdx += '</div>'.length;

    const modalCode = code.substring(startIdx, endIdx);
    code = code.substring(0, startIdx) + code.substring(endIdx);

    // Find injection point after <SettingsbarForClient ... />
    const settingsbarStr = '@update:searchQuery="val => searchQuery = val"\n          />';
    const settingsbarIdx = code.indexOf(settingsbarStr);
    
    if (settingsbarIdx !== -1) {
      const injectIdx = settingsbarIdx + settingsbarStr.length;
      code = code.substring(0, injectIdx) + '\n\n' + modalCode + '\n' + code.substring(injectIdx);
      fs.writeFileSync('src/views/ClientView.vue', code);
      console.log('Fixed modal placement, injected after SettingsbarForClient.');
    } else {
      console.log('Could not find SettingsbarForClient.');
    }
  } else {
    console.log('Could not find end marker.');
  }
} else {
  console.log('Could not find start marker.');
}

