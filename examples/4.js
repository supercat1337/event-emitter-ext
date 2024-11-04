// @ts-check

import { EventEmitterExt } from './../src/index.js';

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents('myEvent');

// Add a one-time listener
emitter.once('myEvent', (arg1, arg2) => {
  console.log(`Received myEvent with args: ${arg1}, ${arg2}`);
});

// Emit the event (will trigger the listener)
emitter.emit('myEvent', 'hello', 'world');

// Emit the event again (will not trigger the listener)
emitter.emit('myEvent', 'hello', 'world');
