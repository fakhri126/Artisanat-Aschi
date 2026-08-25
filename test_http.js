const http = require('http');

const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/bijoux-de-porte',
  'http://localhost:3000/admin/dashboard',
  'http://localhost:3000/admin/bijoux-de-porte'
];

urls.forEach(u => {
  http.get(u, res => {
    console.log(`${u} -> Status ${res.statusCode}`);
  }).on('error', e => {
    console.log(`${u} -> ERROR: ${e.message}`);
  });
});
