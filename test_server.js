const http = require('http');

const req = http.get('http://localhost:3000/admin/login', (res) => {
  console.log('HTTP Status on 3000:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response length:', data.length);
  });
});

req.on('error', (err) => {
  console.log('PORT 3000 NOT REACHABLE:', err.message);
});
