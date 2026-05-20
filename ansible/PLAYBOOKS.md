# Civic Affordance Ansible Playbooks

This directory contains the tested Ansible playbooks for the Kane County reference implementation.

The playbooks are intentionally incremental. Each playbook establishes a narrow, testable boundary and stops before unrelated service work begins.

## Tested bootstrap sequence

### `00-proxmox-create-cts.yml`

Runs from the Proxmox host.

Creates the baseline Debian 13 LXC containers with internal LAN addresses only.

It does not configure public IPs, WireGuard, DNS, mail, Hubzilla, IPFS, or service stacks.

### `01-bootstrap-ct-access.yml`

Runs from the Proxmox host.

Bootstraps base packages, SSH, sudo, the `cr-admin` user, the `ansible` user, and internal Ansible control between the orchestration node and the other containers.

### `03_configure_orchestrator.yml`

Runs from the Proxmox host.

Configures CT109 / `orchestrator1.internal.diagnostics.kane-il.us` as the durable orchestration node.

This playbook has a mandatory backup-first and backup-after rule:

1. Create a portable Proxmox backup archive of CT109 before configuration.
2. Configure CT109 as the durable orchestration node.
3. Create a second portable Proxmox backup archive of CT109 after configuration.

Snapshots are not enough for this boundary. A snapshot remains tied to the live virtualization environment. A backup archive can be copied, downloaded, stored off-site, and restored on another Proxmox host. The orchestration node is part of disaster recovery, so the playbook must create real backup artifacts.

The playbook writes backups under the configured Proxmox backup directory and creates SHA256 checksum files beside them. Operators should copy both the backup archives and checksum files off-host.

## Current stop line

After `03_configure_orchestrator.yml`, CT109 should have:

- a durable working directory
- Git installed
- the model repository cloned
- Ansible available
- internal Ansible control over the already-created CTs
- its own GitHub SSH public key generated for later operator registration
- pre- and post-configuration portable backups

No unrelated service configuration occurs in this playbook.
