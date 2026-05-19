# Interface Declaration Template

Status: Draft  
Repository: `civic-affordance-model`  
Scope: Civic Affordances Diagnostics

## Purpose

This template gives a county root a consistent way to declare a cooperation
interface.

It is not a registration form, license request, or permission request. It is a
structured record other roots may inspect when deciding whether and how to
cooperate.

## Minimal Declaration

```yaml
surface:
  county:
  state:
  county_state_label:
  parent_domain:
  public_ingress:

root:
  operator_identity:
  local_standing_basis:
  administrative_contact:
  attribution_requested:

interface:
  family:
  endpoint:
  offered: false
  cooperation_requested: []
  interface_specific_notes:

policy:
  interface_specific_consent: true
  recognition_is_not_endorsement: true
  local_commerce_disclosed:
  anti_capture_notes:

diagnostics:
  status: draft
  recognized_by: []
  declined_by: []
  partial_recognition: []
  forked_from:
  related_surfaces: []
  open_questions: []
```

## Interface Families

Use one of the following values unless the model later defines another:

```yaml
interface_families:
  - public_ingress
  - dns
  - fediverse
  - directory_ldap
  - email_ceas
  - wireguard
  - dane
  - attestation
```

## DNS Declaration

```yaml
surface:
  county: Kane County
  state: Illinois
  county_state_label: kane-il
  parent_domain: kane-il.us
  public_ingress: https://current-resident.kane-il.us

root:
  operator_identity:
  local_standing_basis:
  administrative_contact:
  attribution_requested:

interface:
  family: dns
  endpoint: kane-il.us
  offered: true
  cooperation_requested:
    - discovery
    - service_records
    - mail_records
    - dane_records_where_published
    - interface_declaration_publication
  interface_specific_notes:
    dnssec: planned_or_current
    zone_publication:
    nameserver_policy:

policy:
  interface_specific_consent: true
  recognition_is_not_endorsement: true
  local_commerce_disclosed:
  anti_capture_notes:

diagnostics:
  status: draft
  recognized_by: []
  declined_by: []
  partial_recognition: []
  forked_from:
  related_surfaces: []
  open_questions: []
```

## Fediverse Declaration

```yaml
surface:
  county:
  state:
  county_state_label:
  parent_domain:
  public_ingress:

root:
  operator_identity:
  local_standing_basis:
  administrative_contact:
  attribution_requested:

interface:
  family: fediverse
  endpoint:
  offered: true
  cooperation_requested:
    - county_to_county_federation
    - expert_pool_federation
    - authenticated_contribution
    - public_reading_where_allowed
  interface_specific_notes:
    protocol:
    software:
    moderation_posture:
    channel_policy:
    privileged_operator_handles:

policy:
  interface_specific_consent: true
  recognition_is_not_endorsement: true
  local_commerce_disclosed:
  anti_capture_notes:

diagnostics:
  status: draft
  recognized_by: []
  declined_by: []
  partial_recognition: []
  forked_from:
  related_surfaces: []
  open_questions: []
```

## Directory / LDAP Declaration

```yaml
surface:
  county:
  state:
  county_state_label:
  parent_domain:
  public_ingress:

root:
  operator_identity:
  local_standing_basis:
  administrative_contact:
  attribution_requested:

interface:
  family: directory_ldap
  endpoint:
  offered: true
  cooperation_requested:
    - selected_directory_lookup
    - service_principal_lookup
    - county_surface_records
    - alias_or_role_lookup_where_allowed
  interface_specific_notes:
    implementation: ldap_or_other
    public_access: none_or_scoped
    private_exchange:
    published_schema:
    sensitive_records_excluded:

policy:
  interface_specific_consent: true
  recognition_is_not_endorsement: true
  local_commerce_disclosed:
  anti_capture_notes:

diagnostics:
  status: draft
  recognized_by: []
  declined_by: []
  partial_recognition: []
  forked_from:
  related_surfaces: []
  open_questions: []
```

## Email / CEAS Declaration

```yaml
surface:
  county:
  state:
  county_state_label:
  parent_domain:
  public_ingress:

root:
  operator_identity:
  local_standing_basis:
  administrative_contact:
  attribution_requested:

interface:
  family: email_ceas
  endpoint:
  offered: true
  cooperation_requested:
    - mail_reachability
    - sender_authorization_policy_publication
    - active_alias_validation_where_offered
    - selected_attestation_publication
  interface_specific_notes:
    ceas_offered: false
    ceas_definition: Civic Email Alias System
    sase_used: false
    alias_validation_endpoint:
    alias_lifecycle:
    mailbox_scope:
    spf:
    dkim:
    dmarc:
    dane:
    attachment_policy:

policy:
  interface_specific_consent: true
  recognition_is_not_endorsement: true
  local_commerce_disclosed:
  anti_capture_notes:

diagnostics:
  status: draft
  recognized_by: []
  declined_by: []
  partial_recognition: []
  forked_from:
  related_surfaces: []
  open_questions: []
```

## WireGuard Declaration

```yaml
surface:
  county:
  state:
  county_state_label:
  parent_domain:
  public_ingress:

root:
  operator_identity:
  local_standing_basis:
  administrative_contact:
  attribution_requested:

interface:
  family: wireguard
  endpoint:
  offered: true
  cooperation_requested:
    - private_root_to_root_peering
    - monitored_service_exchange
    - restricted_directory_exchange_where_allowed
  interface_specific_notes:
    public_key:
    allowed_ips_policy:
    routing_policy:
    logging_policy:
    revocation_policy:

policy:
  interface_specific_consent: true
  recognition_is_not_endorsement: true
  local_commerce_disclosed:
  anti_capture_notes:

diagnostics:
  status: draft
  recognized_by: []
  declined_by: []
  partial_recognition: []
  forked_from:
  related_surfaces: []
  open_questions: []
```

## Attestation Declaration

```yaml
surface:
  county:
  state:
  county_state_label:
  parent_domain:
  public_ingress:

root:
  operator_identity:
  local_standing_basis:
  administrative_contact:
  attribution_requested:

interface:
  family: attestation
  endpoint:
  offered: true
  cooperation_requested:
    - durable_publication
    - content_addressed_artifacts
    - selected_mirroring
  interface_specific_notes:
    implementation: ipfs_or_other
    signing_policy:
    pinning_policy:
    artifact_scope:
    excluded_material:

policy:
  interface_specific_consent: true
  recognition_is_not_endorsement: true
  local_commerce_disclosed:
  anti_capture_notes:

diagnostics:
  status: draft
  recognized_by: []
  declined_by: []
  partial_recognition: []
  forked_from:
  related_surfaces: []
  open_questions: []
```

## Notes on Use

A declaration should be inspectable before it is accepted by another root.

A root may publish declarations in Git, DNS-linked web documents, signed
artifacts, Fediverse posts, or another durable medium.

The declaration format is intentionally simple. It should remain easy to read,
fork, compare, and archive.
