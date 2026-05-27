# Webforms Design Examples Index

## Status

Design document only.

This index tracks example webforms and collections used to shape the JSON Form Runtime before implementation.

## Purpose

The project should not design the framework from abstract theory alone.

The framework should be shaped by several concrete service examples, each testing a different kind of requirement.

The first examples are:

```text
IPFS / CID Mapping
Placekey / Address Validation
one additional example to be selected
```

After at least these examples are documented, the framework can be analyzed for common requirements and a first schema draft can take shape.

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
not yet created
```

This example should test:

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

## Example 3: To be selected

The third example should test requirements not fully covered by IPFS/CID Mapping or Placekey validation.

Possible candidates:

```text
LDAP schema/import workflow
MariaDB migration workflow
document attestation workflow
email/newsletter workflow
JSON backup/restore workflow
```

Selection criteria:

- exposes a different class of validation
- produces a different class of output record
- demonstrates another form of handoff
- helps identify general framework requirements
- remains useful outside Civic Infrastructure

## Analysis plan after examples

After the first three examples are documented, compare them for shared requirements.

The comparison should identify:

- common metadata fields
- common navigation fields
- common form/page/field definitions
- common validation rule types
- common service contract fields
- common result record fields
- common handoff declarations
- common storage/export declarations
- special cases that should not be forced into the core framework

The result should be a conservative first schema draft.

## Guardrails

Do not implement runtime behavior from these examples yet.

Do not add Civic Infrastructure-specific defaults to the `webforms` addon.

Do not hard-code IPFS, Gitea, Placekey, LDAP, MariaDB, or Civic behavior in PHP.

Do not create database tables until the JSON model stabilizes.

Do not treat these examples as mandatory bundled applications for all Hubzilla users.

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
```
