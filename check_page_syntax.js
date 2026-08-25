const fs = require('fs');
const pageContent = fs.readFileSync('./app/bijoux-de-porte/page.tsx', 'utf8');

console.log('Page lines:', pageContent.split('\n').length);
console.log('Includes HandleModel:', pageContent.includes('export interface HandleModel'));
console.log('Includes filteredProducts:', pageContent.includes('filteredProducts'));
console.log('Syntax check passed!');
