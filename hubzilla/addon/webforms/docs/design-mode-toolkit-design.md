# Design Mode Toolkit Design

## Status

Design document only.

This document describes the inert Design-mode toolkit for the Hubzilla `webforms` addon.

It does not implement drag-and-drop behavior, grid snapping, JSON loading, JSON export, JSON import, form rendering, service execution, adapters, credential storage, file writes, database writes, background jobs, workflow automation, or bundled application defaults.

## Scope

The `webforms` addon is intended to support JSON-Composed Web Forms for Hubzilla.

The `/webforms` page has two major modes:

```text
Design
Deploy
```

This document covers only `Design`.

Design mode is a visual authoring environment for inert JSON form descriptions.

Deploy mode, service execution, live form rendering, and external integrations are out of scope for this document.

## Design purpose

Design mode should help a Hubzilla user create, inspect, and revise a JSON-described form without requiring the user to hand-write every coordinate, field, label, default, and validation hint.

The designer should produce inert form descriptions.

The generated JSON is a draft artifact that may later be reviewed by a human, edited by hand, or refined by an assistant.

## Source-of-truth rule

JSON remains the durable source of truth.

The GUI designer is only one authoring method.

Supported authoring paths should eventually include:

```text
hand-written JSON
assistant-generated JSON
GUI-generated JSON
```

The designer should not create hidden state that cannot be represented in JSON.

## Page placement

Hubzilla PDL places the `webforms` runtime inside the Hubzilla page.

Design-mode JSON places objects inside the immediate webform design workspace.

The coordinate system belongs to the Design-mode workspace and its declared containers. It does not belong to:

```text
the browser viewport
the full Hubzilla page
the PDL page shell
the right sidebar
the top navigation bar
```

## Left sidebar in Design mode

When the `/webforms` mode switch is set to `Design`, the left sidebar should contain the Design / Deploy switch at the top, followed by inert design tools.

Candidate left-sidebar areas:

```text
Mode
Toolkit
Selected object properties
JSON actions
```

The left sidebar should be compact and should not replace Hubzilla’s right-side context.

## Center workspace in Design mode

The center area should show a grid / snap workspace.

The workspace represents the immediate design container for the form being composed.

Expected center workspace capabilities, eventually:

```text
show a visual grid
place inert containers
place inert fields
select objects
move objects
resize objects
snap objects to grid
show relative placement
show object boundaries
```

These are design targets only. They are not implemented by this document.

## Right sidebar

The right sidebar remains Hubzilla context.

The right sidebar should continue to show normal Hubzilla widgets such as:

```text
NEW MEMBER LINKS
```

Design mode should not use the right sidebar as the main form-authoring surface.

## Toolkit palette

The toolkit palette should expose inert building blocks.

Initial candidate building blocks:

```text
container
field group
label
text input
textarea
number input
date input
select
checkbox
button
result panel
help text
warning text
```

These are authoring objects, not service behavior.

Adding a button to the design does not mean the button performs an action.

A button is inert until a later JSON definition and runtime explicitly connect it to allowed behavior.

## Container model

A container is a local coordinate context.

Objects placed inside a container should use coordinates relative to that container.

This allows a form design to remain portable when embedded in different page shells or resized later.

Candidate container properties:

```text
id
label
x
y
width
height
unit
grid_size
snap_enabled
```

The exact JSON syntax remains undecided.

## Relative placement model

The placement descriptor should be relative to the immediate container.

Candidate placement concepts:

```text
x
y
width
height
unit
anchor
z_order
snap
```

The first design target should support simple rectangular placement.

Complex responsive behavior should not be required for the first design target.

## Field property editor

When a field is selected, the property editor should allow the user to set inert descriptive properties.

Candidate field properties:

```text
id
label
type
default
placeholder
help_text
required
minimum
maximum
max_length
pattern
options
visibility_hint
```

The property editor should not perform service execution.

It should only describe the field and its intended constraints.

## Validation hints

Design mode should allow validation hints to be attached to fields.

Examples:

```text
required
max_length
min_length
pattern
allowed_values
date_range
path_safety
email_address
cid_format
```

Validation hints are not the same as final runtime enforcement.

The designer records the intended validation contract. A later runtime may enforce supported validation rules.

## Result panels

A result panel is an inert place where a future deployed form may display output.

Examples:

```text
Placekey result
CID mapping status
message send status
validation failure report
```

Design mode may allow the user to place result panels visually.

The panel should not fetch or calculate data in Design mode.

## JSON actions

Design mode should eventually provide JSON-oriented actions.

Candidate actions:

```text
export JSON
import JSON
copy JSON
validate JSON structure
clear workspace
```

The first implementation should prefer user-controlled export/import over automatic server writes.

## No hidden execution

Design mode must not perform hidden service behavior.

Design mode should not:

```text
call external APIs
send email
publish to IPFS
pin CIDs
write to Gitea
query Placekey
query TIGER/Census data
write LDAP entries
write MariaDB rows
store credentials
perform background jobs
```

## Draft artifact expectation

The output of Design mode is a draft JSON artifact.

The draft may be:

```text
downloaded
copied
inspected
committed to a repository
reviewed by an assistant
edited by hand
later imported back into the designer
```

The designer should make the generated JSON visible and inspectable.

## General utility

The Design-mode toolkit should be useful for arbitrary Hubzilla users composing lawful JSON-defined webforms.

It should not assume Civic Infrastructure, Affordances, Affected Status, IPFS, Placekey, or email behavior.

Those are example collections and service designs, not defaults of the generic designer.

## Initial design decision

The first safe implementation target for `webforms` may be the inert Design-mode authoring surface, because it can help create reference JSON without enabling service execution.

The designer should remain bounded:

```text
visual form composition
relative placement
property editing
validation hints
JSON draft output
```

Everything beyond that belongs to later reviewed design phases.
