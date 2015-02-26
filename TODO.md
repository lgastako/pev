# DONE

1. Convert events to new style:
   What you provide is a details object that gets stuck in a map under a
   "details" key next to additional auto-created metadata keys including
   "createdAt" with a (serialized of course) timestamp, and a unique ID.
   - Add unique ID to event.
    - Rename all "event" to "eventName" where appropriate.
1. Fix repeating events problem
   -> Ok let's fix up the event format first, so we can add IDs and whatnot
      which will make debugging easier.
1. Refactor eachListener, _fireListeners etc into a good subclass relationship
   based on ._listeners()
1. Fix _fireSameWindowListeners in PervasiveEmitter so that we just
   (re)dispatch the already generated simpleEvent.


# TODO

New top priority, since the TabEmitter stuff worked outside of the tests, but
not live on SFDC due to XDM issues:

1. Re-implement TabEmitter on top of TabBus so that it will work across
   domains.

Going to use the first 2 as an opportunity to implement #3 (the tests).

1. Above changes result in new problem which is that the demo breaks
   -> Which implies that the PervasiveEmitter is broken.
1. TabEmitters seem to work but the test fails for them.
1. Tests for other windows (can we window.open another html for co-op purposes
   or does localhost interfere with that?  If so should we just
   SimpleHTTPServer the tests?)
1. New/better name/branding.
1. Update documentation to reflect new design and branding.
