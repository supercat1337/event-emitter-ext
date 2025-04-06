// @ts-check
/** @module EventEmitterExt */

// STRATEGY_ORDERED_BY_LISTENER_ID  - Iterate over the listeners in the order they were registered .
// STRATEGY_ORDERED_BY_EVENTS - Iterate over listeners in the order they were registered, grouped by events.
const STRATEGY_ORDERED_BY_LISTENER_ID = 0;
const STRATEGY_ORDERED_BY_EVENTS = 1;

/**
 * @template {string} T
 */
class EventEmitterExt {
    /** @type {Map.<string, Set<number>>} */
    #events = new Map();

    #muted = false;

    /** @type {boolean} */
    autoRegister = false;

    /** @type {Map.<string, Array<any>>} */
    #scheduledEvents = new Map();

    #lastListenerId = -1;

    /** @type {Map.<number, Function>} */
    #listeners = new Map();

    /** @type {Map.<number, number>} */
    #listenersCountData = new Map();

    #listenersAreRunning = false;

    /** @type {number} */
    #listenerRunnerStrategy = STRATEGY_ORDERED_BY_EVENTS;

    /**
     * Set the strategy for running listeners. The strategy is used to determine the order in which listeners are called.
     * @param {number} strategy - The strategy to use. The following values are supported:
     * 0 - Iterate over the listeners in the order they were registered .
     * 1 - Iterate over listeners in the order they were registered, grouped by events.
     */
    setListenerRunnerStrategy(strategy) {
        this.#listenerRunnerStrategy = strategy;
    }

    /**
     * Get the strategy for running listeners. The strategy is used to determine the order in which listeners are called.
     * @returns {number} - The strategy to use. The following values are supported:
     * 0 - Iterate over the listeners in the order they were registered .
     * 1 - Iterate over listeners in the order they were registered, grouped by events.
     */
    getListenerRunnerStrategy() {
        return this.#listenerRunnerStrategy;
    }

