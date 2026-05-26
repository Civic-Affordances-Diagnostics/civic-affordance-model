# Live-Server Deployment Baseline

This document records the verified live-server context for the `uscivicinfra` Hubzilla theme before any theme deployment action. It exists so future assistants and human developers can see what was checked, what was concluded, and what has not yet been done.

## Project rule

The public GitHub repository is the source of truth for project artifacts after they are committed. The live Hubzilla server is a deployment target, not the source of truth, unless a local change is intentionally copied back into the repository and committed.

## Cooperation rule

Proceed one contribution at a time. Prefer documented verification over assumptions. Do not move from one operational step to the next until the current step is understood and its result is recorded.

## Current objective

Install and test the `uscivicinfra` theme on the live Hubzilla server only after verifying the local Hubzilla checkout and parent theme.

The theme is intended to remain low-risk because it is self-contained under:

```text
/var/www/hubzilla/view/theme/uscivicinfra/
```

The theme must not require:

- Hubzilla core edits
- edits to `redbasic`
- database changes
- dependency installation
- a frontend build step
- JavaScript behavior for the initial deployment

## Verified repository context

The live server path `/var/www/hubzilla` was verified as a Git checkout.

Command:

```bash
cd /var/www/hubzilla && \
echo "=== repo root ===" && git rev-parse --show-toplevel && \
echo "=== branch ===" && git branch --show-current && \
echo "=== remotes ===" && git remote -v && \
echo "=== status ===" && git status --short && \
echo "=== uscivicinfra theme ===" && \
test -d view/theme/uscivicinfra && echo "present" || echo "not present"
```

Observed output:

```text
=== repo root ===
/var/www/hubzilla
=== branch ===
master
=== remotes ===
origin  https://framagit.org/hubzilla/core.git (fetch)
origin  https://framagit.org/hubzilla/core.git (push)
=== status ===
=== uscivicinfra theme ===
not present
```

Conclusion:

- `/var/www/hubzilla` is the live Hubzilla core checkout.
- The checked-out branch is `master`.
- The configured remote is upstream Hubzilla core at `https://framagit.org/hubzilla/core.git`.
- The working tree reported no local modifications in `git status --short`.
- The `uscivicinfra` theme was not present at the time of verification.
- The live server is not the Civic Affordance GitHub repository; it is a Hubzilla core checkout.

## Verified parent theme

The `uscivicinfra` theme depends on `redbasic` as its parent theme. The parent theme was verified before any copy/install action.

Command:

```bash
cd /var/www/hubzilla && test -d view/theme/redbasic && echo "redbasic present" || echo "redbasic missing"
```

Observed output:

```text
redbasic present
```

Conclusion:

- The parent theme `redbasic` exists on the live server.
- The `uscivicinfra` derived-theme dependency is available.

## Not yet done

At the time this document was added:

- `uscivicinfra` had not yet been copied into `/var/www/hubzilla/view/theme/`.
- The theme had not yet been enabled in Hubzilla.
- No Hubzilla configuration had been changed.
- No core files had been edited.
- No database changes had been made.

## Deployment principle

Because `/var/www/hubzilla` is a clean upstream Hubzilla checkout, installing `uscivicinfra` will create an untracked theme directory under:

```text
/var/www/hubzilla/view/theme/uscivicinfra/
```

That is acceptable only if done deliberately and documented. The directory should remain clearly separable from Hubzilla core and should be removable without affecting Hubzilla itself.

## Next intended operational step

After this documentation is committed, the next operational step is to copy the committed theme files from the Civic Affordance repository artifact into the live Hubzilla checkout, then verify the file list before enabling the theme.

No enablement step should occur until the copied files are verified on disk.

## Installation performed

After the baseline verification was committed, the `uscivicinfra` theme files were copied from the committed Civic Affordance GitHub repository into the live Hubzilla checkout.

