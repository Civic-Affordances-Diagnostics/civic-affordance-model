# IPFS CID Mapping Webform Design

## Status

Design document only.

This document pins requirements for the first real JSON-defined webform example. It does not implement IPFS, Gitea, pinning, scheduling, repository writes, JSON loading, runtime rendering, API calls, file writes, or database writes.

## Catalog entry

The collection should list itself in the Catalog as:

```text
CID Mapping
```

This is a JSON collection and service design, not a Hubzilla built-in default.

## Design purpose

The purpose of `CID Mapping` is to connect content-addressed storage to human-readable, repository-backed paths.

IPFS provides the content-addressed object identity.

Gitea provides a repository path layer that can organize CID-related records using POSIX-style path conventions and versioned commits.

The webform collection provides the service contract that binds those layers together.

## Core design principle

```text
IPFS identifies content.
Gitea organizes mappings.
Webforms declares the service contract.
```

The collection should not pretend that IPFS has a native administrative file hierarchy.

The collection should not treat Gitea as the content store of record when the CID is the content-addressed reference.

The collection should use Gitea as a versioned, browsable, path-based index and management layer for CID mappings.

## Initial sub-webforms

The first IPFS/Gitea design should be decomposed into bottom-level sub-webforms.

```text
IPFS Publish
IPFS Pin Request
IPFS Schedule Pin
IPFS Map Pin
IPFS Gitea Browse
```

These are the primitive service steps that a larger `CID Mapping` collection may later orchestrate.

## Sub-webform: IPFS Publish

### Purpose

Accept a document or content reference and produce a CID record.

### Declared inputs

Possible future inputs:

- file or document reference
- filename
- source path or upload reference
- MIME type or filetype hint
- subject tag
- jurisdiction tag, if applicable
- owner/controller identifier

### Declared outputs

Possible future outputs:

- CID
- content metadata
- source filename
- filetype
- size, if known
- publish timestamp
- verification status
- error result, if publish fails

### Service guarantee fields

Possible future guarantee fields:

- content accepted
- CID produced
- CID verified
- failure reason recorded

## Sub-webform: IPFS Pin Request

### Purpose

Create a request to pin a CID.

### Declared inputs

Possible future inputs:

- CID
- owner/controller identifier
- requested pinning provider or node
- requested duration policy
- payment or support willingness flag, if applicable
- service terms reference, if applicable

### Declared outputs

Possible future outputs:

- pin request record
- requested provider/node
- requested duration
- status
- timestamp
- error result, if request fails

### Service guarantee fields

Possible future guarantee fields:

- CID accepted for pin request
- pin request recorded
- pin request submitted
- pin request rejected
- failure reason recorded

## Sub-webform: IPFS Schedule Pin

### Purpose

Attach a time policy to a pin request.

### Declared inputs

Possible future inputs:

- CID
- pin request identifier
- start date
- end date
- between-dates rule
- duration
- renewal policy
- expiration behavior

### Declared outputs

Possible future outputs:

- scheduled pin record
- effective date range
- duration rule
- renewal/expiration rule
- status
- timestamp

### Service guarantee fields

Possible future guarantee fields:

- schedule accepted
- schedule validated
- schedule recorded
- schedule conflict detected
- failure reason recorded

## Sub-webform: IPFS Map Pin

### Purpose

Map a pinned or publishable CID to one or more Gitea repository paths.

### Declared inputs

Possible future inputs:

- CID
- filename
- subject
- filetype
- jurisdiction or locality, such as `kane-il`
- repository identifier
- path projection rule
- pin status reference

### Declared outputs

Possible future outputs:

- CID/path mapping record
- list of paths written or proposed
- repository reference
- commit reference, if written
- verification status
- timestamp
- error result, if mapping fails

### Path projection examples

A single CID may have more than one valid repository path projection.

Examples:

```text
kane-il/subject/filename
kane-il/filetype/subject
subject/kane-il/cid
```

These path forms represent different browsing and governance needs.

`kane-il/subject/filename` supports jurisdiction-first browsing.

`kane-il/filetype/subject` supports records-management browsing.

`subject/kane-il/cid` supports subject-first audit trails.

