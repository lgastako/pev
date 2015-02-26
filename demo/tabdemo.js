(function() {

    var bus = PEV.TabBus.connect()

    console.log("my frame id is " + bus.frameId)

    bus.on("envelope", function(event) {
        console.log("bus.on.message")
        console.log(event)
        var envelope = event.details
        console.log("envelope")
        console.log(envelope)
        var msg = envelope.msg
        console.log("I (" + bus.frameId + ") got a message (from " + envelope.frameId + "): " + JSON.stringify(msg))
        if (msg.line) {
            var line = msg.line
            console.log("got a line: " + line)
            output.innerText += line + "\n"
        } else {
            console.log("skipping non-line message")
        }
    })

    // bus.send({hello: "World"})

    var cmdline = document.getElementById("cmdline")
    var output = document.getElementById("output")

    cmdline.addEventListener("keyup", function(evt) {
        if (event.keyCode == 13) {
            var line = event.target.value
            bus.send({line: line})
            console.log("sent: " + line)
            event.target.value = ""
        }
    })

})()
