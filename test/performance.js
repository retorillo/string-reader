const child_process = require('child_process')
const path = require('path');
const max = 10000;
const workerModule = path.join(__dirname, 'performance-worker.js');
const workerArgs = [ path.join(__dirname, 'test.js'), max ];
const worker = child_process.fork(workerModule, workerArgs, { silent: true });
worker.on('message', (m) => {
   if (m.totalElapse)
      console.log(m.totalElapse / max);
   else
      console.log(m);
});
