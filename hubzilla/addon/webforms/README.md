# Webforms

Webforms is a general-purpose Hubzilla addon intended to provide a JSON Form Runtime.

The addon is not Civic Infrastructure-specific. Civic Infrastructure may later be one JSON collection loaded by Webforms, but the addon itself should remain useful to all Hubzilla users for JSON-backed tools such as forms, local data managers, email-style tools, password-management experiments, or other user-controlled interfaces.

## Current status

The current implementation is layout-only.

It provides:

- an addon route at `/webforms`
- a PDL-backed Hubzilla page shell
- plain-text placeholders for the future Webforms menu and selected JSON collection menu
- a blank center content area where a future JSON-rendered form/runtime will appear
- preservation of the normal Hubzilla right-side widgets, including New Member Links

It deliberately does not provide:

- JSON loading
- form controls
- hyperlinks
- import/export behavior
- storage behavior
- API behavior
- Civic Infrastructure behavior
- database changes
- Hubzilla core edits

## Layout principle

Webforms should enrich Hubzilla, not take over Hubzilla.

The initial `/webforms` route uses Hubzilla's default three-column page shell:

- left aside: Webforms Menu and Selection Menu placeholders
- center content: blank runtime/container placeholder
- right aside: existing Hubzilla widgets such as notifications and New Member Links

A previous test attempted to include a profile card in the left aside. That was removed because `/webforms` is a site/module route, not a channel page. Hubzilla's existing profile widgets depend on channel-page profile context and did not render reliably on the module route. This should not be reintroduced unless a deliberate Webforms-specific profile widget is designed later.

## JSON Form Runtime direction

The future runtime should load JSON definitions that describe menus, page regions, controls, validation hints, storage hints, and workflow behavior.

The first stage should remain local-first. JSON records may be stored as files in a user-controlled storage area. Hubzilla's per-user file storage, such as a channel cloud path like `/cloud/theron`, is a candidate for JSON storage and should be evaluated later before implementation.

External API processing may be added later as an expansion path, but the runtime should first work locally so that API support is an extension, not a redesign.
