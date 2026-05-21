# Civic Affordance Diagnostics Ansible Bootstrap

This is the Proxmox-root bootstrap layer for the Kane County production reference implementation. It creates the initial Debian 13 LXC containers, prepares CT109 as the durable orchestration node, and then hands cross-site fabric work to CT109.

The Kane inventory is production infrastructure for this root. Other roots should fork or copy the inventory and replace site-specific hostnames, addresses, VMIDs, storage, template, bridge, gateway, and SSH-key values.

## Prerequisite on the Proxmox host

Run from the Proxmox host root shell after cloning the repository:

```bash
apt-get update && apt-get install -y ansible-core
```

The playbooks use built-in Ansible modules plus Proxmox `pct` commands. They do not require Proxmox API credentials.

## Prerequisite on the Linode host

Run once from the Linode root shell before `04_handoff_wireguard_fabric.yml` is tested.

```bash
set -euo pipefail
apt-get update
apt-get install -y sudo openssh-server
id -u ansible >/dev/null 2>&1 || useradd -m -s /bin/bash ansible
usermod -aG sudo ansible
passwd -l ansible
install -d -m 700 -o ansible -g ansible /home/ansible/.ssh
cat > /home/ansible/.ssh/authorized_keys <<'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFMiFR/FUxY0gZ5tWEq0I9y3IvNsTcDxTsrKc/lX7eLf ansible-controller@kane-il
EOF
chown ansible:ansible /home/ansible/.ssh/authorized_keys
chmod 600 /home/ansible/.ssh/authorized_keys
cat > /etc/sudoers.d/90-civic-ansible <<'EOF'
ansible ALL=(ALL:ALL) NOPASSWD:ALL
EOF
chmod 440 /etc/sudoers.d/90-civic-ansible
visudo -cf /etc/sudoers.d/90-civic-ansible
id ansible
sudo -l -U ansible
```

## Kane County inventory

The Kane reference inventory is under:

```text
inventories/kane-il/
```

## Current tested playbook sequence

Run from the `ansible/` directory on the Proxmox host.

1. `playbooks/00-proxmox-create-cts.yml`
2. `playbooks/01-bootstrap-ct-access.yml`
3. `playbooks/03_configure_orchestrator.yml`

Manual gate after step 3: complete the Linode prerequisite before running step 4.

4. `playbooks/04_handoff_wireguard_fabric.yml`

`03_configure_orchestrator.yml` creates the CT109 backup boundary. `04_handoff_wireguard_fabric.yml` begins the CT109 handoff path toward WireGuard fabric deployment between `orchestrator1.internal.diagnostics.kane-il.us` and `mx1.diagnostics.kane-il.us`.
