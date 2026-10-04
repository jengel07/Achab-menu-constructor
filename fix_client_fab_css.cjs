import fs from 'fs';

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const oldCssRegex = /\.floating-waiter-fab \{[\s\S]*?position: fixed;[\s\S]*?top: calc\(16px \+ env\(safe-area-inset-top\)\);[\s\S]*?\}/;

const newCss = `.floating-waiter-fab {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 100;
  border: none;
}`;

vue = vue.replace(oldCssRegex, newCss);

fs.writeFileSync('src/views/ClientView.vue', vue);

