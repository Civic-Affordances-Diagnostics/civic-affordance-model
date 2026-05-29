# Webforms

`webforms` is a Hubzilla addon for browser-local JSON-composed webform design and render testing.

This repository state is a recovered working browser-local checkpoint. The addon can design a form on a grid, emit a portable Webforms package JSON document, save/import that JSON, and render the imported package in Deploy mode on the same grid-style canvas.

The current implementation is intentionally limited. It proves the Design -> JSON package -> Import -> Deploy cycle without adding server-side storage, submitted form processing, services, database writes, or federation behavior.

## Current working cycle

```text
Design Grid
-> package JSON
-> Save package JSON
-> Clear
-> Import package JSON
-> restored Design Grid
-> Deploy grid render
```

The package JSON is the authoritative boundary between Design and Deploy.

Design creates and edits package state. JSON Save exports it. JSON Import restores it. Deploy renders from the loaded package JSON.

Design package generation and Deploy rendering share package/layout helper logic through `webforms-package-shared.js`.

PHP-side option and render responsibilities are also separated:

```text
include/webforms-config.php
  static options, labels, tabs, and toolbar definitions

include/webforms-render.php
  center-panel page rendering for Design and Deploy

webforms.php
  addon hooks, module dispatch, config access, request helpers, and asset loading
```

## Current purpose

The addon currently provides:

```text
/webforms route
Design / Deploy mode switch
registered left sidebar widget
Hubzilla PDL page shell
browser-local Design grid
blank new/cleared drafts
browser-local object creation
browser-local object deletion
browser-local object selection and property editing
browser-local package JSON generation
package JSON copy
package JSON download
package JSON import
browser-session draft persistence
browser-session package persistence
public local-only Design mode
browser-local Deploy render from loaded package JSON
shared package/layout helper module
shared PHP config source
separated PHP center-panel renderer
```

The current Design mode can create simple browser-local objects and emit a structured JSON package. It does not write to Hubzilla storage or execute services.

The current Deploy mode renders loaded package JSON on a grid-style rectangular canvas. It does not submit form data, store results, call services, or federate.

## Current file structure

```text
addon/webforms/
├── README.md
├── Widget/
│   └── Webforms.php
├── include/
│   ├── webforms-config.php
│   └── webforms-render.php
├── mod_webforms.pdl
├── view/
│   ├── css/
│   │   └── webforms.css
│   └── js/
│       ├── webforms-deploy.js
│       ├── webforms-design-draft.js
│       ├── webforms-design-grid.js
│       ├── webforms-design-json.js
│       ├── webforms-design-package.js
│       ├── webforms-design-properties.js
│       ├── webforms-design-session.js
│       ├── webforms-design-state.js
│       ├── webforms-design.js
│       └── webforms-package-shared.js
├── webforms.apd
└── webforms.php
```

## PHP module layout

The PHP code is split by responsibility:

```text
webforms.php
  addon entry point
  module declaration
  hook registration
  PDL loading
  shared config access
  request sanitization helpers
  Design / Deploy dispatch
  CSS and JavaScript asset registration

include/webforms-config.php
  Design form options
  Design descriptions
  Design tabs
  Deploy collection options
  Deploy form options
  toolbar definitions

include/webforms-render.php
  public/local access notices
  Design center-panel rendering
  Design tab navigation
  Design tab content rendering
  Deploy center-panel rendering

Widget/Webforms.php
  registered Zotlabs\Widget sidebar widget
  sidebar mode selector
  Design selector
  Deploy selector
  toolbar button matrix
```

`webforms.php` and `Widget/Webforms.php` both consume `include/webforms-config.php`, so sidebar and center-panel labels are no longer maintained in separate hard-coded arrays.

## Hubzilla conventions used

The addon currently uses these Hubzilla patterns:

```text
webforms.php
  addon entry point
  module declaration
  hook registration
  PDL loading
  asset registration

webforms.apd
  app descriptor

mod_webforms.pdl
  Comanche/PDL layout for the webforms module

Widget/Webforms.php
  registered Zotlabs\Widget sidebar widget

head_add_css()
  CSS asset registration

head_add_js()
  ordered JavaScript asset registration
```

The sidebar widget is registered on addon load:

```php
Widget::register('addon/webforms/Widget/Webforms.php', 'webforms');
```

and unregistered on addon unload:

```php
Widget::unregister('addon/webforms/Widget/Webforms.php', 'webforms');
```

The PDL file places the registered widget into the left aside region:

```text
[region=aside]
[widget=webforms][/widget]
[/region]
```

## Browser-local behavior

Design mode is intentionally browser-local at this stage.

The browser currently handles:

```text
grid rendering
object creation
object deletion
object selection
property editing
session draft persistence
session draft clear/reset
package JSON generation
package JSON copy
package JSON download
package JSON import
package-to-draft restoration
Deploy rendering from loaded package JSON
```

The browser uses `sessionStorage` only so work survives Grid / JSON / Deploy navigation during the same browser session. This is not permanent save/publish behavior.

Clear returns to an empty draft. It does not create a default sample field.

## JavaScript module layout

The JavaScript is split by responsibility:

```text
webforms-design-state.js
  shared Design namespace constants

webforms-design-draft.js
  draft construction
  object factories
  object lookup/mutation
  add/delete/select object helpers
  shared escape helpers

webforms-design-session.js
  sessionStorage load/persist/clear for design drafts
  runtime access/tab refresh
  draft counter repair

webforms-package-shared.js
  shared package version
  shared package sessionStorage keys
  package validation
  portable field detection
  portable field mapping
  portable layout mapping
  package form id/title helpers
  grid size lookup
  layout bounds calculation
  fields-by-id mapping
  object counter repair
  plain object cloning

webforms-design-package.js
  hubzilla.webforms.package generation
  package persistence
  package-to-draft restoration
  meta/design/runtime sections
  JSON textarea rendering

webforms-design-grid.js
  grid rendering
  generated object rendering
  grid selection visuals
  grid preview updates

webforms-design-properties.js
  compact selected-object property editor
  placement dropdowns
  select options editor
  property updates

webforms-design-json.js
  copy package JSON
  download package JSON
  import package JSON
  clear/reset current browser-session draft

webforms-design.js
  initialization
  toolbar dispatch
  high-level Design orchestration

webforms-deploy.js
  browser-local Deploy rendering from loaded package JSON
  grid-style Deploy canvas
  interactive inert controls
```

The files are loaded in dependency order by `webforms.php`.

`webforms-package-shared.js` is loaded before `webforms-design-package.js` in Design mode and before `webforms-deploy.js` in Deploy mode. This keeps Design JSON generation and Deploy rendering aligned around the same package assumptions.

## Grid components

The current Grid toolbar supports these browser-local components:

```text
Box
  layout container

Field
  text input

Label
  display text

Area
  textarea

Check
  checkbox

Button
  inert button

Select
  select list with value|label options editor

Result
  display-only result panel

Help
  display-only help text

Del
  delete selected object
```

Input components are emitted in `form.fields`.

Layout/display components such as Box, Label, Result, and Help are represented in `form.layout` and are not emitted as user-input fields.

## JSON package shape

The JSON tab emits a package with these top-level sections:

```text
meta
  package identity, status, access, generator

design
  editor/grid state for the Hubzilla webforms designer

form
  portable form fields and layout for Deploy rendering and external use

runtime
  reserved space for future storage, services, and federation behavior
```

The current package schema name is:

```text
hubzilla.webforms.package
```

At this checkpoint, the package JSON is the unit of truth for round-tripping Design and Deploy.

Shared package/layout behavior is centralized in `webforms-package-shared.js` so the same assumptions are used when Design produces package JSON and when Deploy renders it.

## Deploy rendering

Deploy mode renders from loaded package JSON.

Deploy uses:

```text
package.form.fields
package.form.layout
package.design.grid.size when available
```

Deploy creates a grid-style rectangular canvas using the same placement coordinates saved by Design. The deployed controls are interactive in the browser, but no submit behavior is active.

The Deploy renderer does not call services, write to storage, store submissions, or federate.

## Public and logged-in access

The addon currently uses a simple Public / Logged-in separation.

Public visitors can use Design mode as local-only browser behavior.

Logged-in users are identified as logged-in in the browser-local package metadata, but no additional private storage, publishing, service, or federation behavior is active yet.

Public Design mode is intended to support open local authoring and JSON export without requiring server-side work.

## Current non-goals

This checkpoint intentionally does not implement:

```text
server-side save
Hubzilla cloud storage writes
database writes
submitted form processing
permanent localStorage
service execution
credential storage
federation actions
workflow automation
bundled application defaults
Civic Infrastructure defaults
complex ACLs
```

The addon should remain content-neutral and should not impose any Civic Infrastructure concepts or defaults on Hubzilla users.

## Deployment asset note

The addon registers JavaScript and CSS using Hubzilla asset helpers.

During local testing, addon JavaScript failed to load when nginx denied all `/addon/...` paths. The tested local solution was to allow safe static addon assets by extension while continuing to deny arbitrary addon source access.

That deployment issue is not specific to `webforms`; existing addons also use `/addon/...` JavaScript paths through `head_add_js()`.

This point is included here because client-side addon behavior is important for reducing server work and enabling public/local Design mode.

## Feedback requested

At this checkpoint, feedback is useful on:

```text
addon structure
module/routing approach
Widget::register() usage
PDL placement
asset registration
public/local Design behavior
file organization
browser-local package JSON boundary
shared package/layout helper approach
shared PHP config/render split
Deploy rendering approach
whether this should continue as an addon in this form
```

Feedback is not yet requested on a completed persistent storage layer, services layer, federation behavior, or submitted form workflow because those pieces are intentionally not implemented yet.

## Development principle

Keep the addon conservative and reviewable.

Prefer small files, clear responsibilities, Hubzilla conventions, and content-neutral behavior. Larger runtime features should wait until the browser-local package boundary remains stable and boring.

## Recovery note

The attempted implicit Load Design behavior was rolled back. Design initialization should load the current browser-session draft only. Package JSON enters Design through the explicit Import action. This prevents Grid work from being silently replaced during normal Grid / JSON tab navigation.
