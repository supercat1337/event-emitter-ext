// @ts-check

import { EventEmitterExt, STRATEGY_ORDERED_BY_EVENTS, STRATEGY_ORDERED_BY_LISTENER_ID } from './../src/index.js';

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents('a', 'b', 'c');

// Add a listeners
emitter.on('c', () => { 
    console.log('c');
})

emitter.on('b', () => {
    console.log('b');
});

emitter.on('a', () => {
    console.log('a');
});

// Set the strategy
emitter.setListenerRunnerStrategy(STRATEGY_ORDERED_BY_LISTENER_ID);

// Emit the events
emitter.emitMany(['a', 'b', 'c']);

// output:
// c
// b
// a

// Set the strategy
emitter.setListenerRunnerStrategy(STRATEGY_ORDERED_BY_EVENTS);

// Emit the events
emitter.emitMany(['a', 'b', 'c']);

// output:
// a
// b
// c

