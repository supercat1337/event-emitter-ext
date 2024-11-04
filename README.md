# event-emitter-ext

The EventEmitterExt class appears to be an extension of a typical event emitter, with some additional features. Here are the main differences:

1. Muting: The EventEmitterExt class has a mute() method that allows you to temporarily suppress the emission of events. This is not typically found in standard event emitters.
2. Event scheduling: When the emitter is muted, events are not discarded, but instead scheduled to be emitted when the emitter is unmuted. This is a unique feature of this class.
3. Waiting for events: The waitForEvent() and waitForAnyEvent() methods allow you to wait for specific events to be emitted, with optional timeouts. This is not typically found in standard event emitters.


### Installation
```
$ npm install @supercat1337/event-emitter-ext
```

### Methods
 - registerEvents(...events) - Register events to be emitted. This should be called before any other methods on this class. The order of the events in the `events` array determines the order in which the event listeners are triggered. This method can be called multiple times to register multiple events.
 - unregisterEvents(...events) - Unregister events from being emitted. If the event is not already registered, this has no effect.
 - on(event, listener) - Add a callback function that's going to be executed when the event is triggered. Returns a function that can be used to unsubscribe from the event
 - once(event, listener) - Add a callback function that's going to be executed only once when the event is triggered. Returns a function that can be used to unsubscribe from the event
 - onAny(events, listener) - Add a callback function that's going to be executed when any of the specified events are triggered. Returns a function that can be used to unsubscribe from the events.
 - emit(event) - Trigger an event. All registered listeners will be called with the event as the first argument.
 - emitMany(events) - Trigger multiple events. All registered listeners will be called with the events as the first argument.
 - removeListener(event, listener) - Remove an event listener.
 - off(event, listener) - Remove an event listener. Shorthand for removeListener.
 - waitForEvent(event, max_wait_ms = 0) - Wait for an event to be emitted. If max_wait_ms is set to 0, the function will wait indefinitely.
 - waitForAnyEvent(events, max_wait_ms = 0) - Wait for any of the specified events to be emitted. If max_wait_ms is set to 0, the function will wait indefinitely.
 - mute() - Mute the event emitter, preventing events from being triggered.
 - unmute() - Unmute the event emitter, allowing events to be triggered.
 - isMuted() - Check if the event emitter is muted.

### Properties
 - events - The events registered with the event emitter. The keys are the event names, and the values are arrays of listener IDs.
 - autoRegister - Set to true to automatically register events when they are emitted.

### Usage



Here are some examples of using the `EventEmitterExt` class that you can include in your `README.md` file:

**Basic Usage**
```javascript
import { EventEmitterExt } from '@supercat1337/event-emitter-ext';

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents('myEvent');

// Add a listener
emitter.on('myEvent', (arg1, arg2) => {
  console.log(`Received myEvent with args: ${arg1}, ${arg2}`);
});

// Emit the event
emitter.emit('myEvent', 'hello', 'world');
```

**Muting and Unmuting**
```javascript
import { EventEmitterExt } from '@supercat1337/event-emitter-ext';

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents('myEvent');

// Add a listener
emitter.on('myEvent', (arg1, arg2) => {
  console.log(`Received myEvent with args: ${arg1}, ${arg2}`);
});

// Mute the emitter
emitter.mute();

// Emit the event (will be scheduled, not emitted)
emitter.emit('myEvent', 'hello', 'world');

// Unmute the emitter
emitter.unmute();

// The scheduled event will now be emitted
```

**Waiting for Events**
```javascript
import { EventEmitterExt } from '@supercat1337/event-emitter-ext';

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
```

**One-time Listeners**
```javascript
import { EventEmitterExt } from '@supercat1337/event-emitter-ext';

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
```

These examples demonstrate the basic usage of the `EventEmitterExt` class, as well as its advanced features like muting, waiting for events, and one-time listeners.
