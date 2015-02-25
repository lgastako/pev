# TODO

1. Convert events to new style:
   What you provide is a details object that gets stuck in a map under a
   "details" key next to additional auto-created metadata keys including
   "createdAt" with a (serialized of course) timestamp, and a unique ID.

   - Fixing this now -->
     - Add unique ID to event.
      - TODO: Rename all "event" to "eventName" where appropriate.

1. Fix repeating events problem
   -> Ok let's fix up the event format first, so we can add IDs and whatnot which will
      make debugging easier.
1. Update documentation to reflect new design.
1. Refactor eachListener, _fireListeners etc into a good subclass relationship
   based on ._listeners()
1. Tests for other windows (can we window.open another html for co-op purposes
   or does localhost interfere with that?  If so should we just
   SimpleHTTPServer the tests?)
1. Fix _fireSameWindowListeners in PervasiveEmitter so that we just (re)dispatch the
   already generated simpleEvent.
