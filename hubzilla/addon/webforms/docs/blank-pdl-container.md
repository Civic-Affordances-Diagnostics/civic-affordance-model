# Blank PDL Container

This document records the current layout-only boundary for the initial `/webforms` page.

## Purpose

The first `/webforms` page proves that a general-purpose Webforms addon can enter Hubzilla as a normal, participant-facing module page without altering Hubzilla core or taking over existing navigation.

The page is intentionally blank in the center because JSON rendering is a separate development phase.

## Current PDL shell

The page uses Hubzilla's `default` template and three page regions:

- `aside`
- `content`
- `right_aside`

The left aside currently contains only plain-text layout placeholders:

- Webforms Menu
- Selection Menu

The center content region contains the blank runtime area supplied by the addon module.

The right aside preserves normal Hubzilla widgets:

- notifications
- newmember

## Removed profile-card experiment

A profile-card experiment was attempted with Hubzilla profile widgets. This was removed.

Reason: `/webforms` is a site/module route, not a channel route. Hubzilla's `fullprofile` and `profile` widgets require `App::$profile['profile_uid']`, which is normally established on channel pages. The `vcard` widget was also tested as a possible observer-card option, but it did not render on `/webforms` in the current context.

The accepted layout therefore follows Hubzilla's module-page pattern: the left aside contains task-specific Webforms placeholders rather than forcing a channel profile card onto a site/module page.

A Webforms-specific identity/profile widget may be considered later, but that would be new behavior and is outside the current layout-only phase.

## Boundary

This page must remain layout-only until the design for the JSON Form Runtime is agreed.

No JSON loading, form behavior, links, storage, API calls, or Civic Infrastructure-specific behavior should be added in this phase.
