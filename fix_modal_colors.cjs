const fs = require('fs');
let code = fs.readFileSync('src/views/SuperAdminView.vue', 'utf8');

const styleBlock = `
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; color: #111827; padding: 24px; border-radius: 12px; width: 400px; max-width: 90%; }
.modal-content h2 { margin-top: 0; color: #111827; }
.form-group { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
.form-group label { color: #374151; font-weight: 600; font-size: 13px; }
.form-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; color: #111827; background: #fff; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.btn-primary { background: #9D0D0E; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-secondary { background: #e5e7eb; color: #374151; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.text-red-500 { color: #ef4444; }
.font-bold { font-weight: bold; }
</style>
`;

// Replace the old style block
code = code.replace(/\.modal-overlay \{[\s\S]*?<\/style>/, styleBlock);

fs.writeFileSync('src/views/SuperAdminView.vue', code);

