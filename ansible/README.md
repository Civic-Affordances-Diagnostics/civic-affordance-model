# Civic Affordance Diagnostics Ansible Bootstrap

This is the first Proxmox-root bootstrap layer for the Kane County reference implementation.
It is intentionally narrow and inspectable.

It creates Debian 13 LXC containers, assigns only internal Proxmox/LAN addresses, upgrades the base OS, installs SSH/sudo/Python, creates bootstrap users, and proves that the orchestration CT can control the other CTs.

It does not configure public OVH IPs, provider MAC addresses, WireGuard, DNS, nginx, mail, Hubzilla, LDAP, IPFS, DKIM, DNSSEC, or application service users.

## Prerequisite on the Proxmox host

Run from the Proxmox host root shell after cloning the repository:

```bash
apt-get update && apt-get install -y ansible-core
```

The playbooks use built-in Ansible modules plus Proxmox `pct` commands. They do not require Proxmox API credentials.

## Kane County inventory

The Kane reference inventory is under:

```text
inventories/kane-il/
```

Other county roots/operators should copy that directory to their own site code, for example:

```text
inventories/orange-ca/
```

Then replace hostnames, VMIDs, bridge, gateways, storage name, template name, addresses, and SSH public keys.

## Stop line

After playbook `01`, the intended state is:

```text
All planned CTs exist.
Each CT has only its internal Proxmox/LAN IPv4 and IPv6 address.
Each CT has the correct hostname.
Each CT has apt-get update and apt-get dist-upgrade applied.
Each CT has openssh-server, sudo, and python3.
Each CT has cr-admin and ansible.
The ansible account has passwordless sudo.
orchestrator1 has ansible-core installed.
orchestrator1 has a generated controller SSH key.
orchestrator1 can run Ansible ping and sudo true against all CTs.
No public IP configuration has been attempted.
No WireGuard configuration has been attempted.
No service stack has been installed.
```

## Run order

From the `ansible/` directory on the Proxmox host:

```bash
ansible-playbook playbooks/00-proxmox-create-cts.yml
ansible-playbook playbooks/01-bootstrap-ct-access.yml
```

## Playbook 00

`playbooks/00-proxmox-create-cts.yml`

Creates and starts the planned Debian 13 LXC CTs with:

```text
RAM:     2048 MB
Swap:    512 MB
vCPU:    2
Storage: 32 GB
Bridge:  vmbr1
Iface:   eth0
IPv4 GW: 192.168.1.1
IPv6 GW: fd56:98f0:6a9::1
```

If a target VMID already exists with the expected hostname, it is left in place and started if needed.
If the VMID exists with a different hostname, the playbook refuses to modify it.

## Playbook 01

`playbooks/01-bootstrap-ct-access.yml`

Uses `pct exec` from the Proxmox host to bootstrap the CTs before SSH is trusted.

It performs:

```text
apt-get update
apt-get -y dist-upgrade
apt-get install -y ca-certificates curl gpg openssh-server python3 sudo
```

On `orchestrator1`, it also installs:

```text
ansible-core
```

It creates only bootstrap users:

```text
root       existing bootstrap/emergency account
cr-admin   human/operator sudo account
ansible    automation sudo account
```

No service users are created at this layer.

## Playbook sequence

See `PLAYBOOKS.md` for the current tested playbook sequence and the backup-first rule for the orchestration node.
