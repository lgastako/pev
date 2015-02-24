# PEV - Pervasive Event Emitter for Javascript

PEV is similar to the
[EventEmitter](http://smalljs.org/object/events/event-emitter/) made popular by
[node.js](http://nodejs.org/api/events.html) except that it targets browsers
and proxies all events on top of storage events so that they will be seen by
all open windows on the same page.

Due to the cross-window nature of PEV's events, there are some differences from
normal javascript events.  In PEV, all events consist of an event name, which
is just a string, and an optional JSON details object.

The entire details object must be JSON serializable.

Consequently, callbacks take the form of:

```javascript
function cb(eventName, details) {
   // ...do something here...
}
```

Because handlers are added in other windows where there is a different object
handling communication with local storage, by default all Pervasive Event
Emitters share all events.

This will create a single universally shared event emitter:

```javascript
var events = new PervasiveEventEmitter()
```

You're ready to go:

```javascript
events.on("my-event-1", function(eventName, details) {
    // ... do something ...
})

events.emit("my-event-2", {
    user: "John",
    age: 39
})
```

If you want a "private" event emitter, you can pass a "uid" setting to the
PervasiveEventEmitter constructor.  In this scenario only other event emitters
with the same uid setting will share events.

```javascript
var privateEvents = new PervasiveEventEmitter({
    uid: "my-private-emitter"
})
```

By default PervasiveEventEmitter uses localStorage but you can specify any
object that implements the same interface/events as localStorage and
sessionStorage with the "storage" setting:

```javascript
var privateEvents = new PervasiveEventEmitter({
    storage: window.sessionStorage
})
```

You can also turn your own objects into PervasiveEventEmitters.

```javascript
function MyObject() {
    PervasiveEventEmitter.call(this)
}
```

The following combines everything to make a user defined object into an event
emitter which uses session storage and who's events are unique to the class
itself.

```javascript
function MyObject() {
    PervasiveEventEmitter.call(this, {
        uid: "MyObject",
        storage: window.sessionStorage,
    })
}
```


## TODOs

* Unique event IDs?
* Better name than pev.
