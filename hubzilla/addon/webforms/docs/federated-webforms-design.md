# Federation Opportunities for JSON-Composed Web Forms

## Status

Design document only.

This document records federation opportunities for the Hubzilla `webforms` addon.

It does not implement federation behavior, JSON loading, form rendering, service execution, credential storage, file writes, database writes, background jobs, or bundled default collections.

## Scope

The `webforms` addon is intended to provide JSON-Composed Web Forms for Hubzilla.

Because Hubzilla is a federated platform, `webforms` should be designed so future form definitions, service requests, service results, and collaboration records can take advantage of Hubzilla-native identity and permissioning.

This document is not Civic Infrastructure-specific.

The same design should remain useful for arbitrary lawful user-defined forms and collections.

## Design principle

`webforms` should not be merely a local forms page.

It should become a Hubzilla-native way to create, share, review, request, fulfill, and record structured work.

The general model is:

```text
JSON-composed form
  plus Hubzilla identity
  plus Hubzilla permissions
  plus optional federation-aware records
```

## Federation-aware objects

Candidate future objects include:

```text
form collection published
form collection imported
form collection forked
form review requested
form review completed
service request created
service request accepted
service result returned
service offer published
service guarantee recorded
```

These are future design objects only.

They are not implemented.

## Federated form catalogs

A Hubzilla channel could eventually publish a catalog of available JSON form collections.

Examples:

```text
CID Mapping
Placekey Address Validation
Bare-Bones Email Client
Volunteer Intake
Warehouse Contract Intake
Environmental Incident Report
Research Log
```

The catalog may be public or permissioned.

Possible visibility scopes:

```text
private
specific channel
privacy group
project team
public
federated public
```

The generic `webforms` addon must not ship one mandatory catalog for all users.

Users should intentionally install, import, create, or select collections.

## Federated form packages

A JSON collection may eventually be shared as a package.

A package might contain:

```text
collection manifest
sub-webform definitions
layout definitions
validation definitions
service contract declarations
example records
documentation
version metadata
```

A recipient could inspect, copy, import, fork, or adapt the package.

Git repositories remain useful for development.

Hubzilla federation may become useful for permissioned distribution, discovery, collaboration, and use.

## Federated service requests

A webform can eventually create a structured service request.

Examples:

```text
please pin this CID
please validate this address list
please map this CID to a repository path
please review this form definition
please return a service result
```

A service request should have explicit fields.

Candidate fields:

```text
request id
request type
requesting channel
target channel or group
input record reference
requested action
visibility
expiration
terms or notes
status
```

The request should be inspectable as structured JSON.

## Federated service offers

A channel may eventually publish a service offer.

Examples:

```text
willing to pin CIDs
willing to review form definitions
willing to validate address batches
willing to host a repository index
```

A service offer may include:

```text
service type
provider channel
scope
limits
terms
availability
visibility
```

The IPFS pinning example is a strong candidate for early service-offer design.

## Federated service results

A service result records what happened.

Examples:

```text
CID pinned
pin request rejected
Gitea path mapping written
address validation completed
form review completed
email sent
```

A result record should not be hidden runtime state.

Candidate fields:

```text
result id
related request id
service type
provider channel
status
timestamp
input reference
output reference
failure reason
visibility
retention hint
```

## Permissioned records

Webform records should be able to stay local or become permissioned Hubzilla records.

Possible record classes:

```text
private draft
private result
shared with one channel
shared with a group
public summary
federated service request
federated service result
```

The user should control when a record leaves local/browser state.

## Relationship to Design mode

Design mode can eventually support collaboration around form definitions.

Example workflow:

```text
create a draft form
view generated JSON
share draft with selected collaborators
receive comments or revised JSON
import revised JSON
publish a stable collection
```

This should use Hubzilla-native identity and permissions rather than inventing a separate collaboration system.

## Relationship to Deploy mode

Deploy mode can eventually render selected JSON collections and create result records.

Some result records may remain local.

Some may become Hubzilla records.

Some may become federated service requests or results.

Deploy mode should not automatically federate records without explicit user action or approved collection policy.

## ActivityPub boundary

The full permissioned workflow should be designed for Hubzilla-native federation first.

Wider Fediverse publication may be useful for public announcements, public summaries, or links to public collections.

Do not assume every permissioned Hubzilla workflow can be safely represented in a public ActivityPub-style object.

## Local-first boundary

A form should still work as a local design/export artifact when federation is not used.

The federation model should be optional.

Minimum useful local behavior remains:

```text
design form
view JSON
copy JSON
download JSON
import JSON
render locally later
```

Federation enriches the system; it should not be required for the generic designer to be useful.

## Security and privacy

Federation-aware webforms must distinguish:

```text
form definitions
private settings
credentials
service requests
service results
public summaries
```

Credentials and private API settings must not be included in federated form definitions by default.

A service request should reveal only what the user intends to send.

A service result should be shared according to explicit permissions.

## General utility

The federation model should remain useful beyond any single project.

Potential uses include:

```text
distributed archives
mutual aid coordination
research workflows
organizational contracts
incident reports
document review
service marketplaces between trusted channels
```

The generic `webforms` addon should not encode one ideology, domain, or civic workflow into its defaults.

## Current decision

The immediate implementation remains local and inert.

The design should preserve room for future Hubzilla-native federation by keeping these concepts explicit:

```text
collection
webform
service request
service offer
service result
permissioned record
visibility
retention
handoff
```

The first federation-aware implementation should not be attempted until the local Design and Deploy model is stable.
