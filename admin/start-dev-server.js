const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = __dirname;
const logDir = path.join(root, '.dev-server');
fs.mkdirSync(logDir, { recursive: true });

const out = fs.openSync(path.join(logDir, 'stdout.log'), 'a');
const err = fs.openSync(path.join(logDir, 'stderr.log'), 'a');
const cli = path.join(root, 'node_modules', '@vue', 'cli-service', 'bin', 'vue-cli-service.js');

const child = spawn(process.execPath, [cli, 'serve', '--mode=dev', '--no-progress', '--no-watch-options-stdin'], {
  cwd: root,
  env: { ...process.env, BROWSER: 'none' },
  stdio: ['pipe', out, err],
  windowsHide: true,
});

console.log(`Started admin dev server with pid ${child.pid}`);

child.on('exit', (code, signal) => {
  console.log(`Admin dev server exited: code=${code} signal=${signal}`);
  process.exit(code || 0);
});

const stop = () => {
  child.kill();
  process.exit(0);
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
setInterval(() => {}, 60 * 1000);
