# Kane County Civic Infrastructure Network Design

Status: working design draft  
Scope: Kane County, Illinois reference implementation  
Domain under design: `diagnostics.kane-il.us`  
Apex domain preservation: `kane-il.us` remains unaffected

This document records the current network design for the Kane County Civic Infrastructure reference implementation. It is a network and host allocation document, not a deployment playbook and not a DNS zone file.

## Design Boundary

The Kane County implementation uses multiple public and private nodes. The design separates public transport, reverse proxying, IPFS publication/pinning, mail backend services, Hubzilla diagnostics, and Python orchestration.

The Linode public edge is intentionally appliance-like. It carries public DNS, WireGuard, and mail transport. It does not host the reverse proxy, web applications, mailboxes, LDAP authority, databases, Hubzilla, CEAS state, or participant accounts.

The reverse proxy belongs on the Proxmox side.

## Confirmed Public Edge Node

### `mx1.diagnostics.kane-il.us`

Provider/location: Linode, Chicago  
Primary public identity: `mx1.diagnostics.kane-il.us`  
Reason for primary identity: rDNS, SMTP banner, and mail transport alignment

| Item | Value |
|---|---:|
| Public IPv4 | `172.237.130.143` |
| Public IPv6 | `2600:3c06:e001:2ba::221/64` |
| WireGuard IPv4: | 10.0.0.1/24 |
| WireGuard IPv6: | fd56:98f0:6a9:10::1/64 |
| RAM | 1 GB |
| CPU | 1 vCPU |
| Storage | 25 GB |

### FQDNs on the Linode Public Edge

These names may resolve to the same Linode public IPv4/IPv6 addresses.

| FQDN | Role |
|---|---|
| `mx1.diagnostics.kane-il.us` | Public MTA relay / transport boundary; also system hostname and rDNS target |
| `ns1.diagnostics.kane-il.us` | BIND9 authoritative primary |
| `wg1.diagnostics.kane-il.us` | WireGuard public endpoint |

The name `ingress1.diagnostics.kane-il.us` is not assigned to the Linode in this design. Application ingress belongs to the reverse proxy node.

### Linode Service Scope

Allowed on this node:

- BIND9 authoritative DNS primary
- WireGuard public endpoint
- Postfix MTA relay / transport boundary
- Firewalling and packet forwarding needed for those services
- Operator/service administration only

Excluded from this node:

- nginx reverse proxy
- public web application hosting
- mailboxes
- Dovecot participant access
- LDAP authority
- databases
- Hubzilla
- CEAS state
- participant accounts

## Confirmed Reverse Proxy / DNS Secondary Node

### `ingress1.diagnostics.kane-il.us`

Role: reverse proxy, TLS termination, HTTP/HTTPS ingress, BIND9 secondary  
Placement: Proxmox public node

| Item | Value |
|---|---:|
| Public IPv4 | `15.235.0.200` |
| Public IPv6 | `2607:5300:203:8784::102` |
| Proxmox/LAN IPv4 | `192.168.1.102/16` |
| Proxmox/LAN IPv6 | `fd56:98f0:6a9::102/48` |
| WireGuard IPv4 | `10.0.0.102` |
| WireGuard IPv6 | `fd56:98f0:6a9:10::102/64` |
| Conservative RAM allocation | 2 GB |
| Conservative CPU allocation | 2 vCPU |
| Conservative storage allocation | 40 GB |

### FQDNs on the Reverse Proxy Node

| FQDN | Role |
|---|---|
| `ingress1.diagnostics.kane-il.us` | Public reverse proxy / HTTPS ingress |
| `ns2.diagnostics.kane-il.us` | BIND9 authoritative secondary |

### Reverse Proxy Node Service Scope

Allowed on this node:

- nginx reverse proxy
- TLS termination
- BIND9 authoritative secondary
- public HTTP/HTTPS service routing
- zone transfer receiving over WireGuard

Excluded from this node:

- public IPFS pinning/swarm workload
- mailboxes
- LDAP authority unless deliberately assigned later
- Hubzilla application/database state
- CEAS account state

## Confirmed IPFS / git-POSIX / API Node

### `ipfs1.diagnostics.kane-il.us`

Role: IPFS publication, cooperative pinning, git/POSIX mapping, API-only access  
Placement: dedicated Proxmox public node

| Item | Value |
|---|---:|
| Public IPv4 | `15.235.0.96` |
| Public IPv6 | `2607:5300:203:8784::106` |
| Proxmox/LAN IPv4 | `192.168.1.106/16` |
| Proxmox/LAN IPv6 | `fd56:98f0:6a9::106/48` |
| WireGuard IPv4 | `10.0.0.106` |
| WireGuard IPv6 | `fd56:98f0:6a9:10::106/64` |
| Conservative RAM allocation | 8 GB |
| Conservative CPU allocation | 4 vCPU |
| Conservative storage allocation | 500 GB minimum, expandable |

