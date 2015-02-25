(function() {

    var pervasiveEmitter = new PEV.PervasiveEmitter()
    var tabEmitter = new PEV.TabEmitter()
    var frameId = (window.location.hash || "").substring(1)

    pervasiveEmitter.on("ping", function(event) {
        pervasiveEmitter.emit("pong", {
            ping: event,
            from: frameId
        })
    })

    tabEmitter.on("ping", function(event) {
        tabEmitter.emit("pong", {
            ping: event,
            from: frameId
        })
    })

})()
