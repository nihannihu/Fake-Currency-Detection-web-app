const { spawn } = require('child_process');
const path = require('path');

// Test calling the Python script directly
console.log("Testing Python script call from backend...");

// Use absolute path to make sure we're calling the right script
const scriptPath = path.join(__dirname, '..', 'ai-model', 'currency_detector.py');
const fakeImagePath = path.join(__dirname, '..', 'ai-model', 'test.jpg');
const realImagePath = path.join(__dirname, '..', 'ai-model', 'dataset/test/real/100_jpg.rf.2edef2522c4db8d75e4c9bd8863d154d.jpg');

console.log(`Script path: ${scriptPath}`);
console.log(`Fake test image path: ${fakeImagePath}`);
console.log(`Real test image path: ${realImagePath}`);

// Test with fake image
console.log("\n=== Testing with FAKE currency image ===");
testImage(scriptPath, fakeImagePath, "FAKE");

// Test with real image
console.log("\n=== Testing with REAL currency image ===");
testImage(scriptPath, realImagePath, "REAL");

function testImage(scriptPath, imagePath, imageType) {
  const pythonProcess = spawn('python', [scriptPath, imagePath]);

  let pythonResult = '';
  let pythonError = '';

  pythonProcess.stdout.on('data', (data) => {
    pythonResult += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    pythonError += data.toString();
  });

  pythonProcess.on('close', (code) => {
    console.log(`${imageType} image test - Python script exited with code ${code}`);
    if (pythonError) {
      console.log(`${imageType} image test - Python stderr: ${pythonError}`);
    }
    
    // Extract JSON from the output (last line should be JSON)
    const lines = pythonResult.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    
    try {
      const result = JSON.parse(lastLine);
      console.log(`${imageType} image test - Result:`, result);
    } catch (parseError) {
      console.error(`${imageType} image test - Error parsing Python result:`, parseError);
      console.log(`${imageType} image test - Last line of output:`, lastLine);
    }
  });
}