    /**
     * Register an event listener
     * @param {Function} func
     * @returns {number} - Listener ID
     */
    #registerListener(func) {
        let id = ++this.#lastListenerId;
        this.#listeners.set(id, func);
        this.#listenersCountData.set(id, 0);
        return id;
    }

    /**
     * Remove an event listener by ID
     * @param {number} id
     */
    #removeListenerById(id) {
        this.#listeners.delete(id);
    }

    /**
     * Get the listener ID by function
     * @param {Function} func
     * @returns {number} - Listener ID. -1 if not found
     */
    #getListenerIdByFunc(func) {
        for (let [key, value] of this.#listeners) {
            if (value === func) {
                return key;
            }
        }

        return -1;
    }

    /**
     * Attach a listener to an event
     * @param {T} event
     * @param {number} listener_id
     */
    #attachListenerToEvent(event, listener_id) {
        let listeners = this.#events.get(event) || new Set();

        listeners.add(listener_id);

        let count = this.#listenersCountData.get(listener_id) || 0;
        count++;

        this.#listenersCountData.set(listener_id, count);
    }

    /**
     *
     * @param {T} event
     * @param {number} listener_id
     * @returns
     */
    #detachListenerFromEvent(event, listener_id) {
        let listeners = this.#events.get(event) || new Set();

        listeners.delete(listener_id);

        let count = this.#listenersCountData.get(listener_id) || 1;
        count--;
        this.#listenersCountData.set(listener_id, count);

        this.#removeListenerIfNotUsing(listener_id);
    }

    /**
     * Remove an event listener from an event
     * @param {number} listener_id
     */
    #removeListenerIfNotUsing(listener_id) {
        let count = this.#listenersCountData.get(listener_id) || 0;

        if (count == 0) {
            this.#removeListenerById(listener_id);
            this.#listenersCountData.delete(listener_id);
            return;
        }
    }

    /**
     * Set the event emitter to a muted state. While muted, any calls to emit or emitMany
     * will not trigger any event listeners. Instead, the events and their arguments will be
     * stored to be triggered when the event emitter is unmuted.
     */
    mute() {
        this.#muted = true;
    }

    /**
     * Unmutes the event emitter, allowing events to be triggered.
     * Any events that were scheduled while muted will be executed.
     */
    unmute() {
        this.#muted = false;
        this.#runScheduledEvents();
    }

    /**
     * Returns whether the event emitter is currently muted.
     * @returns {boolean}
     */
    isMuted() {
        return this.#muted;
    }

    #runScheduledEvents() {
        if (this.#scheduledEvents.size === 0) {
            return;
        }

        this.#listenersAreRunning = true;

        /** @type {Map<number, any[]>} */
        let listenersRunData = new Map();

        this.#events.forEach((listeners, event) => {
            if (this.#scheduledEvents.has(event)) {
                let args = this.#scheduledEvents.get(event) || [];
                listeners.forEach((listener_id) => {
                    listenersRunData.set(listener_id, args);
                });
            }
        });

        this.#scheduledEvents.clear();

        let orderedListenerIds = Array.from(listenersRunData.keys());

        if (this.#listenerRunnerStrategy == STRATEGY_ORDERED_BY_LISTENER_ID) {
            orderedListenerIds.sort((a, b) => {
                return a - b;
            });
        }

        orderedListenerIds.forEach((listener_id) => {
            let args = listenersRunData.get(listener_id) || [];
            let listener = this.#listeners.get(listener_id);

            try {
                if (listener) listener(...args);
            } catch (e) {
                console.error(e);
            }
        });

        this.#listenersAreRunning = false;
    }

    /**
     * Register events to be emitted. This should be called before any other methods on this class.
     * The order of the events in the `events` array determines the order in which the event listeners are triggered.
     * This method can be called multiple times to register multiple events.
     * @param {T[]} events - Array of events to register
     */
    registerEvents(...events) {
        events.forEach((event) => {
            if (!this.#events.has(event)) {
                this.#events.set(event, new Set());
            }
        });
    }

    /**
     * Unregister events from being emitted. If the event is not already registered, this has no effect.
     * @param {T[]} events - Array of events to unregister
     */
    unregisterEvents(...events) {
        events.forEach((event) => {
            if (!this.#events.has(event)) {
                return;
            }

            let listeners = this.#events.get(event);

            if (listeners) {
                listeners.forEach((listener_id) => {
                    this.#detachListenerFromEvent(event, listener_id);
                });

                this.#events.delete(event);
            }
        });
    }

    unregisterAllEvents() {
        this.#events.clear();
        this.#listeners.clear();
        this.#listenersCountData.clear();
        this.#scheduledEvents.clear();
    }

    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @param {T} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    on(event, listener) {
        const emptyFunction = () => {};

        if (this.autoRegister == false) {
            if (!this.#events.has(event)) {
                return emptyFunction;
            }
        } else {
            this.registerEvents(event);
        }

        let listener_id = this.#registerListener(listener);

        this.#attachListenerToEvent(event, listener_id);

        let that = this;

        let unsubscriber = function () {
            that.#detachListenerFromEvent(event, listener_id);
        };

        return unsubscriber;
    }

    /**
     * Add a callback function that's going to be executed when any of the events are triggered
     * @param {T[]} events - Array of events to listen to
     * @param {Function} listener - Callback to execute when any of the events are triggered
     * @returns {()=>void}
     */
    onAny(events, listener) {
        if (this.autoRegister == true) {
            this.registerEvents(...events);
        }

        let events_copy = Array.from(events).filter((event) =>
            this.#events.has(event)
        );

        if (events_copy.length == 0) {
            return () => {};
        }

        let listener_id = this.#registerListener(listener);

        events_copy.forEach((event) => {
            this.#attachListenerToEvent(event, listener_id);
        });

        return () => {
            events_copy.forEach((event) => {
                this.#detachListenerFromEvent(event, listener_id);
            });
        };
    }

    /**
     * Remove an event listener from an event
     * @param {T} event
     * @param {Function} listener
     */
    removeListener(event, listener) {
        if (!this.#events.has(event)) {
            return;
        }

        let listener_id = this.#getListenerIdByFunc(listener);

        if (listener_id == -1) {
            return;
        }

        this.#detachListenerFromEvent(event, listener_id);
    }

    /**
     * Remove all event listeners from an event
     * @param {T} event
     */
    removeAllListeners(event) {
        if (!this.#events.has(event)) {
            return;
        }

        let listeners = this.#events.get(event) || new Set();

        listeners.forEach((listener_id) => {
            this.#detachListenerFromEvent(event, listener_id);
        });
    }

    /**
     * Alias for removeListener
     * @param {T} event
     * @param {Function} listener
     */
    off(event, listener) {
        this.removeListener(event, listener);
    }

    /**
     * Check if an event is registered with the event emitter
     * @param {T} event
     * @returns {boolean}
     */
    hasEvent(event) {
        return this.#events.has(event);
    }

    /**
     * Check if there are any listeners registered for a specific event
     * @param {T} event - The event to check for listeners
     * @returns {boolean} - Returns true if there are listeners for the event, false otherwise
     */
    hasListeners(event) {
        let listeners = this.#events.get(event) || new Set();
        return listeners.size > 0;
    }

    /**
     * Get the number of listeners registered for a specific event
     * @param {T} event - The event to get the number of listeners for
     * @returns {number} - The number of listeners for the event
     */
    getNumberOfListeners(event) {
        let eventData = this.#events.get(event) || new Set();
        return eventData.size;
    }

    /**
     * emit is used to trigger an event
     * @param {T} event
     * @param {any[]} args
     */
    emit(event, ...args) {
        if (this.#listenersAreRunning) {
            throw new Error("Cannot call emit while listeners are running");
        }

        if (!this.#events.has(event)) {
            return;
        }

        if (this.#muted) {
            this.#scheduledEvents.set(event, args);
        } else {
            this.#emit(event, ...args);
        }
    }

    /**
     * emit is used to trigger an event
     * @param {T} event
     * @param {any[]} args
     */
    #emit(event, ...args) {
        let listeners = this.#events.get(event) || new Set();

        this.#listenersAreRunning = true;

        listeners.forEach((listener_id) => {
            try {
                let listener = this.#listeners.get(listener_id);

                if (listener) {
                    listener(...args);
                }
            } catch (e) {
                console.error(event, args);
                console.error(e);
            }
        });

        this.#listenersAreRunning = false;
    }

    /**
     * emitMany is used to trigger multiple events at the same time
     * @param {T[]} events - Array of events to trigger
     * @param {any[]} args - Arguments to pass to the event listeners
     */
    emitMany(events, ...args) {
        if (this.#listenersAreRunning) {
            throw new Error("Cannot call emitMany while listeners are running");
        }

        events.forEach((event) => {
            if (!this.#events.has(event)) {
                return;
            }

            this.#scheduledEvents.set(event, args);
        });

        if (!this.#muted) {
            this.#runScheduledEvents();
        }
    }

    /**
     * Add a one-time listener
     * @param {T} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    once(event, listener) {
        let that = this;

        let unsubscriber = this.on(event, function () {
            unsubscriber();
            listener.apply(that, arguments);
        });

        return unsubscriber;
    }

    /**
     * Wait for an event to be emitted
     * @param {T} event
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, the function will wait indefinitely.
     * @returns {Promise<boolean>} - Resolves with true if the event was emitted, false if the time ran out.
     */
    waitForEvent(event, max_wait_ms = 0) {
        return new Promise((resolve) => {
            let timeout;

            let unsubscriber = this.on(event, () => {
                if (max_wait_ms > 0) {
                    clearTimeout(timeout);
                }

                unsubscriber();
                resolve(true);
            });

            if (max_wait_ms > 0) {
                timeout = setTimeout(() => {
                    unsubscriber();
                    resolve(false);
                }, max_wait_ms);
            }
        });
    }

    /**
     * Wait for any of the specified events to be emitted
     * @param {T[]} events - Array of event names to wait for
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, the function will wait indefinitely.
     * @returns {Promise<boolean>} - Resolves with true if any event was emitted, false if the time ran out.
     */
    waitForAnyEvent(events, max_wait_ms = 0) {
        return new Promise((resolve) => {
            let timeout;

            /** @type {Function[]} */
            let unsubscribers = [];

            const main_unsubscriber = () => {
                if (max_wait_ms > 0) {
                    clearTimeout(timeout);
                }

                unsubscribers.forEach((unsubscriber) => {
                    unsubscriber();
                });

                resolve(true);
            };

            events.forEach((event) => {
                unsubscribers.push(this.on(event, main_unsubscriber));
            });

            if (max_wait_ms > 0) {
                timeout = setTimeout(() => {
                    main_unsubscriber();
                    resolve(false);
                }, max_wait_ms);
            }
        });
    }

    /**
     * Get the listeners for a specific event
     * @param {T} event - The event to get the listeners for
     * @returns {Function[]} - An array of the listeners for the event
     */
    getListeners(event) {
        if (!this.#events.has(event)) {
            return [];
        }

        let listeners_id = this.#events.get(event) || new Set();
        let listeners = [];

        listeners_id.forEach((listener_id) => {
            let listener = this.#listeners.get(listener_id);
            if (listener) {
                listeners.push(listener);
            }
        });

        return listeners;
    }

    /**
     * Get the names of all events that have been registered.
     * @returns {string[]} - An array of the names of all events that have been registered.
     */
    getEventNames() {
        return Array.from(this.#events.keys());
    }
}

export { EventEmitterExt, STRATEGY_ORDERED_BY_EVENTS, STRATEGY_ORDERED_BY_LISTENER_ID };
