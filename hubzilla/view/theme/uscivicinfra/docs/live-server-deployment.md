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
