# JSON Menu and Storage Design Notes

This document records the current design proposal for future Webforms JSON menus, JSON-rendered forms, and local-first storage. It is a design note, not an implementation specification.

## General-purpose addon

`webforms` is the addon name.

The JSON Form Runtime is the architecture implemented by the addon.

The addon must remain general-purpose for Hubzilla users. Civic Infrastructure is not built into the addon. Civic Infrastructure may later be loaded as one JSON collection among many.

## Cascading menu concept

The page layout should support a stable left-side Webforms Menu followed by a selected collection menu.

Initial static placeholder:

- Webforms Menu
  - Open Repo
  - Download
  - Import
  - Help
- Selection Menu
  - No JSON collection selected

Future JSON-driven behavior:

- Open Repo shows available JSON collections.
- Selecting a collection loads its collection-specific menu.
- The collection-specific menu is defined by JSON.
- Selecting a collection-specific menu item renders the corresponding JSON-defined form in the center content region.

Example collection: Email Client

- Configure Server
- Read Email
- Send Email
- Download
- Import

Example collection: Civic Workspace

- Attestation
- Affordances
- Affected-Status
- Download
- Import

These examples are illustrative only. They must not become hard-coded Webforms behavior.

## JSON form definition concept

A JSON collection should be able to describe:

- collection metadata
- left-side menu sections
- forms available in the collection
- fields and controls
- field grouping and page regions
- validation hints
- local storage hints
- import/export behavior
- optional future API behavior

The runtime should render from the JSON description. The addon should not hard-code application-specific forms.

## Local-first storage concept

The first storage design should be local-first.

JSON records may be stored as files and still serve as a valid initial database for the runtime. File-based JSON storage supports inspection, download, restore, backup, and migration design before committing to MariaDB schema decisions.

Hubzilla's per-user file storage, visible to users through channel cloud paths such as `/cloud/theron`, is a candidate storage location for JSON definitions and records. This is only a candidate at this stage and requires later Hubzilla-specific design review before implementation.

## Future MariaDB design

The JSON should be designed so that stable records can later suggest a mature MariaDB schema.

JSON definitions should therefore distinguish:

- presentation layout
- menu structure
- data model
- validation rules
- storage hints
- lifecycle state
- audit fields

A future MariaDB schema should be derived from stable JSON record structures, not guessed prematurely.

## Future API expansion

External API processing is not part of the first implementation phase.

The local-first design should be structured so that API processing can later be added as an expansion path. In that later mode, JSON collections may submit to an independent processing node while the Hubzilla addon remains the user-facing runtime and identity/session host.
