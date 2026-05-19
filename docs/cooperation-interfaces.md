# Cooperation Interfaces

Status: Draft  
Repository: `civic-affordance-model`  
Scope: Civic Affordances Diagnostics

## Purpose

This document defines the cooperation interfaces by which independent county implementations may recognize, route to, federate with, compare, or otherwise cooperate with one another.

This is a model document, not a product specification. It does not prescribe a hosting provider, virtualization system, software distribution, business model, funding model, legal theory, or internal administrative design for any county implementation.

A Kane County reference implementation may use one local infrastructure stack. Another county root may use a different stack. The model concerns itself with the interfaces exposed for cooperation, not the private substrate behind those interfaces.

## Core Principle

Civic Affordance Diagnostics defines interfaces, not permission.

A county root may build, operate, fork, decline, peer, federate, publish, or isolate according to its own local ownership and judgment. Cooperation begins only where one root intentionally exposes an interface and another root elects to recognize or use that interface.

## Definitions

### Civic Infrastructure

Civic Infrastructure is infrastructure for surfacing, inspecting, recording, routing, publishing, or comparing civic affordances.

It is not a government body, court, regulator, law firm, representative organization, social-media company, campaign, charity, public utility, or commercial platform.

### County Root

A county root is a local owner-operator or operator group that declares and operates a county-state civic infrastructure surface.

The word "root" does not mean that the operator has authority over other counties, other roots, or the cooperative network. It identifies the local operational root for a declared surface.

### County-State Surface

A county-state surface is a declared civic infrastructure surface for a specific county and state.

Examples:

```text
kane-il.us
orange-ca.ankerpoint-sawmill.com
dupage-il.example.org
maricopa-az.operator.example
```

The parent domain identifies the contributor's naming root. The county-state label identifies the civic surface being contributed.

### Cooperation Interface

A cooperation interface is a defined point where a county implementation can be discovered, resolved, reached, queried, federated with, attested against, or otherwise used by another implementation.

The model does not require every county root to expose every interface.

### Cooperative Recognition

Cooperative recognition means that one or more roots have elected to recognize, resolve, route, peer, federate, query, publish, or otherwise cooperate with a declared interface.

Recognition is not endorsement. Recognition is not permission. Recognition is not legal, ethical, commercial, or political certification.

## Cooperation Doctrine

### Infrastructure / Purpose Separation

Civic Infrastructure provides cooperation surfaces. It does not certify, endorse, supervise, or assume responsibility for every purpose pursued through those surfaces.

The wiring is not the purposing.

A contributor's infrastructure may enable discovery, routing, federation, directory lookup, mail exchange, attestation, diagnostic publication, or other civic affordance functions. Those technical functions do not convert the cooperative network into the author, sponsor, representative, regulator, attorney, advocate, publisher, or guarantor of a local actor's conduct.

The model does not exist to declare itself "law-abiding," "legal," or "ethical" as a general institutional posture. Each root and local actor remains responsible for its own acts, purposes, claims, contracts, publications, and choices.

### Diagnostics Before Solution

Civic Affordance Diagnostics does not exist to solve every civic, legal, technical, economic, administrative, or social condition surfaced by the infrastructure.

It exists to expose them.

Acceptance, refusal, cooperation, non-cooperation, forking, obstruction, capture attempts, spam, abuse, litigation threats, implementation failures, technical incompatibilities, and local disagreement are all diagnostic signals.

The model does not require those signals to be hidden, neutralized, or prematurely resolved. A surfaced condition is useful because it can be inspected, compared, documented, routed around, forked from, or used to improve later implementations.

### The Network Diagnoses Itself

The cooperative network is not only a carrier of diagnostic surfaces. It is itself a diagnostic subject.

Each interface exposes evidence about the network: which roots cooperate, which roots refuse, which implementations fork, which actors attempt capture, which interfaces prove durable, which interfaces fail, and which local conditions require different treatment.

A refusal to cooperate is not automatically a defect. A fork is not automatically a failure. An obstruction is not automatically an emergency. Each may reveal useful information about the civic, technical, economic, administrative, or local conditions surrounding a county implementation.

