
const { spawn } = require('child_process');
const http = require('http');

const server = spawn('npx', ['tsx', 'server.ts']);
server.stdout.on('data', (data) => {
  console.log('Server:', data.toString());
  if (data.toString().includes('Server running')) {
    console.log('Server started, running test...');
    // Run the test
    const { exec } = require('child_process');
    exec('npx tsx test-api.ts', (err, stdout, stderr) => {
      console.log('Test Output:', stdout);
      if (stderr) console.error('Test Error:', stderr);
      process.exit(0);
    });
  }
});
server.stderr.on('data', (data) => console.error('Server Error:', data.toString()));

