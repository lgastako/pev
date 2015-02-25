function barListener() {}
function bazListener() {}
function bamListener() {}
function bifListener() {}

PONGS = []

ALL_EMITTERS = [PEV.EventEmitter,
                PEV.TabEmitter,
                PEV.PervasiveEmitter]

TAB_AND_PERVASIVE_EMITTERS = [PEV.TabEmitter,
                              PEV.PervasiveEmitter]


function setupOtherWindowTestMachinery() {
    TAB_AND_PERVASIVE_EMITTERS.forEach(function(constructor) {
        var emitter = new constructor()
        emitter.on("pong", function(event) {
            PONGS.push(event)
        })
    })
}

setupOtherWindowTestMachinery()

// Copied from the emitter because it's not exposed publically there.
function generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    })
}


function cleanupByConstructor(constructor, emitter) {
    if (constructor == PEV.TabEmitter) {
        var tabWindow = emitter._tabWindow()
        if (tabWindow) {
            delete tabWindow.__pevTabEmitterListeners
        }
    }
}


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

            cleanupByConstructor(constructor, emitter)
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

            cleanupByConstructor(constructor, emitter)
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

            cleanupByConstructor(constructor, emitter)
        })
    }
)


QUnit.test(
    "'once' fires once and only once in the local window for all emitters.",

    function(assert) {
        var emitters = ALL_EMITTERS
        emitters = [PEV.EventEmitter]
        emitters.forEach(function(constructor) {
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

            cleanupByConstructor(constructor, emitter)
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
            assert.equal(cname + calls, cname + "1")

            emitter.emit("foo")
            assert.equal(cname + calls, cname + "2")

            emitter.emit("foo")
            assert.equal(cname + calls, cname + "2")

            cleanupByConstructor(constructor, emitter)
        })
    }
)


QUnit.test(
    "Chainability of common methods in all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()
            var cb = function() {}

            assert.equal(emitter
                         .on("foo", cb)
                         .off("foo", cb)
                         .emit("baz")
                         .addListener("bim", cb)
                         .removeListener("bim", cb)
                         .once("bop", cb)
                         .many(3, "bop", cb)
                         .removeAllListeners(),
                        emitter)

            if (constructor == PEV.EventEmitter) {

                assert.equal(emitter._fireListeners("bar"), emitter)

            } else if (constructor == PEV.PervasiveEmitter) {

                assert.equal(emitter
                             ._fireSameWindowListeners("bar")
                             ._fireOtherWindowListeners("bar"),
                            emitter)

            }

            cleanupByConstructor(constructor, emitter)
        })
    }
)


QUnit.test(
    "Generated events have expected fields.",

    function(assert) {
        var emitter = new PEV.EventEmitter()
        var details = {bar: "baz"}
        var event = emitter._createEvent("foo", details)

        assert.equal(event.type, "simpleEvent")
        assert.equal(event.eventName, "foo")
        assert.deepEqual(event.details, details)
        assert.equal(typeof(event.createdAtUnix), "number")
        assert.equal(typeof(event.createdAtIso), "string")

        cleanupByConstructor(PEV.EventEmitter, emitter)
    }
)

QUnit.test(
    "Creating an event with no details results in {} details instead of undefined.",

    function(assert) {
        var emitter = new PEV.EventEmitter()
        var event = emitter._createEvent("foo")

        assert.deepEqual(event.details, {})

        cleanupByConstructor(PEV.EventEmitter, emitter)
    }
)


QUnit.test(
    "on -> emit -> event received pipeline",

    function(assert) {
        var emitters = ALL_EMITTERS
        assert.expect(emitters.length * 5)
        emitters.forEach(function(constructor) {
            if (constructor == PEV.PervasiveEmitter) {
                var emitter = new constructor("this test specifically")
            } else {
                var emitter = new constructor()
            }
            var done = assert.async()
            var received = []

            emitter.removeAllListeners()

            emitter.on("foo", function(evt) {
                received.push(evt)
            })

            emitter.emit("foo")
            emitter.emit("foo", {which: 2})
            emitter.emit("foo")

            var checks = 0
            var checkTimeout = 50
            var maxChecks = 40
            var checker = setInterval(function() {
                if (received.length >= 3 || checks++ > maxChecks) {
                    window.clearInterval(checker)

                    assert.equal(received.length, 3)

                    var detailsList = received.map(function(x) { return x.details })

                    // console.log("detailsList: " + JSON.stringify(detailsList))
                    // console.log("dl0: " + detailsList[0])
                    // console.log("dl1: " + detailsList[1])
                    // console.log("dl2: " + detailsList[2])

                    assert.equal(detailsList.length, 3)
                    assert.deepEqual(detailsList[0], {})
                    assert.deepEqual(detailsList[1], {which: 2})
                    assert.deepEqual(detailsList[2], {})

                    cleanupByConstructor(constructor, emitter)

                    done()
                }
            }, checkTimeout)
        })
    }
)

function getPongTestEventIds() {
    return PONGS.map(function(pong) { return pong.details.ping.details.testEventId })
}


QUnit.test(
    "Events from a regular EventEmitter do not fire outside of current window scope.",

    function(assert) {
        var emitter = new PEV.EventEmitter()

        var testEventId = generateUUIDv4()
        emitter.emit("ping", {testEventId: testEventId})

        var pongTestEventIds = getPongTestEventIds()
        assert.equal(pongTestEventIds.indexOf(testEventId), -1)
    }
)


QUnit.test(
    "Events from a TabEmitter or PervasiveEmitter fire in other frames within the same tab.",

    function(assert) {
        TAB_AND_PERVASIVE_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()

            var testEventId = generateUUIDv4()
            emitter.emit("ping", {testEventId: testEventId})

            var pongTestEventIds = getPongTestEventIds()
            console.log("Looking for testEventId: " + testEventId)
            console.log("found " + PONGS.length + " pongs.")
            console.log("PONGS => " + JSON.stringify(PONGS))
            console.log("pongTestEventIds => " + pongTestEventIds)
            console.log("found " + pongTestEventIds.length + " pongTestEventIds.")
            console.log("indexOf: " + pongTestEventIds.indexOf(testEventId))
            console.log("for constructor: " + constructor)
            assert.notEqual(pongTestEventIds.indexOf(testEventId), -1)
        })
    }
)


QUnit.test(
    "Events from a TabEmitter do not fire outside of current tab scope.",

    function(assert) {
        assert.equal("Not implemented.", "Implemented")
    }
)


QUnit.test(
    "Events from a PervasiveEmitter do fire outside of current tab scope.",

    function(assert) {
        assert.equal("Not implemented.", "Implemented")
    }
)
