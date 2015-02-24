# TODO

1. Implement TabEmitter
1. Rename PervasiveEventEmitter to PervasiveEmitter
1. Update documentation to reflect new design.
1. Convert events to new style:
   What you provide is a details object that gets stuck in a map under a
   "details" key next to additional auto-created metadata keys including
   "createdAt" with a (serialized of course) timestamp, and a unique ID.
1. Refactor eachListener, _fireListeners etc into a good subclass relationship
   based on ._listeners()
