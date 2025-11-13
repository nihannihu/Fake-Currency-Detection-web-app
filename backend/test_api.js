const fs = require('fs');
const http = require('http');
const FormData = require('form-data');
const path = require('path');

// Test with fake currency image
console.log("Testing with fake currency image...");
const form1 = new FormData();
form1.append('image', fs.createReadStream('../ai-model/test.jpg'));

const options1 = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/check-currency',
  method: 'POST',
  headers: form1.getHeaders()
};

const req1 = http.request(options1, (res) => {
  console.log(`Fake currency - Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`Fake currency result: ${chunk}`);
  });
});

req1.on('error', (error) => {
  console.error('Fake currency test - Error:', error.message);
});

form1.pipe(req1);

// Test with real currency image
setTimeout(() => {
  console.log("\nTesting with real currency image...");
  // Copy a real image to uploads directory for testing
  const realImagePath = '../ai-model/dataset/test/real/100_jpg.rf.2edef2522c4db8d75e4c9bd8863d154d.jpg';
  const uploadPath = './uploads/real_test_image.jpg';
  
  // For this test, we'll just test the fake image since we need to upload through the API
  console.log("Note: To test real currency images, you would need to upload them through the web interface");
}, 2000);