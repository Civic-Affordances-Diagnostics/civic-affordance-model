# Blank PDL Container Test

This document records the intended scope and first live observations for the initial `webforms` implementation.

## Objective

Create the smallest useful Hubzilla addon page for the future JSON Form Runtime:

```text
/webforms
```

The page should prove that Hubzilla can host a blank runtime container using an addon module and a PDL shell.

## Current hypothesis

Based on live inspection of Hubzilla 11.2.1:

- addon modules can expose routes such as `/webforms`
- `load_pdl` is called during routing before theme initialization completes
- existing addons can register `load_pdl`
- an addon can set layout content when its module is active
- addon PDL files can exist as `addon/<addon>/mod_<addon>.pdl`

This first implementation tests that hypothesis with the smallest possible page.

## What the first live test proved

The first live test proved:

- the addon could be installed into the live Hubzilla checkout without core edits
- the addon compatibility check passed after removing the invalid addon-header `Requires: local_channel`
- the app descriptor belongs with the addon as `addon/webforms/webforms.apd`, not in the core `app/` directory
- the addon could be enabled from `/admin/addons`
- `/webforms` resolved as a route
- the page loaded as a blank page
- the Hubzilla top navigation and menus remained available

## Layout observation

The first PDL file used Hubzilla's default template:

```text
[template]default[/template]

[region=content]
$content
[/region]
```

Live observation showed that this produced a usable blank page, but the right-side new-member area was still visible. For a JSON Form Runtime, the preferred first shell is a single content workspace that preserves Hubzilla navigation but does not reserve left or right sidebar regions.

The next PDL test therefore uses the `full` template:

```text
[template]full[/template]

[region=content]
$content
[/region]
```

The inspected `full` template is a single-column full-width layout with the Hubzilla navbar. That matches the current requirement better than the default three-column layout.

## What this test does not prove

This test does not prove:

- JSON form rendering
- JSON validation
- JSON record storage
- MariaDB schema design
- API processing
- Civic Infrastructure workflow behavior
- channel-relative routing such as `/channel/{channel}/webforms`

Those remain later design and implementation questions.

## Rollback expectation

This contribution is intended to be reversible by disabling the addon or removing the copied files:

```text
addon/webforms/
addon/webforms/webforms.apd
```

No database migration or core edit is introduced by this first test.
