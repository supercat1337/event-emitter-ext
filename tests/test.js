//@ts-check

//import test from "ava";
import { EventEmitterExt } from "./../src/index.js";
import test from "./../node_modules/ava/entrypoints/main.mjs";

test("on(), emit()", (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo", "bar");
    ev.on("foo", () => {
        t.pass();
    });

    ev.emit("bar");
    ev.emit("foo");
});

test("on(), emit() with autoRegister = true", (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.autoRegister = true;
    var foo = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("once(), emit()", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;
    ev.once("foo", () => {
        foo++;
    });

    ev.emit("foo");
    ev.emit("foo");
    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail(String(foo));
    }
});

test("emit() while listeners are running", (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("bar", "foo");
    var foo = 0;

    ev.on("foo", () => {
        ev.emit("foo");
        foo++;
    });

    ev.emit("foo");

    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("onAny()", (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo", "bar");

    var foo = 0;

    let unsubscriber = ev.onAny(["foo", "bar"], () => {
        foo++;
    });

    ev.emit("foo");
    ev.emit("bar");

    unsubscriber();

    ev.emit("foo");

    if (foo == 2) {
        t.pass();
    } else {
        t.fail();
    }
});

test("onAny() with autoRegister = false and no registered events", (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.autoRegister = false;

    var foo = 0;

    let unsubscriber = ev.onAny(["foo"], () => {
        foo++;
    });

    ev.emit("foo");

    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("onAny() with autoRegister = true", (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.autoRegister = true;

    var foo = 0;

    let unsubscriber = ev.onAny(["foo", "bar"], () => {
        foo++;
    });

    ev.emit("foo");
    ev.emit("bar");

    unsubscriber();

    ev.emit("foo");

    if (foo == 2) {
        t.pass();
    } else {
        t.fail();
    }
});

test("removeListener()", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;
    var action = () => {
        foo++;
    };

    ev.on("foo", action);
    ev.removeListener("foo", action);

    // @ts-expect-error
    ev.off("bar", action);

    ev.emit("foo");
    ev.emit("foo");

    if (foo == 0 && ev.hasListeners("foo") == false) {
        t.pass();
    } else {
        t.fail();
    }
});

test("removeListener() if listener doesn't exist", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;
    var action = () => {
        foo++;
    };

    ev.removeListener("foo", action);

    ev.emit("foo");
    ev.emit("foo");

    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("Call unsubscriber", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;
    var action = () => {
        foo++;
    };

    var unsubscriber = ev.on("foo", action);

    ev.emit("foo");
    unsubscriber();

    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("on(), emit() with error", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;

    /**
     *
     * @param {number} bar
     */
    function func(bar) {
        if (bar % 2) {
            throw new Error("Custom error");
        } else {
            foo++;
        }
    }

    ev.on("foo", () => {
        func(foo);
    });

    ev.emit("foo");
    ev.emit("foo");
    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForEvent()", async (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;
    var action = () => {
        foo++;
    };

    ev.on("foo", action);

    setTimeout(() => {
        ev.emit("foo");
    }, 10);

    await ev.waitForEvent("foo");
    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForEvent() with timeout  and no event", async (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;
    var action = () => {
        foo++;
    };

    ev.on("foo", action);

    setTimeout(() => {
        ev.emit("foo");
    }, 200);

    await ev.waitForEvent("foo", 50);
    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForEvent() with timeout", async (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;
    var action = () => {
        foo++;
    };

    ev.on("foo", action);

    setTimeout(() => {
        ev.emit("foo");
    }, 50);

    await ev.waitForEvent("foo", 200);
    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForAnyEvent()", async (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo", "bar");

    var foo = 0;
    var bar = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.on("bar", () => {
        bar++;
    });

    setTimeout(() => {
        ev.emit("foo");
    }, 10);

    await ev.waitForAnyEvent(["foo", "bar"]);

    setTimeout(() => {
        ev.emit("bar");
    }, 10);

    await ev.waitForAnyEvent(["foo", "bar"]);

    if (foo == 1 && bar == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForAnyEvent() with timeout and no event", async (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo", "bar");

    var foo = 0;
    var bar = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.on("bar", () => {
        bar++;
    });

    setTimeout(() => {
        ev.emit("foo");
    }, 50);

    setTimeout(() => {
        ev.emit("bar");
    }, 300);

    await ev.waitForAnyEvent(["foo", "bar"], 100);

    if (foo == 1 && bar == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForAnyEvent() with timeout", async (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo", "bar");

    var foo = 0;
    var bar = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.on("bar", () => {
        bar++;
    });

    setTimeout(() => {
        ev.emit("foo");
    }, 200);

    await ev.waitForAnyEvent(["foo", "bar"], 50);

    if (foo == 0 && bar == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("mute()", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;
    var action = () => {
        foo++;
    };

    ev.on("foo", action);

    ev.emit("foo");

    ev.mute();

    ev.emit("foo");
    ev.emit("foo");
    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("unmute()", (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;

    var action = () => {
        foo++;
    };

    ev.onAny(["foo", "bar"], action);

    ev.mute();
    ev.emit("foo");
    ev.emit("foo");
    ev.emit("bar");
    ev.emit("bar");
    ev.emit("foo");

    ev.unmute();

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("#runScheduledEvents", (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo", "bar");

    var foo = 0;
    var action = () => {
        foo++;
    };

    ev.onAny(["foo", "bar"], action);
    ev.mute();

    ev.emit("foo");
    ev.emit("bar");
    ev.emit("foo");
    ev.emit("bar");
    ev.emit("foo");
    ev.emit("bar");

    ev.unmute();

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("#runScheduledEvents (when empty)", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;
    var action = () => {
        foo++;
    };

    ev.on("foo", action);
    ev.mute();
    ev.unmute();

    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("unregisterEvents()", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();

    ev.registerEvents("foo");

    var foo = 0;

    var action = () => {
        foo++;
    };

    ev.on("foo", action);

    ev.unregisterEvents("foo");

    ev.emit("foo");

    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("unregisterEvents() (when unknown event)", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();

    // @ts-expect-error
    ev.unregisterEvents("foo1");

    // @ts-expect-error
    if (!ev.hasEvent("foo1")) {
        t.pass();
    } else {
        t.fail();
    }
});

test("on invalid event", (t) => {
    /** @type {EventEmitterExt<"foo">} */

    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;
    var bar = 0;

    ev.on("foo", () => {
        foo++;
    });

    // @ts-expect-error
    ev.on("bar", () => {
        bar++;
    });

    // @ts-expect-error
    ev.emit("bar");
    ev.emit("foo");

    if (foo == 1 && bar == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("emitMany()", (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("bar", "foo");
    ev.setListenerRunnerStrategy(1);

    t.is(ev.getListenerRunnerStrategy(), 1);

    var foo = "a";
    var bar = "b";
    var result = "";

    ev.on("foo", () => {
        result += foo;
    });

    ev.on("bar", () => {
        result += bar;
    });

    // @ts-expect-error
    ev.emitMany(["foo", "bar", "unknown"]);

    if (result == "ba") {
        t.pass();
    } else {
        t.fail();
    }

    result = "";
    ev.setListenerRunnerStrategy(0);

    ev.emitMany(["foo", "bar"]);

    if (result == "ab") {
        t.pass();
    } else {
        t.fail();
    }
});

test("emitMany() while listeners are running", (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("bar", "foo");
    var foo = 0;

    ev.on("foo", () => {
        ev.emitMany(["foo"]);
        foo++;
    });

    ev.emitMany(["foo"]);

    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("unregisterAllEvents()", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");
    ev.unregisterAllEvents();

    if (ev.hasEvent("foo")) {
        t.fail();
    } else {
        t.pass();
    }
});

test("removeAllListeners()", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("foo");

    var foo = 0;
    var action = () => {
        foo++;
    };

    ev.on("foo", action);

    ev.removeAllListeners("foo");

    ev.emit("foo");

    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("removeAllListeners() on unregistered event", (t) => {
    /** @type {EventEmitterExt<"foo"|"bar">} */
    var ev = new EventEmitterExt();
    ev.registerEvents("bar");

    var foo = 0;
    var action = () => {
        foo++;
    };

    ev.on("foo", action);

    ev.removeAllListeners("foo");

    ev.emit("foo");

    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("getNumberOfListeners()", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();

    ev.registerEvents("foo");

    var foo = 0;

    const action = () => {
        foo++;
    };

    const action_2 = () => {
        foo++;
    };

    ev.on("foo", action);
    ev.on("foo", action_2);

    if (ev.getNumberOfListeners("foo") != 2) {
        t.fail();
    }

    ev.removeAllListeners("foo");
    if (ev.getNumberOfListeners("foo") != 0) {
        t.fail();
    } else {
        t.pass();
    }
});

test("isMuted()", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();

    if (ev.isMuted()) {
        t.fail();
    } else {
        t.pass();
    }

    ev.mute();
    if (!ev.isMuted()) {
        t.fail();
    } else {
        t.pass();
    }

    ev.unmute();
    if (ev.isMuted()) {
        t.fail();
    } else {
        t.pass();
    }
});

test("getListeners()", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();

    ev.registerEvents("foo");

    const action = () => {
        // do nothing
    };
    const action_2 = () => {
        // do nothing
    };

    ev.on("foo", action);
    ev.on("foo", action_2);

    if (ev.getListeners("foo").length != 2) {
        t.fail();
    }

    ev.removeAllListeners("foo");
    if (ev.getListeners("foo").length != 0) {
        t.fail();
    }

    // @ts-expect-error
    t.is(ev.getListeners("foo1").length, 0);
});

test("getEventNames()", (t) => {
    /** @type {EventEmitterExt<"foo">} */
    var ev = new EventEmitterExt();

    ev.registerEvents("foo");

    if (ev.getEventNames().length != 1) {
        t.fail();
    }
    if (ev.getEventNames()[0] != "foo") {
        t.fail();
    }

    t.pass();
});
