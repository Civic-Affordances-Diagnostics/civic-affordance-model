# Pilot Examples Framework Comparison

## Status

Design document only.

This document compares the first three pilot examples for the Hubzilla `webforms` addon and extracts conservative framework requirements for JSON-Composed Web Forms.

This document does not authorize implementation of JSON loading, runtime rendering, external service calls, mail access, IPFS behavior, Placekey behavior, Gitea behavior, file writes, database writes, credential storage, background jobs, or bundled application defaults.

## Purpose

The first three examples were selected to test the proposed framework from different directions before defining an initial schema.

The comparison is intentionally focused on general Hubzilla utility.

The addon should remain a neutral Hubzilla contribution:

```text
JSON-Composed Web Forms
```

It should not be framed as Civic Infrastructure, Affordances, Affected Status, IPFS tooling, address validation tooling, or email tooling.

Each example is a test case that helps identify reusable framework needs.

## Pilot examples compared

```text
IPFS / CID Mapping
Placekey / Address Validation
Bare-Bones Email Client
```

Each example has general utility outside any one project.

### IPFS / CID Mapping

General utility:

- publishing content-addressed records
- pinning or requesting preservation
- mapping content identifiers to human-readable repository paths
- creating auditable index records
- browsing/exporting repository-backed mappings

Primary framework stress test:

```text
content reference -> service action -> durable mapping record -> browse/export layer
```

### Placekey / Address Validation

General utility:

- validating user-submitted addresses
- normalizing location records
- generating candidate records from source datasets
- classifying validation failures
- handing structured records to a downstream directory or database workflow

Primary framework stress test:

```text
source data -> candidate generation -> external validation -> result classification -> downstream handoff
```

### Bare-Bones Email Client

General utility:

- short plain-text message composition
- recent sent/received message display
- strict field constraints
- manual forwarding to one saved address
- private per-user configuration
- alignment between UI constraints and server-side mail policy

Primary framework stress test:

```text
private setting + constrained input + external mailbox action + short-lived records
```

## High-level comparison

| Requirement area | CID Mapping | Placekey Validation | Bare-Bones Email | Framework implication |
|---|---|---|---|---|
| Catalog listing | Needs `CID Mapping` collection | Needs address-validation collection/service | Needs email-client collection/service | Catalog entries must be generic and content-neutral. |
| Cascading navigation | Needs sub-webforms for publish, pin, schedule, map, browse | Needs configure, verify, import, attach, generate, validate, export, handoff | Needs settings, recent messages, compose, forward | Navigation must be JSON-driven and support collections composed from sub-webforms. |
| Simple first form | Possible CID/pin/map form | API key + address + verify | recipient + subject + body + send | The runtime must support both small standalone forms and larger compositions. |
| External service boundary | IPFS, pinning provider, Gitea | Placekey, TIGER/Census source, directory target | mail server, mailbox, milter policy | JSON must declare service expectations without hard-coding service clients into PHP. |
| Validation type | CID format, path safety, date range | address fields, generated ranges, source classification | email address, one recipient, max subject/body length | Validation must be declarative and extensible. |
| Result records | CID, pin status, path mapping, commit ref | normalized address, Placekey, success/failure class | send attempt, forward attempt, recent message summary | Results need a common envelope with service-specific payloads. |
| Handoff | CID feeds pinning and mapping | candidate/results feed export and directory handoff | selected message feeds forwarding | Outputs and inputs need declared types and compatibility. |
| Private configuration | provider tokens or repository credentials | API key and credential reference | forwarding address and mailbox credentials | Secrets/private settings must be distinct from exportable records. |
| Retention/window | pin duration and mapping history | dataset year, batch records, exports | rolling 30/31-day mailbox window | Retention and visibility policies must be declared. |
| Offline viability | definitions, mappings, exports inspectable offline | definitions, candidates, stored results inspectable offline | definitions/settings/result records inspectable offline | JSON definitions and records should remain useful without live services. |
| Online execution | publish/pin/write/browse requires services | API validation/import/handoff requires services | mail read/send/forward requires services | Runtime must distinguish design/rendering from service execution. |

## Common framework requirements

The three examples point to a shared framework, not three separate application implementations.

The smallest common framework should support the following concepts.

## 1. Catalog layer

The framework needs a Catalog of available JSON collections and standalone webforms.

