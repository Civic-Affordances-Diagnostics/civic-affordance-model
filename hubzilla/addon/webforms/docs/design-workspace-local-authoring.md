# Design Workspace and Local Authoring Model

## Status

Design document only.

This document records the accepted Design-mode direction for the Hubzilla `webforms` addon after the initial Design / Deploy routing and registered sidebar-widget convention were established.

It does not implement JavaScript, external libraries, JSON loading, JSON export, JSON import, form rendering, drag-and-drop behavior, grid snapping, service execution, credential storage, file writes, database writes, background jobs, workflow automation, or bundled application defaults.

## Scope

The `webforms` addon provides a general-purpose foundation for JSON-Composed Web Forms in Hubzilla.

The current page model is:

```text
/webforms?mode=design
/webforms?mode=deploy
```

Design and Deploy are sibling modes.

Design mode is for creating and inspecting inert form definitions.

Deploy mode is for selecting and eventually rendering JSON-defined webforms.

Design mode must not activate the currently selected deployed webform.

## Current working structure

The current accepted structure is:

```text
static PDL shell
registered Webforms sidebar widget
center content rendered by webforms.php
right sidebar preserved as Hubzilla context
```

The left sidebar is rendered by the registered Webforms widget.

The center content is rendered by `webforms.php`.

The right sidebar remains normal Hubzilla context, including notifications and `NEW MEMBER LINKS`.

## Design-mode left sidebar

When Design mode is active, the left sidebar should show only Design controls.

Expected areas:

```text
Mode
Select form to design
Toolbar
Selected object
```

The Deploy collection and webform selectors should be hidden in Design mode.

## Deploy-mode left sidebar

When Deploy mode is active, the left sidebar should show only Deploy controls.

Expected areas:

```text
Mode
Collection selector
Webform selector
```

The Design form selector, design toolbar, and selected-object panel should be hidden in Deploy mode.

## Selected object panel

The Selected object panel is the future property editor for the selected design object.

When the user selects a container, field, label, button, result panel, or other form object, the panel should eventually show relevant editable properties.

Candidate properties:

```text
object type
object id
parent container
x
y
width
height
grid position
label
name/key
default value
placeholder
help text
required
validation hints
visibility
data binding
```

Placement properties should be relative to the immediate parent container.

They should not be relative to the browser viewport, the Hubzilla PDL frame, or the whole page.

## Grid workspace

The center Design workspace should present a grid/canvas for composing inert JSON-defined forms.

The current placeholder demonstrates:

```text
root form container
visible grid
sample inert field
```

The grid is a design surface, not an executing form.

Adding an object to the grid should eventually update local browser state.

The grid should remain visually stable when the browser is resized.

## Center tabs

The center Design workspace should eventually support tabs.

Initial tabs:

```text
Grid
JSON
API
```

These tabs are Design-mode tabs, not separate Hubzilla routes.

### Grid tab

The Grid tab is the visual authoring surface.

It should allow the user to view, place, select, and eventually move inert form objects.

The Grid tab is the primary design canvas.

### JSON tab

The JSON tab should show the JSON form definition generated from the current in-browser design state.

The JSON should be visible, copyable, and eventually downloadable.

Initial JSON behavior should be local to the browser.

No server write is required for the first useful version.

Candidate JSON actions:

```text
view generated JSON
copy JSON
download JSON
paste/import JSON
validate structure locally
```

The JSON tab should make the generated form definition inspectable and reviewable.

### API tab

The API tab should show service configuration relevant to the form or collection being designed.

Examples:

```text
Placekey settings
IPFS settings
Gitea settings
email service settings
local-only/export-only settings
```

The tab name may later become `Services` if that better fits non-API workflows.

If no API or service settings are configured, the form should remain local-only.

Local-only mode should still allow:

```text
visual design
JSON inspection
copy JSON
download JSON
manual review
assistant review
repository commit
```

## Local workstation processing

Most Design-mode operations should happen on the local workstation in the browser.

Hubzilla provides:

```text
page shell
identity context
permissions context
future storage bridge
future federation bridge
```

The browser can provide:

```text
visual layout editing
local object state
generated JSON
local validation previews
copy/download behavior
```

This keeps the first designer implementation safe and avoids unnecessary server writes.

## Library preference

Use mature JavaScript, JSON, SVG, drag/drop, grid, and editor libraries where appropriate.

Do not hand-code generic mechanics from scratch when a stable library exists.

Good candidates for library-backed behavior include:

```text
drag/drop
resizing
grid snapping
JSON editing
schema validation
SVG/canvas manipulation
tree/dropdown navigation
diff or preview tools
```

The architecture should not be owned by any one library.

Libraries should provide mechanics.

The `webforms` JSON model should remain the durable source of truth.

## Source-of-truth rule

The JSON definition remains the durable source of truth.

Supported authoring paths should eventually include:

```text
hand-written JSON
assistant-generated JSON
GUI-generated JSON
```

The GUI designer is an editor for JSON, not a replacement for JSON.

## Credential and configuration boundary

API keys and credentials must not be treated as ordinary exported form JSON.

Future design should distinguish:

```text
form definition JSON
private local/service settings
runtime result records
public or shared records
```

A form definition may declare that a service adapter can be used.

The actual private credential should not be exported by default with the form definition.

## Non-goals for the current stage

Do not implement:

```text
service execution
credential storage
server writes
database tables
automatic federation actions
runtime form submission
JSON persistence
drag/drop behavior
grid snapping behavior
```

The current goal is to clarify the Design-mode architecture before adding active browser behavior.

## Current decision

The next Design-mode implementation work should proceed from the existing inert grid toward browser-local authoring.

The accepted conceptual direction is:

```text
left sidebar:
  mode selector
  design form selector
  toolbar
  selected object properties

center:
  Grid tab
  JSON tab
  API/Services tab

right sidebar:
  Hubzilla context
```