The Hubzilla container was reported by the project owner as backed up before proceeding. This was described as a Proxmox backup, not a snapshot. The backup identifier, timestamp, and storage location were not provided in this conversation and should be recorded separately if needed for future operational recovery documentation.

Command used:

```bash
cd /tmp && \
rm -rf civic-affordance-model && \
git clone --depth 1 https://github.com/Civic-Affordances-Diagnostics/civic-affordance-model.git && \
sudo rsync -a \
  /tmp/civic-affordance-model/hubzilla/view/theme/uscivicinfra/ \
  /var/www/hubzilla/view/theme/uscivicinfra/ && \
sudo chown -R www-data:www-data /var/www/hubzilla/view/theme/uscivicinfra && \
cd /var/www/hubzilla && \
echo "=== installed theme files ===" && \
find view/theme/uscivicinfra -maxdepth 2 -type f | sort && \
echo "=== git status ===" && \
git status --short
```

Observed output:

```text
Cloning into 'civic-affordance-model'...
remote: Enumerating objects: 41, done.
remote: Counting objects: 100% (41/41), done.
remote: Compressing objects: 100% (37/37), done.
remote: Total 41 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
Receiving objects: 100% (41/41), 175.70 KiB | 5.86 MiB/s, done.
=== installed theme files ===
view/theme/uscivicinfra/CHANGELOG.md
view/theme/uscivicinfra/LICENSE.md
view/theme/uscivicinfra/README.md
view/theme/uscivicinfra/css/style.css
view/theme/uscivicinfra/docs/development.md
view/theme/uscivicinfra/docs/live-server-deployment.md
view/theme/uscivicinfra/php/config.php
view/theme/uscivicinfra/php/style.php
view/theme/uscivicinfra/php/theme.php
view/theme/uscivicinfra/screenshot.png
=== git status ===
```

Conclusion:

- The theme directory was copied to `/var/www/hubzilla/view/theme/uscivicinfra/`.
- The installed file list matched the expected foundation files.
- The `git status --short` section produced no output after the copy operation.
- The copy operation did not modify tracked Hubzilla core files.
- The empty placeholder directories `js/` and `templates/` were not present in the installed file listing. That is acceptable for this foundation step because no JavaScript or template override is required yet.

## Live-server PHP syntax verification

After installation, the three PHP files were checked with the live server PHP runtime before theme enablement.

Command used:

```bash
cd /var/www/hubzilla && \
php -l view/theme/uscivicinfra/php/theme.php && \
php -l view/theme/uscivicinfra/php/style.php && \
php -l view/theme/uscivicinfra/php/config.php
```

Observed output:

```text
No syntax errors detected in view/theme/uscivicinfra/php/theme.php
No syntax errors detected in view/theme/uscivicinfra/php/style.php
No syntax errors detected in view/theme/uscivicinfra/php/config.php
```

Conclusion:

- `php/theme.php` parses successfully on the live server.
- `php/style.php` parses successfully on the live server.
- `php/config.php` parses successfully on the live server.
- No theme enablement had occurred at the time of this syntax check.

## Installed source and ownership verification

The copied source commit and installed ownership were verified after PHP syntax checking.

Command used:

```bash
cd /var/www/hubzilla && \
echo "=== source commit copied from GitHub ===" && \
cd /tmp/civic-affordance-model && git log -1 --oneline && \
echo "=== installed ownership ===" && \
cd /var/www/hubzilla && find view/theme/uscivicinfra -maxdepth 2 -printf '%u:%g %p\n' | sort
```

Observed output:

