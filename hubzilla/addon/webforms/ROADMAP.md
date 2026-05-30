# Webforms Roadmap

Status: active, conservative roadmap  
Scope: Hubzilla `webforms` addon browser-local runtime stabilization

## Current position

`webforms` is a Hubzilla addon for JSON-composed webform design and browser-local render testing.

The current development focus is the package round-trip:

```text
Import JSON
-> render on Grid
-> change fields
-> generate JSON
-> save/download
-> load/import again
-> render in Deploy
```

This roadmap is intentionally short. It exists to prevent scope drift while the form runtime is being stabilized.

## Near-term priorities

1. Keep the existing Design / JSON / Deploy routing stable.
2. Preserve browser-session draft persistence across Grid -> JSON -> Grid navigation.
3. Stabilize root-level field rendering one field type at a time.
4. Keep field behavior paired between:
   - Grid rendering
   - selected-object property editor
   - JSON import/export preservation
   - Deploy rendering
5. Improve result-display fields so future operations can show returned values.
6. Fix nested container rendering only after root-level field types are stable.
7. Load only tested package JSON into Deploy when bundled package loading is later added.

## Reserved result fields

Future publication/action packages may need to display these result values:

```text
operation_id
operation
status
cid
git_path
pin_status
retrieval_status
verification_status
policy_status
completed_at
error_code
error_message
```

Reserved status values:

```text
accepted
completed
rejected
failed
pending
```

Reserved pin status values:

```text
pinned
not_pinned
unpin_requested
unpinned
pin_failed
```

Reserved verification status values:

```text
verified
mismatch
not_checked
failed
```

Reserved policy status values:

```text
allowed
blocked
requires_review
retained
superseded
```

These names are reserved for display/schema preparation only. They do not imply service execution.

## Explicit non-goals for this phase

Do not add these during the current stabilization phase:

```text
server-side saves
Hubzilla cloud writes
database writes
submitted form processing
Kubo RPC calls
git write operations
pinset mutation
service execution
credential storage
federation actions
workflow automation
Civic Infrastructure defaults in the generic addon
```

## Authority boundary

The Webforms addon remains a participant-facing JSON form runtime.

The intended later boundary is:

```text
Hubzilla/Webforms
-> orchestrator1
-> service nodes such as ipfs1
```

Webforms may later declare governed operation intent and display returned results, but it must not hold raw IPFS, git, publisher, or infrastructure write authority in browser JavaScript.

## Development rule

Proceed one small, reviewable change at a time.

Do not refactor routing, initialization, persistence, package loading, or rendering unless the exact behavior being fixed has already been identified and can be tested immediately.

If the Grid -> JSON -> Grid cycle or import -> render -> save -> load cycle breaks, stop feature work and repair the baseline first.