### FQDNs on the IPFS Node

| FQDN | Role |
|---|---|
| `ipfs1.diagnostics.kane-il.us` | Public IPFS node identity |
| `api1.ipfs.diagnostics.kane-il.us` | Controlled API surface for application read/write operations |

The API is not a public raw IPFS administration interface. The raw IPFS API, pinset control, and git mutation authority remain private/internal.

### IPFS Node Service Scope

Allowed on this node:

- IPFS daemon
- Kane County publication
- cooperative pinning for other county records
- git/POSIX mapping
- API-only access for controlled read/write operations

Example deterministic mapping pattern:

```text
orange-ca/affordance_family/surface_qualification/attestation/CID
```

Excluded from this node:

- nginx reverse proxy for the broader infrastructure
- mail relay or mailboxes
- Hubzilla
- participant account systems
- public raw IPFS admin API
- web UI

## Confirmed Mail Backend Node

### `mail1.internal.diagnostics.kane-il.us`

Role: Postfix / Dovecot backend mail node  
Placement: Proxmox internal/service node

| Item | Value |
|---|---:|
| Proxmox/LAN IPv4 | `192.168.1.107/16` |
| Proxmox/LAN IPv6 | `fd56:98f0:6a9::107/48` |
| Conservative RAM allocation | 4 GB |
| Conservative CPU allocation | 2 vCPU |
| Conservative storage allocation | 100 GB minimum |

### Mail Backend Service Scope

Allowed on this node:

- Postfix backend services
- Dovecot
- virtual mailbox delivery
- CEAS mail backend integration
- mail policy/state required for backend service

Expected transport relationship:

```text
Internet
  -> mx1.diagnostics.kane-il.us
  -> WireGuard/private route
  -> mail1.internal.diagnostics.kane-il.us
```

Excluded from this node:

- public MX identity
- public rDNS identity
- DNS primary
- IPFS workload
- Hubzilla

## Confirmed Hubzilla Node

### `hubzilla1.internal.diagnostics.kane-il.us`

Role: Hubzilla diagnostics node  
Placement: Proxmox internal/service node

| Item | Value |
|---|---:|
| Proxmox/LAN IPv4 | `192.168.1.108/16` |
| Proxmox/LAN IPv6 | `fd56:98f0:6a9::108/48` |
| Conservative RAM allocation | 8 GB |
| Conservative CPU allocation | 4 vCPU |
| Conservative storage allocation | 160 GB minimum |

### Hubzilla Service Scope

Allowed on this node:

- Hubzilla diagnostics application
- Hubzilla application files
- Hubzilla supporting database if locally placed
- Diagnostics account/channel functions as later defined

Public access should be routed through `ingress1.diagnostics.kane-il.us`, not directly exposed by this node.

## Confirmed Python Orchestration Node

### `orchestrator1.internal.diagnostics.kane-il.us`

Role: Python virtualenv orchestration node  
Placement: Proxmox internal/service node

| Item | Value |
|---|---:|
| Proxmox/LAN IPv4 | `192.168.1.109/16` |
| Proxmox/LAN IPv6 | `fd56:98f0:6a9::109/48` |
| Conservative RAM allocation | 4 GB |
| Conservative CPU allocation | 2 vCPU |
| Conservative storage allocation | 80 GB minimum |

### Python Orchestration Service Scope

Allowed on this node:

- Python virtual environments
- orchestration workers
- diagnostic advisory routines
- backend automation
- integration workers for CEAS, LDAP, Hubzilla, mail, DNS, IPFS, and attestation systems as later defined

Excluded from this node:

- public application ingress
- public mail transport
- public DNS authority
- raw public IPFS operations

## Network Summary

### Public Address Summary

| Node | Public IPv4 | Public IPv6 |
|---|---:|---:|
| `mx1.diagnostics.kane-il.us` | `172.237.130.143` | `2600:3c06:e001:2ba::221/64` |
| `ingress1.diagnostics.kane-il.us` | `15.235.0.200` | `2607:5300:203:8784::102` |
| `ipfs1.diagnostics.kane-il.us` | `15.235.0.96` | `2607:5300:203:8784::106` |

### Proxmox/LAN Address Summary

