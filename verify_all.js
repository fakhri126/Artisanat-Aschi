const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        getAllFiles(filePath, exts, fileList);
      }
    } else {
      if (exts.includes(path.extname(file))) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

const files = getAllFiles('.', ['.ts', '.tsx']);
let hasError = false;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const imp = match[1];
    if (imp.startsWith('@/')) {
      const rel = imp.replace('@/', '');
      const candidates = [
        path.join('.', rel),
        path.join('.', rel + '.ts'),
        path.join('.', rel + '.tsx'),
        path.join('.', rel + '.js'),
        path.join('.', rel + '.mjs'),
        path.join('.', rel, 'index.ts'),
        path.join('.', rel, 'index.tsx'),
        path.join('.', rel, 'index.js')
      ];
      const exists = candidates.some(c => fs.existsSync(c));
      if (!exists) {
        console.error('BROKEN IMPORT in ' + file + ': ' + imp);
        hasError = true;
      }
    }
  }
});

if (!hasError) {
  console.log('ALL IMPORTS CLEAN!');
}
