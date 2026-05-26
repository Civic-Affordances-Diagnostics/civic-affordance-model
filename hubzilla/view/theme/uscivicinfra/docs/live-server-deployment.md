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
