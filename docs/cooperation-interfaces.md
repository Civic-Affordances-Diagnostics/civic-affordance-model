# Cooperation Interfaces

Status: Draft  
Repository: `civic-affordance-model`  
Scope: Civic Affordances Diagnostics

## Purpose

This document defines the cooperation interfaces by which independent county
implementations may recognize, route to, federate with, compare, or otherwise
cooperate with one another.

This is a model document, not a product specification. It does not prescribe a
hosting provider, virtualization system, software distribution, business model,
funding model, legal theory, or internal administrative design for any county
implementation.

The model concerns itself with the interfaces exposed for cooperation, not the
private substrate behind those interfaces.

## Core Principle

Civic Affordance Diagnostics defines interfaces, not permission.

A county root may build, operate, fork, decline, peer, federate, publish, or
isolate according to its own local ownership and judgment. Cooperation begins
only where one root intentionally exposes an interface and another root elects
to recognize or use that interface.

## Cooperation Doctrine

### Infrastructure / Purpose Separation

Civic Infrastructure provides cooperation surfaces. It does not certify,
endorse, supervise, or assume responsibility for every purpose pursued through
those surfaces.

The wiring is not the purposing.

A contributor's infrastructure may enable discovery, routing, federation,
directory lookup, mail exchange, attestation, diagnostic publication, or other
civic affordance functions. Those technical functions do not convert the
cooperative network into the author, sponsor, representative, regulator,
attorney, advocate, publisher, or guarantor of a local actor's conduct.

### Diagnostics Before Solution

Civic Affordance Diagnostics does not exist to solve every civic, legal,
technical, economic, administrative, or social condition surfaced by the
infrastructure.

It exists to expose them.

Acceptance, refusal, cooperation, non-cooperation, forking, obstruction, capture
attempts, spam, abuse, litigation threats, implementation failures, technical
incompatibilities, and local disagreement are all diagnostic signals.

### The Network Diagnoses Itself

The cooperative network is not only a carrier of diagnostic surfaces. It is
itself a diagnostic subject.

Each interface exposes evidence about the network: which roots cooperate, which
roots refuse, which implementations fork, which actors attempt capture, which
interfaces prove durable, which interfaces fail, and which local conditions
require different treatment.

A refusal to cooperate is not automatically a defect. A fork is not
automatically a failure. An obstruction is not automatically an emergency. Each
may reveal useful information about the civic, technical, economic,
administrative, or local conditions surrounding a county implementation.

### No Duty to Resolve

Civic Infrastructure has no general duty to resolve the conditions it exposes.

A diagnostic surface may reveal a dispute, incompatibility, obstruction,
absence, failure, capture attempt, or abuse pattern. The act of surfacing that
condition does not make the network responsible for curing it.

The model prefers inspectable exposure over concealed fragility.

### Cooperation Is Not Permission

Civic Infrastructure does not grant permission to build.

Owner-operators may build infrastructure for their own purposes without
requesting approval from the cooperative network. Cooperation begins only when
another root elects to recognize, route, peer, federate, resolve, exchange,
query, or otherwise interoperate with that infrastructure.

### Recognition Is Not Endorsement

Cooperative recognition is technical and relational. It means that one or more
roots have elected to cooperate with a declared interface.

Recognition does not imply endorsement of every local actor, statement,
business, campaign, civic claim, diagnostic surface, contract, publication, or
use case associated with that county implementation.

### Local Sovereignty

Each county implementation is locally owned and locally administered.

The cooperative model does not impose a uniform business model, hosting model,
legal theory, moderation model, funding model, virtualization stack, or
operational chain of command on independent county roots.

### Interface Minimalism

The model defines interfaces, not internal architecture.

A county root may use Proxmox, LXD, rented infrastructure, residential
infrastructure, commercial hosting, donated systems, or other arrangements.
Those choices are local.

### One Declared Endpoint Per Interface

A county root should expose one clearly identified cooperation endpoint per
interface family it chooses to offer.

For a declared county-state surface, this means:

- one logical public ingress;
- one DNS cooperation point;
- one Fediverse node if Fediverse cooperation is offered;
- one directory cooperation surface if LDAP or directory cooperation is offered;
- one mail cooperation surface if Email or CEAS cooperation is offered;
- one WireGuard peering surface if WireGuard cooperation is offered;
- one trust-publication surface if DANE cooperation is offered;
- one attestation publication surface if attestation cooperation is offered.

This rule applies per declared county-state surface. It does not create a
monopoly over the county.

### Interface-Specific Consent

Cooperation is interface-specific.

A root may cooperate for DNS while declining Fediverse federation, WireGuard
peering, LDAP exchange, DANE reliance, mail exchange, attestation mirroring, or
any other interface.

No interface implies consent to all other interfaces.

### Plurality Without Monopoly

The model does not require a single canonical county domain or a single
recognized county operator.

Multiple contributors may declare surfaces for the same county. This permits
local competition, specialization, redundancy, comparison, and experimentation.

A contributor may specialize in an affordance family. One Orange County,
California surface may emphasize `LICENSED_PROFESSIONAL`. Another may emphasize
`FLOODPLAIN_AFFECTED_RESIDENT`. The existence of one does not invalidate the
other.

