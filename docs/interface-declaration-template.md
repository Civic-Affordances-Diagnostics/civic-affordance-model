# Interface Declaration Template

Status: Draft  
Repository: `civic-affordance-model`  
Scope: Civic Affordances Diagnostics

## Purpose

This template gives a county root a compact way to declare a county-state surface and the cooperation interfaces it offers.

The template is intentionally declarative. It does not prescribe internal architecture.

## Minimal Declaration

```yaml
surface:
  county: ""
  state: ""
  county_state_label: ""
  surface_domain: ""
  parent_domain: ""

root:
  root_name: ""
  root_type: "" # individual | business | charity | technical_group | local_project | other
  operator_contact: ""
  attribution_name: ""
  attribution_public: true

local_standing:
  type: "" # current_resident | local_business | local_professional | local_charity | parcel_linked_actor | technical_operator | other
  description: ""

interfaces:
  public_ingress:
    status: "" # offered | not_offered | planned | declined
    endpoint: ""
    notes: ""

  dns:
    status: "" # offered | not_offered | planned | declined
    zone_or_name: ""
    nameservers: []
    notes: ""

  fediverse:
    status: "" # offered | not_offered | planned | declined
    node: ""
    software_family: ""
    federation_scope: "" # public | compatible_roots | local_only | not_applicable
    notes: ""

  directory:
    status: "" # offered | not_offered | planned | declined
    protocol: "" # ldap | api | static | other
    endpoint: ""
    access_scope: "" # public | root_to_root | authenticated | local_only | not_applicable
    record_classes: []
    notes: ""

  email_ceas:
    status: "" # offered | not_offered | planned | declined
    mail_domain: ""
    mx_records: []
    validation_endpoint: ""
    notes: ""

  wireguard:
    status: "" # offered | not_offered | planned | declined
    peering_contact: ""
    allowed_purposes: []
    notes: ""

  dane:
    status: "" # offered | not_offered | planned | declined
    covered_services: []
    notes: ""

  attestation:
    status: "" # offered | not_offered | planned | declined
    method: "" # ipfs | git | signed_manifest | hash_publication | other
    publication_surface: ""
    notes: ""

affordances:
  surfaced: []
  planned: []
  not_surfaced: []

local_attribution:
  display_name: ""
  relationship: ""
  county_connection: ""
  visibility_requested: true

cooperation:
  recognized_by: []
  declined_by: []
  interface_specific_notes: []

diagnostics:
  observed_signals: []
  forks_from: []
  known_incompatibilities: []
  known_obstructions: []
  known_capture_attempts: []
```

## Filled Example

```yaml
surface:
  county: "Kane County"
  state: "Illinois"
  county_state_label: "kane-il"
  surface_domain: "kane-il.us"
  parent_domain: "kane-il.us"

root:
  root_name: "Kane County CURRENT RESIDENT root"
  root_type: "individual"
  operator_contact: "hostmaster@kane-il.us"
  attribution_name: "Kane County CURRENT RESIDENT root"
  attribution_public: true

local_standing:
  type: "current_resident"
  description: "County-rooted operator for a Kane County, Illinois reference implementation."

interfaces:
  public_ingress:
    status: "offered"
    endpoint: "current-resident.kane-il.us"
    notes: "One logical public ingress for the reference implementation."

  dns:
    status: "offered"
    zone_or_name: "kane-il.us"
    nameservers: []
    notes: "DNS cooperation surface for the Kane County implementation."

  fediverse:
    status: "planned"
    node: "diagnostics.current-resident.kane-il.us"
    software_family: "Hubzilla or compatible family"
    federation_scope: "compatible_roots"
    notes: "Diagnostic federation surface."

  directory:
    status: "planned"
    protocol: "ldap"
    endpoint: ""
    access_scope: "root_to_root"
    record_classes:
      - "service_principal"
      - "affordance_metadata"
      - "validation_metadata"
    notes: "Directory cooperation surface, not a general identity dump."

  email_ceas:
    status: "planned"
    mail_domain: "current-resident.kane-il.us"
    mx_records: []
    validation_endpoint: "validate@current-resident.kane-il.us"
    notes: "CEAS and service-principal mail surface."

  wireguard:
    status: "not_offered"
    peering_contact: ""
    allowed_purposes: []
    notes: "No WireGuard cooperation implied by DNS."

  dane:
    status: "planned"
    covered_services:
      - "https"
      - "mail"
    notes: "DANE posture to be declared separately."

  attestation:
    status: "planned"
    method: "ipfs"
    publication_surface: ""
    notes: "Durable diagnostic publication and record attestation."

affordances:
  surfaced:
    - CURRENT_RESIDENT
  planned:
    - COUNTY_RESIDENT
    - PROPERTY_TAXPAYER
    - PARCEL_LINKED_OCCUPANT
  not_surfaced: []

local_attribution:
  display_name: "Kane County CURRENT RESIDENT root"
  relationship: "county-rooted operator"
  county_connection: "Kane County, Illinois"
  visibility_requested: true

cooperation:
  recognized_by: []
  declined_by: []
  interface_specific_notes: []

diagnostics:
  observed_signals: []
  forks_from: []
  known_incompatibilities: []
  known_obstructions: []
  known_capture_attempts: []
```

## Notes on Use

The template is not a mandatory application form.

It is a diagnostic structure. A county root may use it to make its cooperation posture legible.

Other roots may use it to decide whether to recognize, partially recognize, decline, fork, compare, or isolate a declared surface.
