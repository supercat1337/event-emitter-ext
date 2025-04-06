# event-emitter-ext

The EventEmitterExt class is an extension of a typical event emitter, with some additional features. Here are the main differences:

1. Muting: The EventEmitterExt class has a mute() method that allows you to temporarily suppress the emission of events.
2. Event scheduling: When the emitter is muted, events are not discarded, but instead scheduled to be emitted when the emitter is unmuted.
3. Waiting for events: The waitForEvent() and waitForAnyEvent() methods allow you to wait for specific events to be emitted, with optional timeouts.
4. Batch emission: The emitMany() method allows you to emit multiple events at once.
5. Strategy for running listeners: The setListenerRunnerStrategy() method allows you to set the strategy for running listeners. The default strategy is STRATEGY_ORDERED_BY_EVENTS. STRATEGY_ORDERED_BY_EVENTS will iterate over the listeners in the order they were registered. STRATEGY_ORDERED_BY_LISTENER_ID will iterate over the listeners in the order they were registered, grouped by events.
6. Listener groups: The onAny() method allows you to group multiple listeners under a single event.

### Installation

```
$ npm install @supercat1337/event-emitter-ext
```

### Methods

-   registerEvents(...events) - Register events to be emitted. This should be called before any other methods on this class. The order of the events in the `events` array determines the order in which the event listeners are triggered. This method can be called multiple times to register multiple events.
-   unregisterEvents(...events) - Unregister events from being emitted. If the event is not already registered, this has no effect.
-   unregisterAllEvents() - Remove all event listeners from all events that have been registered.
-   on(event, listener) - Add a callback function that's going to be executed when the event is triggered. Returns a function that can be used to unsubscribe from the event
-   once(event, listener) - Add a callback function that's going to be executed only once when the event is triggered. Returns a function that can be used to unsubscribe from the event
-   onAny(events, listener) - Add a callback function that's going to be executed when any of the specified events are triggered. Returns a function that can be used to unsubscribe from the events.
-   emit(event) - Trigger an event. All registered listeners will be called with the event as the first argument.
-   emitMany(events) - Trigger multiple events. All registered listeners will be called with the events as the first argument.
-   removeListener(event, listener) - Remove an event listener.
-   off(event, listener) - Remove an event listener. Shorthand for removeListener.
-   removeAllListeners(event) - Remove all event listeners from an event.
-   hasEvent(event) - Check if an event is registered.
-   hasListeners(event) - Check if an event has any listeners.
-   getNumberOfListeners(event) - Get the number of listeners registered for a specific event.
-   waitForEvent(event, max_wait_ms = 0) - Wait for an event to be emitted. If max_wait_ms is set to 0, the function will wait indefinitely.
-   waitForAnyEvent(events, max_wait_ms = 0) - Wait for any of the specified events to be emitted. If max_wait_ms is set to 0, the function will wait indefinitely.
-   mute() - Mute the event emitter, preventing events from being triggered.
-   unmute() - Unmute the event emitter, allowing events to be triggered.
-   isMuted() - Check if the event emitter is muted.
-   setListenerRunnerStrategy(strategy) - Set the strategy for running listeners. The strategy is used to determine the order in which listeners are called. The following values are supported: 0 - Iterate over the listeners in the order they were registered . 1 - Iterate over listeners in the order they were registered, grouped by events.
-   getListenerRunnerStrategy() - Get the strategy for running listeners. The strategy is used to determine the order in which listeners are called. The following values are supported: 0 - Iterate over the listeners in the order they were registered . 1 - Iterate over listeners in the order they were registered, grouped by events.
-   getListeners(event) - Get the listeners for a specific event.
-   getEventNames() - Get the names of all events that have been registered.

### Properties

-   autoRegister - Set to true to automatically register events when they are emitted.

### Usage

Here are some examples of using the `EventEmitterExt` class that you can include in your `README.md` file:

**Basic Usage**

```javascript
import { EventEmitterExt } from "@supercat1337/event-emitter-ext";

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents("myEvent");

// Add a listener
emitter.on("myEvent", (arg1, arg2) => {
    console.log(`Received myEvent with args: ${arg1}, ${arg2}`);
});

// Emit the event
emitter.emit("myEvent", "hello", "world");
```

**Muting and Unmuting**

```javascript
import { EventEmitterExt } from "@supercat1337/event-emitter-ext";

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents("myEvent");

// Add a listener
emitter.on("myEvent", (arg1, arg2) => {
    console.log(`Received myEvent with args: ${arg1}, ${arg2}`);
});

// Mute the emitter
emitter.mute();

// Emit the event (will be scheduled, not emitted)
emitter.emit("myEvent", "hello", "world");

// Unmute the emitter
emitter.unmute();

// The scheduled event will now be emitted
```

**Waiting for Events**

```javascript
import { EventEmitterExt } from "@supercat1337/event-emitter-ext";

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents("myEvent");

// Wait for the event to be emitted
emitter.waitForEvent("myEvent", 1000).then((result) => {
    if (result) {
        console.log("myEvent was emitted within 1 second");
    } else {
        console.log("myEvent was not emitted within 1 second");
    }
});

// Emit the event
emitter.emit("myEvent");
```

**One-time Listeners**

```javascript
import { EventEmitterExt } from "@supercat1337/event-emitter-ext";

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents("myEvent");

// Add a one-time listener
emitter.once("myEvent", (arg1, arg2) => {
    console.log(`Received myEvent with args: ${arg1}, ${arg2}`);
});

// Emit the event (will trigger the listener)
emitter.emit("myEvent", "hello", "world");

// Emit the event again (will not trigger the listener)
emitter.emit("myEvent", "hello", "world");
```

**Advanced Usage**

```javascript
import {
    EventEmitterExt,
    STRATEGY_ORDERED_BY_EVENTS,
    STRATEGY_ORDERED_BY_LISTENER_ID,
} from "@supercat1337/event-emitter-ext";

const emitter = new EventEmitterExt();

// Register an event
emitter.registerEvents("a", "b", "c");

// Add a listeners
emitter.on("c", () => {
    console.log("c");
});

emitter.on("b", () => {
    console.log("b");
});

emitter.on("a", () => {
    console.log("a");
});

// Set the strategy
emitter.setListenerRunnerStrategy(STRATEGY_ORDERED_BY_LISTENER_ID);

// Emit the events
emitter.emitMany(["a", "b", "c"]);

// output:
// c
// b
// a

// Set the strategy
emitter.setListenerRunnerStrategy(STRATEGY_ORDERED_BY_EVENTS);

// Emit the events
emitter.emitMany(["a", "b", "c"]);

// output:
// a
// b
// c
```

These examples demonstrate the basic usage of the `EventEmitterExt` class, as well as its advanced features like muting, waiting for events, and one-time listeners.
