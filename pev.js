(function() {
    var LOCAL_EVENT = "PEVLocalEvent"

    function EventEmitter(settings) {
        settings = settings || {}

        var eventListenersByEvent = {}

        this._listeners = function(event) {
            var eventListeners = eventListenersByEvent[event] || []
            eventListenersByEvent[event] = eventListeners
            return eventListeners
        }

        this.on = function(event, cb) {
            this._listeners(event).push(cb)
            return this
        }

        this.off = function(event, cb) {
            var listeners = this._listeners(event)
            var index = listeners.indexOf(cb)
            if (index > -1) {
                listeners.splice(index, 1)
            }
            return this
        }

        this.removeAllListeners = function() {
            eventListenersByEvent = {}
            return this
        }

        this.listeners = function(event) {
            // Clone the array so people can't mutate our copy
            return this._listeners(event).splice(0)
        }

        this.listenerCount = function(event) {
            // Use the internal _listeners(event) to avoid an array copy
            return this._listeners(event).length
        }

        this.eachListener = function(event, f) {
            this._listeners(event).forEach(function(listener) {
                try {
                    f(listener)
                } catch (ex) {
                    console.log(ex)
                }
            })
            return this
        }

        this._fireListeners = function(event, details) {
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

        this.emit = function(event, details) {
            return this._fireListeners(event, details)
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
    }

    function TabEmitter(settings) {
        settings = settings || {}
        EventEmitter.call(this, settings)
    }

    function PervasiveEventEmitter(settings) {
        settings = settings || {}

        EventEmitter.call(this, settings)

        var EVENT_CHANNEL_KEY = "__PEV__"
        var EVENT_CLEARING_SIGIL = "__PEV_CLEAR_EVENT__"

        if (settings.uid) {
            EVENT_CHANNEL_KEY = EVENT_CHANNEL_KEY + ":" + settings.uid
        }

        this.uid = settings.uid

        this.storage = settings.storage || localStorage

        var that = this

        this._fireSameWindowListeners = function(event, details) {
            window.dispatchEvent(new CustomEvent(LOCAL_EVENT, {
                detail: {
                    pev: {
                        uid: that.uid,
                        event: event,
                        details: details
                    }
                }
            }))

            return this
        }

        this._fireOtherWindowListeners = function(event, details) {
            // We send our event and then a sigil to clear it, in case identical
            // events are fired twice in a row.  If we go to a model where we
            // always add a synthetic unique event ID then we could drop the song
            // and dance with the sigil.
            var item = {
                event: event,
                details: details
            }
            this.storage.setItem(EVENT_CHANNEL_KEY, JSON.stringify(item))
            this.storage.setItem(EVENT_CHANNEL_KEY, EVENT_CLEARING_SIGIL)
            return this
        }

        this.emit = function(event, details) {
            this._fireOtherWindowListeners(event, details)
            this._fireSameWindowListeners(event, details)
            return this
        }

        function initRemoteEvents(that) {

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

            function onStorageEvent(storageEvent) {
                if (storageEvent.storageArea != that.storage) return
                if (storageEvent.key != EVENT_CHANNEL_KEY) return
                if (storageEvent.newValue == EVENT_CLEARING_SIGIL) return

                var val = JSON.parse(storageEvent.newValue)

                var event = val.event
                var details = val.details

                that.emit(event, details)
            }

            window.addEventListener("storage", onStorageEvent, false)
        }

        function initLocalEvents(that) {
            window.addEventListener(LOCAL_EVENT, function(evt) {
                var event = evt.detail.pev.event
                var uid = evt.detail.pev.uid
                var details = evt.detail.pev.details

                if (uid == that.uid) {
                    that._fireListeners(event, details)
                }
            })
        }

        initRemoteEvents(this)
        initLocalEvents(this)
    }

    window.PEV = {
        EventEmitter: EventEmitter,
        TabEmitter: TabEmitter,
        PervasiveEventEmitter: PervasiveEventEmitter
    }

})()
