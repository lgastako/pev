function ExampleEmitter() {
    PEV.EventEmitter.call(this)
}

function ExampleTabEmitter() {
    PEV.TabEmitter.call(this)
}

function ExamplePervasiveEmitter() {
    PEV.PervasiveEventEmitter.call(this)
}

function barListener() {}
function bazListener() {}
function bamListener() {}
function bifListener() {}


ALL_EMITTERS = [ExampleEmitter,
                ExampleTabEmitter,
                ExamplePervasiveEmitter]

TAB_AND_PERVASIVE_EMITTERS = [ExampleTabEmitter,
                              ExamplePervasiveEmitter]


QUnit.test(
    "'on' causes listener to be added in all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()

            emitter.on("foo", barListener)

            assert.deepEqual(emitter.listeners("foo"), [barListener])
        })
    }
)


QUnit.test(
    "'off' causes listener to be removed in all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()

            emitter.on("foo", barListener)
            emitter.off("foo", barListener)

            assert.deepEqual(emitter.listeners("foo"), [])
        })
    }
)

QUnit.test(
    "'removeAllListeners' causes all listeners to be removed in all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()

            emitter.on("foo", barListener)
            emitter.on("baz", bifListener)

            emitter.removeAllListeners()

            assert.deepEqual(emitter.listeners("foo"), [])
            assert.deepEqual(emitter.listeners("bar"), [])
        })
    }
)


QUnit.test(
    "'listeners' returns the list of listeners for any event in all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()

            emitter.on("foo", barListener)
            emitter.on("foo", bazListener)
            emitter.on("bif", bamListener)

            assert.deepEqual(emitter.listeners("foo"), [barListener, bazListener])
            assert.deepEqual(emitter.listeners("bif"), [bamListener])
        })
    }
)


QUnit.test(
    "'listenerCount' works in all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()

            emitter.on("foo", barListener)
            emitter.on("foo", bazListener)
            emitter.on("bif", bamListener)

            assert.equal(emitter.listenerCount("foo"), 2)
            assert.equal(emitter.listenerCount("bif"), 1)
            assert.equal(emitter.listenerCount("baz"), 0)
        })
    }
)


QUnit.test(
    "'once' fires once and only once in the local window for all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()
            var calls = 0

            emitter.emit("foo")
            assert.equal(calls, 0)

            emitter.once("foo", function() {
                calls++
            })

            emitter.emit("foo")
            assert.equal(calls, 1)

            emitter.emit("foo")
            assert.equal(calls, 1)
        })
    }
)


QUnit.test(
    "'many' fires the appropriate number of times in the local window for all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()
            var calls = 0

            var cname = constructor.name + " => "

            emitter.emit("foo")
            assert.deepEqual(cname + calls, cname + 0)

            emitter.many(2, "foo", function() {
                calls++
            })

            emitter.emit("foo")
            assert.equal(cname + 1, cname + calls)

            emitter.emit("foo")
            assert.equal(cname + 2, cname + calls)

            emitter.emit("foo")
            assert.equal(cname + 2, cname + calls)
        })
    }
)


QUnit.test(
    "Chainability of common methods in all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()
            var cb = function() {}

            assert.equal(emitter,
                         emitter
                         .on("foo", cb)
                         .off("foo", cb)
                         .eachListener(cb)
                         .emit("baz")
                         .addListener("bim", cb)
                         .removeListener("bim", cb)
                         .once("bop", cb)
                         .many(3, "bop", cb)
                         .removeAllListeners())

            if (constructor == ExampleEmitter) {

                assert.equal(emitter,
                             emitter
                             ._fireListeners("bar"))

            } else if (constructor == ExamplePervasiveEmitter) {

                assert.equal(emitter,
                             emitter
                             ._fireSameWindowListeners("bar")
                             ._fireOtherWindowListeners("bar"))

            }
        })
    }
)


QUnit.test(
    "Events from a regular EventEmitter do not fire outside of current window scope.",

    function(assert) {
        assert.equal("Not implemented.", "Implemented")
    }
)


QUnit.test(
    "Events from a TabEmitter or PervasiveEventEmitter fire in other frames within the same tab.",

    function(assert) {
        assert.equal("Not implemented.", "Implemented")
    }
)


QUnit.test(
    "Events from a TabEmitter do not fire outside of current tab scope.",

    function(assert) {
        assert.equal("Not implemented.", "Implemented")
    }
)


QUnit.test(
    "Events from a PervasiveEventEmitter do fire outside of current tab scope.",

    function(assert) {
        assert.equal("Not implemented.", "Implemented")
    }
)