### Design decision

Do not force one canonical path too early.

The JSON should allow a collection to declare multiple path projections for the same CID.

Each projection should be named and explain its purpose.

## Sub-webform: IPFS Gitea Browse

### Purpose

Browse, inspect, or export repository-backed CID mappings.

### Declared inputs

Possible future inputs:

- repository identifier
- path prefix
- subject filter
- jurisdiction filter
- filetype filter
- CID filter
- date range filter

### Declared outputs

Possible future outputs:

- visible mapping list
- selected mapping record
- exported JSON index
- repository path reference
- commit reference, if available

### Service guarantee fields

Possible future guarantee fields:

- repository index loaded
- mapping found
- mapping not found
- selected record exported
- failure reason recorded

## Collection orchestration

The `CID Mapping` collection may eventually orchestrate the primitive sub-webforms in this order:

```text
IPFS Publish
  -> IPFS Pin Request
  -> IPFS Schedule Pin
  -> IPFS Map Pin
  -> IPFS Gitea Browse
```

The collection should also allow partial use when appropriate.

Examples:

- A user may already have a CID and only need `IPFS Pin Request`.
- A user may already have a pinned CID and only need `IPFS Map Pin`.
- A user may only need to browse existing mappings.

## Required framework capabilities exposed by this example

This example suggests that the framework will eventually need to support:

- Catalog entries
- cascading left navigation
- sub-webforms
- collection orchestration
- shared collection configuration
- service action declarations
- input/output contracts
- validation declarations
- handoff declarations
- multi-path projection rules
- result records
- service guarantee records
- import/export records
- offline design and inspection
- optional online execution through later processors

## Candidate JSON design areas

This document does not define final JSON syntax, but it identifies the areas the syntax must be able to describe.

### Collection metadata

Possible metadata fields:

```text
id
name
description
version
catalog_label
collection_type
maintainer
license
```

### Navigation

Possible navigation fields:

```text
menu_label
menu_order
parent_menu
sub_webform_targets
```

### Forms

Possible form fields:

```text
form_id
title
description
field_groups
fields
actions
result_panels
```

### Validation

Possible validation fields:

```text
required
format
pattern
allowed_values
minimum
maximum
date_order
path_safety
cid_format
```

### Service contract

Possible service fields:

```text
service_id
service_type
inputs
outputs
action_boundary
requires_online_service
expected_result_schema
failure_result_schema
```

### Handoff

Possible handoff fields:

```text
emits
consumes
compatible_with
required_previous_result
optional_previous_result
```

### Storage/export

Possible storage fields:

```text
record_type
record_id_strategy
local_json_filename
exportable
restorable
retention_hint
```

## Path safety requirement

Because this design maps CIDs to repository paths, the framework should eventually include path-safety validation.

The JSON design should be able to prohibit unsafe path forms such as:

```text
../outside-path
/absolute/path
path//with//empty-segment
path/with/control-character
```

The JSON design should also be able to normalize or reject invalid path characters according to the collection's declared repository policy.

## Credential boundary

The design may eventually involve IPFS provider tokens, Gitea tokens, or pinning service credentials.

Credentials must not be treated as ordinary exported records.

Future design must distinguish:

- user-supplied secrets
- non-secret configuration
- exported records
- public mapping records
- service logs

No credential storage behavior is authorized by this document.

## Public/private boundary

CID mappings may be public, private, or restricted depending on content and owner intent.

The JSON design should eventually declare visibility for records and exports.

Possible visibility categories:

```text
private
channel-visible
collection-visible
public
federated
```

These are design placeholders only.

## Open questions

- Should `CID Mapping` be a collection containing all five sub-webforms, or should it first be documented as a single webform that later splits into five?
- Should path projections be declared at the collection level, the sub-webform level, or both?
- Should Gitea paths store mapping JSON files, human-readable index files, or both?
- What is the minimum mapping record required before any service execution exists?
- How should private CIDs and public repository paths be handled?
- What should be considered a successful pin verification?

## Current decision

`CID Mapping` is the first real design example for the JSON Form Runtime.

It should remain a documentation-only design until the framework schema is approved.
