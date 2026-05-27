# Initial JSON Schema Draft for JSON-Composed Web Forms

## Status

Design document only.

This document proposes the first conservative schema shape for the Hubzilla `webforms` addon. It does not implement JSON loading, form rendering, service execution, file writes, database writes, credential storage, background jobs, external connectors, or bundled application defaults.

The purpose is to name the framework concepts that appear across the first three pilot examples:

```text
IPFS / CID Mapping
Placekey / Address Validation
Bare-Bones Email Client
```

## Contribution posture

The addon should be presented as:

```text
JSON-Composed Web Forms for Hubzilla
```

It should not be branded as Civic Infrastructure, Affordance tooling, Affected-Status tooling, IPFS tooling, address tooling, or email tooling.

The pilot examples are only design pressure tests. They exist to discover what a useful general-purpose Hubzilla addon needs.

## Current conclusion

The three pilot examples show that the framework needs a schema language for:

- catalog entries
- collections
- cascading navigation
- service-capable webforms
- pages and field groups
- fields and controls
- validation rules
- service contracts
- result records
- handoff declarations
- storage/export policy
- private settings
- visibility and retention
- offline/online boundaries

The framework is ready for an initial static schema draft.

The framework is not ready for runtime coding.

## Schema design principle

The schema should describe what the webform is and what it expects.

The schema should not hide implementation behavior.

A valid JSON collection should be inspectable before any code executes. A Hubzilla administrator, user, or developer should be able to open the JSON and understand:

- what the collection is called
- what menus it adds
- what forms it exposes
- what fields it asks for
- what validation rules it declares
- what service action it represents
- what outputs it claims to emit
- what records it stores or exports
- what private settings it uses
- what external services are required for execution

## Top-level JSON kinds

The first schema should recognize two top-level authoring units.

```text
collection
webform
```

### collection

A `collection` is a package of one or more webforms, pages, shared settings, navigation definitions, and handoff rules.

Examples:

```text
CID Mapping
Placekey Address Validation
Bare-Bones Email Client
```

### webform

A `webform` is a bounded form/service unit. It may be standalone or part of a collection.

Examples:

```text
IPFS Publish
IPFS Pin Request
Verify Single Address
Compose Short Message
Save Forwarding Address
```

## Minimal top-level collection shape

A conservative collection shape should include:

```text
schema_version
kind
id
label
description
catalog
navigation
settings
webforms
handoffs
storage
visibility
retention
```

Candidate skeleton:

```json
{
  "schema_version": "webforms.collection.v0.1-draft",
  "kind": "collection",
  "id": "example.collection",
  "label": "Example Collection",
  "description": "Short human-readable description.",
  "catalog": {},
  "navigation": [],
  "settings": [],
  "webforms": [],
  "handoffs": [],
  "storage": {},
  "visibility": {},
  "retention": {}
}
```

## Catalog object

The catalog object describes how an installed or imported collection may appear to the user.

It should not imply that a collection is bundled by default.

Candidate fields:

```text
label
description
category
tags
visible
order
```

Example:

```json
{
  "catalog": {
    "label": "CID Mapping",
    "description": "Map content identifiers to repository paths.",
    "category": "Storage",
    "tags": ["documents", "mapping", "repository"],
    "visible": true,
    "order": 100
  }
}
```

## Navigation objects

Navigation should be JSON-composed, not hard-coded in PHP.

The first design only needs enough structure to represent cascading left-side navigation.

Candidate fields:

```text
id
label
parent
kind
target
order
```

Where `kind` may be:

```text
collection
webform
page
external_help
separator
```

Example:

```json
{
  "id": "nav.publish",
  "label": "IPFS Publish",
  "parent": "nav.cid_mapping",
  "kind": "webform",
  "target": "webform.ipfs_publish",
  "order": 10
}
```

## Settings objects

Settings describe user or collection configuration.

Settings must distinguish private settings from ordinary records.

The first schema should support:

```text
private_user_setting
collection_setting
non_secret_configuration
secret_reference
```

Examples from the pilot designs:

```text
Placekey API key
Gitea token
pinning provider token
saved external forwarding address
mailbox account reference
```

Candidate fields:

```text
id
label
type
scope
secret
exportable
required
validation
```

Important boundary:

```text
Secrets and private account settings are not ordinary exported records.
```

## Webform object

A webform should define one bounded unit of user interaction and service intent.

Candidate fields:

```text
id
label
description
role
pages
fields
actions
service
results
storage
visibility
retention
```

The `role` field should describe the webform's purpose without tying the framework to one service type.

Candidate roles:

```text
compose
verify
publish
pin
schedule
map
browse
import
export
configure
```

These are vocabulary hints, not PHP method names.

## Page object

A webform may have one or more pages.

Candidate fields:

```text
id
title
description
groups
actions
result_panels
```

Most early webforms should use one page.

Multi-page workflows should not be introduced until the single-page shape is stable.

## Field group object

Field groups organize related controls.

Candidate fields:

```text
id
label
description
fields
order
```

Example uses:

```text
Message
Address Input
Pin Schedule
Repository Mapping
Private Settings
```

## Field object

Fields describe controls, data capture, and display hints.

Candidate fields:

```text
id
label
type
help
placeholder
required
readonly
source
validation
storage_key
exportable
```

Candidate field types:

```text
text
textarea
email
date
datetime
number
integer
select
checkbox
hidden
readonly
secret
secret_reference
file_reference
json_text
result_summary
result_table
```

The schema should not require every renderer to support every field type at first.

