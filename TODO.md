# TODO

1. Rename PervasiveEventEmitter to PervasiveEmitter
1. Update documentation to reflect new design.
1. Convert events to new style:
   What you provide is a details object that gets stuck in a map under a
   "details" key next to additional auto-created metadata keys including
   "createdAt" with a (serialized of course) timestamp, and a unique ID.
1. Refactor eachListener, _fireListeners etc into a good subclass relationship
   based on ._listeners()
1. Tests for other windows (can we window.open another html for co-op purposes
   or does localhost interfere with that?  If so should we just
   SimpleHTTPServer the tests?)