```text
=== source commit copied from GitHub ===
292a254 (grafted, HEAD -> main, origin/main, origin/HEAD) docs: add deployment verification log
=== installed ownership ===
www-data:www-data view/theme/uscivicinfra
www-data:www-data view/theme/uscivicinfra/CHANGELOG.md
www-data:www-data view/theme/uscivicinfra/LICENSE.md
www-data:www-data view/theme/uscivicinfra/README.md
www-data:www-data view/theme/uscivicinfra/css
www-data:www-data view/theme/uscivicinfra/css/style.css
www-data:www-data view/theme/uscivicinfra/docs
www-data:www-data view/theme/uscivicinfra/docs/development.md
www-data:www-data view/theme/uscivicinfra/docs/live-server-deployment.md
www-data:www-data view/theme/uscivicinfra/php
www-data:www-data view/theme/uscivicinfra/php/config.php
www-data:www-data view/theme/uscivicinfra/php/style.php
www-data:www-data view/theme/uscivicinfra/php/theme.php
www-data:www-data view/theme/uscivicinfra/screenshot.png
```

Conclusion:

- The copied source was the Civic Affordance repository `main` branch at commit `292a254`.
- Installed files and directories were owned by `www-data:www-data`.
- The theme was installed but still had not been enabled.

## Current deployment state after installation

Current known state after the install, syntax check, and ownership verification:

- GitHub source is committed through `292a254`.
- The Hubzilla container was reported backed up before deployment.
- `/var/www/hubzilla` is the live Hubzilla core checkout.
- Hubzilla core remained clean under `git status --short` after the copy operation.
- `redbasic` is present.
- `uscivicinfra` is installed under `/var/www/hubzilla/view/theme/uscivicinfra/`.
- All installed files are owned by `www-data:www-data`.
- Theme PHP syntax checks passed.
- The theme has not yet been enabled.
- No Hubzilla configuration change has been recorded.
- No database change has been recorded.
- No template override has been added.
- No JavaScript behavior has been added.

## Next intended operational step after this documentation update

After this installation documentation is committed to GitHub, the next operational step is to check whether Hubzilla lists `uscivicinfra` in its theme administration interface. If it appears, enable it only for the operator/admin channel first, not as a broad site default.

Do not begin addon, wiki, JSON form, or template-override work until the foundation theme has been confirmed selectable and reversible on the live server.


## First enablement and rollback incident

After installation and documentation, the theme was made available in the Hubzilla admin theme interface. The administrator observed that both `redbasic` and `uscivicinfra` could be enabled at the same time. This confirmed that the admin theme page controls available themes, not the single active channel theme.

The administrator then observed that `/settings/display` showed both `redbasic` and `uscivicinfra` in the Display Theme dropdown. The `screenshot.png` file did not appear as a preview image in that page, but direct browser access to the screenshot URL succeeded. This indicated that the screenshot was present, web-accessible, and not itself the blocker.

When `uscivicinfra` was selected for the operator channel with the inherited `Focus (Hubzilla default)` scheme and the form was submitted, the page failed with a browser error indicating that the site could not currently handle the request.

Rollback command used:

```bash
cd /var/www/hubzilla && \
sudo mv view/theme/uscivicinfra view/theme/uscivicinfra.disabled && \
echo "uscivicinfra disabled by directory rename" && \
git status --short
```

Observed rollback result:

- `/settings/display` loaded again.
- `uscivicinfra` disappeared from the Display Theme dropdown.
- The rollback was therefore effective and reversible.

## Root-cause evidence for first failure

Server log inspection found the fatal error associated with the failed `/settings/display` request. The relevant nginx/PHP-FPM log entry was:

```text
2026/05/26 15:36:58 [error] 122#122: *6547 FastCGI sent in stderr: "PHP message: PHP Fatal error:  Uncaught ArgumentCountError: Too few arguments to function uscivicinfra_init(), 0 passed in /var/www/hubzilla/Zotlabs/Web/Router.php on line 273 and exactly 1 expected in /var/www/hubzilla/view/theme/uscivicinfra/php/theme.php:15
#0 /var/www/hubzilla/Zotlabs/Web/Router.php(273): uscivicinfra_init()
#1 /var/www/hubzilla/Zotlabs/Web/WebServer.php(118): Zotlabs\Web\Router->Dispatch()
#2 /var/www/hubzilla/index.php(14): Zotlabs\Web\WebServer->run()
  thrown in /var/www/hubzilla/view/theme/uscivicinfra/php/theme.php on line 15" while reading response header from upstream, client: 192.168.1.101, server: directory.diagnostics.kane-il.us, request: "GET /settings/display HTTP/1.1", upstream: "fastcgi://unix:/run/php/php8.2-fpm.sock:", host: "directory.diagnostics.kane-il.us", referrer: "https://directory.diagnostics.kane-il.us/settings/display"
```