The Catalog should describe what is available, not what is mandatory.

Candidate fields:

```text
id
label
description
version
category
tags
status
maintainer
license
visibility
entry_type
```

`entry_type` may distinguish:

```text
collection
standalone_webform
sub_webform
```

The Catalog must not imply that a collection is bundled as a Hubzilla default.

## 2. Collection layer

A collection groups related webforms into a coherent product while preserving the individual sub-webforms.

Candidate fields:

```text
collection_id
name
description
version
catalog_label
included_webforms
shared_configuration
shared_records
navigation
orchestration
storage_policy
visibility_policy
```

A collection should declare:

- included sub-webforms
- intended order
- optional/skippable steps
- shared configuration
- shared records
- resume behavior
- export behavior
- public/private boundaries

## 3. Navigation layer

The left-side navigation should be driven by JSON.

It should support simple menus first and cascading menus later.

Candidate fields:

```text
menu_id
label
parent
order
target_type
target_id
visible_when
enabled_when
```

Candidate target types:

```text
collection
webform
settings_page
result_browser
export_page
help_page
```

The navigation layer should not contain business logic. It should point to declared forms, pages, and result views.

## 4. Webform/service-unit layer

A webform is a bounded service unit.

It may be as small as a single form, or it may be one step inside a collection.

Candidate fields:

```text
webform_id
label
description
role
pages
fields
actions
service_contract
result_schema
handoff
storage_policy
```

Candidate roles:

```text
settings
input
verification
import
export
browse
compose
forward
handoff
```

The role should help the runtime and users understand intent without hard-coding service behavior.

## 5. Display schema

The display schema describes what the user sees.

Candidate elements:

```text
page
section
field_group
field
action_button
result_panel
warning_panel
help_text
```

This layer should support ordinary Hubzilla users composing forms without writing PHP.

Required early controls:

```text
text
textarea
password_or_secret_reference
email
select
checkbox
date
date_range
hidden_or_computed_reference
readonly_result
```

A later version may add richer controls, but the first framework should avoid unnecessary complexity.

## 6. Data schema

The data schema describes accepted and emitted records.

The same display field may map to a data field, but display and data should remain distinguishable.

Candidate fields:

```text
field_id
record_key
type
required
repeatable
source
classification
```

Candidate data types:

```text
string
text
integer
boolean
date
datetime
email_address
cid
path
url
json_object
json_array
reference
```

The data schema must support both user-entered values and service-generated values.

## 7. Validation layer

Validation must be JSON-declared, not hard-coded in PHP per application.

Common validation rules from the three examples:

```text
required
max_length
min_length
format
pattern
one_value_only
no_attachments
plain_text_only
email_address
cid_format
path_safety
date_order
rolling_date_window
allowed_values
numeric_range
record_classification
```

Example-specific validation should be allowed without forcing every application to use it.

The first framework should define a small core rule set and allow future extension.

## 8. Service contract layer

A service contract declares what action a webform represents.

It does not mean the action is implemented in the current phase.

Candidate fields:

```text
service_id
service_label
service_type
action_boundary
requires_online_service
requires_credentials
inputs
outputs
success_result
failure_result
warning_result
processor_hint
```

Candidate service types from the examples:

```text
publish
pin_request
schedule
map
browse
configure
verify
import
generate
validate_batch
export
handoff
read_recent
compose_send
manual_forward
```

The framework should not hard-code IPFS, Placekey, Gitea, mail, LDAP, MariaDB, or any other service into PHP as a special case.

## 9. Result-record layer

All three examples need result records.

A common result envelope should exist, with service-specific payloads inside it.

Candidate common envelope:

```text
record_id
record_type
webform_id
collection_id
created_at
created_by
status
input_reference
output_payload
warnings
errors
service_guarantees
visibility
exportable
```

Candidate statuses:

```text
draft
submitted
accepted
completed
partial
failed
rejected
unavailable
skipped
```

The result envelope should be useful even when the payload differs radically between examples.

## 10. Service-guarantee layer

A service guarantee is a recorded claim about what happened or what was verified.

It is not necessarily a legal guarantee.

Examples:

```text
input accepted
input validated
CID produced
pin requested
path mapping recorded
address normalized
Placekey returned
candidate rejected
message submitted
forward attempt recorded
external service unavailable
failure reason recorded
```

The framework should make these claims explicit record fields instead of hidden assumptions.