### No Duty to Resolve

Civic Infrastructure has no general duty to resolve the conditions it exposes.

A diagnostic surface may reveal a dispute, incompatibility, obstruction, absence, failure, capture attempt, or abuse pattern. The act of surfacing that condition does not make the network responsible for curing it.

The model prefers inspectable exposure over concealed fragility.

### Cooperation Is Not Permission

Civic Infrastructure does not grant permission to build.

Owner-operators may build infrastructure for their own purposes without requesting approval from the cooperative network. Cooperation begins only when another root elects to recognize, route, peer, federate, resolve, exchange, query, or otherwise interoperate with that infrastructure.

### Recognition Is Not Endorsement

Cooperative recognition is technical and relational. It means that one or more roots have elected to cooperate with a declared interface.

Recognition does not imply endorsement of every local actor, statement, business, campaign, civic claim, diagnostic surface, contract, publication, or use case associated with that county implementation.

### Local Sovereignty

Each county implementation is locally owned and locally administered.

The cooperative model does not impose a uniform business model, hosting model, legal theory, moderation model, funding model, virtualization stack, or operational chain of command on independent county roots.

### Interface Minimalism

The model defines interfaces, not internal architecture.

A county root may use Proxmox, LXD, rented infrastructure, residential infrastructure, commercial hosting, donated systems, or other arrangements. Those choices are local.

The cooperative network concerns itself only with exposed cooperation interfaces.

### One Declared Endpoint Per Interface

A county root should expose one clearly identified cooperation endpoint per interface family it chooses to offer.

For a declared county-state surface, this means:

- one logical public ingress;
- one DNS cooperation point;
- one Fediverse node if Fediverse cooperation is offered;
- one directory cooperation surface if LDAP or directory cooperation is offered;
- one mail cooperation surface if Email or CEAS cooperation is offered;
- one WireGuard peering surface if WireGuard cooperation is offered;
- one attestation publication surface if attestation cooperation is offered.

This rule applies per declared county-state surface. It does not create a monopoly over the county.

Multiple roots may declare county-state surfaces for the same county under domains they control. Those surfaces may compete, specialize, cooperate, diverge, or be compared.

### Interface-Specific Consent

Cooperation is interface-specific.

A root may cooperate for DNS while declining Fediverse federation, WireGuard peering, LDAP exchange, DANE reliance, mail exchange, attestation mirroring, or any other interface.

No interface implies consent to all other interfaces.

### Plurality Without Monopoly

The model does not require a single canonical county domain or a single recognized county operator.

Multiple contributors may declare surfaces for the same county. This is not a defect. It permits local competition, specialization, redundancy, comparison, and experimentation.

A contributor may specialize in an affordance family. One Orange County, California surface may emphasize `LICENSED_PROFESSIONAL`. Another may emphasize `FLOODPLAIN_AFFECTED_RESIDENT`. The existence of one does not invalidate the other.

### Local Commerce Without Purchased Entitlement

Civic Infrastructure is not required to be free of cost.

Each county implementation is locally owned and may arrange its own commerce, contracts, hosting, administration, consulting, technical support, implementation work, and contributor attribution.

A local business, charity, professional, resident, technical operator, or other qualified actor may hire a local root or technical contributor to implement infrastructure or connect the actor to a county cooperation surface.

Those local arrangements do not bind the cooperative network.

Payment, contract, sponsorship, hosting, consulting, donation, or local commercial arrangement does not create entitlement to cooperative recognition.

### Local Attribution and Anti-Capture

Civic Infrastructure may expose local economic attribution, local contribution, and local commerce. It must not become a scalable advertising network, corporate sponsorship layer, or cross-county capture mechanism.

Visibility belongs to local contribution and local standing, not remote purchase.

A sawmill in the same county may be visible in that county's civic infrastructure when it has local standing or direct contribution. A sawmill in another county, state, country, continent, planet, or galaxy has no automatic claim to attention inside the local county surface.

### Isolation Is the Enforcement Primitive

