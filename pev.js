(function() {
    var LOCAL_EVENT = "PEVLocalEvent"
    var LISTENER_BAG_KEY = "__pevTabEmitterListeners"

    function generateUUIDv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        })
    }

    function EventEmitter(settings) {
        settings = settings || {}

        var _eventListenersByEvent = {}

        this._listenerBag = function() {
            return _eventListenersByEvent
        }

        this._listeners = function(eventName) {
            var listenerBag = this._listenerBag()
            var listeners = listenerBag[eventName] || []
            listenerBag[eventName] = listeners
            return listeners
        }

        this.on = function(eventName, cb) {
            var listeners = this._listeners(eventName)
            listeners.push(cb)
            // console.log("added listener for eventName=> " + eventName + ", cb => " + cb)
            // console.log("listenerBag is now => " + JSON.stringify(this._listenerBag()))
            // console.log("listenerCount('" + eventName + "') => " + this.listenerCount(eventName))
            return this
        }

        this.off = function(eventName, cb) {
            var listeners = this._listeners(eventName)
            var index = listeners.indexOf(cb)
            if (index > -1) {
                listeners.splice(index, 1)
            }
            return this
        }

        this.removeAllListeners = function() {
            _eventListenersByEvent = {}
            return this
        }

        this.listeners = function(eventName) {
            // Clone the array so people can't mutate our copy
            return this._listeners(eventName).splice(0)
        }

        this.listenerCount = function(eventName) {
            // Use the internal _listeners(eventName) to avoid an array copy
            return this._listeners(eventName).length
        }

        // var aborted = false
        // var count = 0

        this._fireListeners = function(event) {
            // if (aborted) return

            // console.log("_fireListeners")
            // console.log(" count => " + count)

            var listeners = this._listeners(event.eventName)

            // console.log("firing " + listeners.length + " listeners")

            listeners.forEach(function(listener) {
                // if (aborted) return

                try {
                    listener(event)
                } catch (ex) {
                    console.log("aborted: %o", ex)
                    aborted = true
                }

            })

            // console.log("ok fired them")

            // if (count++ > 100) {
            //     console.log("aborted on count")
            //     aborted = true
            // }

            return this
        }

        this._createEvent = function(eventName, details) {
            details = details || {}
            var now = new Date()
            var eventId = generateUUIDv4()
            var event = {
                type: "simpleEvent",
                eventId: eventId,
                eventName: eventName,
                details: details,
                createdAtUnix: now.getTime(),
                createdAtIso: now.toISOString()
            }
            return event
        }

        this.emit = function(eventName, details) {
            var event = this._createEvent(eventName, details)
            try {
                return this._fireListeners(event)
            } catch (ex) {
                console.log(ex)
            }
        }

        this.addListener = this.on
        this.removeListener = this.off

        this.many = function(n, eventName, cb) {
            var that = this

            function listener() {
                if (--n <= 0) {
                    that.off(eventName, listener)
                }
                cb.apply(this, arguments)
            }

            that.on(eventName, listener)

            return that
        }

        this.once = function(eventName, cb) {
            this.many(1, eventName, cb)
            return this
        }
    }

    function TabEmitter(settings) {
        settings = settings || {}
        EventEmitter.call(this, settings)

        var _cachedTabWindow = null

        this._tabWindow = function() {
            if (_cachedTabWindow) {
                return _cachedTabWindow
            }

            var tabWindow = window

            while (tabWindow != tabWindow.parent) {
                tabWindow = tabWindow.parent
            }

            _cachedTabWindow = tabWindow

            return tabWindow
        }

        this._listenerBag = function() {
            var tabWindow = this._tabWindow()
            var listenerBag = tabWindow[LISTENER_BAG_KEY] || {}
            tabWindow[LISTENER_BAG_KEY] = listenerBag
            return listenerBag
        }

        this.removeAllListeners = function() {
            var tabWindow = this._tabWindow()
            tabWindow[LISTENER_BAG_KEY] = {}
            return this
        }
    }

    function PervasiveEmitter(settings) {
        settings = settings || {}

        EventEmitter.call(this, settings)

        var EVENT_CHANNEL_KEY = "__PEV__"
        var EVENT_CLEARING_SIGIL = "__PEV_CLEAR_EVENT__"

        this.uid = settings.uid || null

        if (this.uid) {
            EVENT_CHANNEL_KEY = EVENT_CHANNEL_KEY + ":" + this.uid
        }

        this.storage = settings.storage || localStorage

        var that = this

        this._fireSameWindowListeners = function(event) {
            // console.log("_fireSameWindowListeners -> _createEvent")

            window.dispatchEvent(new CustomEvent(LOCAL_EVENT, {
                detail: {
                    uid: that.uid,
                    simpleEvent: event
                }
            }))

            return this
        }

        this._fireOtherWindowListeners = function(event) {
            // We send our event and then a sigil to clear it, in case identical
            // events are fired twice in a row.  If we go to a model where we
            // always add a synthetic unique event ID then we could drop the song
            // and dance with the sigil.
            // console.log("_fireOtherWindowListeners: Created event obj: " + JSON.stringify(event))
            this.storage.setItem(EVENT_CHANNEL_KEY, JSON.stringify(event))
            this.storage.setItem(EVENT_CHANNEL_KEY, EVENT_CLEARING_SIGIL)
            // console.log("item set and cleared!")
            return this
        }

        this.emit = function(eventName, details) {
            var event = this._createEvent(eventName, details)
            this._fireOtherWindowListeners(event)
            this._fireSameWindowListeners(event)
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

                // console.log("ON STORAGE EVENT!")
                // console.log(val)

                that._fireListeners(event)
            }

            window.addEventListener("storage", onStorageEvent, false)
        }

        var count = 0

        function initLocalEvents(that) {
            // console.log("initializing local events with uid: " + that.uid)

            window.addEventListener(LOCAL_EVENT, function(evt) {
                window.le = evt
                if (count++ > 10) return
                // console.log("LOCAL_EVENT: %o", evt)

                if (!evt.detail.simpleEvent) {
                    consoe.log("bailing because no simpleEvent")
                    return
                }
                var eventUidDefined = evt.detail.hasOwnProperty("uid")
                var eventUid = evt.detail.uid
                var ourUid = that.uid

                // console.log("compared eventUid (" + eventUid + ") and ourUid (" + ourUid + ")")
                // console.log("eventUidDefined: " + eventUidDefined)
                if (eventUidDefined && eventUid == ourUid) {
                    var event = evt.detail.simpleEvent
                    // console.log("initLocalEvents->that._fireListeners cause uid " + evt.detail.uid)
                    // console.log("firing on event: " + JSON.stringify(event))
                    that._fireListeners(event)
                // } else {
                //     console.log("disregarding mismatched uids (" + ourUid + " vs. " + eventUid + ")")
                }
            })
        }

        initRemoteEvents(this)
        initLocalEvents(this)
    }

    window.PEV = {
        EventEmitter: EventEmitter,
        TabEmitter: TabEmitter,
        PervasiveEmitter: PervasiveEmitter
    }

})()
