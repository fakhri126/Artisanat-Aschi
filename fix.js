const fs = require('fs');
let code = fs.readFileSync('components/site/boho-decor.tsx', 'utf8');
code = code.split('className={wood-motif }').join('className={`wood-motif ${className || \\'\\'}`}');
fs.writeFileSync('components/site/boho-decor.tsx', code);