| Node | Proxmox/LAN IPv4 | Proxmox/LAN IPv6 |
|---|---:|---:|
| Reverse proxy / DNS secondary | `192.168.1.102/16` | `fd56:98f0:6a9::102/48` |
| IPFS / git-POSIX / API | `192.168.1.106/16` | `fd56:98f0:6a9::106/48` |
| Postfix / Dovecot backend | `192.168.1.107/16` | `fd56:98f0:6a9::107/48` |
| Hubzilla | `192.168.1.108/16` | `fd56:98f0:6a9::108/48` |
| Python orchestration | `192.168.1.109/16` | `fd56:98f0:6a9::109/48` |

### WireGuard Address Summary

| Node | WireGuard IPv4 | WireGuard IPv6 |
|---|---:|---:|
| Linode public edge | 10.0.0.1 | fd56:98f0:6a9:10::1 |
| Reverse proxy / DNS secondary | `10.0.0.102` | `fd56:98f0:6a9:10::102/64` |
| IPFS / git-POSIX / API | `10.0.0.106` | `fd56:98f0:6a9:10::106/64` |

## Conservative Resource Allocation Summary

| Node | RAM | CPU | Storage Initial / Recommended | Notes |
|---|---:|---:|---:|---|
| Linode public edge | 1 GB | 1 vCPU | 25 / 25 GB | Fixed current Linode allocation |
| Reverse proxy / DNS secondary | 2 GB | 2 vCPU | 32 / 40 GB | nginx + BIND9 secondary |
| IPFS / git-POSIX / API | 8 GB | 4 vCPU | 32 / 500 GB minimum | Storage should be expandable; cooperative pinning can grow |
| Mail backend | 4 GB | 2 vCPU | 32 / 100 GB minimum | Postfix/Dovecot backend; mailbox quota policy affects storage |
| Hubzilla | 8 GB | 4 vCPU | 32 / 160 GB minimum | Diagnostics application and database workload |
| Python orchestration | 4 GB | 2 vCPU | 32 / 80 GB minimum | Workers, venvs, integration tasks |

These allocations are conservative starting points. IPFS storage is the most likely allocation to require planned expansion.

## User and Service Account Model

This section records intended user classes. It does not require that every user exist before deployment begins.

### General User Policy

- `root` exists for OS bootstrap and emergency administration.
- Routine interactive administration should use a named sudo-capable operator account.
- Ansible automation should use a dedicated sudo-capable automation account.
- Application/service daemons should run as non-sudo service users.
- Participant accounts must not exist on the Linode public edge.
- Private keys must not be committed to GitHub or stored in the repository.

### Sudo-Capable Users

| User | Scope | Purpose |
|---|---|---|
| `root` | all Linux nodes | bootstrap and emergency administration |
| `cr-admin` | all managed nodes | named human/operator sudo administration |
| `ansible` | all managed nodes | automation account for Ansible-controlled configuration |

Recommended SSH posture after bootstrap:

- direct `root` SSH may be disabled after `cr-admin` and `ansible` are verified;
- password SSH login should be disabled;
- `ansible` may use passwordless sudo only where necessary for automation;
- `cr-admin` may require sudo authentication depending on local policy.

### Non-Sudo Service Users by Node

| Node | Non-sudo users | Purpose |
|---|---|---|
| Linode public edge | `bind`, `postfix`, `_chrony` or equivalent OS time user | BIND9, MTA relay, base system services |
| Reverse proxy / DNS secondary | `www-data`, `bind` | nginx and BIND9 secondary |
| IPFS / git-POSIX / API | `ipfs`, `git`, `cr-api` | IPFS daemon, git/POSIX storage ownership, controlled API service |
| Mail backend | `postfix`, `dovecot`, `vmail`, optional `opendkim` | mail routing, IMAP/LMTP, virtual mailbox storage, DKIM signing if placed here |
| Hubzilla | `www-data`, optional `hubzilla` | web application runtime and application ownership if separated from web server user |
| Python orchestration | `cr-orch`, optional `cr-worker` | Python venv ownership, workers, orchestration jobs |

Package names and exact system users may vary by Debian release and package defaults. The design rule is that daemons run as non-sudo users and do not share participant identity with system identity.

### SSH Public Key Recorded for Bootstrap/Admin

Public key label: `ca-kane-diagnostics-edge-admin`

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF/qgl5lH9b2YpDI+pDKRJHJebutUkZiAvvc6jLizYnl ca-kane-diagnostics-edge-admin
```

This is a public key only. The private key is not recorded here and must not be committed to the repository.

## Open Items Not Yet Assigned

The following are intentionally not finalized in this design draft:

- LDAP authority placement.
- DNSSEC key storage/signing placement.
- DKIM signing placement.
- Whether public names other than node FQDNs will resolve directly to the reverse proxy or use CNAME indirection.
- Exact firewall policy per node.
- Backup targets and restore procedure.
