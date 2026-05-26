# Webforms

Webforms is intended to become a general-purpose JSON Form Runtime for Hubzilla.

This first implementation is layout-only. It exists to prove that a Hubzilla addon route at `/webforms` can provide a PDL-backed page shell while preserving ordinary Hubzilla page structure.

## Current scope

The current page intentionally provides only:

- the normal Hubzilla top navigation;
- the default three-column Hubzilla page layout;
- the profile card in the left aside;
- a plain-text Webforms Menu under the profile card;
- a plain-text Selection Menu placeholder under the Webforms Menu;
- a center runtime container placeholder;
- the existing right-side Hubzilla widgets, including New Member Links.

## Non-goals for this step

This step does not implement:

- JSON loading;
- form controls;
- menu links;
- import or export behavior;
- storage;
- database tables;
- API calls;
- Civic Infrastructure behavior.

The menu text is deliberately non-functional. Functional behavior must come later from JSON definitions and the JSON Form Runtime design, not from this PDL/layout test.

## Design principle

Webforms should enrich Hubzilla without taking over Hubzilla. The page shell should preserve Hubzilla identity, navigation, and side regions while reserving the center content region for the future runtime.
