# Civic Infrastructure: Estimated Demand Ranking

Status: Draft  
Repository: `civic-affordance-model`  
Scope: Civic Affordances Diagnostics

## Purpose

This document ranks civic infrastructure components by estimated public demand
as it exists today — not by technical merit, not by what people should want,
and not by what serves long-term civic health.

It is a social diagnostic. It reflects how society actually functions today.

It informs two decisions: what to publish first, and what to develop first.

## Method

The ranking is based on observed behavior: what people reach for instinctively,
what they discover under pressure, what they recognize but do not use, and what
they do not know exists or actively distrust.

This is not a survey. It is a pattern reading from existing civic behavior —
the HOA member searching Reddit at 11pm, the community recording a city council
meeting on a phone, the group chat where actual organizing happens, the YouTube
video that exists before the event is over.

## The Ranking

---

### Tier 1 — Already in use. Not thought of as infrastructure.

These are the components people are already using without naming them as civic
infrastructure. Demand is high because the barrier is zero. People carry the
tools. The behavior is instinctive.

- **Video** (YouTube, short-form video): Instant, shareable, emotional, no
  friction. The single most powerful civic documentation tool in existence
  today. People record what matters without being asked to.

- **Social media posts and threads** (X, Facebook, Instagram, TikTok): The
  primary channel through which people express civic grievance, organize
  reaction, and find others in the same situation.

- **Group chats** (WhatsApp, Signal, Telegram): Where actual organizing
  happens. Invisible to institutions. High trust, high speed, no overhead.

- **Forum threads and community boards** (Reddit, local Facebook groups): Where
  people search for answers to civic problems they do not know how to name. "Is
  my HOA allowed to do this." "What happens if the city does not respond to my
  complaint." This is where affected people find each other.

---

### Tier 2 — Wanted when needed. Not thought about until the problem arrives.

These components are not instinctive but become highly desirable the moment
someone realizes their situation requires them.

- **Searchable public record**: People discover they want this the moment they
  try to find out what happened before they arrived — at a property, in a
  community, in a dispute. The demand is reactive but strong.

- **Document hosting and sharing** (Google Drive, Dropbox links): Already in
  widespread use but unstructured. People share what they have. The problem is
  not the sharing, it is that the record does not survive the platform or the
  account.

- **Maps and parcel data**: High demand once someone realizes their problem has
  a geographic boundary. Flood zones, HOA boundaries, school districts, tax
  parcels. People want to see where they stand.

- **Podcasts and audio**: Growing civic use, particularly local. Lower
  production barrier than video. Allows longer, more detailed civic narrative.

---

### Tier 3 — Recognized. Uncertain demand.

These components are known by name to a portion of the population but are not
instinctively reached for. The gap between what people should want and what
they actually want is widest here.

- **Email newsletters**: High value to older demographics and civic
  organizations. Associated with spam by younger users. Demand exists but is
  uneven and declining in some populations.

- **RSS and web feeds**: Nearly invisible to general users. Highly valued by
  the minority who use them. Would benefit civic infrastructure significantly if
  more people knew what they were.

- **Mailing lists**: Functionally powerful. Almost nobody under 40 knows what
  they are or asks for one. Should not be ranked high because they should be
  useful. Ranked here because they are not perceived as desirable.

- **DNS and domain identity**: Nobody thinks about this until something breaks
  or is taken away. The Internet Society's attempted transfer of `.org` to
  private equity is a case study: the diagnostic signal was visible, the
  affected population was enormous, and almost none of them knew what DNS was
  until the threat was explained to them.

---

### Tier 4 — Low perceived demand. Unknown, technical, or distrusted.

These components have real value within the model but face the highest barrier
to adoption. Some are unknown. Some are associated with technical complexity.
Some are actively distrusted.

- **Fediverse and federated social** (ActivityPub, Zot6, Diaspora): Growing but
  niche. Common reaction: "why isn't it just Twitter." Distrust of complexity
  and unfamiliarity with the decentralization argument.

- **IPFS and content-addressed storage**: Invisible to nearly everyone. Valued
  by a small technical minority. The use case — durable, tamper-evident
  publication — is highly desirable in concept; the implementation is not
  perceived as desirable because it is not understood.

- **Blockchain and distributed attestation**: Polarizing. A portion of the
  population associates it with the future of trust and permanence. A larger
  portion associates it with financial speculation and fraud. The underlying
  function has genuine civic value; the branding does not currently help.

- **WireGuard and private peering**: Zero public demand. Pure operator-layer
  infrastructure. Perceived desirability is effectively zero outside technical
  operators, which is appropriate.

- **I2P, Tor, and anonymous overlay networks**: Associated by most with either
  serious privacy advocacy or illegal activity. Demand exists in specific
  populations — journalists, activists, people in hostile jurisdictions — but
  is not general.

- **OpenNIC and alternative DNS roots**: Essentially unknown outside a small
  technical community. The underlying concern — who controls the naming layer of
  the internet — is civically important. The tool is not perceived as desirable
  because the concern is not yet legible to most people.

- **LDAP and directory services**: Nobody asks for this by name. Ever.
  Invisible by design. Infrastructure layer only.

---

## What This Ranking Means for Development

The ranking is not an instruction to abandon Tier 4. It is an instruction to
understand what connects them.

Tier 1 is where affected people already are. Tier 4 is where durable,
qualified, tamper-evident civic records live. The design problem is the
distance between them.

The components that close that distance — intake that meets people where they
are, translation that makes Tier 4 functions legible without requiring Tier 4
knowledge — are the development priority.

A person with a phone video and a Reddit post should be able to contribute to a
Diagnostic Surface without knowing what IPFS is. The durable record should
exist without the contributor needing to understand how it works.

## What This Ranking Means for Publication

Publish this document before any technical specification.

It establishes, plainly and honestly, that Civic Infrastructure is not being
designed for a technical audience. It is being designed for the person who is
already recording, already posting, already searching — and has nowhere
trustworthy to put what they have found.