Conclusion:

- The failure was not caused by CSS, screenshot availability, file ownership, scheme selection, or missing `redbasic`.
- The live Hubzilla runtime called `uscivicinfra_init()` with zero arguments.
- The theme implementation incorrectly declared `uscivicinfra_init(&$a)`, requiring one argument.
- PHP raised an `ArgumentCountError`, causing the page failure.

Corrective action in the next repository update:

```php
function uscivicinfra_init() {
	if (class_exists('App')) {
		App::$theme_info['extends'] = 'redbasic';
	}
}
```

This preserves the redbasic-derived intent while matching the actual Hubzilla 11.2.1 runtime call observed on the live server.

## State before retry

Before retrying theme selection:

- `uscivicinfra` remains renamed to `view/theme/uscivicinfra.disabled` on the live server.
- `/settings/display` loads again.
- `redbasic` remains available.
- No second enablement attempt should occur until the corrected `php/theme.php` is committed to GitHub, copied to the live server, syntax-checked, and documented.

## Successful retry after init-signature fix

After the root cause was identified, the corrected `php/theme.php` was committed to GitHub with `uscivicinfra_init()` accepting no required arguments. Browser-side GitHub visibility was delayed, so the retry used a server-side clone as the verification source.

Server-side verification and disabled-copy update command:

```bash
cd /tmp && \
rm -rf civic-affordance-model && \
git clone --depth 1 https://github.com/Civic-Affordances-Diagnostics/civic-affordance-model.git && \
grep -n "function uscivicinfra_init()" /tmp/civic-affordance-model/hubzilla/view/theme/uscivicinfra/php/theme.php && \
sudo rsync -a \
  /tmp/civic-affordance-model/hubzilla/view/theme/uscivicinfra/ \
  /var/www/hubzilla/view/theme/uscivicinfra.disabled/ && \
sudo chown -R www-data:www-data /var/www/hubzilla/view/theme/uscivicinfra.disabled && \
cd /var/www/hubzilla && \
php -l view/theme/uscivicinfra.disabled/php/theme.php && \
php -l view/theme/uscivicinfra.disabled/php/style.php && \
php -l view/theme/uscivicinfra.disabled/php/config.php
```

Observed output:

```text
Cloning into 'civic-affordance-model'...
remote: Enumerating objects: 41, done.
remote: Counting objects: 100% (41/41), done.
remote: Compressing objects: 100% (37/37), done.
remote: Total 41 (delta 0), reused 0, pack-reused 0 (from 0)
Receiving objects: 100% (41/41), 178.67 KiB | 4.36 MiB/s, done.
15:function uscivicinfra_init() {
No syntax errors detected in view/theme/uscivicinfra.disabled/php/theme.php
No syntax errors detected in view/theme/uscivicinfra.disabled/php/style.php
No syntax errors detected in view/theme/uscivicinfra.disabled/php/config.php
```

Conclusion:

- The server-side clone verified that the committed GitHub source contained the corrected zero-argument `uscivicinfra_init()` declaration.
- The corrected theme files were copied only into the disabled directory first.
- The three theme PHP files passed syntax checks in the disabled directory before restoring the normal theme path.

Restore command:

```bash
cd /var/www/hubzilla && \
test ! -d view/theme/uscivicinfra && \
sudo mv view/theme/uscivicinfra.disabled view/theme/uscivicinfra && \
sudo chown -R www-data:www-data view/theme/uscivicinfra && \
echo "uscivicinfra restored" && \
git status --short
```

