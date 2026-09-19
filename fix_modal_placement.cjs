const fs = require('fs');

let code = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const startIdx = code.indexOf('<!-- WAITER CALL MODAL -->');
if (startIdx !== -1) {
  // Find the end of the modal. It has `<div class="bottom-sheet-overlay">` and inside `<div class="bottom-sheet">` and inside another div. So 3 closing divs total.
  // We can just find '🙋 {{ tDyn('Просто подойти') }}</button>' and then the next 3 '</div>'s.
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

    // Now insert modalCode right before the last </template>
    const lastTemplateIdx = code.lastIndexOf('</template>');
    code = code.substring(0, lastTemplateIdx) + '\n' + modalCode + '\n' + code.substring(lastTemplateIdx);

    fs.writeFileSync('src/views/ClientView.vue', code);
    console.log('Fixed modal placement.');
  } else {
    console.log('Could not find end marker.');
  }
} else {
  console.log('Could not find start marker.');
}
