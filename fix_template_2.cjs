import fs from 'fs';

let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// 1. Remove the misplaced toast
vue = vue.replace(
`                      </div>
      </div>
      
      <div v-if="showToast" class="toast-notification">
        <CheckCircle :size="16" /> Режим работы успешно сохранен
      </div>
    </template>`,
`                      </div>
                    </div>
                  </template>`
);

// 2. Add toast at the end of the template (before </template> before <script)
// Using a regex to find the FIRST </template> that precedes <script
const lastTemplateRegex = /<\/template>\s*<script setup lang="ts">/;
vue = vue.replace(lastTemplateRegex, `
    <div v-if="showToast" class="toast-notification">
      <CheckCircle :size="16" /> Режим работы успешно сохранен
    </div>
  </template>
  <script setup lang="ts">`
);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);

