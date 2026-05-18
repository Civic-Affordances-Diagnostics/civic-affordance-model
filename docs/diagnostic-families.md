# Diagnostic Families

Status: Draft  
Repository: `civic-affordance-model`  
Scope: Civic Affordances Diagnostics

## Purpose

This document defines the initial diagnostic families for Civic Affordances Diagnostics.

A diagnostic family is a reusable category of civic affordances. It groups related affected-status capacities so that diagnostic surfaces can be designed with clear qualification rules, evidence anchors, and access boundaries.

This document does not create a government body, court, law firm, regulator, homeowners association, representative organization, or advocacy campaign. It preserves vocabulary for diagnostic infrastructure.

## Core Definitions

### Civic Affordance

A civic affordance is the evidenced capacity of a person, household, role, or qualified actor to claim affected status in relation to a residential, local, public, private-governance, procedural, or expert domain.

A civic affordance is not merely an opinion, interest, preference, political position, or social identity. It must have an affected-status claim and some possible evidence anchor.

### Civic Affordance Stacking

Civic affordance stacking is the cumulative layering of affected-status categories.

The stack is not a hierarchy. A person may be affected through multiple direct layers at once, such as:

- United States resident
- Illinois resident
- Kane County resident
- HOA member
- parcel-linked occupant
- property taxpayer
- court-linked party
- subject-matter expert
- direct witness

The diagnostic purpose is to make the affected-status stack legible before remedies, advocacy, litigation, policy proposals, or institutional claims are considered.

### Diagnostic Surface

A diagnostic surface is the structured place where a civic affordance can be inspected, evidenced, recorded, discussed, or published under qualification rules.

A diagnostic surface may be public, private, federated, expert-gated, county-local, IPFS-published, archive-only, or otherwise constrained.

### Speak / Write vs. Hear / Read

Civic Affordances Diagnostics distinguishes between access to observe and access to contribute.

- Hear / Read: observing, learning, auditing, reviewing, or inspecting.
- Speak / Write: contributing to the diagnostic record.

The model does not assume that everyone who can read a diagnostic surface is qualified to write into it.

## Design Principle

A diagnostic family exists only where there is a real affected-status capacity that can be described, evidenced, and qualified.

The model should avoid creating surfaces merely because a topic is controversial, interesting, politically active, or emotionally compelling.

## Initial Diagnostic Families

### 1. Residency Affordances

Residency affordances concern the relationship between a person or household and a civic geography.

#### Initial affordances

- `CURRENT_RESIDENT`
- `COUNTY_RESIDENT`
- `MUNICIPAL_RESIDENT`
- `UNINCORPORATED_RESIDENT`

#### Why this family matters

Residency is often the first civic boundary. It affects eligibility, reachability, services, taxation, jurisdiction, representation, local identity, records access, public participation, and practical affectedness.

`CURRENT_RESIDENT` is currently the most substantial affordance because it can become infrastructure: address eligibility, mail reachability, county boundary discipline, CEAS, diagnostics, and county-replicable participation.

#### Typical evidence anchors

- residential address
- postal reachability
- SASE or other mail-based evidence
- county boundary
- municipal or unincorporated boundary
- service address
- voter or tax records where appropriate
- direct county-level records

#### Notes

Residency affordances should not be reduced to voter status. Voter registration may be an affordance, but residency is broader.

---

### 2. Parcel / Dwelling Affordances

Parcel and dwelling affordances concern affectedness tied to a specific parcel, dwelling, unit, structure, address, occupancy arrangement, or property-risk condition.

#### Initial affordances

- `PARCEL_LINKED_OCCUPANT`
- `PROPERTY_TAXPAYER`
- `TENANT_OCCUPANT`
- `CONDO_UNIT_OWNER`
- `FLOODPLAIN_AFFECTED_RESIDENT`

#### Why this family matters

A person may be deeply affected by a parcel or dwelling without fitting the casual label “homeowner.” Title, occupancy, taxation, beneficial use, insurance risk, land-use status, environmental hazard, and legal duty can diverge.

This family keeps the diagnostic model from flattening affected persons into a single ownership category.

#### Typical evidence anchors

- parcel number / PIN / APN
- deed or title record
- lease
- assessment or tax bill
- occupancy evidence
- utility bill
- condominium declaration
- floodplain or hazard map
- insurance or damage record
- county GIS
- building, zoning, septic, well, or health department record

#### Notes

`PARCEL_LINKED_OCCUPANT` should be treated as a high-value diagnostic term because it can capture real affectedness without incorrectly claiming title ownership.

---

### 3. Private Governance Affordances

Private governance affordances concern governance systems that are not ordinary government but still impose rules, costs, obligations, restrictions, records, procedures, and institutional control.

#### Initial affordances

- `HOA_MEMBER`
- `HOA_BOARD_MEMBER`
- `HOA_VENDOR`
- `HOA_MANAGER`
- `HOA_COUNSEL_PROFESSIONAL_ACTOR`

#### Why this family matters

`HOA_MEMBER` is currently the most consequential affordance because it exposes the asymmetry between affected members and the operating surface of the HOA: boards, managers, attorneys, vendors, insurers, accountants, and other paid or institutionally recognized actors.

The HOA model is not the master model for Civic Affordances Diagnostics, but it is a critical proof-of-concept for private governance diagnostics.

#### Typical evidence anchors

- recorded declaration
- bylaws
- deed or unit ownership record
- assessment account
- meeting notice
- board minutes
- management contract
- attorney correspondence
- vendor contract
- enforcement notice
- fine, lien, collection, or litigation record
- direct role evidence

