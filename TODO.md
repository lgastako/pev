# TODO

DONE 1. Convert events to new style:
DONE    What you provide is a details object that gets stuck in a map under a
DONE    "details" key next to additional auto-created metadata keys including
DONE    "createdAt" with a (serialized of course) timestamp, and a unique ID.
DONE
DONE    - Fixing this now -->
DONE      - Add unique ID to event.
DONE       - TODO: Rename all "event" to "eventName" where appropriate.

DONE 1. Fix repeating events problem
DONE    -> Ok let's fix up the event format first, so we can add IDs and whatnot which will
DONE       make debugging easier.

-> But this results in new problem which is that the demo breaks.  Going to use
   this opportunity to create the tests for other windows.

1. Tests for other windows (can we window.open another html for co-op purposes
   or does localhost interfere with that?  If so should we just
   SimpleHTTPServer the tests?)


1. Update documentation to reflect new design.
1. Refactor eachListener, _fireListeners etc into a good subclass relationship
   based on ._listeners()
1. Fix _fireSameWindowListeners in PervasiveEmitter so that we just (re)dispatch the
   already generated simpleEvent.
1. New/better name/branding.
