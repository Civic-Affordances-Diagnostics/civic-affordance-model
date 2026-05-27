# Design Mode First Implementation Plan

## Status

Implementation planning document only.

This document defines the first safe implementation slice for the Hubzilla `webforms` addon Design mode.

It does not implement drag-and-drop behavior, grid snapping, JSON loading, JSON export, JSON import, live form rendering, service execution, adapters, credential storage, file writes, database writes, background jobs, workflow automation, or bundled application defaults.

## Purpose

The purpose of the first implementation slice is to make the `/webforms` page visibly reflect the accepted Design / Deploy model without making the addon functional yet.

The first slice should remain inert and layout-only.

It should help confirm that the page structure is correct before any JSON authoring, runtime rendering, or service behavior is introduced.

## Existing page boundary

The current `/webforms` page is a Hubzilla module-level addon route.

The page is already PDL-backed.

The page should continue to preserve normal Hubzilla context.

The right sidebar should remain Hubzilla context, including:

```text
NEW MEMBER LINKS
```

## First implementation target

The first implementation target is a visible, inert Design / Deploy shell.

Expected page shape:

```text
left sidebar:
  Design / Deploy switch placeholder
  mode-specific placeholder area

center:
  selected mode placeholder

right sidebar:
  Hubzilla widgets
  NEW MEMBER LINKS
```

No real mode-switching logic is required in the first slice unless it can be done safely as inert static markup.

## Left sidebar target

The top of the left sidebar should show one mode selector:

```text
Design | Deploy
```

This selector may be static in the first implementation.

The goal is to establish placement and language, not behavior.

Below the selector, the left sidebar may show placeholders for the two future modes.

Suggested initial left-sidebar placeholder text:

```text
Design Mode
- Toolkit placeholder
- Field palette placeholder
- Properties placeholder

Deploy Mode
- Catalog placeholder
- Collection navigation placeholder
```

The exact visual wording may be adjusted to match Hubzilla conventions.

## Center content target

The center content should show an inert workspace placeholder.

Suggested initial center content:

```text
Webforms

Design mode will provide an inert grid/snap workspace for composing JSON-defined forms.

Deploy mode will render selected JSON-composed webforms after the runtime is implemented.
```

A simple visual division between the future Design workspace and Deploy view is acceptable.

The first implementation should not attempt drag/drop, snapping, JSON editing, or form rendering.

## Right sidebar target

The right sidebar should remain Hubzilla-owned context.

The first implementation should preserve the existing PDL right-side widgets:

```text
[widget=notifications][/widget]
[widget=newmember][/widget]
```

Do not move the design toolkit into the right sidebar.

Do not remove `NEW MEMBER LINKS`.

## Preferred first code change

The preferred first code change should be one file only:

```text
hubzilla/addon/webforms/mod_webforms.pdl
```

Reason:

The accepted first implementation slice is layout-only.

The PDL file already controls the page shell.

Changing only the PDL file avoids introducing runtime behavior before the layout is verified.

## Avoid in the first implementation

Do not add:

```text
JavaScript
CSS files
PHP processing logic
JSON files
form rendering
drag/drop behavior
grid snapping
server-side storage
client-side storage
API calls
credential fields
database tables
background jobs
Civic Infrastructure defaults
bundled application collections
```

## Verification target

After the first code change, `/webforms` should visibly show:

```text
left sidebar:
  Design / Deploy switch placeholder
  Design and Deploy placeholder areas

center:
  inert webforms workspace placeholder

right sidebar:
  notifications / NEW MEMBER LINKS

profile card:
  absent
```

The expected result is still an inert shell.

## Success criteria

The first implementation slice is successful when:

```text
/webforms loads
Hubzilla top navigation remains intact
right sidebar remains intact
NEW MEMBER LINKS remains visible
Design / Deploy language appears at the top of the left sidebar
center content clearly indicates inert Design and Deploy futures
no service behavior exists
no JSON runtime behavior exists
```

## Next step after verification

If the first implementation slice is accepted visually, the next step should be another one-file change.

Candidate follow-up:

```text
hubzilla/addon/webforms/mod_webforms.pdl
```

or, only if necessary:

```text
hubzilla/addon/webforms/webforms.php
```

The follow-up should still remain inert unless explicitly approved.

## Current decision

The next code step should be a single-file PDL update that introduces the visible Design / Deploy shell for `/webforms`.

No runtime functionality is approved by this plan.
