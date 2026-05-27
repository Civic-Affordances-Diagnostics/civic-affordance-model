# Design / Deploy Mode Design

## Status

Design document only.

This document describes the intended `/webforms` page mode split for the Hubzilla `webforms` addon.

It does not implement JSON loading, form rendering, drag-and-drop behavior, grid snapping, service execution, API calls, file writes, database writes, email behavior, IPFS behavior, Placekey behavior, or bundled application defaults.

## Purpose

The `webforms` addon should provide a general-purpose Hubzilla page for JSON-Composed Web Forms.

The page needs two different user intentions:

```text
Design
Deploy
```

`Design` is for composing inert form descriptions.

`Deploy` is for selecting and rendering JSON-defined webforms and collections.

The same `/webforms` route can support both intentions without making the addon application-specific.

## Page-level principle

Hubzilla PDL places the `webforms` runtime inside the normal Hubzilla page.

The JSON-composed form system controls what appears inside the runtime area.

The page should preserve the familiar Hubzilla frame, including the right-side Hubzilla context.

## Accepted page shape

The `/webforms` page should retain:

```text
top:
  normal Hubzilla navigation

left sidebar:
  Webforms mode switch and mode-specific controls

center:
  Design workspace or Deploy webform view

right sidebar:
  Hubzilla widgets, including NEW MEMBER LINKS
```

The right sidebar should remain Hubzilla context. It should not become a `webforms` control area in this phase.

## Left sidebar mode switch

The top of the left sidebar should contain a single mode switch:

```text
Design
Deploy
```

This switch is the first control in the left sidebar.

It determines the meaning of the remaining left sidebar controls and the center content area.

## Design mode

### Purpose

Design mode is an inert visual authoring environment.

It helps a user compose JSON descriptions for webforms without making the resulting form functional.

### Left sidebar in Design mode

When `Design` is selected, the left sidebar should show design tools after the mode switch.

Possible future tools:

```text
HTML toolkit
field palette
container tools
label tools
button tools
result-panel tools
property controls
JSON import/export controls
```

These tools are design controls only.

They should not perform service execution.

### Center area in Design mode

When `Design` is selected, the center area should show a design workspace.

The workspace may eventually include:

```text
grid
snap behavior
containers
field placement
relative coordinates
selection handles
properties reflected into JSON
```

The workspace is not the Hubzilla PDL frame and not the browser viewport.

Placement is relative to the immediate JSON-declared container.

### Design mode output

Design mode should eventually produce inert JSON.

That JSON may describe:

```text
containers
groups
fields
labels
controls
defaults
help text
validation hints
relative placement
actions as inert declarations
result panels as inert placeholders
```

Design mode should not make API calls, submit records, or execute services.

## Deploy mode

### Purpose

Deploy mode is for selecting and rendering available JSON-defined webforms and collections.

Deploy mode is where the cascading collection/webform navigation belongs.

### Left sidebar in Deploy mode

When `Deploy` is selected, the left sidebar should show navigation after the mode switch.

Possible future navigation:

```text
Catalog
Collections
Webforms
Sub-webforms
Pages
```

For example:

```text
Catalog
  CID Mapping
    IPFS Publish
    IPFS Pin Request
    IPFS Schedule Pin
    IPFS Map Pin
    IPFS Gitea Browse

  Placekey Address Validation

  Bare-Bones Email Client
```

The navigation should be JSON-driven, not hard-coded in PHP.

### Center area in Deploy mode

When `Deploy` is selected, the center area should show the selected webform or collection page.

In the current design phase, this remains conceptual.

A later renderer may use the JSON definition to render live HTML controls.

A still-later service processor may execute declared service actions.

## Design mode versus Deploy mode

The two modes should remain distinct.

```text
Design mode:
  creates or edits inert JSON descriptions

Deploy mode:
  renders selected JSON definitions for use
```

Design mode should be safe to build first because it does not require service execution.

Deploy mode should not be built by hard-coding the pilot examples.

## Authorship model

The framework should support multiple JSON authoring methods:

```text
hand-written JSON
assistant-generated JSON
GUI-generated JSON
```

The GUI designer is one authoring method.

The durable source of truth remains JSON.

## Modularity expectation

The Design / Deploy split does not require one monolithic JSON file.

A collection may eventually be composed from separate JSON modules, such as:

```text
collection manifest
webform module
field descriptor
layout descriptor
validation descriptor
service descriptor
storage/export descriptor
handoff descriptor
```

The exact file structure is not decided by this document.

The important design requirement is that the GUI designer should eventually be able to read and write the same JSON structures that hand authors and assistants can inspect.

## Non-goals

Do not implement in this phase:

```text
drag-and-drop behavior
grid snapping
JSON parser
JSON renderer
service execution
API connectors
credential storage
file writes
database writes
background jobs
mail sending
IPFS publishing
Placekey validation
collection installation
runtime security model changes
```

## Implementation implication

The safest first implementation target is Design mode as an inert designer.

However, this document does not authorize implementation.

The next step should remain one file and one purpose at a time.

## Open questions

- Should the mode switch state be remembered per user, per session, or only per page load?
- Should Design mode initially export JSON only through copy/download, or later save to Hubzilla storage?
- Should the first designer prototype live inside the addon route or as a standalone prototype document?
- What is the minimum inert field toolkit needed for a first safe prototype?
- How should the designer represent relative container coordinates without committing to a final renderer?
- Should Deploy mode initially show only placeholder selected JSON, or wait until a renderer exists?

## Current decision

`/webforms` should have a top-left mode switch:

```text
Design / Deploy
```

`Design` shows an inert HTML/form-designer toolkit and a center grid/snap workspace.

`Deploy` shows cascading JSON collection/webform navigation and a center live webform view.

The right sidebar remains Hubzilla context, including NEW MEMBER LINKS.
