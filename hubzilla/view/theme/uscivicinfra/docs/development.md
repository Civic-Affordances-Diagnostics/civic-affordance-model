# USCIVICINFRA Theme Development Notes

## Scope

This theme is a conservative Hubzilla-derived theme. It extends `redbasic` and introduces a restrained civic diagnostic visual layer without copying redbasic wholesale.

The first release deliberately avoids template overrides. That keeps the theme compatible with Hubzilla behavior while giving the live server a reversible test surface.

## Repository source of truth

The public repository is the source of truth for project artifacts after a patch is accepted. Local files on the live Hubzilla server should be treated as deployment copies unless they are committed back to the repository.

## Live-server development rule

Development may occur on the live Hubzilla server because the theme is self-contained and low-risk. Keep that true:

- Do not edit Hubzilla core.
- Do not edit redbasic.
- Do not introduce a build step.
- Do not add dependencies.
- Do not make database changes.
- Do not load JavaScript until there is a concrete need.
- Prefer rollback by switching the selected theme back to `redbasic`.

## Derived-theme structure

The theme uses the standard derived-theme pattern:

```text
php/theme.php     theme metadata and redbasic extension declaration
php/style.php     loads redbasic CSS, then appends css/style.css
php/config.php    inherits redbasic theme configuration
css/style.css     USCIVICINFRA override layer
templates/        empty until a template override is justified
js/               empty until a behavior override is justified
```

## Installation

From a Hubzilla checkout:

```bash
sudo mkdir -p /var/www/hubzilla/view/theme/uscivicinfra
sudo cp -a hubzilla/view/theme/uscivicinfra/. /var/www/hubzilla/view/theme/uscivicinfra/
sudo chown -R www-data:www-data /var/www/hubzilla/view/theme/uscivicinfra
```

If deploying from the standalone theme ZIP, copy the `uscivicinfra/` directory directly under `/var/www/hubzilla/view/theme/`.

## Testing checklist

Test as the operator/admin channel first:

- Theme appears in the admin theme list.
- Theme can be selected without PHP errors.
- Redbasic settings remain available.
- Logged-out landing view loads.
- Logged-in channel view loads.
- Directory view loads.
- Calendar view loads.
- Settings and admin pages remain usable.
- Light and dark modes remain readable.
- Mobile viewport remains navigable.

## Rollback

No code rollback should be needed for normal theme testing. Switch the channel or site default theme back to `redbasic`.

If the theme must be removed:

```bash
sudo rm -rf /var/www/hubzilla/view/theme/uscivicinfra
```

## Contribution discipline

Preferred patch shape:

- one purpose per patch
- minimal changes
- no unrelated cleanup
- clear commit message
- explain why the change helps Hubzilla users, not only Civic Infrastructure users

## Planned next patches

1. Add diagnostic channel navigation classes or a narrow template override if redbasic cannot express the channel architecture through CSS alone.
2. Add affordance marker presentation once the data source is settled.
3. Add registration-page language only after confirming the Hubzilla template and wording requirements.
4. Add calendar token styling after confirming where scope tokens are rendered.
5. Add form primitives for future JSON-rendered civic addons.
