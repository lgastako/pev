# PEV

Pervasive Event Emitter for Javascript

PEV is similar to the [EventEmitter](http://smalljs.org/object/events/event-emitter/) made popular by [node.js](http://nodejs.org/api/events.html)
except that it targets browsers and proxies all events on top of storage events so that they will be seen by all open windows on the same page.

## TODOs

* Allow specifying a unique ID so that you can have separate emitters in one app.
