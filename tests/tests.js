function Example() {
    PervasiveEventEmitter.call(this)
}

QUnit.test(
    "'on' causes listener to be added.",

    function(assert) {
        var example = new Example()

        example.on("foo", "bar")

        // Ideally we wouldn't check for internal state, BFN...
        assert.deepEqual(example.eventListeners, {
            "foo": ["bar"]
        })
    }
)

QUnit.test(
    "'off' causes listener to be removed.",

    function(assert) {
        var example = new Example()

        example.on("foo", "bar")
        example.off("foo", "bar")

        assert.deepEqual(example.eventListeners, {
            "foo": []
        })
    }
)

QUnit.test(
    "'removeAllListeners' causes all listeners to be removed.",

    function(assert) {
        var example = new Example()

        example.on("foo", "bar")
        example.on("baz", "bif")

        example.removeAllListeners()

        assert.deepEqual(example.eventListeners, {})
    }
)

QUnit.test(
    "'listeners' returns the list of listeners for any event",

    function(assert) {
        var example = new Example()

        example.on("foo", "bar")
        example.on("foo", "baz")
        example.on("bif", "bam")

        assert.deepEqual(example.listeners("foo"), ["bar", "baz"])
        assert.deepEqual(example.listeners("bif"), ["bam"])
    }
)


QUnit.test(
    "'listenerCount' works",

    function(assert) {
        var example = new Example()

        example.on("foo", "bar")
        example.on("foo", "baz")
        example.on("bif", "bam")

        assert.equal(example.listenerCount("foo"), 2)
        assert.equal(example.listenerCount("bif"), 1)
        assert.equal(example.listenerCount("baz"), 0)
    }
)


QUnit.test(
    "'once' fires once and only once",

    function(assert) {
        var example = new Example()
        var calls = 0

        example.emit("foo")
        assert.equal(calls, 0)

        example.once("foo", function() {
            calls++
        })

        example.emit("foo")
        assert.equal(calls, 1)

        example.emit("foo")
        assert.equal(calls, 1)
    }
)


QUnit.test(
    "'many' fires the appropriate number of times",

    function(assert) {
        var example = new Example()
        var calls = 0

        example.emit("foo")
        assert.equal(calls, 0)

        example.many(2, "foo", function() {
            calls++
        })

        example.emit("foo")
        assert.equal(calls, 1)

        example.emit("foo")
        assert.equal(calls, 2)

        example.emit("foo")
        assert.equal(calls, 2)
    }
)


QUnit.test(
    "'emit' causes listeners in the SAME WINDOW to receive events",
    function(assert) {
        var example = new Example()
        var foos = []
        var done = assert.async()

        example.emit("foo", {
            which: 0
        })

        example.on("foo", function(event, details) {
            console.log("Callback for foo: " + event + ", details => " + details)
            foos.push(details)
        })

        example.emit("foo", {
            which: 1
        })

        console.log("event emitted.")

        setTimeout(function() {
            console.log("checking in setTimeout")
            assert.deepEqual(foos, [{which: 1}])
            done()
        }, 10)
    }
)

// QUnit.test(
//     "'emit' causes listeners in DIFFERENT WINDOWS to receive events",
//     function(assert) {
//         // We need to test the exact same thing but when the value is set in a different window.
//         // Can we test that without something like Selenium?
//         assert.ok(false, "Need to test from different windows.")
//     }
// )
