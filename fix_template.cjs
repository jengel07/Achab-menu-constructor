import fs from 'fs';

let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// The malformed block:
const malformed = `                      </div>
      </div>
      
      <div v-if="showToast" class="toast-notification">
        <CheckCircle :size="16" /> Режим работы успешно сохранен
      </div>
    </template>`;

const fixed = `                      </div>
                    </div>
                  </template>`;

vue = vue.replace(malformed, fixed);

// Now put the toast at the very end properly
const endOfRootTemplate = `      </div>
    </div>
</template>`;

const newEndOfRoot = `      </div>
    </div>
    <div v-if="showToast" class="toast-notification">
      <CheckCircle :size="16" /> Режим работы успешно сохранен
    </div>
</template>`;

vue = vue.replace(endOfRootTemplate, newEndOfRoot);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);

