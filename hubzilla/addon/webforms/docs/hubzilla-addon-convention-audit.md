# Hubzilla Addon Convention Audit

## Status

Convention audit and implementation note.

This document records the Hubzilla addon conventions verified during the `webforms` development pass.

It is intended to prevent future regressions into non-canonical PDL/sidebar patterns.

## Scope

This note applies to the current `webforms` addon shell only.

It does not authorize JSON loading, form rendering, drag-and-drop behavior, storage, service execution, API calls, credential storage, database tables, background jobs, or bundled default collections.

## Current addon purpose

The addon remains:

```text
webforms
```

The generic purpose remains:

```text
JSON-Composed Web Forms for Hubzilla
```

The addon must remain content-neutral and must not ship Civic Infrastructure, Affordance, Affected-Status, IPFS, Placekey, or email behavior as defaults.

## Verified Hubzilla PDL pattern

Hubzilla module PDL files commonly use simple regions and widget references.

Observed examples included:

```text
addon/articles/mod_articles.pdl
addon/cards/mod_cards.pdl
addon/wiki/mod_wiki.pdl
addon/logger_stats/mod_logger_stats.pdl
view/pdl/mod_directory.pdl
view/pdl/mod_webpages.pdl
```

The common shape is:

```text
[region=aside]
[widget=...][/widget]
[/region]

[region=content]
$content
[/region]

[region=right_aside]
[widget=notifications][/widget]
[widget=newmember][/widget]
[/region]
```

The `webforms` PDL shell should follow that convention.

## Current accepted PDL direction

The accepted `webforms` PDL shape is:

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

This keeps the Hubzilla page frame normal and preserves the right-side Hubzilla context, including `NEW MEMBER LINKS`.

## Widget registration convention

A PDL widget reference such as:

```text
[widget=webforms][/widget]
```

does not automatically load:

```text
addon/webforms/Widget/Webforms.php
```

The widget must be registered through Hubzilla's extension widget registry.

The verified convention is:

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

The widget registry is stored under Hubzilla system configuration.

After adding widget registration to an already-enabled addon, the addon may need to be disabled and re-enabled so the registration is written.

## Widget file convention

The sidebar widget file should live at:

```text
addon/webforms/Widget/Webforms.php
```

The class should use:

```php
namespace Zotlabs\Widget;

class Webforms {
    function widget($arr) {
        ...
    }
}
```

The file should include a Hubzilla-style widget header:

```php
/**
 * Name: Webforms sidebar
 * Description: Display Design or Deploy controls for the webforms addon
 * Requires: webforms
 */
```

## Current sidebar responsibility

The `Webforms` widget owns the left sidebar.

It should render only the active mode's controls:

```text
mode=design
  Design / Deploy selector
  Design form selector
  Design toolkit placeholders
  Selected object placeholder

mode=deploy
  Design / Deploy selector
  Deploy collection selector
  Deploy webform selector
```

Design and Deploy controls should not be shown simultaneously.

## Current module-content responsibility

`webforms.php` owns the center content.

It should render the active mode's inert center placeholder:

```text
mode=design
  Design workspace placeholder

mode=deploy
  Deploy preview placeholder
```

The module content should not own the left sidebar when the registered widget path is working.

## PDL rendering note

PDL content in this context should not rely on Markdown headings such as:

```text
### Heading
```

Earlier testing showed Markdown-style text rendered as raw or collapsed text.

Use PDL regions, widget references, and simple HTML from PHP/widget output instead.

## App-install note

The early channel app-install gate showed an unwanted `Install` button and prevented the inert `/webforms` center content from rendering.

The current page still requires a signed-in local channel, but it does not block the module content behind the app-install prompt.

The app descriptor still carries:

```text
requires: local_channel
```

This keeps `/webforms` participant-facing and logged-in without adding the earlier route-blocking behavior.

## Current route

The active route remains:

```text
/webforms
```

Mode and selection are currently represented as query parameters:

```text
/webforms?mode=design
/webforms?mode=design&design_form=ipfs-publish
/webforms?mode=deploy
/webforms?mode=deploy&collection=cid-mapping&deploy_form=ipfs-publish
```

These are inert routing placeholders only.

## Repository hygiene

Avoid leaving failed implementation artifacts in the repository.

Known failed approach:

```text
creating addon/webforms/Widget/Webforms.php without registering it
```

Reason:

```text
[widget=webforms][/widget] did not render until the widget was registered through Zotlabs\Extend\Widget and the addon was reloaded.
```

Do not restore PHP-generated dynamic PDL as the preferred design unless the registered-widget path fails again for a documented reason.

## Future documentation cleanup candidates

The following existing documents may need review after this convention is accepted:

```text
docs/blank-pdl-container.md
docs/design-deploy-mode-design.md
docs/design-mode-first-implementation-plan.md
docs/design-mode-toolkit-design.md
```

Cleanup goals:

```text
remove references that imply the left sidebar should be hard-coded directly in PDL
record that the left sidebar is owned by the registered Webforms widget
record that center content is owned by webforms.php
record that PDL remains a simple Hubzilla shell
```

Do not perform broad documentation rewrites during feature coding. Update these when documentation cleanup is the explicit task.

## Current decision

The canonical working direction is:

```text
static PDL shell
registered addon sidebar widget
center content rendered by module PHP
right sidebar preserved as Hubzilla context
```

This is the preferred base for the next implementation steps.
