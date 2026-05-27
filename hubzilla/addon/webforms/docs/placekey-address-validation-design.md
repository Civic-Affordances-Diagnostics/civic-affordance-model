# Placekey Address Validation Webform Design

## Status

Design document only.

This document pins requirements for a second JSON-defined webform example. It does not implement Placekey calls, Census/TIGER processing, JSON loading, runtime rendering, API calls, file writes, database writes, LDAP behavior, MariaDB behavior, or bundled application defaults.

## Catalog entry

The collection or service should list itself in the Catalog as:

```text
Placekey Address Validation
```

This is an optional JSON collection and service design. It is not a Hubzilla built-in default and should not be hard-coded into PHP.

## Design purpose

The purpose of `Placekey Address Validation` is to describe a reusable address-validation service workflow.

The simple form verifies one pasted address against Placekey.

The larger service workflow uses Census/TIGER-derived street and address-range data to generate or validate candidate addresses, then sends candidates through Placekey or a comparable address-resolution service.

The durable product is not only a user-visible answer. It is a structured record of:

- input address or generated candidate
- normalization result
- source data used
- Placekey response or failure
- validation confidence
- downstream handoff status

## Core design principle

```text
TIGER/Census suggests candidate address ranges.
Placekey resolves physical-place identifiers.
Webforms declares the service contract and records the result.
```

The collection should not treat a TIGER address range as proof that every structure exists.

The collection should not treat an external API response as an undocumented side effect.

The collection should record both successes and failures so later webforms can consume the result safely.

## Initial simple form

The first visible form should be conceptually small:

```text
API key
single-line address
Verify button
result panel
```

Example address:

```text
102 S. Second Street West Dundee IL 60118
```

The expected result is one of:

```text
Placekey result
no result
ambiguous result
API/authentication failure
validation failure
service unavailable
```

## Candidate sub-webforms

The broader design should be decomposed into bottom-level sub-webforms.

```text
Placekey Configure API
Placekey Verify Single Address
TIGER/Census Source Import
Street Place Attachment
Address Range Candidate Generation
Placekey Batch Validate Candidates
Address Result Export
Directory Handoff
```

These are primitive service steps that a larger address-validation collection may later orchestrate.

## Sub-webform: Placekey Configure API

### Purpose

Accept configuration needed to call the Placekey API or a compatible address-resolution processor.

### Declared inputs

Possible future inputs:

- API key
- API endpoint identifier
- request mode
- rate-limit hint
- credential label
- credential visibility policy

### Declared outputs

Possible future outputs:

- non-secret configuration record
- credential reference, not the credential value
- configuration validation status
- failure result, if configuration is invalid

### Credential boundary

Credentials must not be treated as ordinary exported records.

The JSON design must distinguish:

- secret credential values
- credential references
- non-secret configuration
- exported validation records
- public records
- service logs

No credential storage behavior is authorized by this document.

## Sub-webform: Placekey Verify Single Address

### Purpose

Accept one pasted address and return a Placekey result or a structured failure result.

### Declared inputs

Possible future inputs:

- single-line address
- parsed street address
- city
- region/state
- postal code
- country code
- optional latitude
- optional longitude
- optional location name
- API configuration reference

### Declared outputs

Possible future outputs:

- submitted address
- normalized address fields
- Placekey
- address Placekey, if returned
- building Placekey, if returned
- confidence score, if returned
- provider-specific identifiers, if returned
- response timestamp
- request status
- failure reason, if any

### Validation expectations

Possible validation fields:

```text
required
single_line_address_format
country_code
postal_code_format
state_or_region_format
api_key_reference_present
maximum_input_length
```

The first design should not overfit to one address parser. The JSON should be able to describe both single-line and field-separated input.

## Sub-webform: TIGER/Census Source Import

### Purpose

Declare source data used to generate or validate candidate addresses.

### Declared inputs

Possible future inputs:

- county or county-equivalent identifier
- state identifier
- Census/TIGER year
- source dataset type
- local file reference
- download/source reference
- street layer or address-range layer reference
- import scope

### Declared outputs

Possible future outputs:

- source import record
- source dataset metadata
- selected geography
- street/address range records available
- import timestamp
- warning list
- failure reason, if import fails

### Design caution

TIGER/Census address range data describes potential address ranges. It should not be recorded as confirmed structure existence.

The framework should allow the result to classify records as:

```text
source_range
candidate_address
validated_address
failed_validation
ambiguous_validation
```

## Sub-webform: Street Place Attachment

### Purpose

Attach street names or address ranges to a place context such as city, village, town, unincorporated area, county, ZIP code, or other declared geography.

### Declared inputs

Possible future inputs:

- street name
- street segment identifier
- address range identifier
- ZIP code
- municipality/place name
- county
- state
- unincorporated-area flag or label
- source geography layer

### Declared outputs

Possible future outputs:

- street/place attachment record
- attached locality
- attached postal code
- attachment confidence
- conflict warning
- source references

### Validation expectations

Possible validation fields:

```text
place_required
zip_required
state_required
street_name_required
range_side_required_if_available
conflict_policy
```

## Sub-webform: Address Range Candidate Generation

### Purpose

Generate candidate address strings from a validated source range and place context.

### Declared inputs

Possible future inputs:

- street name
- low address number
- high address number
- parity rule
- side-of-street hint
- city/place
- state
- postal code
- range step policy
- suppression/confidentiality policy

### Declared outputs

Possible future outputs:

