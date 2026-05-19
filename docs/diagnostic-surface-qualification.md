# Diagnostic Surface Qualification Taxonomy

Status: Draft  
Repository: `civic-affordance-model`  
Scope: Civic Affordances Diagnostics

## Purpose

This taxonomy defines how Civic Affordances Diagnostics decides whether a
diagnostic surface should exist, who may write into it, who may only read or
observe, how evidence is qualified, and what infrastructure posture the surface
requires.

A diagnostic surface is not created because a topic is interesting,
controversial, politically active, or emotionally compelling. A surface is
created when there is an evidenced affected-status relationship that can be
qualified, recorded, inspected, and, where appropriate, published.

## Core Principle

Write access follows qualified affordance.

Publication authority follows evidence discipline.

Infrastructure posture follows sensitivity, obstruction expectation, and
persistence requirement.

## Relationship to Diagnostic Families

Diagnostic families identify the broad kind of affectedness. This taxonomy
decides how a specific surface behaves.

Example:

- Diagnostic family: Private Governance
- Affordance: `HOA_MEMBER`
- Surface: HOA assessment escalation diagnostics
- Qualification: parcel-linked owner/member evidence, assessment account
  evidence, records evidence
- Exposure posture: authenticated first, public publication only after review
- Persistence: durable record with selected IPFS-pinned releases

## Qualification Dimensions

### 1. Affordance Family

Which broad family gives this surface its diagnostic purpose?

Values:

- Residency
- Parcel / Dwelling
- Private Governance
- Public Governance
- Procedural / Evidentiary
- Expert

A surface may involve multiple families. The primary family should be the one
that controls qualification.

### 2. Affordance Identifier

What exact affected-status capacity qualifies a participant to write into this
surface?

Example values:

- `CURRENT_RESIDENT`
- `COUNTY_RESIDENT`
- `PARCEL_LINKED_OCCUPANT`
- `PROPERTY_TAXPAYER`
- `HOA_MEMBER`
- `PARENT_OF_STUDENT`
- `PUBLIC_RECORDS_REQUESTER`
- `COURT_LINKED_PARTY`
- `SUBJECT_MATTER_EXPERT`

The identifier should be stable. Do not create new identifiers when an existing
affordance can be narrowed by evidence rules.

### 3. Affectedness Type

How is the participant affected?

Values:

- Directly affected person
- Indirectly affected person
- Household-linked person
- Address-linked person
- Parcel-linked person
- Procedural party
- Direct witness
- Records custodian
- Subject-matter expert
- Technical operator
- Professional actor
- Observer

Observer status may permit hear/read access without speak/write access.

### 4. Evidence Requirement

What must be shown before a participant may write into the diagnostic record?

Values:

- Self-attested
- Address-evidenced
- Mail-evidenced
- County-boundary-evidenced
- Parcel-evidenced
- Occupancy-evidenced
- Tax-evidenced
- Association-record-evidenced
- Public-record-evidenced
- Case-linked
- Credential-evidenced
- Expert-reviewed
- Multi-source verified

Self-attestation may be acceptable for low-risk discussion. It should not be
enough for durable diagnostic publication where the claim depends on affected
status.

### 5. Access Mode

What actions are permitted for this participant on this surface?

Values:

- Hear
- Read
- Attend
- Comment
- Submit evidence
- Speak
- Write
- Publish
- Moderate
- Administer

Read access and write access should not be conflated.

### 6. Surface Sensitivity

How much harm, obstruction, retaliation, confusion, or exposure could result
from mishandling this surface?

Values:

- Ordinary civic
- Personal but low-risk
- Personally sensitive
- Financially sensitive
- Legally entangled
- Adversarial
- Controversial
- High-risk
- Sealed / restricted

Sensitivity is not a reason to avoid a surface. It is a reason to choose the
correct qualification and exposure posture.

### 7. Exposure Posture

Where and how should the surface be visible?

Values:

- Public web
- Public Git repository
- Public Fediverse
- Authenticated Fediverse
- County-local node
- Private workspace
- Private WireGuard mesh
- Expert-only workspace
- Archive-only publication
- Sealed / restricted access

Public exposure is not always diagnostic maturity. Some surfaces should begin
privately and publish only structured findings.

### 8. Protocol Fit

What protocol or medium fits the surface's qualification, cooperation,
persistence, and exposure needs?

Values:

- DNS
- Zot6
- ActivityPub
- Email / CEAS
- Git
- IPFS
- Web publication
- LDAP-backed identity
- Database-backed workflow
- Private WireGuard
- Future CAD protocol

The Fediverse may be useful for some surfaces, but it is not automatically the
correct tool for every diagnostic surface.

CEAS may fit surfaces where mail-evidenced participation, civic email aliases,
reachability, sender authorization, or alias validation are relevant.

IPFS is preferred for selected public artifacts that require content-addressed
persistence, not for raw uncontrolled evidence dumping.

### 9. Persistence Requirement

How durable should the record be?

Values:

- Temporary discussion
- Working note
- Internal diagnostic record
- Durable diagnostic record
- Published finding
- IPFS-pinned artifact
- Signed release
- Immutable audit artifact

