# PDL Shell Design

## Role of PDL / Comanche

PDL / Comanche should be treated as the Hubzilla page shell and placement layer.

It should answer:

- what page template is used;
- which page regions exist;
- where the workspace appears;
- what surrounding blocks, menus, widgets, or guidance appear.

It should not define the JSON form itself.

## Responsibilities

The PDL shell may provide:

- page title area;
- main content region;
- optional sidebar/help region;
- optional status region;
- stable placement for the future runtime container.

## Non-responsibilities

PDL should not define:

- form controls;
- validation rules;
- civic affordance logic;
- affected-status logic;
- storage rules;
- API behavior;
- processing behavior;
- database schema.

Those belong to the JSON Form Runtime and the JSON definitions loaded into it.

## Blank page test

The first useful PDL-related milestone is a blank or minimal participant-facing page.

The blank page should prove the page-composition layer before any form logic is introduced.

## Relationship to the runtime

The eventual relationship should be:

```text
Hubzilla route/navigation
  -> PDL / Comanche page shell
    -> stable runtime container
      -> JSON Form Runtime
        -> loaded JSON definition
```
