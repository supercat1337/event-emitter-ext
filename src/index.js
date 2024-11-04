// @ts-check
/** @module EventEmitterExt */

/**
 * @template {string} T
 */
class EventEmitterExt {

    /** @type {Map.<string, Set<number>>} */
    events = new Map;

    #muted = false;

    /** @type {boolean} */
    autoRegister = false;

    /** @type {Map.<string, Array<any>>} */
    #scheduledEvents = new Map;

    #lastListenerId = -1;

    /** @type {Map.<number, Function>} */
    #listeners = new Map;

    /** @type {Map.<number, number>} */
    #listenersCountData = new Map;

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

        let listeners = this.events.get(event);

        if (listeners === undefined) {
            return;
        }

        listeners.add(listener_id);

        if (!this.#listenersCountData.has(listener_id)) {
            this.#listenersCountData.set(listener_id, 0);
        }

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
        let listeners = this.events.get(event);

        if (listeners === undefined) {
            return;
        }

        listeners.delete(listener_id);

        if (!this.#listenersCountData.has(listener_id)) {
            return;
        }

        let count = this.#listenersCountData.get(listener_id) || 0;
        count--;
        this.#listenersCountData.set(listener_id, count);

        this.#removeListenerIfNotUsing(listener_id);
    }

    /**
     * Remove an event listener from an event
     * @param {number} listener_id
     */
    #removeListenerIfNotUsing(listener_id) {

        if (!this.#listeners.has(listener_id)) {
            return;
        }

        let count = this.#listenersCountData.get(listener_id) || 0;
        if (count === undefined) {
            return;
        }

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

        /** @type {Set<number>} */
        let usedListeners = new Set();

        this.events.forEach((listeners, event) => {

            if (this.#scheduledEvents.has(event)) {
                let args = this.#scheduledEvents.get(event) || [];

                listeners.forEach((listener_id) => {
                    let listener = this.#listeners.get(listener_id);

                    if (listener === undefined) {
                        return;
                    }

                    if (usedListeners.has(listener_id)) {
                        return;
                    }

                    usedListeners.add(listener_id);
                    listener(...args);
                });

                this.#scheduledEvents.delete(event);
            }
        });
    }

    /**
     * Register events to be emitted. This should be called before any other methods on this class. 
     * The order of the events in the `events` array determines the order in which the event listeners are triggered.
     * This method can be called multiple times to register multiple events.
     * @param {T[]} events - Array of events to register
     */
    registerEvents(...events) {
        events.forEach((event) => {
            if (!this.events.has(event)) {
                this.events.set(event, new Set());
            }
        })
    }

    /**
     * Unregister events from being emitted. If the event is not already registered, this has no effect.
     * @param {T[]} events - Array of events to unregister
     */
    unregisterEvents(...events) {
        events.forEach((event) => {

            if (!this.events.has(event)) {
                return;
            }

            let listeners = this.events.get(event);

            if (listeners) {
                listeners.forEach((listener_id) => {
                    this.#detachListenerFromEvent(event, listener_id);
                });

                this.events.delete(event);
            }

        })
    }

    unregisterAllEvents() {
        this.events.clear();
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

        const emptyFunction = () => { };

        if (this.autoRegister == false) {

            if (!this.events.has(event)) {
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
        let listener_id = this.#registerListener(listener);

        events.forEach((event) => {
            this.#attachListenerToEvent(event, listener_id);
        });

        return () => {
            events.forEach((event) => {
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
        if (!this.events.has(event)) {
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
        if (!this.events.has(event)) {
            return;
        }

        this.events.get(event).forEach((listener_id) => {
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
     * emit is used to trigger an event
     * @param {T} event
     * @param {any[]} args
     */
    emit(event, ...args) {
        if (!this.events.has(event)) {
            return;
        }

        if (this.#muted) {
            this.#scheduledEvents.set(event, args);
            return;
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

        let listeners = this.events.get(event);

        if (listeners === undefined) {
            return;
        }

        listeners.forEach((listener_id) => {
            try {

                let listener = this.#listeners.get(listener_id);

                if (listener === undefined) {
                    return;
                }

                listener.apply(this, args);
            }
            catch (e) {
                console.error(event, args);
                console.error(e);
            }

        });

    }

    /**
     * emitMany is used to trigger multiple events at the same time
     * @param {T[]} events - Array of events to trigger
     * @param {any[]} args - Arguments to pass to the event listeners
     */
    emitMany(events, ...args) {
        this.events.forEach((listeners, event) => {
            let ev = /** @type {T} */ (event);
            if (events.includes(ev)) {
                this.emit(ev, ...args);
            }
        });
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
}

export { EventEmitterExt };