- generated candidate list
- candidate count
- range metadata
- skipped values
- warning list
- generation timestamp

### Design caution

Candidate generation must not silently assert that every candidate is real.

A generated candidate is only a candidate until a validation service, authoritative local source, or other declared process confirms it.

Example conceptual output classes:

```text
1 STREETNAME CITY ZIP -> candidate
2 STREETNAME CITY ZIP -> candidate
3 STREETNAME CITY ZIP -> skipped by parity rule or candidate depending on source rule
```

The exact generation policy should be declared in JSON, not hard-coded.

## Sub-webform: Placekey Batch Validate Candidates

### Purpose

Send candidate addresses through Placekey or a compatible processor and record one result per candidate.

### Declared inputs

Possible future inputs:

- candidate address list
- API configuration reference
- batch size
- rate-limit policy
- retry policy
- failure handling policy

### Declared outputs

Possible future outputs:

- batch validation record
- per-address result records
- Placekeys
- failed candidates
- ambiguous candidates
- rate-limit warnings
- service errors
- completion status

### Service guarantee fields

Possible future guarantee fields:

- batch accepted
- candidate validated
- candidate rejected
- result recorded
- API unavailable
- rate limit reached
- failure reason recorded

## Sub-webform: Address Result Export

### Purpose

Export validated, failed, or candidate records for downstream use.

### Declared inputs

Possible future inputs:

- result set identifier
- export filter
- export format
- visibility policy
- downstream schema target

### Declared outputs

Possible future outputs:

- JSON export
- CSV export
- schema-mapped export
- error report
- export timestamp

### Storage/export boundary

Exported records should be separated from secrets and service credentials.

Exports should record source references and validation status so downstream consumers do not mistake candidates for confirmed places.

## Sub-webform: Directory Handoff

### Purpose

Describe handoff of validated address/place records into a later directory-oriented service such as LDAP.

### Declared inputs

Possible future inputs:

- validated address result set
- schema mapping
- directory target reference
- object class mapping
- attribute mapping
- dry-run flag

### Declared outputs

Possible future outputs:

- directory-ready JSON records
- LDIF-like export, if later approved
- mapping report
- rejected records
- handoff status

### Design caution

This document does not implement LDAP.

The purpose is to show that the output of address validation must be typed enough for a later directory webform to consume safely.

## Collection orchestration

The `Placekey Address Validation` collection may eventually orchestrate the primitive sub-webforms in this order:

```text
Placekey Configure API
  -> Placekey Verify Single Address
```

for the smallest case, and:

```text
TIGER/Census Source Import
  -> Street Place Attachment
  -> Address Range Candidate Generation
  -> Placekey Batch Validate Candidates
  -> Address Result Export
  -> Directory Handoff
```

for the larger case.

The collection should also allow partial use when appropriate.

Examples:

- A user may only need to verify one pasted address.
- A user may already have candidate addresses and only need batch validation.
- A user may already have validated records and only need export or handoff.

## Required framework capabilities exposed by this example

This example suggests that the framework will eventually need to support:

- API credential configuration without unsafe export
- single-record service actions
- batch service actions
- source dataset declarations
- candidate generation rules
- typed result classes
- failure records
- confidence/ambiguity fields
- downstream handoff declarations
- rate-limit and retry policy hints
- import/export boundaries
- secret/non-secret separation
- validation without asserting truth beyond the source data

## Candidate JSON design areas

This document does not define final JSON syntax, but it identifies areas the syntax must be able to describe.

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

### Source data

Possible source fields:

```text
source_id
source_type
source_name
source_year
source_geography
source_uri
local_file_reference
source_confidence
source_limitations
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
maximum_length
postal_code_format
state_or_region_format
country_code_format
address_range_order
address_range_parity
candidate_status_required
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
rate_limit_policy
retry_policy
```

### Handoff

Possible handoff fields:

```text
emits
consumes
compatible_with
required_previous_result
optional_previous_result
result_class_filter
schema_mapping_target
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
visibility
contains_secret
```

## Result classification requirement

The framework should be able to classify records so downstream webforms know what they are consuming.

Possible classes:

```text
raw_input
normalized_input
source_range
candidate_address
validated_placekey_address
ambiguous_placekey_address
failed_placekey_address
exported_result
handoff_ready_record
```

This prevents later webforms from treating every generated candidate as a validated address.

## Public/private boundary

Address validation records may contain sensitive operational information depending on context.

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

- Should API configuration be a reusable sub-webform shared by many API-backed collections?
- Should `Placekey Address Validation` be one collection with two modes, or two collections: simple verification and batch generation/validation?
- How should the framework represent confidence scores without assuming a single provider's scoring model?
- How should generated candidates be marked so they are never confused with confirmed structures?
- What is the minimum result record required for downstream LDAP or MariaDB mapping?
- Should source dataset provenance be required for every batch result?
- Should failed validations be first-class records or only error logs?

## Current decision

`Placekey Address Validation` is the second real design example for the JSON Form Runtime.

It should remain a documentation-only design until the framework schema is approved.

## External reference notes

These references inform the design but do not authorize implementation:

- Placekey API documentation describes obtaining an API key and making requests to the `/v1/placekey` endpoint with an `apikey` header and JSON query payload.
- The Census Geocoder supports single-record and batch geocoding, with results derived from MAF/TIGER address ranges.
- Census TIGER/Line documentation describes address ranges as potential ranges, not individual confirmed structures.
