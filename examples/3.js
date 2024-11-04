// @ts-check

import { EventEmitterExt } from './../src/index.js';

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents('myEvent');

// Wait for the event to be emitted
emitter.waitForEvent('myEvent', 1000).then((result) => {
  if (result) {
    console.log('myEvent was emitted within 1 second');
  } else {
    console.log('myEvent was not emitted within 1 second');
  }
});

// Emit the event
emitter.emit('myEvent');