Observed result:

- The command completed without reported errors.
- `/settings/display` loaded after the restore.
- The Display Theme dropdown showed both `redbasic` and `uscivicinfra`.

Second channel-selection test:

- Display Theme was set to `uscivicinfra`.
- Scheme was left as `Focus (Hubzilla default)`.
- No other custom theme settings were changed.
- The settings form submitted successfully.
- The page loaded after submit.
- The operator immediately observed a visible improvement, specifically reduced type size.

Post-success verification command:

```bash
cd /var/www/hubzilla && \
echo "=== git status ===" && \
git status --short && \
echo "=== recent uscivicinfra/php errors ===" && \
tail -n 80 /var/log/nginx/error.log | grep -Ei 'uscivicinfra|fatal|ArgumentCountError|theme.php|settings/display' || true
```

Observed output:

```text
=== git status ===
=== recent uscivicinfra/php errors ===
2026/05/26 15:36:58 [error] 122#122: *6547 FastCGI sent in stderr: "PHP message: PHP Fatal error:  Uncaught ArgumentCountError: Too few arguments to function uscivicinfra_init(), 0 passed in /var/www/hubzilla/Zotlabs/Web/Router.php on line 273 and exactly 1 expected in /var/www/hubzilla/view/theme/uscivicinfra/php/theme.php:15
#0 /var/www/hubzilla/Zotlabs/Web/Router.php(273): uscivicinfra_init()
  thrown in /var/www/hubzilla/view/theme/uscivicinfra/php/theme.php on line 15" while reading response header from upstream, client: 192.168.1.101, server: directory.diagnostics.kane-il.us, request: "GET /settings/display HTTP/1.1", upstream: "fastcgi://unix:/run/php/php8.2-fpm.sock:", host: "directory.diagnostics.kane-il.us", referrer: "https://directory.diagnostics.kane-il.us/settings/display"
```

Conclusion:

- `git status --short` produced no output, so the tracked Hubzilla working tree remained clean after the successful retry.
- The only matching fatal error shown in the checked log output was the known earlier `15:36:58` failure.
- No newer `uscivicinfra` fatal error was reported in the pasted verification output after the successful retry.

## Current deployment state after successful retry

Known state after the successful second channel-selection test:

- GitHub source contains the corrected zero-argument `uscivicinfra_init()` declaration.
- The corrected theme is restored at `/var/www/hubzilla/view/theme/uscivicinfra/`.
- The theme is available in Hubzilla.
- The operator channel can select `uscivicinfra` from `/settings/display`.
- The operator channel is using `uscivicinfra` with the inherited `Focus (Hubzilla default)` scheme.
- The first visible improvement was observed after applying the theme.
- `redbasic` remains available.
- Hubzilla tracked core files remain clean under `git status --short`.
- The old fatal error remains in the historical nginx log and should not be mistaken for a new post-fix failure.

## Next intended operational step after this documentation update

Commit this successful retry documentation to the Civic Affordance GitHub repository before any additional design, scheme, addon, wiki, or template-override work. After that commit, the next technical work should be limited to observation and small theme refinements unless a new failure is found.

## Channel-scoped visual smoke test

After the successful channel-selection retry was documented and committed, the operator performed an initial visual smoke test using the `uscivicinfra` theme on the default channel.

Observed result:

- The site front page loaded while logged in with the default channel.
- Main navigation was visible.
- The page was readable.
- No obvious broken layout, overlap, or blocking display problem was reported.
- The operator observed that the reduced type size was an immediate improvement.

The operator also tested behavior outside the selected channel context:

- A different browser visiting as a public visitor still loaded `redbasic`.
- Other channels still loaded `redbasic`.
- The `uscivicinfra` theme applied only to the operator's default channel.

Conclusion:

