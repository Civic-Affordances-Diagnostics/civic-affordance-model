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

The left aside should keep the normal profile card and then add plain-text Webforms placeholders:

```text
Webforms Menu
- Open Repo
- Download
- Import
- Help

Selection Menu
- No JSON collection selected.
```

The right side should remain Hubzilla-managed and may continue to show New Member Links or other standard widgets.

## Current implementation boundary

This is not runtime functionality. It is only a layout proof.

No menu item is a link. No JSON collection is loaded. No form control is rendered. No storage, import, export, API, or Civic Infrastructure behavior is implemented.

## Next design boundary

Future behavior should be introduced through JSON definitions loaded by the Webforms runtime, not through hard-coded PHP page behavior.
