(function() {

    var output = document.getElementById("output")
    var cmdline = document.getElementById("cmdline")

    var p = new PEV.PervasiveEmitter()

    cmdline.addEventListener("keyup", function(event){
        if (event.keyCode == 13) {
            var line = event.target.value
            p.emit("line", {line: line})
            event.target.value = ""
        }
    });


    p.on("line", function(event, details) {
        output.innerText += details.line + "\n"
    })

})()
