const fs = require('fs');
const http = require('http');
const FormData = require('form-data');

// Test with the known fake currency image
console.log("Testing with known fake currency image...");
const form = new FormData();
form.append('image', fs.createReadStream('../ai-model/test.jpg'));

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/check-currency',
  method: 'POST',
  headers: form.getHeaders()
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`Fake currency result: ${chunk}`);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

form.pipe(req);