The cooperative network does not need to punish a defective, fraudulent, captured, or incoherent implementation.

Roots may simply decline or remove cooperation. The implementation may continue to exist locally, but without cooperative DNS recognition, federation, routing, peering, directory exchange, mail exchange, or other network support.

Isolation is not central punishment. It is the ordinary consequence of declined cooperation.

## Interface Catalog

The following interface catalog is intentionally minimal. It defines where cooperation may occur. It does not define the entire internal implementation of a county root.

### 1. Public Ingress Interface

The public ingress interface is the declared entry point through which the county-state surface can be reached from the public Internet.

A county root should declare one logical public ingress for each county-state surface it exposes.

The public ingress may terminate HTTP, HTTPS, mail submission, mail exchange, Fediverse traffic, directory traffic, validation endpoints, or other services through routing controlled by the local root.

The public ingress does not reveal or prescribe the internal topology. A root may use reverse proxies, containers, VMs, private networks, tunnels, residential systems, commercial hosting, or other arrangements behind the ingress.

The cooperation record should identify:

- the county-state surface;
- the domain name used for the public ingress;
- the public address or names through which ingress is reached;
- the services intentionally exposed through that ingress;
- the operator attribution for the ingress;
- the interfaces that are explicitly not offered.

### 2. DNS Cooperation Interface

The DNS cooperation interface is the first and most general cooperation surface.

DNS cooperation supports discovery, delegation, naming, service records, attribution records, DANE records, validation endpoints, and other functions useful to civic infrastructure.

A county root may expose a county-state DNS surface under any domain it controls.

Examples:

```text
kane-il.us
orange-ca.ankerpoint-sawmill.com
dupage-il.example.org
```

The model does not require the parent domain to be controlled by a central project.

The DNS cooperation interface may support:

- discovery of public ingress;
- service records for Fediverse, mail, directory, validation, or attestation services;
- MX records for mail cooperation;
- TLSA records where DANE is used;
- TXT records for interface declarations or operator attribution;
- NS records where a county-state zone is delegated;
- records needed for ordinary service operation.

DNS cooperation does not imply cooperation with every service named in DNS. Each service remains interface-specific.

#### DNS Surface Rule

A DNS surface should be declared in a stable county-state form.

Recommended label pattern:

```text
<county>-<state>
```

Examples:

```text
kane-il
orange-ca
dupage-il
```

The county-state label is a civic surface label, not a claim of monopoly over the county.

#### DNS Recognition

A root may recognize another root's DNS surface by resolving it, linking to it, delegating to it, publishing it in a cooperation index, including it in local diagnostics, or otherwise treating it as a cooperative surface.

A root may also decline or remove DNS cooperation if the declared surface is incoherent, captured, misleading, astroturfed, fraudulent, or outside the accepting root's cooperation policy.

DNS removal leaves the rejected implementation local and stranded from that cooperation layer. It does not prevent the implementation from existing.

### 3. Fediverse Cooperation Interface

The Fediverse cooperation interface is the declared social and diagnostic federation surface for a county implementation.

A county root may expose one Fediverse node for federation, diagnostics, publication, discussion, discovery, or compatible county-to-county cooperation.

The model does not require every root to operate a Fediverse node.

A Fediverse cooperation declaration should identify:

- the node domain;
- the software family where relevant;
- the county-state surface it serves;
- the operator namespace;
- the participant namespace;
- whether remote federation is enabled;
- whether local-only diagnostic surfaces exist;
- any affordance families currently surfaced;
- any interfaces intentionally not federated.

Operator accounts and service accounts are not ordinary participant affordances. The operator namespace should remain distinct from participant diagnostic namespaces.

Fediverse cooperation is not endorsement of every post, channel, profile, group, actor, or remote interaction.

### 4. Directory / LDAP Cooperation Interface

The directory cooperation interface is the declared surface through which a county root may expose limited directory, eligibility, service-principal, address-boundary, or affordance metadata.

LDAP is one possible implementation of this interface. The model does not require every root to use LDAP internally.

