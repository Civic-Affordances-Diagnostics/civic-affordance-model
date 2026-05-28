# Webforms

`webforms` is a Hubzilla addon for browser-local JSON-composed webform design.

This repository state is intended as an early maintainer-review checkpoint. The addon is intentionally small and incomplete so Hubzilla developers can review the addon structure, routing, widget registration, PDL placement, asset loading, and file organization before larger Deploy/runtime behavior is added.

## Current purpose

The addon currently provides:

```text
/webforms route
Design / Deploy mode switch
registered left sidebar widget
Hubzilla PDL page shell
browser-local Design grid
browser-local object selection and property editing
browser-local package JSON generation
JSON copy and download from the browser
public local-only Design mode
```

The current Design mode can create simple browser-local objects and emit a structured JSON package. It does not write to Hubzilla storage or execute services.

## Current file structure

```text
addon/webforms/
├── README.md
├── Widget/
│   └── Webforms.php
├── mod_webforms.pdl
├── view/
│   ├── css/
│   │   └── webforms.css
│   └── js/
│       ├── webforms-design-grid.js
│       ├── webforms-design-json.js
│       ├── webforms-design-properties.js
│       ├── webforms-design-state.js
│       └── webforms-design.js
├── webforms.apd
└── webforms.php
```

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
  JavaScript asset registration
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
object selection
property editing
session draft persistence
package JSON generation
JSON copy
JSON download
```

The browser uses `sessionStorage` only so work survives Grid / JSON tab navigation during the same browser session. This is not permanent save/publish behavior.

## Public and logged-in access

The addon currently uses a simple Public / Logged-in separation.

Public visitors can use Design mode as local-only browser behavior.

Logged-in users are identified as logged-in in the browser-local package metadata, but no additional private storage, publishing, service, or federation behavior is active yet.

Public Design mode is intended to support open local authoring and JSON export without requiring server-side work.

## JSON package shape

The JSON tab emits a package with these top-level sections:

```text
meta
  package identity, status, access, generator

design
  editor/grid state for the Hubzilla webforms designer

form
  portable form fields and layout for renderers outside Hubzilla

runtime
  reserved space for future storage, services, and federation behavior
```

The current package schema name is:

```text
hubzilla.webforms.package
```

This structure is intended to serve two audiences:

```text
Hubzilla/webforms runtime
  later Deploy mode, PHP/Python processing, storage, services, federation

external developers
  render or process the portable form section in other environments
```

## Current non-goals

This checkpoint intentionally does not implement:

```text
server-side save
Hubzilla cloud storage writes
database writes
Deploy rendering
drag/drop
JSON import
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

At this checkpoint, feedback is requested on:

```text
addon structure
module/routing approach
Widget::register() usage
PDL placement
asset registration
public/local Design behavior
file organization
whether this should continue as an addon in this form
```

Feedback is not yet requested on a completed form runtime, Deploy mode, storage layer, services layer, or federation behavior because those pieces are intentionally not implemented yet.

## Development principle

Keep the addon conservative and reviewable.

Prefer small files, clear responsibilities, Hubzilla conventions, and content-neutral behavior. Larger runtime features should wait until the base addon shape is acceptable to Hubzilla maintainers.
