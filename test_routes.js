const http = require('http');

const routes = [
  '/',
  '/catalogue',
  '/bijoux-de-porte',
  '/admin',
  '/admin/login',
  '/admin/catalogue',
  '/admin/dashboard',
  '/api/reel'
];

function checkRoute(route) {
  return new Promise((resolve) => {
    http.get('http://localhost:3000' + route, (res) => {
      console.log(route, '-> Status:', res.statusCode);
      resolve();
    }).on('error', (e) => {
      console.log(route, '-> Error:', e.message);
      resolve();
    });
  });
}

async function run() {
  for (const r of routes) {
    await checkRoute(r);
  }
}

run();