A directory cooperation surface should not be treated as a general public dump of participant identity. It should expose only the directory functions intentionally declared by the local root.

A directory cooperation declaration should identify:

- the directory protocol or access method;
- the county-state surface;
- the directory base or discovery path where applicable;
- the classes of records exposed;
- whether the interface is public, root-to-root, authenticated, read-only, or restricted;
- whether address, alias, service-principal, affordance, or validation records are included;
- the privacy and persistence posture for each exposed class.

Directory cooperation does not imply that another root accepts the local root's evidence discipline. Roots may compare, reject, fork, or isolate directory claims.

### 5. Email / CEAS Cooperation Interface

The Email / CEAS cooperation interface is the declared surface for county-rooted mail exchange, alias validation, administrative service mail, and civic email affordance functions.

A county root may expose one mail cooperation surface for a county-state implementation.

This interface may include:

- MX records;
- SPF, DKIM, and DMARC records;
- DANE/TLSA records where used;
- service-principal mailboxes;
- CEAS aliases;
- validation endpoints;
- alias lifecycle rules;
- inbound and outbound mail policy;
- attachment, HTML, forwarding, quota, retention, or storage rules.

The model does not require every root to operate CEAS.

Email cooperation is not a general endorsement of messages sent through a local root. The mail system routes and validates technical affordances. It does not become the author, sponsor, advocate, or guarantor of every message.

### 6. WireGuard / Private Peering Interface

The WireGuard cooperation interface is the declared private peering surface between roots or compatible contributors.

A root may offer one WireGuard peering surface for county-to-county infrastructure cooperation, operational diagnostics, private service exchange, or administrative maintenance.

WireGuard cooperation should be explicit. DNS cooperation, Fediverse cooperation, directory cooperation, or mail cooperation does not imply WireGuard peering consent.

A WireGuard cooperation declaration should identify:

- the county-state surface;
- the peering purpose;
- the peer admission rule;
- the contact or operator process for peering;
- the allowed service routes;
- the interfaces intentionally excluded from the tunnel;
- the revocation process.

### 7. DANE / Trust Publication Interface

The DANE / trust publication interface is the declared surface through which a root publishes DNS-based trust material for services that choose to rely on it.

DANE cooperation is optional and depends on the DNS posture of the local root.

A DANE declaration should identify:

- the domain or zone where trust material is published;
- the services covered;
- the certificate or key rollover posture;
- whether other roots may rely on those records;
- whether DANE is offered for mail, HTTPS, directory, or other services.

DANE cooperation does not imply acceptance of the local root's entire stack.

### 8. Attestation / Durable Publication Interface

The attestation interface is the declared surface for durable publication, content addressing, release records, hash publication, IPFS records, or comparable diagnostic persistence.

This interface may be used to expose immutable or content-addressed records without making every underlying private fact public.

An attestation declaration should identify:

- the attestation method;
- the publication surface;
- the record classes included;
- whether records are public, root-to-root, delayed, redacted, hashed, or otherwise constrained;
- the retention posture;
- the verification method.

Attestation cooperation is diagnostic. It supports inspection, comparison, and persistence. It does not convert the network into the authority responsible for every attested purpose.

## Interface Declaration Pattern

Each declared cooperation interface should answer:

1. What county-state surface is being declared?
2. Which local root controls it?
3. Which domain names or endpoints identify it?
4. Which interface family is being offered?
5. What is intentionally not offered?
6. What affordance families does this interface support?
7. What local attribution is being exposed?
8. What evidence or operational basis supports the contribution?
9. What other roots currently recognize or decline it?
10. What diagnostic signals have been observed?

The answer may be short. The important point is that cooperation remains inspectable.

## Relationship to Existing Diagnostic Documents

This document does not replace the diagnostic families or surface qualification taxonomy.

The diagnostic families describe the affected-status affordances that may justify a surface.

The surface qualification taxonomy describes how a specific diagnostic surface decides who may write, who may read, what evidence is required, and what exposure posture applies.

This document describes how independent county implementations expose interfaces for cooperation.
