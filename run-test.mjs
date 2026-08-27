import { spawn, exec } from 'child_process';

const server = spawn('npx.cmd', ['tsx', 'server.ts'], { shell: true });
server.stdout.on('data', (data) => {
  console.log('Server:', data.toString());
  if (data.toString().includes('Server running')) {
    console.log('Server started, running test...');
    exec('npx.cmd tsx test-api.ts', (err, stdout, stderr) => {
      console.log('Test Output:', stdout);
      if (stderr) console.error('Test Error:', stderr);
      process.exit(0);
    });
  }
});
server.stderr.on('data', (data) => console.error('Server Error:', data.toString()));
