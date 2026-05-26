# USCIVICINFRA Hubzilla Theme

`uscivicinfra` is a derived Hubzilla theme for the Civic Infrastructure Diagnostics Directory. It extends `redbasic` and keeps the first implementation deliberately narrow: theme registration, inherited redbasic configuration, a CSS override layer, documentation, and an admin-panel screenshot.

The theme is not intended to make Hubzilla look like a consumer social network, government website, or corporate dashboard. Its purpose is to give Hubzilla a restrained civic diagnostic frame while preserving Hubzilla conventions and keeping maintenance friction low.

## Status

Version: `0.1.0`

This is a foundation release for live-server testing. It does not override Hubzilla templates yet and does not add JavaScript behavior.

## Install location

Copy this directory to the Hubzilla theme path:

```text
/var/www/hubzilla/view/theme/uscivicinfra/
```

Expected resulting files:

```text
/var/www/hubzilla/view/theme/uscivicinfra/php/theme.php
/var/www/hubzilla/view/theme/uscivicinfra/php/style.php
/var/www/hubzilla/view/theme/uscivicinfra/php/config.php
/var/www/hubzilla/view/theme/uscivicinfra/css/style.css
/var/www/hubzilla/view/theme/uscivicinfra/screenshot.png
```

Set ownership after copying:

```bash
sudo chown -R www-data:www-data /var/www/hubzilla/view/theme/uscivicinfra
```

Then enable the theme in the Hubzilla admin theme panel.

## Design and technical posture

- Base theme: `redbasic`
- CSS strategy: plain CSS appended after redbasic
- Template strategy: no template overrides until a specific need is identified
- JavaScript strategy: no theme JavaScript loaded by default
- Build system: none
- Core edits: none
- Database changes: none

## First-use testing

Recommended live-server test sequence:

1. Copy the theme into `/var/www/hubzilla/view/theme/uscivicinfra/`.
2. Set ownership to `www-data:www-data`.
3. Enable the theme only for the operator/admin channel first.
4. Check logged-out home, logged-in channel view, settings, directory, notifications, calendar, and mobile layout.
5. If anything fails, switch the channel back to `redbasic`; no core rollback should be required.

## Future work

Future contributions should remain small and reviewable:

1. Navigation and diagnostic channel treatment.
2. Participant affordance markers.
3. Registration language for SASE qualification.
4. Calendar scope-token presentation.
5. Five-CID diagnostic record display primitives.
6. JSON-rendered civic form styling for future addons.

Each contribution should be separately reviewable and should avoid imposing Civic Infrastructure-specific behavior on Hubzilla core.
