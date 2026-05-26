# Navigation Design

## Purpose

The Civic Workspace must be participant-facing.

It is not an administrator utility, developer utility, theme setting, or PDL Editor workflow. It is the page participants should eventually reach in ordinary use.

## Required navigation quality

The navigation path should be:

- discoverable by signed-in participants;
- expressed in plain user-facing language;
- independent of Hubzilla administration pages;
- compatible with normal Hubzilla channel identity and permissions;
- suitable for future JSON-defined applications loaded into the same workspace.

## Candidate labels

Candidate public labels include:

- Civic Workspace
- My Workspace
- My Claims
- Forms
- Workspace

The name should not expose implementation language such as PDL, Comanche, JSON, runtime, or module.

## Initial behavior

The first page may be blank or nearly blank. Its purpose is to prove:

- the route exists;
- the page loads;
- the participant can reach it through normal navigation;
- visitors and unrelated users do not accidentally enter a workflow;
- the page can later host the JSON Form Runtime.

## Later behavior

After the JSON Form Runtime exists, the same workspace may load JSON definitions for different purposes, such as:

- generic form workflows;
- personal JSON-backed tools;
- email-client style interfaces;
- password-manager style interfaces;
- import/export tools;
- Civic Infrastructure claim workflows.
