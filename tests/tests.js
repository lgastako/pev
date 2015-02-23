function ExampleEmitter() {
    PEV.EventEmitter.call(this)
}

function ExamplePervasiveEmitter() {
    PEV.PervasiveEventEmitter.call(this)
}

ALL_EMITTERS = [ExampleEmitter, ExamplePervasiveEmitter]


QUnit.test(
    "'on' causes listener to be added in all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()

            emitter.on("foo", "bar")

            assert.deepEqual(emitter.listeners("foo"), ["bar"])
        })
    }
)


QUnit.test(
    "'off' causes listener to be removed in all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()

            emitter.on("foo", "bar")
            emitter.off("foo", "bar")

            assert.deepEqual(emitter.listeners("foo"), [])
        })
    }
)


QUnit.test(
    "'removeAllListeners' causes all listeners to be removed in all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()

            emitter.on("foo", "bar")
            emitter.on("baz", "bif")

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

            emitter.on("foo", "bar")
            emitter.on("foo", "baz")
            emitter.on("bif", "bam")

            assert.deepEqual(emitter.listeners("foo"), ["bar", "baz"])
            assert.deepEqual(emitter.listeners("bif"), ["bam"])
        })
    }
)


QUnit.test(
    "'listenerCount' works in all emitters.",

    function(assert) {
        ALL_EMITTERS.forEach(function(constructor) {
            var emitter = new constructor()

            emitter.on("foo", "bar")
            emitter.on("foo", "baz")
            emitter.on("bif", "bam")

            assert.equal(emitter.listenerCount("foo"), 2)
            assert.equal(emitter.listenerCount("bif"), 1)
            assert.equal(emitter.listenerCount("baz"), 0)
        })
    }
)


QUnit.test(
    "'once' fires once and only once for all emitters.",

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
            assert.equal(cname + calls, cname + 1)

            emitter.emit("foo")
            assert.equal(cname + calls, cname + 2)

            emitter.emit("foo")
            assert.equal(cname + calls, cname + 2)


            // emitter.emit("foo")
            // assert.deepEqual({cname: cname, calls: calls}, {cname: cname, calls: 0})

            // emitter.many(2, "foo", function() {
            //     calls++
            // })

            // emitter.emit("foo")
            // assert.equal(cname + calls, cname + 1)

            // emitter.emit("foo")
            // assert.equal(cname + calls, cname + 2)

            // emitter.emit("foo")
            // assert.equal(cname + calls, cname + 2)
        })
    }
)


// QUnit.test(
//     "'emit' causes listeners in the SAME WINDOW to receive events in both",

//     function(assert) {
//         [ExamplePervasiveEmitter, ExamplePervasiveEmitter].forEach(function(constructor) {
//             var emitter = new constructor()
//             var foos = []
//             var done = assert.async()

//             emitter.emit("foo", {
//                 which: 0
//             })

//             emitter.on("foo", function(event, details) {
//                 console.log("Callback for foo: " + event + ", details => " + details)
//                 foos.push(details)
//             })

//             emitter.emit("foo", {
//                 which: 1
//             })

//             console.log("event emitted.")

//             setTimeout(function() {
//                 console.log("checking in setTimeout")
//                 assert.deepEqual(foos, [{which: 1}])
//                 done()
//             }, 10)
//         })
//     }
// )


QUnit.test(
    "Private PervasiveEventEmitters known their own unique ID.",

    function(assert) {
        p1 = new PEV.PervasiveEventEmitter({
            uid: "uid1"
        })

        p2 = new PEV.PervasiveEventEmitter({
            uid: "uid2"
        })

        assert.equal(p1.uid, "uid1")
        assert.equal(p2.uid, "uid2")
    }
)


QUnit.test(
    "Events on private emitters are private (locally).",

    function(assert) {
        var publicEvents = new PEV.PervasiveEventEmitter()
        var privateEvents1 = new PEV.PervasiveEventEmitter({uid: "private-1"})
        var privateEvents1a = new PEV.PervasiveEventEmitter({uid: "private-1"})
        var privateEvents2 = new PEV.PervasiveEventEmitter({uid: "private-2"})

        var recordedEvents = {}

        function recordEvents(name) {
            return function(eventName, details) {
                var eventList = recordedEvents[name] || []
                eventList.push(details)
                recordedEvents[name] = eventList
            }
        }

        publicEvents.on("foo", recordEvents("publicEvents"))
        privateEvents1.on("foo", recordEvents("privateEvents1"))
        privateEvents2.on("foo", recordEvents("privateEvents2"))
        privateEvents1a.on("foo", recordEvents("privateEvents1a"))

        publicEvents.emit("foo", {
            target: "publicEvents"
        })

        privateEvents1.emit("foo", {
            target: "privateEvents1"
        })

        privateEvents2.emit("foo", {
            target: "privateEvents2"
        })

        privateEvents1a.emit("foo", {
            target: "privateEvents1a"
        })

        assert.deepEqual(recordedEvents["publicEvents"], [
            {target: "publicEvents"}
        ])

        assert.deepEqual(recordedEvents["privateEvents1"], [
            {target: "privateEvents1"},
            {target: "privateEvents1a"}
        ])

        assert.deepEqual(recordedEvents["privateEvents2"], [
            {target: "privateEvents2"},
        ])

        assert.deepEqual(recordedEvents["privateEvents1a"], [
            {target: "privateEvents1"},
            {target: "privateEvents1a"}
        ])
    }
)


// QUnit.test(
//     "Events on private emitters are private (across windows).",

//     function(assert) {
//         // TODO
//     }
// )

// QUnit.test(
//     "'emit' causes listeners in DIFFERENT WINDOWS to receive events",
//     function(assert) {
//         // We need to test the exact same thing but when the value is set in a different window.
//         // Can we test that without something like Selenium?
//         assert.ok(false, "Need to test from different windows.")
//     }
// )


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
