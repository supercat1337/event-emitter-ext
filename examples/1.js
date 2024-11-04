// @ts-check

import { EventEmitterExt } from './../src/index.js';

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents('myEvent');

// Add a listener
emitter.on('myEvent', (arg1, arg2) => {
  console.log(`Received myEvent with args: ${arg1}, ${arg2}`);
});

// Emit the event
emitter.emit('myEvent', 'hello', 'world');