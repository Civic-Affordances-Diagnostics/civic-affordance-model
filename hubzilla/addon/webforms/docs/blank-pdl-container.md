# Blank PDL Container Test

This document records the intended scope of the first `webforms` implementation.

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

## What this test should prove

A successful test proves only:

- the addon is visible to Hubzilla
- `/webforms` resolves as a module route
- the PDL hook does not break routing
- the PDL shell can place `$content` in the page content region
- a stable runtime container can appear on the page

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
app/webforms.apd
```

No database migration or core edit is introduced by this first test.
