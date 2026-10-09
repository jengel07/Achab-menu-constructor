const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const output = fs.createWriteStream(path.join(__dirname, 'daur-menu-deploy.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('Archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Glob pattern to include everything except node_modules and .git
archive.glob('**/*', {
  cwd: __dirname,
  ignore: [
    'node_modules/**', 
    'daur-menu-backend/node_modules/**', 
    '.git/**', 
    'dist/**', 
    'daur-menu-deploy.zip'
  ],
  dot: true // Include hidden files like .env and .dockerignore
});

archive.finalize();
