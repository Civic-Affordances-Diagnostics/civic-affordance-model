# County Surface Cooperation Intake

Status: Draft  
Repository: `civic-affordance-model`  
Scope: Civic Affordances Diagnostics

## Purpose

This document defines how one root may describe a county-state surface for
possible cooperation with other roots.

Intake is not central licensing. It is a structured way to make cooperation
claims inspectable.

## Core Principle

A contributor may build without permission.

Cooperation begins only when another root elects to recognize, resolve, route,
federate, peer, query, exchange, mirror, or otherwise cooperate with the
contributor's declared interface.

## Intake Is Not Central Licensing

Civic Affordance Diagnostics does not require a central authority to approve a
county root before the root exists.

A root exists when a local owner-operator declares and operates a county-state
surface.

Intake helps other roots decide whether, how, and to what extent they will
cooperate.

## Intake Dimensions

### 1. County-State Claim

What county-state surface is being declared?

Examples:

```text
kane-il.us
orange-ca.ankerpoint-sawmill.com
maricopa-az.operator.example
```

Record:

- county name;
- state name;
- county-state label;
- parent domain;
- public ingress;
- DNS cooperation point.

### 2. Contributor / Root Identity

Who is operating or sponsoring the surface?

Record:

- operator name or organization;
- contributor identity to display, if any;
- local business, charity, professional, technical group, or resident status;
- administrative contact method;
- operational continuity contact, if different.

A contributor may be an individual, business, charity, project, professional
practice, technical operator, or group. The important question is not prestige.
The important question is whether the contributor is actually responsible for
the declared surface and can be inspected by other roots.

### 3. Local Standing or Operational Connection

Why does the contributor belong on this county surface?

Possible bases:

- residency;
- local business operation;
- local professional practice;
- local property or parcel connection;
- local infrastructure operation;
- local charitable or civic work;
- technical operation directly serving the county surface;
- other inspectable local connection.

Local standing is not required to be uniform across every root. It must be
claimed clearly enough for other roots to evaluate.

### 4. Interface Families Offered

Which cooperation interfaces are being offered?

Possible interfaces:

- public ingress;
- DNS;
- Fediverse;
- directory / LDAP;
- Email / CEAS;
- WireGuard;
- DANE;
- attestation / durable publication.

Each interface stands alone. Offering DNS does not imply offering Fediverse,
WireGuard, LDAP, DANE, Email, CEAS, or attestation cooperation.

### 5. Affordance Families Surfaced

Which diagnostic families does the surface emphasize?

Possible families:

- Residency;
- Parcel / Dwelling;
- Private Governance;
- Public Governance;
- Procedural / Evidentiary;
- Expert.

Possible examples:

- `CURRENT_RESIDENT`
- `LICENSED_PROFESSIONAL`
- `FLOODPLAIN_AFFECTED_RESIDENT`
- `HOA_MEMBER`
- `PUBLIC_RECORDS_REQUESTER`

A surface may specialize. One local contributor may focus on professional
competence. Another may focus on floodplain affectedness. Both may be useful.

### 6. Local Economic Attribution

What local attribution is requested?

Record:

- attribution name;
- local standing basis;
- contribution type;
- whether attribution is for operation, funding, hosting, maintenance,
  expertise, or another contribution;
- whether any paid implementation or support relationship exists.

Attribution recognizes contribution. It is not a purchased right to network
cooperation.

### 7. Anti-Capture Review

What capture signals should other roots inspect?

Signals may include:

- remote corporate control;
- identical surfaces repeated across counties;
- hidden sponsor or controlling party;
- paid visibility not tied to local standing;
- astroturfed local identity;
- false county-state claim;
- attempt to convert cooperation into a franchise, ad network, vendor channel,
  or centralized service.

These signals do not automatically prove misconduct. They are diagnostic.

### 8. Interface-Specific Cooperation

What is being requested from other roots?

Examples:

- resolve DNS;
- list the surface as a known county-state surface;
- federate with the Fediverse node;
- peer over WireGuard;
- query selected directory records;
- exchange or validate mail;
- rely on DANE-published trust material;
- mirror or cite attestation artifacts.

A root may accept one request and decline another.

### 9. Diagnostic Signals

What should be recorded about the intake itself?

Examples:

- accepted;
- partially accepted;
- declined;
- isolated;
- forked;
- challenged;
- obstructed;
- captured;
- suspected astroturf;
- technically incompatible;
- pending evidence;
- pending local standing review.

The intake process is itself diagnostic.

## Intake Outcomes

### Recognized

One or more roots elect to cooperate with one or more declared interfaces.

### Partially Recognized

A root cooperates with some interfaces and declines others.

Example: DNS recognized; Fediverse and WireGuard declined.

### Declined

A root declines cooperation with the declared surface or interface.

Decline is not punishment. It is a cooperation decision and a diagnostic signal.

### Isolated

The surface may continue operating locally, but one or more cooperation layers
are not recognized by other roots.

### Forked

Another root or contributor may create a competing or divergent surface for the
same county-state claim.

Forking is not automatically a failure. It may reveal specialization,
redundancy, disagreement, or improved local fit.

## Example: Local Business Surface

A sawmill in Orange County, California controls:

```text
orange-ca.ankerpoint-sawmill.com
```

The sawmill offers:

- public ingress;
- DNS cooperation;
- a diagnostic surface emphasizing `LICENSED_PROFESSIONAL`;
- local attribution to the sawmill as contributor;
- no Fediverse node yet;
- no WireGuard peering yet;
- no CEAS interface yet.

Other roots may recognize the DNS surface while declining other interfaces until
those interfaces exist.

The sawmill's local attribution is acceptable only because the contributor has
local standing or direct operational contribution. A sawmill in another county
has no automatic claim to visibility in this county surface.

## Example: Same County, Different Concern

A second Orange County contributor controls:

```text
orange-ca.floodplain-operator.example
```

This contributor emphasizes:

- `FLOODPLAIN_AFFECTED_RESIDENT`;
- parcel / dwelling affordances;
- durable publication of selected floodplain diagnostic records;
- possibly no professional-surface work.

The two surfaces may compete, cooperate, diverge, or be compared. The model does
not require one canonical domain for the county.

## Minimal Intake Record

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

interfaces_offered:
  dns: false
  fediverse: false
  directory_ldap: false
  email_ceas: false
  wireguard: false
  dane: false
  attestation: false

affordances_surfaced: []

cooperation_requested: []

anti_capture_notes:

diagnostic_status:
  intake_state: draft
  recognized_by: []
  declined_by: []
  partial_recognition: []
  open_questions: []
```