- The first visual smoke test passed for the selected channel.
- The theme selection behaved as a channel-level display preference, not as a site-wide default change.
- Visitor presentation and other channels were not changed by the operator-channel test.
- This confirms that the first live test stayed within the intended limited blast radius.

## Current deployment state after visual smoke test

Known state after the channel-scoped smoke test:

- `uscivicinfra` is installed under `/var/www/hubzilla/view/theme/uscivicinfra/`.
- `uscivicinfra` is available in Hubzilla.
- The operator's default channel can use `uscivicinfra` with the inherited `Focus (Hubzilla default)` scheme.
- The site remains on `redbasic` for public visitors.
- Other channels remain on `redbasic` unless individually changed.
- No additional theme code changes were made during this observation step.

## Next intended operational step after this documentation update

Commit this smoke-test documentation before any further theme refinement. The next technical step should be observation on representative Hubzilla pages, followed by one small CSS or documentation change at a time. Do not begin addon, wiki, JSON-form, or template-override work until the base theme behavior has been observed across enough ordinary Hubzilla pages to establish a stable foundation.

## Inherited redbasic scheme inspection

After the channel-scoped smoke test, the operator tested the inherited redbasic scheme selector under `uscivicinfra`.

Observed result in the Hubzilla display settings page:

- Switching between `Focus (Hubzilla default)` and `Focus-boxy` did not produce an obvious visible difference for the tested page.
- The `Custom Theme Settings` area remained available, which suggests that inherited redbasic settings may currently provide more practical control than the existing scheme difference.

The installed redbasic scheme files were then inspected on the live server before any custom `uscivicinfra` scheme was proposed.

Command used:

```bash
cd /var/www/hubzilla && \
echo "=== redbasic schema files ===" && \
find view/theme/redbasic/schema -maxdepth 1 -type f | sort && \
echo "=== focus files ===" && \
ls -l view/theme/redbasic/schema/*Focus* 2>/dev/null || true
```

Observed output:

```text
=== redbasic schema files ===
view/theme/redbasic/schema/Focus-Boxy.css
view/theme/redbasic/schema/Focus-Boxy.php
view/theme/redbasic/schema/bootstrap-nightfall.css
=== focus files ===
-rw-r--r-- 1 www-data www-data 717 May 25 12:22 view/theme/redbasic/schema/Focus-Boxy.css
-rw-r--r-- 1 www-data www-data   6 May 25 12:22 view/theme/redbasic/schema/Focus-Boxy.php
```

The content of the installed scheme files was then inspected.

Command used:

```bash
cd /var/www/hubzilla && \
echo "=== Focus-Boxy.css ===" && \
cat view/theme/redbasic/schema/Focus-Boxy.css && \
echo && \
echo "=== Focus-Boxy.php ===" && \
cat view/theme/redbasic/schema/Focus-Boxy.php && \
echo && \
echo "=== bootstrap-nightfall.css first 80 lines ===" && \
sed -n '1,80p' view/theme/redbasic/schema/bootstrap-nightfall.css
```

Observed `Focus-Boxy.css` content:

```css
.comment .wall-item-body,
.comment .wall-item-tools-left {
        padding-left: 3.4rem;
}

.wall-item-content-wrapper.comment {
        border-bottom: 1px solid var(--bs-border-color);
}

.hide-comments-outer,
.hide-comments-outer:hover {
        border: 0;
}

.widget {
        border: 1px solid var(--bs-border-color);
}

#note-text {
        border: 1px solid transparent;
}

.vcard-card {
        border: 1px solid var(--bs-border-color);
        border-bottom: 0;
}

.vcard-card .card {
        border: 1px solid var(--bs-border-color);
        border-top: 0;
        border-right: 0;
        border-left: 0;
}

.vcard-card .vcard {
        border: 1px solid var(--bs-border-color);
        border-top: 0;
        border-right: 0;
        border-left: 0;
}

.contact-block-img {
        width: 2.89rem;
        height: 2.89rem;
}
```

