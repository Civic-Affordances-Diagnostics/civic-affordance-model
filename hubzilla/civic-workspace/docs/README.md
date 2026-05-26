# Civic Workspace and JSON Form Runtime Design

This folder records the design baseline for a future Hubzilla add-on centered on a **JSON Form Runtime**.

This is not yet Civic Infrastructure project implementation. The immediate design target is a general-purpose Hubzilla add-on that can benefit all Hubzilla users. Civic Infrastructure should later be only one set of JSON definitions loaded by the same runtime.

## Accepted terms

- **JSON Form Runtime**: the general-purpose runtime/add-on that loads JSON-defined interfaces.
- **Civic Workspace**: the participant-facing page shell where a JSON-defined capability can later be loaded.
- **JSON definition**: an independently loadable capability/application description.
- **PDL / Comanche**: Hubzilla's page-description layer, used only as the outer page shell/placement layer.

## Current design boundary

The JSON Form Runtime should be designed local-first.

The initial design should not depend on an external API. API exchange should be an expansion path, not a redesign. Civic Infrastructure JSON definitions may later use API read/write capacity, but that must not make the runtime Civic-specific.

## Non-goals at this stage

- No Hubzilla core changes.
- No database schema changes.
- No theme implementation work.
- No Civic Infrastructure implementation yet.
- No external processing-node requirement yet.
- No assumption that PDL is the form language.

## Design goal

Create a Hubzilla-native path where a participant can navigate to a blank page shell, and where a future JSON Form Runtime can render JSON-defined applications inside a stable container.
