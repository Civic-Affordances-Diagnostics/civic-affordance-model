# County Surface Cooperation Intake

Status: Draft  
Repository: `civic-affordance-model`  
Scope: Civic Affordances Diagnostics

## Purpose

This document defines a draft intake model for recognizing county-state civic infrastructure surfaces.

The intake model does not grant permission to build. It records whether a declared surface is coherent enough for one or more roots to recognize, resolve, route, federate, peer, query, compare, or otherwise cooperate with it.

## Core Principle

Cooperation intake evaluates the declared county-state surface, not the prestige of the parent domain.

A contributor may declare a county-state surface under any domain the contributor controls.

Examples:

```text
kane-il.us
orange-ca.ankerpoint-sawmill.com
orange-ca.other-local-operator.example
dupage-il.example.org
```

The parent domain identifies the contributor's naming root. The county-state label identifies the civic surface being offered.

## Intake Is Not Central Licensing

The cooperative network does not issue a central license, franchise, credential, or monopoly.

A county root may cooperate with a declared surface. Another root may decline. A third root may cooperate only for DNS and decline Fediverse, WireGuard, LDAP, mail, DANE, or attestation interfaces.

The result is a visible cooperation map, not central permission.

## Intake Dimensions

### 1. County-State Claim

The declaration should identify the county and state being surfaced.

Minimum fields:

```yaml
county: "Orange County"
state: "California"
county_state_label: "orange-ca"
surface_domain: "orange-ca.example.com"
```

The county-state claim should be legible enough for other roots to understand what civic geography is being declared.

### 2. Contributor / Root Identity

The declaration should identify the local root or contributor.

Minimum fields:

```yaml
root_name: "Example Local Operator"
root_type: "individual | business | charity | technical group | other"
operator_contact: "hostmaster@example.com"
attribution_name: "Example Local Operator"
```

The attribution name may be public if the contributor wants visible credit.

### 3. Local Standing or Operational Connection

The declaration should state why the contributor is locally connected to the county-state surface.

Examples:

- current resident;
- local business;
- local professional;
- local charity;
- local technical operator;
- local parcel-linked actor;
- local service provider;
- local institution;
- other locally grounded affected-status relationship.

This is not a demand for a centralized identity regime. It is a diagnostic field. Roots may decide whether the asserted connection is sufficient for cooperation.

### 4. Interface Families Offered

The declaration should identify which cooperation interfaces are being offered.

Example:

```yaml
interfaces:
  dns: offered
  public_ingress: offered
  fediverse: not_offered
  directory_ldap: offered_root_to_root
  email_ceas: not_offered
  wireguard: not_offered
  dane: offered_for_https
  attestation: planned
```

No interface implies consent to all other interfaces.

### 5. Affordance Families Surfaced

The declaration should identify the civic affordances being surfaced or planned.

Examples:

```yaml
affordances:
  - CURRENT_RESIDENT
  - LICENSED_PROFESSIONAL
  - FLOODPLAIN_AFFECTED_RESIDENT
  - PROPERTY_TAXPAYER
```

A contributor may specialize. Two surfaces for the same county may expose different affordance priorities.

### 6. Local Economic Attribution

The declaration may identify local economic attribution.

Example:

```yaml
local_attribution:
  display_name: "Ankerpoint Sawmill"
  relationship: "local business contributor"
  county_connection: "operates in Orange County, California"
  visibility_requested: true
```

Local attribution is not a purchased entitlement to network recognition.

### 7. Anti-Capture Review

The declaration should expose whether the contribution appears locally grounded or externally captured.

Diagnostic questions:

- Is the contributor local to the county-state surface?
- Is the contribution operated locally, funded locally, or accountable locally?
- Is a remote corporation trying to occupy a county civic surface without local standing?
- Is the domain being used to simulate local legitimacy?
- Is the contribution a useful local implementation, a fork, a test, an experiment, or an astroturf surface?

This review is diagnostic, not adjudicatory. Roots may disagree.

### 8. Interface-Specific Cooperation

The intake should record cooperation by interface.

Example:

```yaml
cooperation:
  root: "kane-il.us"
  dns: recognized
  fediverse: declined
  wireguard: declined
  directory_ldap: not_evaluated
  email_ceas: not_offered
  notes: "DNS surface is coherent; no Fediverse node offered."
```

The cooperation map is more useful than a binary accepted/rejected status.

### 9. Diagnostic Signals

The intake should preserve signals.

Examples:

- accepted by one root;
- declined by another root;
- forked from an earlier implementation;
- blocked by a registrar, host, institution, HOA, government office, corporate actor, or network provider;
- attacked, spammed, scraped, misrepresented, or threatened;
- abandoned;
- isolated for astroturfing;
- restored after correction;
- technically incompatible;
- deliberately DNS-only.

The purpose is to expose conditions, not to solve them.

## Intake Outcomes

### Recognized

One or more roots elect to cooperate with the declared surface for one or more interfaces.

### Partially Recognized

One or more roots cooperate for some interfaces and decline others.

Example: DNS recognized, Fediverse declined, WireGuard not offered.

### Declined

A root declines cooperation with the declared surface.

Declining cooperation does not prevent the surface from existing locally.

### Isolated

A surface may be left outside the cooperation layer because roots decline DNS recognition, peering, federation, routing, or other interfaces.

Isolation is not central punishment. It is the ordinary consequence of declined cooperation.

### Forked

A surface may be a fork, alternative implementation, experimental implementation, or specialized local implementation.

A fork is not automatically a failure. It may become a useful diagnostic comparison.

## Example: Local Business Surface

```yaml
county: "Orange County"
state: "California"
county_state_label: "orange-ca"
surface_domain: "orange-ca.ankerpoint-sawmill.com"

root_name: "Ankerpoint Sawmill"
root_type: "local business"
operator_contact: "hostmaster@ankerpoint-sawmill.com"
attribution_name: "Ankerpoint Sawmill"

local_standing:
  type: "local business"
  description: "Fine-cut lumber business operating in Orange County, California."

interfaces:
  dns: offered
  public_ingress: offered
  fediverse: not_offered
  directory_ldap: planned
  email_ceas: not_offered
  wireguard: not_offered
  dane: offered_for_https
  attestation: planned

affordances:
  - LICENSED_PROFESSIONAL

local_attribution:
  display_name: "Ankerpoint Sawmill"
  relationship: "local business contributor"
  visibility_requested: true
```

## Example: Same County, Different Concern

```yaml
county: "Orange County"
state: "California"
county_state_label: "orange-ca"
surface_domain: "orange-ca.floodplain-operator.example"

root_name: "Floodplain-Affected Local Operator"
root_type: "individual"
operator_contact: "hostmaster@floodplain-operator.example"

local_standing:
  type: "parcel-linked affected resident"
  description: "Contributor is affected by floodplain conditions in Orange County, California."

interfaces:
  dns: offered
  public_ingress: offered
  fediverse: offered
  directory_ldap: not_offered
  email_ceas: not_offered
  wireguard: not_offered
  dane: not_offered
  attestation: offered

affordances:
  - FLOODPLAIN_AFFECTED_RESIDENT
  - PARCEL_LINKED_OCCUPANT
```

These two surfaces may compete, cooperate, specialize, or remain separate. Neither receives a monopoly over the county label merely by existing.
