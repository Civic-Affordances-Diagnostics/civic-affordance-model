# Blank PDL Container Test

This document records the current layout-only Webforms test.

## Confirmed route intent

The addon route is expected to be:

```text
/webforms
```

The route is site/module-level, while Hubzilla channel context remains available through the logged-in session.

## Layout target

The desired first layout is the normal Hubzilla three-column page:

```text
Top navigation remains.
Left aside remains.
Center content becomes the Webforms runtime container.
Right aside remains.
```

The left aside should show three stacked containers:

```text
Profile card

Webforms Menu
- Open Repo
- Download
- Import
- Help

Selection Menu
- No JSON collection selected.
```

The profile card is supplied by Hubzilla's existing `vcard` widget because `/webforms` is a site/module route and does not provide the channel-page profile context required by `fullprofile`.

The right side should remain Hubzilla-managed and may continue to show New Member Links or other standard widgets.

## Current implementation boundary

This is not runtime functionality. It is only a layout proof.

No menu item is a link. No JSON collection is loaded. No form control is rendered. No storage, import, export, API, or Civic Infrastructure behavior is implemented.

## Next design boundary

Future behavior should be introduced through JSON definitions loaded by the Webforms runtime, not through hard-coded PHP page behavior.
