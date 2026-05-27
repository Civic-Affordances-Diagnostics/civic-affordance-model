# Bare-Bones Email Client Webform Design

## Status

Design document only.

This document pins requirements for the third pilot JSON-defined webform example. It does not implement mail access, message sending, message forwarding, account settings, JSON loading, runtime rendering, API calls, file writes, database writes, background jobs, credential storage, or mail-server configuration.

This pilot exists to compare against the IPFS/CID Mapping and Placekey/Address Validation examples before drafting an initial framework schema.

## Catalog entry

The collection or standalone webform should list itself in the Catalog as:

```text
Bare-Bones Email Client
```

This is a JSON collection and service design, not a Hubzilla built-in default.

## Design purpose

The purpose of the Bare-Bones Email Client is to test whether the JSON Form Runtime can describe a constrained communication service.

This example differs from the IPFS and Placekey examples because it emphasizes:

- strict field-length limits
- read-window limits
- send/forward actions
- per-user private configuration
- server-policy alignment
- external mailbox boundaries
- message records that are intentionally short-lived

The goal is not to design a full email client.

The goal is to define a deliberately limited service that can be described by JSON, rendered by a future runtime, and later connected to mail services by an implementation-specific processor.

## Core design principle

```text
The webform declares the constrained mail interface.
The mail server enforces mailbox policy.
The runtime must not pretend to be a full mail client.
```

The JSON design should describe what the user may see and submit.

The future mail processor, not this design document, would decide how to talk to IMAP, SMTP, local mail storage, or another mail interface.

## Confirmed constraints

The pilot design has the following confirmed constraints:

```text
Read messages sent or received in the last 30 / 31 days.
No automatic forwarding.
Manual forwarding only.
One saved external forwarding address.
The saved forwarding address belongs to the user's private account settings.
One recipient only when sending email.
No attachments in the webform UI.
Server-side milter strips attachments as a backstop.
Subject line limit: 64 characters.
Message body limit: 512 characters.
Plain text only.
No CC.
No BCC.
No reply-all.
No multiple-recipient forwarding.
No attachment display controls.
Message list shows sent and received messages, with direction marked.
Older messages are not shown because the mail server deletes older messages.
```

## Non-goals

This pilot should not include:

- rich-text or HTML composition
- attachments
- attachment display or download controls
- multiple recipients
- CC or BCC
- reply-all
- mailing-list management
- folders beyond the limited recent-message view
- server-side rule management
- automatic forwarding
- long-term mail archive behavior
- full mailbox administration
- spam filtering controls
- mail transport implementation
- mail server configuration

## Initial sub-webforms

The bare-bones email design can be decomposed into small service steps.

```text
Email Settings
Email Recent Messages
Email Compose
Email Forward
```

These are primitive service steps that a larger email collection may later orchestrate.

## Sub-webform: Email Settings

### Purpose

Allow the user to save one external forwarding address in private account configuration.

### Declared inputs

Possible future inputs:

- external forwarding address
- optional label or description
- confirmation that forwarding is manual only

### Declared outputs

Possible future outputs:

- saved private forwarding-address setting
- setting validation result
- setting update timestamp
- error result, if validation fails

### Validation requirements

The forwarding address field should require:

- a syntactically valid email address
- one address only
- no comma-separated or semicolon-separated list
- no display-name list expansion
- no empty value unless the action is explicitly clearing the saved address

### Privacy boundary

The saved forwarding address is private account configuration.

It must not be treated as a normal exported message record.

It must not be published as part of public form output.

## Sub-webform: Email Recent Messages

### Purpose

Display messages sent or received within the last 30 / 31 days.

### Declared inputs

Possible future inputs:

- mailbox identity or account reference
- direction filter: sent, received, or both
- date-window rule
- selected message identifier

### Declared outputs

Possible future outputs:

- recent message list
- selected message summary
- selected message body preview
- message direction marker
- message timestamp
- result count
- empty-mailbox result
- error result, if mail access fails

### Date-window rule

The pilot uses a rolling recent-message window:

```text
last 30 / 31 days
```

The exact day count may be determined by the future implementation according to the mail server's retention policy.

The framework requirement is that JSON must be able to declare a visible record-window rule and explain why older records are not available.

### Message list fields

Candidate visible fields:

```text
direction
from
to
subject
date/time
message preview
```

The `direction` field should clearly distinguish sent and received messages.

### Retention boundary

