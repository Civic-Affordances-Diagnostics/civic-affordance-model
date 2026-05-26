# Webforms

`webforms` is intended to become a general-purpose JSON Form Runtime addon for Hubzilla.

This initial contribution does **not** implement JSON rendering, storage, API processing, Civic Infrastructure workflows, or database changes. It creates only the first blank user-facing container page at:

```text
/webforms
```

The page is intended to prove the minimum Hubzilla integration path before any runtime behavior is added.

## Purpose of this first step

This first code step tests whether a normal Hubzilla addon can provide a route and PDL-backed page shell for a future JSON Form Runtime.

It intentionally provides:

- a Hubzilla addon named `webforms`
- a module route at `/webforms`
- a `load_pdl` hook handler
- a local addon PDL file, `mod_webforms.pdl`
- a blank runtime container in the main content region
- an addon app descriptor kept with the addon at `addon/webforms/webforms.apd`

It intentionally avoids:

- Hubzilla core edits
- database changes
- JSON rendering
- record persistence
- API processing
- JavaScript runtime behavior
- Civic Infrastructure-specific defaults
- automatic takeover of navigation or pages

## Opt-in rule

`webforms` is a general Hubzilla addon. Civic Infrastructure must remain an optional JSON collection/use case loaded later by explicit participant, channel, hub, or administrator action.

No Civic Infrastructure behavior should be forced into Hubzilla defaults.

## Initial page contract

The initial page should only show that the runtime container exists:

```html
<div id="webforms-runtime-container" class="webforms-runtime-container" data-webforms-runtime="blank">
```

Later work may load JSON collections into this same container.

## PDL boundary

The addon uses the `load_pdl` hook to supply the PDL shell for the `webforms` module. The PDL file places normal module content into the `content` region using Hubzilla's `full` template:

```text
[template]full[/template]

[region=content]
$content
[/region]
```

The `full` template is used because the first live `/webforms` route test showed that the earlier `default` template preserved the right-side new-member area. The `full` template keeps the Hubzilla navbar while providing a single full-width content region for the future JSON Form Runtime.

The PDL layer places the runtime. It does not define JSON forms or civic business logic.

## Expected first test

After the addon directory is copied into the live Hubzilla checkout and the addon is enabled, visiting `/webforms` as a local channel should load a blank Webforms container page.

If the app is available but not installed for the channel, Hubzilla may show the normal app installation prompt.
