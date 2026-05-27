# Install and Deploy Webforms Addon

## Status

Operational documentation for the current development state of the Hubzilla `webforms` addon.

This document explains how to place the addon into a Hubzilla installation, enable it, reload it after widget-registration changes, and verify the current Design / Deploy shell.

The addon is still under early development.

It does not yet implement JSON loading, persistent JSON storage, drag-and-drop behavior, active grid snapping, form rendering, service execution, federation behavior, credential storage, database writes, background jobs, workflow automation, or bundled application defaults.

## Addon purpose

The addon name is:

```text
webforms
```

The generic contribution purpose is:

```text
JSON-Composed Web Forms for Hubzilla
```

The addon should remain content-neutral.

It must not ship Civic Infrastructure, Affordance, Affected-Status, IPFS, Placekey, email, or any other domain-specific workflow as a forced default.

Those may become optional user-created or user-installed JSON collections later.

## Repository layout

In the project repository, the addon lives at:

```text
hubzilla/addon/webforms
```

Current core addon files include:

```text
README.md
webforms.php
webforms.apd
mod_webforms.pdl
Widget/Webforms.php
docs/
```

## Deployment model

The project repository is not the Hubzilla core repository.

To test the addon in a Hubzilla node, copy or sync the project addon directory into an existing Hubzilla installation under:

```text
/var/www/hubzilla/addon/webforms
```

Example source path from a separate project clone:

```text
/var/www/civic-affordance-model/hubzilla/addon/webforms
```

Example live Hubzilla addon path:

```text
/var/www/hubzilla/addon/webforms
```

## Copying the addon

A full addon refresh can be done with a careful copy or `rsync`.

Example:

```bash
rsync -a --delete   /var/www/civic-affordance-model/hubzilla/addon/webforms/   /var/www/hubzilla/addon/webforms/
```

Use this only when the project checkout is known to be clean.

During active development, it is often safer to copy only the files changed in the current step.

Example:

```bash
install -D -m 0644   /var/www/civic-affordance-model/hubzilla/addon/webforms/webforms.php   /var/www/hubzilla/addon/webforms/webforms.php

install -D -m 0644   /var/www/civic-affordance-model/hubzilla/addon/webforms/Widget/Webforms.php   /var/www/hubzilla/addon/webforms/Widget/Webforms.php
```

After copying files, set ownership appropriate for the live Hubzilla installation.

Example:

```bash
chown -R www-data:www-data /var/www/hubzilla/addon/webforms
```

## Enabling the addon

Enable the addon through the Hubzilla administrator interface.

Typical path:

```text
Admin
  Addons
    webforms
```

After the addon is enabled, the route should be available at:

```text
/webforms
```

The app descriptor is:

```text
addon/webforms/webforms.apd
```

It currently includes:

```text
requires: local_channel
```

The page is intended for signed-in Hubzilla channel users.

## Widget registration requirement

The left sidebar is rendered by a registered addon widget.

The PDL shell contains:

```text
[region=aside]
[widget=webforms][/widget]
[/region]
```

This does not automatically load:

```text
addon/webforms/Widget/Webforms.php
```

The widget must be registered by the addon load function.

The current convention is:

```php
use Zotlabs\Extend\Widget;

function webforms_load() {
    register_hook('load_pdl', 'addon/webforms/webforms.php', 'webforms_load_pdl');
    Widget::register('addon/webforms/Widget/Webforms.php', 'webforms');
}

function webforms_unload() {
    unregister_hook('load_pdl', 'addon/webforms/webforms.php', 'webforms_load_pdl');
    Widget::unregister('addon/webforms/Widget/Webforms.php', 'webforms');
}
```

Hubzilla stores registered widgets in system configuration.

If widget registration was added after the addon was already enabled, the addon may need to be disabled and re-enabled so `webforms_load()` runs and the widget registration is written.

## Reloading after widget changes

After updating widget registration or `Widget/Webforms.php`, reload the addon if the left sidebar does not render.

