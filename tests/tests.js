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

        assert.deepEqual(example.eventListeners, {"foo":[]})
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
        }, 100)
    }
)


QUnit.test(
    "'emit' causes listeners in DIFFERENT WINDOWS to receive events",
    function(assert) {
        // We need to test the exact same thing but when the value is set in a different window.
        // Can we test that without something like Selenium?
        assert.ok(false, "Need to test from different windows.")
    }
)

