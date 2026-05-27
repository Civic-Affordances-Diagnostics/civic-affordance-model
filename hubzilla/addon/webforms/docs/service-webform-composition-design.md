# Service Webform Composition Design

## Status

Design document only.

This document does not authorize implementation of JSON loading, runtime rendering, API calls, file writes, database writes, IPFS behavior, Gitea behavior, LDAP behavior, MariaDB behavior, Placekey behavior, or Civic Infrastructure defaults.

The purpose is to pin framework requirements before code is written.

## Scope

This document describes how small JSON-defined webforms can accumulate into larger service products.

The immediate Hubzilla addon remains:

```text
webforms
```

The architectural role remains:

```text
JSON Form Runtime
```

A webform is not only an HTML form. In this design, a webform is a bounded service unit with a visible form interface, declared inputs, declared validation, declared processing expectations, declared outputs, and declared handoff compatibility.

## Core idea

The framework should support this progression:

```text
sub-webform
  -> service-capable webform
  -> JSON collection
  -> orchestrated product
```

A sub-webform performs one bounded service step.

A collection composes several sub-webforms into a coherent product.

A product may expose a simplified menu while preserving the individual sub-webforms as independently inspectable, reusable, and testable parts.

## Terminology

### Sub-webform

A small JSON-defined form/service step.

Examples:

```text
IPFS Publish
IPFS Pin Request
IPFS Schedule Pin
IPFS Map Pin
IPFS Gitea Browse
```

Each sub-webform should define its own fields, validation expectations, service action, result shape, storage hints, and compatible downstream consumers.

### Service-capable webform

A sub-webform with a declared action boundary.

It may eventually delegate work to an external processor, local process, remote API, or manual/offline workflow, but the JSON definition must declare what the action is expected to do and what result shape it is expected to emit.

### JSON collection

A package of related sub-webforms and/or pages.

A collection may define catalog metadata, left-side navigation, workflow order, shared records, shared configuration, import/export behavior, and handoff rules between sub-webforms.

### Orchestrated product

A higher-level user-facing capability assembled from sub-webforms.

The product may feel like one application, but it must remain traceable to its component sub-webforms.

## Required framework distinction

The framework should distinguish at least four layers in JSON design.

### Display schema

What the user sees.

Examples:

- page title
- field labels
- field help text
- button labels
- menu labels
- result panels
- warning text

### Data schema

What records are accepted or emitted.

Examples:

- CID string
- filename
- repository path
- pinning duration
- owner/controller identifier
- verification status
- exported JSON record

### Service schema

What action is being requested or represented.

Examples:

- publish content to IPFS
- request pinning
- schedule pinning
- write a CID/path mapping record
- browse a repository-backed CID index

### Handoff schema

How the output of one sub-webform becomes valid input to another.

Examples:

- `IPFS Publish` emits a CID consumed by `IPFS Pin Request`
- `IPFS Pin Request` emits a pin request consumed by `IPFS Schedule Pin`
- `IPFS Schedule Pin` emits a scheduled pin record consumed by `IPFS Map Pin`
- `IPFS Map Pin` emits repository path mappings consumed by `IPFS Gitea Browse`

## Catalog requirement

The framework needs a Catalog concept.

The Catalog lists available JSON collections and possibly individually installable sub-webforms.

A collection should be able to declare a visible Catalog entry, such as:

```text
CID Mapping
```

The Catalog should not imply that the collection is a built-in default. It only means the collection is available to the user after being installed, selected, imported, or otherwise intentionally made available.

## Left navigation requirement

The left-side menu should eventually support cascading navigation.

The first level may expose installed collections and standalone capabilities.

A selected collection may expose the sub-webforms it orchestrates.

Example:

```text
Catalog
  CID Mapping

CID Mapping
  IPFS Publish
  IPFS Pin Request
  IPFS Schedule Pin
  IPFS Map Pin
  IPFS Gitea Browse
```

The navigation should be driven by JSON, not hard-coded in PHP.

## Composition requirement

A collection must not erase the sub-webforms it uses.

The collection should declare:

- which sub-webforms it includes
- intended order
- optional/skippable steps
- shared configuration
- shared storage records
- which outputs feed which inputs
- what can be exported
- what can be resumed later

## Service guarantee requirement

Each service-capable webform should be able to declare service guarantees.

A guarantee is not necessarily a legal promise. In framework terms, it is a recorded claim about what the service step attempted, completed, verified, or failed to verify.

Examples:

- input accepted
- input validated
- CID observed
- pin requested
- pin confirmed
- repository path written
- mapping record exported
- verification failed
- external API unavailable

The framework should treat these as explicit record fields, not hidden runtime assumptions.

## Offline/online boundary

The JSON definition, form rendering model, validation rules, stored records, import/export records, and workflow descriptions can exist offline.

External service actions may require network or local service access.

Examples:

- IPFS publishing requires an IPFS-capable node or service when actually executed.
- Pinning requires a pinning service or local pinning node when actually executed.
- Gitea path writing requires repository access when actually executed.

The framework should allow offline design, offline inspection, offline record editing where safe, and later service execution when the relevant service is available.

## Non-goals for the current phase

Do not implement:

- dynamic JSON loading
- form rendering
- API execution
- IPFS integration
- Gitea integration
- file writes
- database writes
- background jobs
- credentials storage
- authentication model changes
- Civic Infrastructure defaults

The current phase is design documentation only.

## Design implication

The JSON Form Runtime should eventually be able to load small, bounded webforms first. Larger products should emerge from composition, not from monolithic hard-coded applications.
