import sys

file_path = 'src/components/QrCodeEditor.vue'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_qr = '''<QrcodeVue 
              :value="currentQrValue" 
              :size="200" 
              :foreground="modelValue.qrSettings?.squareColor || '#000000'"
              :background="modelValue.qrSettings?.bgColor || '#ffffff'"
              level="H" 
              render-as="svg"
            />'''

new_qr = '''<QrcodeVue 
              :value="currentQrValue" 
              :size="200" 
              :foreground="modelValue.qrSettings?.squareColor || '#000000'"
              :background="modelValue.qrSettings?.bgColor || '#ffffff'"
              level="H" 
              render-as="svg"
              :image-settings="{ src: modelValue.logo || '/favicon-02.png', width: 50, height: 50, excavate: true }"
            />'''

if old_qr in content:
    content = content.replace(old_qr, new_qr)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replaced QrcodeVue successfully')
else:
    print('Could not find QrcodeVue block')