Older messages are outside the service boundary because the mail server deletes older messages.

The webform should not promise recovery, search, or archive access for messages outside the retention window.

## Sub-webform: Email Compose

### Purpose

Allow the user to send one short plain-text message to one recipient.

### Declared inputs

Required future inputs:

- one recipient email address
- subject line
- plain-text body

### Declared outputs

Possible future outputs:

- send attempt record
- recipient
- subject
- body length
- timestamp
- delivery/submission status
- error result, if send fails

### Validation requirements

The compose form must enforce:

```text
recipient_count = 1
subject_length <= 64 characters
body_length <= 512 characters
plain_text_only = true
attachments_allowed = false
cc_allowed = false
bcc_allowed = false
```

The future runtime should be able to render character counters or validation feedback from these declarations.

### Attachment boundary

The webform should not expose attachment controls.

The server milter may strip attachments as a backstop, but the JSON design should still prohibit attachments at the interface level.

## Sub-webform: Email Forward

### Purpose

Allow the user to manually forward a selected recent message to the one saved external forwarding address.

### Declared inputs

Possible future inputs:

- selected message identifier
- saved forwarding address
- optional short note, if later allowed
- confirmation action

### Declared outputs

Possible future outputs:

- forward attempt record
- selected message reference
- forwarding address reference
- timestamp
- submission status
- error result, if forwarding fails

### Validation requirements

Manual forwarding must enforce:

```text
automatic_forwarding = false
saved_forwarding_address_required = true
forward_recipient_count = 1
multiple_forward_recipients_allowed = false
```

If the saved external forwarding address is missing, the forward action should lead the user to the Email Settings sub-webform rather than accepting a free-form recipient list.

## Collection orchestration

The Bare-Bones Email Client collection may eventually orchestrate the primitive sub-webforms in this pattern:

```text
Email Settings
  -> Email Recent Messages
  -> Email Forward

Email Compose
  -> send result record
```

The collection should also allow partial use when appropriate.

Examples:

- A user may only need to read recent messages.
- A user may only need to compose a short message.
- A user may configure the forwarding address before forwarding any message.
- A user may inspect sent and received messages in one recent-message view.

## Required framework capabilities exposed by this example

This example suggests that the framework will eventually need to support:

- Catalog entries
- cascading left navigation
- sub-webforms
- private per-user configuration
- short text constraints
- character-count validation
- single-recipient validation
- plain-text-only fields
- disabled or absent attachment controls
- rolling retention windows
- message direction markers
- external service action declarations
- manual-only action declarations
- result records for send/forward attempts
- error result records
- non-exportable private settings

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
max_length
single_value
plain_text_only
attachments_allowed
cc_allowed
bcc_allowed
date_window
manual_only
```

### Service contract

Possible service fields:

```text
service_id
service_type
inputs
outputs
action_boundary
requires_mail_service
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
private_account_setting
local_json_filename
exportable
restorable
retention_hint
```

## Credential and account boundary

The design may eventually involve mailbox credentials, SMTP credentials, IMAP credentials, API tokens, or local mail permissions.

No credential storage behavior is authorized by this document.

Future design must distinguish:

- mailbox credentials
- non-secret mail configuration
- private account settings
- recent message records
- send/forward result records
- exportable records
- non-exportable records

## Public/private boundary

Email content and forwarding settings are private by default.

The JSON design should not assume that email records are public, federated, or exportable.

Possible visibility categories for this example:

```text
private
account-private
non-exportable
```

These are design placeholders only.

## Server-policy alignment

The design intentionally aligns the webform with server policy:

- no attachments in the UI
- milter strips attachments as a server-side backstop
- only recent messages visible because older messages are deleted
- short subject and body constraints enforced before service submission

The framework should be able to express these policy constraints in JSON so that the rendered form and the service boundary agree.

## Open questions

This pilot does not need to tie all loose ends.

Open questions may be handled later during framework comparison:

- Should the message list expose full message bodies or only selected-message views?
- Should forwarding include an optional short note, or should it forward the original message only?
- Should sent and received records share one schema with a direction field, or use separate schemas?
- Should the saved forwarding address be stored by the JSON runtime, Hubzilla account preferences, or a future mail-service connector?
- What minimum result record is required for a send or forward attempt?

## Current decision

Bare-Bones Email Client is the third pilot design example for the JSON Form Runtime.

It should remain a documentation-only design until the three pilot examples are compared and an initial framework shape is approved.
