// Like the node.js EventEmitter but proxies all events through local storage
// events so that cross-window event subscriptions are possible.
//
// The events consist of a name and an object with any details.
function PervasiveEventEmitter(settings) {
    var EVENT_CHANNEL_KEY = "__PEV__"
    var EVENT_CLEARING_SIGIL = "__PEV_CLEAR_EVENT__"

    settings = settings || {}

    if (settings.uid) {
        EVENT_CHANNEL_KEY = EVENT_CHANNEL_KEY + ":" + settings.uid
    }

    this.uid = settings.uid

    this.eventListeners = {}
    this.storage = settings.storage || localStorage

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
        details = details || {}
        this.eachListener(event, function(listener) {
            try {
                listener(event, details)
            } catch (ex) {
                console.log(ex)
            }
        })
        return this
    }

    this.fireSameWindowListeners = function(event, details) {
        // This is how we had it.  This works for listeners listerally added to
        // the same object, but not other (distinct) objects in the same window
        // with the same uid (which should fire together).
        // TODO: Fix.
        this.fireListeners(event, details)
        return this
    }

    this.fireOtherWindowListeners = function(event, details) {
        // We send our event and then a sigil to clear it, in case identical
        // events are fired twice in a row.  If we go to a model where we
        // always add a synthetic unique event ID then we could drop the song
        // and dance with the sigil.
        var item = {
            event: event,
            details: details
        }
        console.log(JSON.stringify(item))
        this.storage.setItem(EVENT_CHANNEL_KEY, JSON.stringify(item))
        this.storage.setItem(EVENT_CHANNEL_KEY, EVENT_CLEARING_SIGIL)
        return this
    }

    this.emit = function(event, details) {
        console.log("emit(" + event + ", " + JSON.stringify(details) + ")")
        console.log("EVENT_CHANNEL_KEY: " + EVENT_CHANNEL_KEY)
        this.fireOtherWindowListeners(event, details)
        this.fireSameWindowListeners(event, details)
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
        return this
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
        if (storageEvent.storageArea != that.storage) return
        if (storageEvent.key != EVENT_CHANNEL_KEY) return
        if (storageEvent.newValue == EVENT_CLEARING_SIGIL) return

        var val = JSON.parse(storageEvent.newValue)

        var event = val.event
        var details = val.details

        that.fireListeners(event, details)
    }

    window.addEventListener("storage", onStorageEvent, false)
}