Observed `Focus-Boxy.php` content:

```php
<?php
```

Observed beginning of `bootstrap-nightfall.css`:

```css
/*!
 * Bootstrap v5.1.3 (https://getbootstrap.com/)
 * Copyright 2011-2022 The Bootstrap Authors
 * Copyright 2011-2022 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 *
 * Bootstrap-Nightfall v1.1.3 (https://vinorodrigues.github.io/bootstrap-dark-5/)
 * Copyright 2020-2022 Vino Rodrigues
 * This version is an extraction with only the dark elements, or deltas, of the
 * dark theme.  Used as a bootstrap plugin.
 */
:root {
  color-scheme: dark;
}

:root {
  --bs-blue: #375a7f;
  --bs-indigo: #673ab7;
  --bs-purple: #654ea3;
  --bs-pink: #e83e8c;
  --bs-red: #e74c3c;
  --bs-orange: #fd7e14;
  --bs-yellow: #f39c12;
  --bs-green: #00bc8c;
  --bs-teal: #45b5aa;
  --bs-cyan: #17a2b8;
  --bs-white: #fafafa;
  --bs-black: #111;
  --bs-gray: #7e7e7e;
  --bs-gray-dark: #121212;
  --bs-gray-100: #e1e1e1;
  --bs-gray-200: #cfcfcf;
  --bs-gray-300: #b1b1b1;
  --bs-gray-400: #9e9e9e;
  --bs-gray-500: #7e7e7e;
  --bs-gray-600: #626262;
  --bs-gray-700: #515151;
  --bs-gray-800: #3b3b3b;
  --bs-gray-900: #222;
  --bs-primary: #375a7f;
  --bs-secondary: #626262;
  --bs-success: #00bc8c;
  --bs-info: #17a2b8;
  --bs-warning: #f39c12;
  --bs-danger: #e74c3c;
  --bs-light: #9e9e9e;
  --bs-dark: #3b3b3b;
  --bs-primary-rgb: 55, 90, 127;
  --bs-secondary-rgb: 98, 98, 98;
  --bs-success-rgb: 0, 188, 140;
  --bs-info-rgb: 23, 162, 184;
  --bs-warning-rgb: 243, 156, 18;
  --bs-danger-rgb: 231, 76, 60;
  --bs-light-rgb: 158, 158, 158;
  --bs-dark-rgb: 59, 59, 59;
  --bs-white-rgb: 250, 250, 250;
  --bs-black-rgb: 17, 17, 17;
  --bs-body-color-rgb: 225, 225, 225;
  --bs-body-bg-rgb: 34, 34, 34;
  --bs-body-color: #e1e1e1;
  --bs-body-bg: #222;
  --bs-gradient: linear-gradient(180deg, rgba(17, 17, 17, 0.15), rgba(17, 17, 17, 0));
}
```

Conclusions:

- `Focus` appears to be the redbasic default baseline rather than a separately installed local file.
- `Focus-Boxy` is a small CSS overlay, not a broad alternate layout system.
- `Focus-Boxy.php` contains only the PHP open tag and no apparent logic.
- `bootstrap-nightfall.css` is a dark Bootstrap variable/style overlay and has not yet been tested under `uscivicinfra`.
- The inherited redbasic scheme mechanism works enough to expose the selector, but the observed `Focus` versus `Focus-boxy` difference is small.
- Future `uscivicinfra` schemes remain possible, but should not be created until the base theme is tested across more ordinary Hubzilla pages and the actual desired use-case differences are clearer.
- For now, `Custom Theme Settings` may be the more practical Hubzilla-native adjustment layer for operator preferences.

Current recommendation:

- Do not create custom `uscivicinfra` schemes yet.
- Do not perform color coordination yet.
- Continue documenting ordinary-page observations before adding new CSS.
- Treat future schemes as presentation variants only, not as a place for civic workflow logic.
