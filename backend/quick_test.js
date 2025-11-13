const fs = require('fs');
const http = require('http');
const FormData = require('form-data');

console.log("=== Quick Test: Fake vs Real Currency Detection ===\n");

// Test 1: Fake currency image
console.log("Test 1: Fake Currency Image");
console.log("------------------------");
const fakeForm = new FormData();
fakeForm.append('image', fs.createReadStream('../ai-model/test.jpg'));

const fakeOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/check-currency',
  method: 'POST',
  headers: fakeForm.getHeaders()
};

const fakeReq = http.request(fakeOptions, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`Result: ${chunk}\n`);
    
    // Test 2: Real currency image
    console.log("Test 2: Real Currency Image");
    console.log("-------------------------");
    const realForm = new FormData();
    realForm.append('image', fs.createReadStream('../ai-model/dataset/test/real/100_jpg.rf.2edef2522c4db8d75e4c9bd8863d154d.jpg'));

    const realOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/check-currency',
      method: 'POST',
      headers: realForm.getHeaders()
    };

    const realReq = http.request(realOptions, (res) => {
      console.log(`Status: ${res.statusCode}`);
      res.on('data', (chunk) => {
        console.log(`Result: ${chunk}`);
        console.log("\n=== Test Complete ===");
      });
    });

    realReq.on('error', (error) => {
      console.error('Real currency test error:', error.message);
    });

    realForm.pipe(realReq);
  });
});

fakeReq.on('error', (error) => {
  console.error('Fake currency test error:', error.message);
});

fakeForm.pipe(fakeReq);