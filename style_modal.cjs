import fs from 'fs';

let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// The modal content
vue = vue.replace(
  /\.modal-content\.order-settings-modal\s*\{[\s\S]*?\}/,
  `.modal-content.order-settings-modal {
  background: #ffffff;
  color: #111827;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  overflow: hidden;
}`
);

// mode-tabs
vue = vue.replace(
  /\.mode-tabs\s*\{[\s\S]*?\}/,
  `.mode-tabs { display: flex; background: #f3f4f6; padding: 4px; border-radius: 12px; margin-bottom: 20px; gap: 2px; }`
);

// mode-tabs button active
vue = vue.replace(
  /\.mode-tabs button\.active\s*\{[\s\S]*?\}/,
  `.mode-tabs button.active { background: #ffffff; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }`
);

// mode-description-card
vue = vue.replace(
  /\.mode-description-card\s*\{[\s\S]*?\}/,
  `.mode-description-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 16px; }`
);

vue = vue.replace(
  /\.mode-description-card p\s*\{[\s\S]*?\}/,
  `.mode-description-card p { font-size: 13px; color: #6b7280; line-height: 1.5; margin: 0 0 14px; }`
);

// btn-cancel
vue = vue.replace(
  /\.btn-cancel\s*\{[\s\S]*?\}/,
  `.btn-cancel { background: #f3f4f6; color: #374151; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; }`
);

// setting-block
vue = vue.replace(
  /\.setting-block\s*\{[\s\S]*?\}/,
  `.setting-block { background: #ffffff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 12px; margin-bottom: 12px; }`
);

// text-input
vue = vue.replace(
  /\.text-input\s*\{[\s\S]*?\}/,
  `.text-input { width: 100%; background: #f9fafb; border: 1px solid #d1d5db; color: #111827; padding: 10px; border-radius: 8px; font-size: 14px; outline: none; transition: border 0.15s; }`
);

// input-group label
vue = vue.replace(
  /\.input-group label\s*\{[\s\S]*?\}/,
  `.input-group label { display: block; font-size: 12px; color: #4b5563; margin-bottom: 6px; font-weight: 500; }`
);

// order-top-text
vue = vue.replace(
  /\.order-top-text\s*\{[\s\S]*?\}/,
  `.order-top-text { font-size: 13px; color: #6b7280; margin-bottom: 16px; line-height: 1.5; }`
);

// range-label
vue = vue.replace(
  /\.range-label\s*\{[\s\S]*?\}/,
  `.range-label { display: flex; justify-content: space-between; font-size: 13px; color: #4b5563; margin-bottom: 8px; }`
);

// work-day-row
vue = vue.replace(
  /\.work-day-row\s*\{[\s\S]*?\}/,
  `.work-day-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #111827; }`
);

// notification-tabs button
vue = vue.replace(
  /\.notification-tabs button\s*\{[\s\S]*?\}/,
  `.notification-tabs button { flex: 1; padding: 8px; background: transparent; border: none; color: #6b7280; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 6px; transition: background 0.15s; }`
);

vue = vue.replace(
  /\.notification-tabs button\.active\s*\{[\s\S]*?\}/,
  `.notification-tabs button.active { background: #e5e7eb; color: #111827; }`
);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);