Typical administrator action:

```text
Admin
  Addons
    disable webforms
    enable webforms
```

A missing left sidebar with the center content still working usually means the module route is alive but the widget is not registered or not resolving.

## PDL shell

The accepted PDL shell is intentionally simple:

```text
[template]default[/template]

[region=aside]
[widget=webforms][/widget]
[/region]

[region=content]
$content
[/region]

[region=right_aside]
[widget=notifications][/widget]
[widget=newmember][/widget]
[/region]
```

The right sidebar should remain Hubzilla context, including `NEW MEMBER LINKS`.

The left sidebar should be owned by the registered `webforms` widget.

The center content should be owned by `webforms.php`.

Do not hard-code all Design / Deploy sidebar controls directly into PDL unless restoring from a failure during development.

## Current verification URLs

After deployment and addon reload, verify these URLs.

Design mode:

```text
/webforms?mode=design
```

Expected:

```text
left sidebar:
  Design controls only
  Select form to design
  tab-aware toolbar
  Selected object panel

center:
  Design workspace
  Grid / JSON / Services / Federation / Help tabs

right sidebar:
  Hubzilla context remains visible
```

Deploy mode:

```text
/webforms?mode=deploy
```

Expected:

```text
left sidebar:
  Deploy controls only
  Collection selector
  Webform selector

center:
  Deploy preview placeholder

right sidebar:
  Hubzilla context remains visible
```

Design tab examples:

```text
/webforms?mode=design&design_tab=grid
/webforms?mode=design&design_tab=json
/webforms?mode=design&design_tab=services
/webforms?mode=design&design_tab=federation
/webforms?mode=design&design_tab=help
```

Design selected-form example:

```text
/webforms?mode=design&design_form=ipfs-publish&design_tab=json
```

Deploy selected-webform example:

```text
/webforms?mode=deploy&collection=cid-mapping&deploy_form=ipfs-publish
```

All of these routes are currently inert placeholders.

## Current implementation boundary

The current implementation establishes:

```text
Hubzilla addon shell
static PDL regions
registered sidebar widget
Design / Deploy mode routing
Design selected-form routing
Deploy collection/webform routing
Design center tabs
visible inert grid
inert toolbar matrix
```

It does not yet implement:

```text
JSON persistence
server-side form storage
client-side saved drafts
drag/drop behavior
active snapping
real form rendering
runtime submission
external API calls
credential storage
service execution
federated records
database migrations
background jobs
```

## Local-first expectation

Future Design-mode work should prefer browser-local behavior first.

The browser may eventually handle:

```text
local draft state
visual object placement
generated JSON
copy/download/import
local validation previews
```

The server should not be touched unless the user explicitly saves, imports, publishes, or executes an approved action.

## File-size and modularity guidance

Keep files reasonably small.

Treat roughly 400 to 600 lines as a practical upper bound for most source files unless there is a strong reason.

Separate responsibilities when they become distinct.

Current intended direction:

```text
webforms.php
  route, hooks, PDL loading, high-level dispatch, center content until it needs splitting

Widget/Webforms.php
  left sidebar widget only

mod_webforms.pdl
  static Hubzilla page shell only

future view/js/
  browser-local designer behavior

future view/css/
  grid, toolbar, and layout styling once inline styles become too large

future include/
  shared PHP helpers if webforms.php grows too large
```

Do not let `webforms.php` become a monolithic form runtime.

## Safe update practice

During active development, avoid broad synchronization unless the project checkout is known clean.

Prefer copying only files changed by the current step.

Avoid using `set -e` or `set -u` in an interactive root shell while testing live commands.

Prefer simple commands that fail visibly without logging out the shell.

## Current decision

A developer should be able to clone the project repository, copy `hubzilla/addon/webforms` into a Hubzilla installation, enable or reload the addon, and verify `/webforms`.

The current addon should be judged as an early, inert, convention-aligned Hubzilla addon shell for JSON-Composed Web Forms.
