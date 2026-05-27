# Webforms Design Examples Index

## Status

Design document only.

This index tracks example webforms, comparison documents, and schema-draft documents used to shape the JSON Form Runtime before implementation.

## Purpose

The project should not design the framework from abstract theory alone.

The framework should be shaped by concrete service examples, each testing a different kind of requirement.

The first examples are:

```text
IPFS / CID Mapping
Placekey / Address Validation
Bare-Bones Email Client
```

After these examples were documented, they were compared for shared framework requirements. That comparison supports an initial static schema draft, but not runtime implementation.

## Example 1: IPFS / CID Mapping

Primary document:

```text
hubzilla/addon/webforms/docs/ipfs-cid-mapping-design.md
```

This example tests:

- Catalog listing
- cascading navigation
- sub-webform composition
- collection orchestration
- external service boundaries
- CID records
- pinning requests
- date/duration scheduling
- repository path projections
- Gitea-backed browse/index layer
- service guarantees
- public/private/export boundaries

Candidate sub-webforms:

```text
IPFS Publish
IPFS Pin Request
IPFS Schedule Pin
IPFS Map Pin
IPFS Gitea Browse
```

## Example 2: Placekey / Address Validation

Primary document:

```text
hubzilla/addon/webforms/docs/placekey-address-validation-design.md
```

This example tests:

- API key configuration
- pasted single-line address input
- address normalization
- external API validation
- structured result capture
- range-based address generation
- TIGER/Census-derived street/place data
- jurisdiction/place attachment
- batch processing
- validation failure records
- downstream handoff to LDAP or other directory schemas
- candidate/result classification
- secret/non-secret configuration boundaries

The initial simple case is:

```text
API key
single-line address
Verify button
Placekey or failure result
```

The larger case is:

```text
TIGER/Census street data
  -> locality/place association
  -> address range validation/generation
  -> Placekey validation
  -> address/result records
```

## Example 3: Bare-Bones Email Client

Primary document:

```text
hubzilla/addon/webforms/docs/bare-bones-email-client-design.md
```

This example tests requirements not fully covered by IPFS/CID Mapping or Placekey validation.

This example tests:

- strict subject/body length limits
- one-recipient send constraint
- no attachments in the webform UI
- plain-text-only composition
- recent-message windowing for sent and received mail
- manual forwarding only
- one saved external forwarding address
- private per-user configuration
- server-policy alignment
- result records for send/forward attempts
- non-exportable private settings

The confirmed pilot scope is:

```text
read messages sent or received in the last 30 / 31 days
compose one-recipient plain-text message
subject <= 64 characters
body <= 512 characters
manual forwarding only
one saved external forwarding address
no attachments
```

## Comparison document

Primary document:

```text
hubzilla/addon/webforms/docs/pilot-examples-framework-comparison.md
```

The comparison identifies shared framework requirements across the three pilot examples.

Shared requirements include:

- Catalog entries
- collections
- cascading navigation
- service-capable webforms
- display schema
- data schema
- validation rules
- service contracts
- result records
- handoff declarations
- storage/export policy
- private settings
- visibility and retention
- offline/online boundaries

The comparison concludes that a first static schema draft is justified.

It does not conclude that runtime coding should begin.

## Initial schema draft

Primary document:

```text
hubzilla/addon/webforms/docs/initial-json-schema-draft.md
```

Static JSON example:

```text
hubzilla/addon/webforms/docs/schema-draft-v0.1-collection-example.json
```

The initial schema draft proposes a minimal vocabulary:

```text
collection
catalog
navigation
setting
webform
page
group
field
validation
action
service
result
handoff
storage
visibility
retention
```

The static JSON example is non-functional. It exists to show the proposed object shape before runtime code is written.

## Guardrails

Do not implement runtime behavior from these examples yet.

Do not add Civic Infrastructure-specific defaults to the `webforms` addon.

Do not hard-code IPFS, Gitea, Placekey, LDAP, MariaDB, or mail behavior in PHP.

Do not create database tables until the JSON model stabilizes.

Do not treat these examples as mandatory bundled applications for all Hubzilla users.

Do not treat the static JSON example as a supported runtime format until the schema is reviewed and approved.

## Current framework hypothesis

The JSON Form Runtime should be able to load bounded service definitions and compose them into larger products.

The central framework questions are:

```text
What is a webform?
What is a collection?
What does a service contract require?
How do outputs become inputs?
How are records stored and exported?
How does the left-side navigation represent composition?
How are private settings separated from exportable records?
How much of the JSON shape can be validated before any service executes?
```

## Current next step

Review the initial schema draft for general Hubzilla utility.

The review should ask:

- Is the vocabulary too large for a first implementation?
- Is anything application-specific leaking into the framework?
- Are private settings and exportable records clearly separated?
- Does the schema describe enough to render static forms later?
- Does the schema avoid promising external service execution?
- Can Hubzilla users use this for purposes unrelated to the pilot examples?
