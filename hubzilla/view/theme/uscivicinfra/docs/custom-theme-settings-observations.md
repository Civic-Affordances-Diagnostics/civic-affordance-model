# Custom Theme Settings Observations

This document records the first observed behavior of inherited `redbasic` custom theme settings while testing the `uscivicinfra` Hubzilla theme on the live server.

## Context

`uscivicinfra` is a conservative derived theme that extends `redbasic` and inherits `RedbasicConfig`. The first implementation intentionally avoids Hubzilla core edits, edits to `redbasic`, template overrides, JavaScript behavior, database changes, and build tooling.

At this stage, the theme has been selected only for the operator's Default channel. Public visitors and other channels remain on `redbasic` unless changed separately.

## Observed setting behavior

The operator tested inherited Custom Theme Settings under:

```text
/settings/display
```

Observed behavior:

- `Default to dark mode` works.
- `Narrow navbar` works.
- `Show advanced settings` initially appeared to do nothing when toggled, but after setting it to `Yes` and submitting, the advanced settings became visible.
- The advanced settings exposed standard redbasic-style controls such as theme colors, corner radius, background color, and similar visual configuration inputs.
- Switching between `Focus (Hubzilla default)` and `Focus-boxy` showed no obvious visual difference during the first observation pass.

## Interpretation

The first live tests indicate that the practical customization surface for `uscivicinfra` is currently inherited `redbasic` configuration, not a separate large custom theme system.

This is acceptable and consistent with the project posture:

- preserve Hubzilla conventions;
- avoid unnecessary template overrides;
- avoid new JavaScript behavior;
- avoid premature custom scheme development;
- use the existing Hubzilla theme configuration surface before inventing new mechanisms.

## Decision

Do not create new `uscivicinfra` schemes yet.

Do not begin color coordination work yet.

Continue using inherited `redbasic` custom settings for low-risk observation while ordinary Hubzilla pages are tested one at a time.

Future custom schemes may still be useful, but only after there is a concrete presentation distinction that cannot be handled cleanly by inherited settings and the base CSS layer.

## Current conclusion

The first theme foundation is behaving as intended: it is a thin, Hubzilla-native civic layer over `redbasic`, with most user-facing configuration still delegated to Hubzilla's existing theme settings.