The first implementation can support a minimal subset after the schema is approved.

## Validation object

Validation rules should be declared in JSON.

Candidate common validators:

```text
required
min_length
max_length
pattern
allowed_values
email_single
date_order
rolling_window_days
no_attachments
path_safe
cid_format
json_parseable
record_shape
```

The pilot examples show why validation must support both general and named domain validators.

General validators:

```text
required
max_length
allowed_values
date_order
email_single
```

Named domain validators:

```text
cid_format
path_safe
placekey_result_shape
mail_recent_window
```

Named domain validators should be declared as requirements but not implemented until a validator registry exists.

## Action object

An action is the user's visible action button or command.

Candidate fields:

```text
id
label
kind
requires_confirmation
service_target
success_result_panel
failure_result_panel
```

Candidate action kinds:

```text
validate
save_setting
submit_service_request
send
forward
browse
export
import
```

An action declaration is not an implementation.

It should describe user intent and expected result routing.

## Service contract object

A service contract describes what external, local, or manual service step the webform represents.

Candidate fields:

```text
id
type
mode
requires_online_service
inputs
outputs
success_result_schema
failure_result_schema
guarantees
side_effects
credential_requirements
```

Candidate `mode` values:

```text
offline_record_only
manual
local_service
remote_api
server_adapter
```

Candidate `type` values should be descriptive, not hard-coded framework behavior.

Examples:

```text
ipfs.publish
ipfs.pin_request
repository.path_map
address.verify
address.batch_validate
mail.compose_send
mail.manual_forward
settings.save_private
```

## Service guarantees

A service guarantee is a recordable claim about what the service attempted, completed, verified, or failed to verify.

Examples:

```text
input accepted
input validated
CID produced
pin requested
repository path written
address verified
message sent
manual forward attempted
failure reason recorded
```

The schema should treat guarantees as explicit output fields or result flags.

They should not be hidden in logs only.

## Result object

Each service-capable webform should declare the result record it emits.

Candidate fields:

```text
record_type
record_id_strategy
fields
status_field
created_at_field
source_webform
exportable
visibility
retention
```

Common status values:

```text
draft
submitted
completed
failed
verified
rejected
not_found
skipped
```

The schema should support failure records. Failures are useful outputs, not merely errors.

## Handoff object

A handoff declares how one webform's output can become another webform's input.

Candidate fields:

```text
id
from_webform
from_result
emits
to_webform
consumes
required
optional
mapping
```

Examples:

```text
IPFS Publish emits CID consumed by IPFS Pin Request.
Placekey validation emits address/result records consumed by a directory import workflow.
Compose Short Message emits a send-attempt record, but it may not feed another workflow.
```

The schema should allow some webforms to have no downstream handoff.

## Storage object

Storage describes where records may be held and how they may be exported.

Candidate fields:

```text
record_store
local_json_filename
per_user
exportable
restorable
retention_policy
private_fields
public_fields
```

Initial storage direction remains local-first JSON records.

Possible later storage targets may include:

```text
Hubzilla cloud/file storage
addon-specific storage
MariaDB tables
external service storage
```

Those targets are not authorized by this schema draft.

## Visibility object

Visibility should be declared per collection, webform, and/or result type.

Candidate values:

```text
private
channel-visible
collection-visible
site-visible
public
federated
```

The first runtime does not need to implement all visibility modes. The schema should record the author's intent so it is not guessed later.

## Retention object

Retention describes how long records are expected to remain useful or visible.

Candidate fields:

```text
policy
window_days
expires_after
server_managed
notes
```

Examples:

```text
Email client: message list is limited to the last 30/31 days and older mail is deleted by the mail server.
CID Mapping: mappings may have explicit pin duration and renewal policy.
Placekey validation: failed validation records may be retained for audit or correction.
```

## Credential and private setting boundary

The schema must explicitly separate:

```text
secret values
secret references
private user settings
ordinary records
exportable records
public records
service logs
```

The initial schema should permit references to credentials but should not define credential storage behavior.

Example:

```json
{
  "id": "setting.placekey_api_key",
  "label": "Placekey API Key",
  "type": "secret_reference",
  "scope": "private_user_setting",
  "secret": true,
  "exportable": false
}
```

## Offline/online boundary

The schema should be meaningful offline.

Offline-safe parts:

```text
collection metadata
navigation
form definitions
validation declarations
record shapes
storage/export declarations
handoff declarations
static examples
```

Online or service-dependent parts:

```text
IPFS publishing
pinning confirmation
Gitea repository writes
Placekey verification
mail sending
mailbox reads
manual forwarding execution
```

A collection should be inspectable and partially usable without service execution.

## Minimal framework vocabulary for v0.1-draft

The first draft should use only this core vocabulary unless a pilot example proves another concept is required:

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

## What should not be in the first schema

Do not include yet:

- PHP callback names
- JavaScript function names
- SQL table definitions
- background job definitions
- hard-coded IPFS adapters
- hard-coded Placekey adapters
- hard-coded mail adapters
- Civic Infrastructure defaults
- theming details
- channel routing changes
- automatic workflow execution
- credential persistence rules

## Framework readiness assessment

The three pilot examples justify a schema draft because they share the same structural needs.

They do not justify implementation yet because several details still need review:

- exact JSON names
- minimum required fields
- validator registry design
- service adapter boundary
- storage location
- Hubzilla permission mapping
- import/export behavior
- private setting handling

## Current recommendation

Proceed with a static JSON schema example and reviewer discussion.

Do not code the runtime until the schema vocabulary is accepted as a reasonable starting point.