## 11. Handoff layer

Outputs from one webform must be able to become inputs to another.

Candidate fields:

```text
emits
consumes
compatible_with
required_previous_result
optional_previous_result
mapping_hint
```

Examples:

```text
CID Mapping:
  IPFS Publish emits CID
  IPFS Pin Request consumes CID
  IPFS Map Pin consumes CID and pin status

Placekey:
  Candidate Generation emits address candidates
  Batch Validation consumes address candidates
  Directory Handoff consumes validated address records

Email:
  Recent Messages emits selected message reference
  Email Forward consumes selected message reference and saved forwarding address
```

The first schema should support declarations of compatibility. It does not need to implement automated orchestration immediately.

## 12. Storage/export layer

The framework should treat JSON records as first-class storage artifacts.

Candidate fields:

```text
record_type
record_id_strategy
local_json_filename
storage_scope
exportable
restorable
retention_hint
visibility
```

Candidate storage scopes:

```text
collection_record
user_private_setting
credential_reference
service_log
export_record
public_index
```

Important boundary:

```text
Secrets and private account settings are not ordinary export records.
```

## 13. Credential and private-setting boundary

The examples all need some form of credential or private configuration boundary.

CID Mapping may need IPFS/Gitea/pinning credentials.

Placekey needs an API key.

Email needs mailbox credentials or account references and one private forwarding address.

The framework should distinguish:

```text
secret value
secret reference
non-secret configuration
private account setting
exportable record
public record
service log
```

The first design should allow secret references, but not implement credential storage.

## 14. Visibility and retention layer

Records may have different visibility and retention rules.

Candidate visibility values:

```text
private
channel_visible
collection_visible
public
federated
```

Candidate retention declarations:

```text
none
rolling_days
calendar_range
until_date
pinned_duration
server_managed
manual_delete
```

Examples:

- CID mappings may be public or private.
- Placekey batch results may be exportable but not public.
- Email messages are visible only within a rolling 30/31-day window because the mail server deletes older messages.

## 15. Offline/online boundary

The framework should be valuable offline.

Offline-capable parts:

```text
JSON collection definitions
form definitions
validation rules
stored JSON records
import/export records
handoff declarations
schema inspection
manual review
```

Online or local-service-dependent parts:

```text
IPFS publish/pin
Gitea write/browse through API
Placekey API verification
TIGER/Census source download, if remote
mail read/send/forward
LDAP import
MariaDB migration
```

The JSON Form Runtime should not assume every service is available at render time.

## Requirements that should not be forced into the core

The comparison also identifies things that should remain outside the first framework core.

Do not force the core framework to implement:

- IPFS-specific behavior
- Gitea-specific behavior
- Placekey-specific behavior
- Census/TIGER-specific behavior
- mail-server behavior
- LDAP behavior
- MariaDB behavior
- background job scheduling
- credential vault behavior
- automatic forwarding
- attachment handling
- canonical civic defaults
- one mandatory storage backend
- one mandatory path convention
- one mandatory workflow engine

The core should provide neutral declaration structures. Specific services should remain JSON-defined capabilities and later processors/connectors.

## Conservative first schema direction

The first schema should probably define these top-level object types:

```text
catalog_entry
collection
webform
page
field_group
field
validation_rule
action
service_contract
result_schema
handoff
storage_policy
visibility_policy
retention_policy
```

The first schema should avoid declaring a full workflow engine.

A collection can declare order and compatibility before the runtime knows how to automate every transition.

## Recommended first framework milestone

The next design milestone should be a static JSON schema draft for the minimum viable framework.

It should be able to describe:

```text
one catalog entry
one collection
several sub-webforms
left-side navigation entries
one or more pages per webform
field groups
fields
basic validation rules
action declarations
result-record declarations
handoff declarations
storage/export policies
private-setting and credential-reference boundaries
```

This milestone should still avoid implementation.

## Readiness assessment

The framework is ready for an initial schema draft.

It is not ready for runtime coding.

The three examples provide enough evidence to define common vocabulary and structure.

They do not yet justify implementing external service connectors, credential storage, background jobs, database tables, or automatic orchestration.

## Current decision

The first framework should be designed as a neutral JSON-Composed Web Forms capability for Hubzilla.

The examples should remain documentation-only pilots used to shape the schema.

The next document should define the first conservative JSON schema draft.
