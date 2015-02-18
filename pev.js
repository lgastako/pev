// Like the node.js EventEmitter but proxies all events through local storage
// events so that cross-window event subscriptions are possible.
//
// The events consist of a name and an object with any details.
function PervasiveEventEmitter(storage) {
    var EVENT_CHANNEL_KEY = "__PEV__"
    var EVENT_CLEARING_SIGIL = "__PEV_CLEAR_EVENT__"

    this.eventListeners = {}
    this.storage = storage || localStorage

    this._getListeners = function(event) {
        var eventListeners = this.eventListeners[event] || []
        this.eventListeners[event] = eventListeners
        return eventListeners
    }

    this.on = function(event, cb) {
        var eventListeners = this._getListeners(event)
        eventListeners.push(cb)
        this.eventListeners[event] = eventListeners
        return this
    }

    this.off = function(event, cb) {
        var eventListeners = this._getListeners(event)
        var index = eventListeners.indexOf(cb)
        if (index > -1) {
            eventListeners.splice(index, 1)
        }
        return this
    }

    this.removeAllListeners = function() {
        this.eventListeners = {}
        return this
    }

    this.listeners = function(event) {
        var eventListeners = this._getListeners(event)
        // Clone the array so people can't mutate our copy
        return eventListeners.splice(0)
    }

    this.listenerCount = function(event) {
        // Use the internal _getListeners to avoid an array copy
        return this._getListeners(event).length
    }

    this.eachListener = function(event, f) {
        var eventListeners = this._getListeners(event)
        console.log("eachListener firing " + eventListeners.length + " listeners")
        eventListeners.forEach(function(listener) {
            try {
                f(listener)
            } catch (ex) {
                console.log(ex)
            }
        })
        return this
    }

    this.fireListeners = function(event, details) {
        console.log("Firing listeners... " + this.listenerCount(event))
        this.eachListener(event, function(listener) {
            console.log("Firing listener...")
            try {
                listener(event, details)
            } catch (ex) {
                console.log(ex)
            }
        })
        console.log("Firing listeners...DONE")
    }

    this.emit = function(event, details) {
        var item = {
            event: event,
            details: details
        }

        console.log("emit sticking in EVENT_CHANNEL_KEY(" + EVENT_CHANNEL_KEY + ") => "
                    + JSON.stringify(item))

        // This will cause listeners in other windows to fire
        this.storage.setItem(EVENT_CHANNEL_KEY, JSON.stringify(item))
        this.storage.setItem(EVENT_CHANNEL_KEY, EVENT_CLEARING_SIGIL)
        console.log("setItem(s) complete.")

        // This will fire them in the same window.
        console.log("SELF FIRING")
        this.fireListeners(event, details)
        console.log("fireListeners complete.")

        return this
    }

    this.addListener = this.on
    this.removeListener = this.off

    this.many = function(n, event, cb) {
        var that = this

        function listener() {
            if (--n <= 0) {
                that.off(event, listener)
            }
            cb.apply(this, arguments)
        }

        this.on(event, listener)

        return that
    }

    this.once = function(event, cb) {
        this.many(1, event, cb)
    }

    function beautifyStorageArea(storageArea) {
        if (localStorage && storageArea == localStorage) {
            return "localStorage"
        } else if (sessionStorage && storageArea == sessionStorage) {
            return "sessionStorage"
        } else {
            return "unknown"
        }
    }

    function beautifyStorageEvent(storageEvent) {
        return JSON.stringify({
            key: storageEvent.key,
            newValue: storageEvent.newValue,
            oldValue: storageEvent.oldValue,
            storageArea: beautifyStorageArea(storageEvent.storageArea),
            url: storageEvent.url
        })
    }

    var that = this

    function onStorageEvent(storageEvent) {
        console.log("storageEvent => " + beautifyStorageEvent(storageEvent))

        if (storageEvent.storageArea != that.storage) {
            console.log("bailing for wrong storage area")
            return
        }

        console.log("1")

        if (storageEvent.key != EVENT_CHANNEL_KEY) {
            console.log("bailing for wrong key")
            return
        }

        console.log("2")

        if (storageEvent.value == EVENT_CLEARING_SIGIL) {
            console.log("bailing for sigil")
            return
        }

        console.log("3")

        var val = JSON.parse(storageEvent.newValue)

        console.log(val)

        var event = val.event
        var details = val.details

        console.log("firing listener for event '" + event + "', details => "
                    + JSON.stringify(details))

        console.log("firing listeners")

        that.fireListeners(event, details)

        console.log("fired listeners")

        console.log("the end")
    }

    window.addEventListener("storage", onStorageEvent, false)
}
