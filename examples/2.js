// @ts-check

import { EventEmitterExt } from './../src/index.js';

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents('myEvent');

// Add a listener
emitter.on('myEvent', (arg1, arg2) => {
  console.log(`Received myEvent with args: ${arg1}, ${arg2}`);
});

// Mute the emitter
emitter.mute();

// Emit the event. The event will be scheduled and will only be emitted once when the emitter is unmuted.
emitter.emit('myEvent', 'hello', 'world 0');
emitter.emit('myEvent', 'hello', 'world 1');
emitter.emit('myEvent', 'hello', 'world');

// Unmute the emitter
emitter.unmute();

// The scheduled event will now be emitted