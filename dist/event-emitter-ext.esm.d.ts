/** @module EventEmitterExt */
/**
 * @template {string} T
 */
export class EventEmitterExt<T extends string> {
    /** @type {Map.<string, Set<number>>} */
    events: Map<string, Set<number>>;
    /** @type {boolean} */
    autoRegister: boolean;
    /**
     * Set the event emitter to a muted state. While muted, any calls to emit or emitMany
     * will not trigger any event listeners. Instead, the events and their arguments will be
     * stored to be triggered when the event emitter is unmuted.
     */
    mute(): void;
    /**
     * Unmutes the event emitter, allowing events to be triggered.
     * Any events that were scheduled while muted will be executed.
     */
    unmute(): void;
    /**
     * Returns whether the event emitter is currently muted.
     * @returns {boolean}
     */
    isMuted(): boolean;
    /**
     * Register events to be emitted. This should be called before any other methods on this class.
     * The order of the events in the `events` array determines the order in which the event listeners are triggered.
     * This method can be called multiple times to register multiple events.
     * @param {T[]} events - Array of events to register
     */
    registerEvents(...events: T[]): void;
    /**
     * Unregister events from being emitted. If the event is not already registered, this has no effect.
     * @param {T[]} events - Array of events to unregister
     */
    unregisterEvents(...events: T[]): void;
    unregisterAllEvents(): void;
    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @param {T} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    on(event: T, listener: Function): () => void;
    /**
     * Add a callback function that's going to be executed when any of the events are triggered
     * @param {T[]} events - Array of events to listen to
     * @param {Function} listener - Callback to execute when any of the events are triggered
     * @returns {()=>void}
     */
    onAny(events: T[], listener: Function): () => void;
    /**
     * Remove an event listener from an event
     * @param {T} event
     * @param {Function} listener
     */
    removeListener(event: T, listener: Function): void;
    /**
     * Remove all event listeners from an event
     * @param {T} event
     */
    removeAllListeners(event: T): void;
    /**
     * Alias for removeListener
     * @param {T} event
     * @param {Function} listener
     */
    off(event: T, listener: Function): void;
    /**
     * emit is used to trigger an event
     * @param {T} event
     * @param {any[]} args
     */
    emit(event: T, ...args: any[]): void;
    /**
     * emitMany is used to trigger multiple events at the same time
     * @param {T[]} events - Array of events to trigger
     * @param {any[]} args - Arguments to pass to the event listeners
     */
    emitMany(events: T[], ...args: any[]): void;
    /**
     * Add a one-time listener
     * @param {T} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    once(event: T, listener: Function): () => void;
    /**
     * Wait for an event to be emitted
     * @param {T} event
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, the function will wait indefinitely.
     * @returns {Promise<boolean>} - Resolves with true if the event was emitted, false if the time ran out.
     */
    waitForEvent(event: T, max_wait_ms?: number): Promise<boolean>;
    /**
     * Wait for any of the specified events to be emitted
     * @param {T[]} events - Array of event names to wait for
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, the function will wait indefinitely.
     * @returns {Promise<boolean>} - Resolves with true if any event was emitted, false if the time ran out.
     */
    waitForAnyEvent(events: T[], max_wait_ms?: number): Promise<boolean>;
    #private;
}
//# sourceMappingURL=event-emitter-ext.esm.d.ts.map