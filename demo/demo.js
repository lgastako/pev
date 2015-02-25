(function() {

    var output = document.getElementById("output")
    var cmdline = document.getElementById("cmdline")

    var p = new PEV.PervasiveEmitter()

    cmdline.addEventListener("keyup", function(event){
        if (event.keyCode == 13) {
            var line = event.target.value
            p.emit("line", {line: line})
            console.log("emitted: " + line)
            event.target.value = ""
        }
    });

    p.on("line", function(event) {
        console.log("got a line event: " + JSON.stringify(event))
        var line = event.details.line
        console.log("got a line: " + line)
        output.innerText += line + "\n"
    })

    console.log("on line listener added")

    console.log(p._listenerBag())

})()