## Interface Catalog

This catalog identifies the first cooperation interfaces. A county root may
expose any subset.

### 1. Public Ingress Interface

The public ingress interface is the externally reachable network entry point
for a declared county-state surface.

A root should declare one logical public ingress for each surface. The local
implementation behind that ingress may use any lawful architecture.

The public ingress may support:

- web publication;
- reverse proxying;
- service discovery;
- TLS termination;
- diagnostic publication;
- redirects to interface-specific endpoints.

The public ingress does not expose or standardize the internal infrastructure.

### 2. DNS Cooperation Interface

DNS is the first cooperation interface because it is public, name-based,
delegation-oriented, and compatible with plural county-state surfaces.

A county root may contribute one DNS cooperation point for a declared
county-state surface.

The model does not require the surface to use any particular parent domain.

Examples:

```text
kane-il.us
orange-ca.ankerpoint-sawmill.com
dupage-il.example.org
```

The parent domain identifies the contributor's naming root. The county-state
label identifies the civic surface being contributed.

DNS cooperation may support:

- discovery;
- service records;
- delegation;
- operational attribution;
- DANE records;
- mail exchanger records;
- Fediverse host discovery;
- interface declaration publication;
- comparison between county roots.

DNS recognition is elective. A root may recognize, decline, remove, fork, or
compare another root's DNS surface.

### 3. Fediverse Cooperation Interface

The Fediverse interface allows a county implementation to expose a social,
diagnostic, or publication node for compatible federation.

A root may choose Zot6, ActivityPub, Diaspora-compatible federation, or another
federation path where appropriate.

For the reference model, Zot6 is favored where controlled identity, permissions,
channel structure, and federation discipline matter.

Fediverse cooperation may support:

- local diagnostic channels;
- county-to-county discussion;
- expert pools;
- public reading;
- authenticated contribution;
- controlled publication;
- remote participation where the local root allows it.

Fediverse cooperation does not imply DNS, WireGuard, LDAP, DANE, Email, or CEAS
cooperation.

### 4. Directory / LDAP Cooperation Interface

The directory interface supports structured lookup of civic infrastructure
objects, service principals, address-eligibility records, aliases, roles, or
other directory-backed records.

LDAP is one candidate implementation.

Directory cooperation may support:

- service-principal lookup;
- address or surface vocabulary;
- alias lookup;
- role-scoped service access;
- county-root administrative records;
- read-only directory publication;
- private directory exchange where permitted.

Directory cooperation should be explicit and scoped. A root may publish selected
directory records without exposing internal directory structure or sensitive
qualification records.

### 5. Email / CEAS Cooperation Interface

The Email / CEAS interface supports civic email reachability, sender
authorization, alias validation, and selected mail-evidenced participation.

`CEAS` means Civic Email Alias System.

A CEAS alias is a civic infrastructure alias operated by a county root. It may
support a qualified participant's ability to send or receive email through a
county-rooted civic surface.

CEAS may support `CURRENT_RESIDENT` by linking address evidence, mail evidence,
SASE participation, alias issuance, alias rotation, sender authorization, and
validation of active alias status.

CEAS is not ordinary lifetime email, government email, a voting system, a legal
identity credential, a marketing list, or a network endorsement of the
participant's purposes.

The Email / CEAS interface may expose:

- mail exchanger records;
- SPF, DKIM, DMARC, and DANE posture;
- participant-facing aliases;
- service-principal mailboxes;
- validation endpoint behavior;
- alias lifecycle rules;
- attestation publication rules.

A county root may offer ordinary mail cooperation without CEAS, CEAS without
public alias validation, or no mail cooperation at all.

### 6. WireGuard / Private Peering Interface

The WireGuard interface supports private technical peering between cooperating
roots.

It may be useful for:

- restricted administrative exchange;
- private directory replication;
- monitored service-to-service communication;
- hostile-surface staging;
- backup, monitoring, or coordination traffic;
- root-to-root cooperation that should not be exposed publicly.

WireGuard cooperation is never implied by DNS or Fediverse cooperation.

### 7. DANE / Trust Publication Interface

The DANE interface supports DNS-published trust material for services such as
mail or web endpoints.

DANE cooperation may support:

- TLSA records;
- mail transport hardening;
- certificate rollover discipline;
- root-published trust posture;
- comparison of trust publication between roots.

DANE publication does not make the publishing root a moral or legal certifier of
the local actor's purpose. It publishes technical trust material for a declared
service.

### 8. Attestation / Durable Publication Interface

The attestation interface supports durable publication of selected diagnostic
records, releases, audit artifacts, or content-addressed outputs.

IPFS is one candidate implementation.

Attestation cooperation may support:

- content-addressed releases;
- signed diagnostic artifacts;
- alias-status attestations;
- public tables;
- reproducible exports;
- selected immutable audit records.

Immutability preserves records. It does not make records true.

## Relationship to Existing Diagnostic Documents

`diagnostic-families.md` defines the affordance categories.

`diagnostic-surface-qualification.md` defines how a surface qualifies
participants, evidence, access, exposure, protocols, persistence, and
replication.

This document defines how independent roots expose interfaces through which
those surfaces may cooperate.
