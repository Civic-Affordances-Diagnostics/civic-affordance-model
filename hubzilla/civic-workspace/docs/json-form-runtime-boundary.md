# JSON Form Runtime Boundary

## General-purpose runtime

The JSON Form Runtime is intended as a general-purpose Hubzilla add-on, not as a Civic Infrastructure-only add-on.

Other Hubzilla users should be able to use it for ordinary JSON-backed applications, such as:

- custom forms;
- downloadable/restorable JSON data tools;
- email-client style interfaces;
- password-manager style interfaces;
- small personal or channel tools.

## JSON definitions

Each JSON definition should behave like an independently loadable application or capability inside the runtime.

A JSON definition may describe:

- layout inside the runtime container;
- controls;
- labels;
- help text;
- validation;
- default behavior;
- local storage expectations;
- import/export behavior;
- later API exchange behavior.

## Local-first design

The initial design should support local-first behavior.

A JSON definition may be processed by PHP and/or JavaScript when appropriate. Records may be stored as JSON files. A file-backed JSON record store can still function as a valid first database.

## API expansion

External API processing should be supported as an expansion path.

For Civic Infrastructure use, JSON definitions may later read from and write to APIs connected to independent processing nodes. That processing may happen in Python or another comparable environment. This must be an extension of the runtime contract, not a separate runtime.

## Civic Infrastructure as a JSON set

Civic Infrastructure should be treated as one set of JSON definitions loaded by the general runtime.

Its only special distinction is that it may require API read/write capacity and stricter audit or processing boundaries.

## Design constraint

The runtime should avoid becoming a place for arbitrary executable code. JSON should declare structure, permissions, and intended behavior. The runtime should execute only supported operations.