#### Diagnostic questions

- Who is paid?
- Who is unpaid?
- Who controls records?
- Who controls counsel?
- Who controls the agenda?
- Who controls the money?
- Who can shift costs?
- Who can impose fines, liens, late fees, or collection pressure?
- Who must self-fund evidence?
- Who benefits from delay, complexity, and escalation?

#### Notes

The purpose is diagnostic, not representational. The surface should not claim to govern an HOA, represent all members, practice law, adjudicate misconduct, or replace a board.

---

### 4. Public Governance Affordances

Public governance affordances concern affected-status relationships with public bodies, public districts, public services, public records, elections, schools, taxation, and government-created boundaries.

#### Initial affordances

- `REGISTERED_VOTER`
- `SCHOOL_DISTRICT_RESIDENT`
- `PARENT_OF_STUDENT`
- `SPECIAL_DISTRICT_RATEPAYER`
- `PUBLIC_RECORDS_REQUESTER`

#### Why this family matters

Public governance creates many distinct affected-status relationships that are not the same as residency alone.

A parent of a student, public records requester, school district resident, special district ratepayer, or registered voter may each have different evidence anchors, rights, liabilities, procedures, and limitations.

#### Typical evidence anchors

- voter registration record
- school enrollment record
- guardianship or parent relationship evidence
- school district boundary
- tax bill
- special district boundary
- service bill
- public records request
- FOIA request / response / denial / appeal
- meeting notice
- agenda or minutes

#### Notes

Public governance affordances may require special care because some surfaces may be politically controversial, legally constrained, or affected by election, privacy, student, or public-records rules.

---

### 5. Procedural / Evidentiary Affordances

Procedural and evidentiary affordances concern direct involvement in a process, record, dispute, enforcement action, permit path, court matter, or factual event.

#### Initial affordances

- `COURT_LINKED_PARTY`
- `PERMIT_APPLICANT`
- `CODE_ENFORCEMENT_SUBJECT`
- `DIRECT_WITNESS`
- `RECORD_CUSTODIAN`

#### Why this family matters

Some participants are qualified to write into a diagnostic surface not because of residence or ownership, but because they are directly connected to a procedure or record.

This family keeps the model from confusing affected civic standing with factual or procedural relevance.

#### Typical evidence anchors

- case number
- court filing
- order
- notice
- permit application
- permit denial or approval
- inspection record
- citation
- code-enforcement complaint
- firsthand evidence
- record custody role
- official correspondence
- timestamped documentary evidence

#### Notes

A procedural or evidentiary affordance may be narrow. A person may be qualified to write about a specific case, permit, record, or event without being qualified to write broadly into other surfaces.

---

### 6. Expert Affordances

Expert affordances concern qualified contribution based on training, work history, licensure, technical operation, publication, case experience, or demonstrated subject-matter competence.

#### Initial affordances

- `SUBJECT_MATTER_EXPERT`
- `LICENSED_PROFESSIONAL`
- `TECHNICAL_OPERATOR`
- `CASE_LAW_MATCHED_PARTICIPANT`

#### Why this family matters

Civic Affordances Diagnostics depends on subject experts, not donors, popularity, institutional permission, or general commentary.

Expert affordances allow qualified participants to write within their field of competence, even where they are not personally affected in the same way as a resident, member, owner, tenant, or litigant.

#### Typical evidence anchors

- license
- credential
- formal training
- work history
- publication history
- technical operation record
- court or case familiarity
- code / infrastructure contribution
- professional correspondence
- prior expert report
- documented domain experience

#### Notes

Expert affordance is not unlimited authority. It is scoped to the relevant competence.

A licensed attorney, accountant, engineer, manager, software operator, records specialist, or other professional may be qualified to write in one diagnostic surface and unqualified in another.

## Initial Priority Affordances

The following affordances should be treated as the first expansion set:

1. `CURRENT_RESIDENT`
2. `HOA_MEMBER`
3. `PROPERTY_TAXPAYER`
4. `PARCEL_LINKED_OCCUPANT`
5. `PUBLIC_RECORDS_REQUESTER`
6. `PARENT_OF_STUDENT`
7. `SCHOOL_DISTRICT_RESIDENT`
8. `SPECIAL_DISTRICT_RATEPAYER`
9. `COURT_LINKED_PARTY`
10. `SUBJECT_MATTER_EXPERT`

## Naming Convention

Affordance names should be stable, explicit, uppercase, and underscore-separated when used as identifiers.

Example:

- Display name: Current Resident
- Identifier: `CURRENT_RESIDENT`

Avoid names that imply government authority, legal representation, adjudication, enforcement power, or institutional endorsement.

## County Replication Note

The diagnostic families are not limited to Kane County, Illinois.

Kane County may be the first implementation scope, but the families should be designed so that other U.S. counties can implement compatible county-local diagnostic surfaces.

The general pattern is:

1. define the affordance family;
2. define the local evidence anchors;
3. define who may speak/write;
4. define who may hear/read;
5. define the surface sensitivity;
6. define the exposure posture;
7. define the publication and persistence rules;
8. define how another county can replicate or compare the surface.

## Non-Authority Statement

Civic Affordances Diagnostics is not a government body, regulator, court, law firm, homeowners association, management company, public agency, representative organization, or advocacy campaign.

The diagnostic families define surfaces for identifying, qualifying, recording, and publishing affected-status relationships.