Immutability preserves records. It does not make records true.

### 10. Cooperation Mode

Who may cooperate on this surface, and through what boundary?

Values:

- Local only
- Same-county participants
- Same-state participants
- County-to-county compatible
- Expert-pool federation
- Public federation
- Private federation
- Protocol-only compatibility
- No cooperation / isolated

The 3000+ county model depends on compatible replication, not centralized
control.

### 11. Obstruction Expectation

How much resistance, discrediting, delay, retaliation, legal threat, platform
abuse, or procedural obstruction should the surface expect?

Values:

- Low
- Medium
- High
- Hostile

A hostile surface may require stronger evidence rules, private staging, limited
write access, careful publication, and independent infrastructure.

### 12. Qualification Authority

Who or what determines whether a participant, record, or claim qualifies?

Values:

- Self-qualification
- Operator review
- Expert review
- Records review
- Multi-party review
- Published rule
- County implementation rule
- Protocol rule

Qualification authority should be explicit and inspectable. Where possible,
qualification should be rule-based rather than personality-based.

### 13. Publication Authority

Who can publish findings or artifacts beyond the working surface?

Values:

- No publication
- Participant publication
- Operator publication
- Expert-reviewed publication
- Multi-party approved publication
- Automated publication
- Signed release
- IPFS-pinned release

Writing into a working record is not the same as publishing a finding.

### 14. Replication Rule

Can this surface be replicated by another county, and under what conditions?

Values:

- Local-only
- County-template compatible
- State-specific variant
- National model
- Experimental
- Deprecated
- Not replicable

Replication should preserve vocabulary, qualification discipline, access rules,
and non-authority posture.

## Surface Profile Template

Use this template when defining a new diagnostic surface.

```yaml
surface_name:
status: draft
affordance_family:
affordance_identifier:
affectedness_type: []
evidence_requirement: []
access_mode: []
surface_sensitivity: []
exposure_posture: []
protocol_fit: []
persistence_requirement: []
cooperation_mode: []
obstruction_expectation:
qualification_authority: []
publication_authority: []
replication_rule: []
non_authority_notes:
evidence_notes:
open_questions: []
```

## Example Surface Profile: Current Resident

```yaml
surface_name: Current Resident
status: draft
affordance_family: Residency
affordance_identifier: CURRENT_RESIDENT
affectedness_type:
  - Directly affected person
  - County resident
  - Address-linked person
evidence_requirement:
  - Address-evidenced
  - Mail-evidenced
  - County-boundary-evidenced
access_mode:
  - Read
  - Submit evidence
  - Write after qualification
surface_sensitivity:
  - Ordinary civic
  - Personally sensitive
exposure_posture:
  - Authenticated Fediverse
  - County-local node
  - Selected public web publication
protocol_fit:
  - DNS
  - Zot6
  - Email / CEAS
  - LDAP-backed identity
  - IPFS for selected attestations
persistence_requirement:
  - Durable diagnostic record
  - Selected IPFS-pinned artifact
cooperation_mode:
  - Same-county participants
  - County-to-county compatible
obstruction_expectation: Medium
qualification_authority:
  - Published rule
  - Operator review
publication_authority:
  - Operator publication
  - Signed release where appropriate
replication_rule:
  - County-template compatible
non_authority_notes: Does not certify citizenship, voter eligibility, legal status, or political representation.
evidence_notes: CEAS and SASE may support mail-evidenced participation where adopted by the county root.
open_questions: []
```

## Example Surface Profile: HOA Member

```yaml
surface_name: HOA Member
status: draft
affordance_family: Private Governance
affordance_identifier: HOA_MEMBER
affectedness_type:
  - Directly affected person
  - Parcel-linked person
  - Association-linked person
evidence_requirement:
  - Parcel-evidenced
  - Association-record-evidenced
  - Public-record-evidenced where available
  - Case-linked where applicable
access_mode:
  - Read
  - Submit evidence
  - Write after qualification
  - Speak after qualification
surface_sensitivity:
  - Financially sensitive
  - Legally entangled
  - Adversarial
  - High-risk where litigation or retaliation risk exists
exposure_posture:
  - Authenticated Fediverse
  - Private workspace for staging
  - Public web only for reviewed findings
  - IPFS only for selected durable artifacts
protocol_fit:
  - Zot6
  - Git for doctrine
  - Database-backed workflow
  - IPFS for reviewed publication
  - Private WireGuard where hostile cooperation requires it
persistence_requirement:
  - Internal diagnostic record
  - Durable diagnostic record
  - Published finding only after review
  - Selected immutable audit artifact
cooperation_mode:
  - Same-county participants
  - Expert-pool federation
  - County-to-county compatible after model stabilization
obstruction_expectation: Hostile
qualification_authority:
  - Operator review
  - Expert review where needed
  - Published rule
publication_authority:
  - Expert-reviewed publication
  - Multi-party approved publication where feasible
replication_rule:
  - State-specific variant
  - County-template compatible after legal/context adaptation
non_authority_notes: Does not govern, represent, adjudicate, or replace an HOA.
evidence_notes:
open_questions: []
```
