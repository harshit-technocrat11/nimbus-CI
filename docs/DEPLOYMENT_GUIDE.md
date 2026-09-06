# 🚀 Nimbus CI — Cloud Deployment & CI/CD Guide

> **Target Architecture**: AWS EC2 (`m7i-flex.large` / `t3.large`, Ubuntu 24.04 LTS) + K3s (Lightweight Kubernetes) / Docker Compose for the Backend, and Local / Vercel for the Next.js Frontend.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Connecting to Your EC2 Instance](#step-1-connecting-to-your-ec2-instance)
4. [Step 2: Server Environment Setup (Docker, Node.js, K3s, KEDA)](#step-2-server-environment-setup)
5. [Step 3: Cloning & Configuring Nimbus CI](#step-3-cloning--configuring-nimbus-ci)
6. [Step 4: Running Database Migrations & Launching Services](#step-4-running-database-migrations--launching-services)
7. [Step 5: Connecting Your Frontend Locally](#step-5-connecting-your-frontend-locally)
8. [Step 6: Configuring Real GitHub Webhooks](#step-6-configuring-real-github-webhooks)
9. [Step 7: Automated CI/CD via GitHub Actions](#step-7-automated-cicd-via-github-actions)
10. [Step 8: Daily Start / Stop Routine (Preserving AWS Credits)](#step-8-daily-start--stop-routine)
11. [Troubleshooting & Diagnostics](#troubleshooting--diagnostics)

---

## 1. Architecture Overview

To eliminate laptop RAM pressure and thermal load while maintaining lightning-fast frontend hot-reloading:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AWS EC2 CLOUD VM (m7i-flex.large)                        │
│                    Public IP: <EC2_PUBLIC_IP>                               │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                      K3s (Kubernetes) / Docker                       │  │
│   │                                                                      │  │
│   │   ┌───────────────┐     ┌───────────────┐     ┌──────────────────┐   │  │
│   │   │ PostgreSQL 17 │     │  Redis 7      │     │ Nimbus API       │   │  │
│   │   │ (Port 5432)   │     │  (BullMQ)     │     │ (Port 8000)      │   │  │
│   │   └───────────────┘     └───────┬───────┘     └─────────▲────────┘   │  │
│   │                                 │                       │            │  │
│   │   ┌───────────────┐             ▼                       │ REST /     │  │
│   │   │  Streamer WS  │     ┌───────────────┐               │ Webhooks   │  │
│   │   │  (Port 8001)  │     │ KEDA Autoscaler               │            │  │
│   │   └───────────────┘     └───────┬───────┘               │            │  │
│   │                                 ▼                       │            │  │
│   │                         ┌───────────────┐               │            │  │
│   │                         │ Worker + DinD │               │            │  │
│   │                         │ (1 to 5 Pods) │               │            │  │
│   │                         └───────────────┘               │            │  │
│   └─────────────────────────────────────────────────────────┼────────────┘  │
└──────────────────────────────────────┬──────────────────────┼───────────────┘
                                       │                      │
                          Live Logs WS │                      │ API Requests
                          (Port 8001)  │                      │ (Port 8000)
                                       ▼                      ▼
                       ┌──────────────────────────────────────────────┐
                       │           DEVELOPER LAPTOP / VERCEL          │
                       │           Next.js Frontend (apps/web)        │
                       │           • RAM Used: ~300 MB                │
                       │           • Instant Hot-Reloading            │
                       └──────────────────────────────────────────────┘
```

---

## 2. Prerequisites

1. **AWS EC2 Instance**: `m7i-flex.large` or `t3.large` (Ubuntu 24.04 LTS, 30 GB gp3 SSD).
2. **Private Key**: `nimbus-key.pem` downloaded from AWS.
3. **Security Group (`nimbus-ci-sg`)**:
   - Inbound: Port `22` (SSH), Port `8000` (API), Port `8001` (Streamer), Port `9090` (Metrics).
   - Outbound: All traffic (`0.0.0.0/0`).

---

## 3. Step 1: Connecting to Your EC2 Instance

Open PowerShell or Terminal on your laptop where `nimbus-key.pem` is located:

### On Windows (PowerShell):
```powershell
# Set key permissions (if needed)
icacls .\nimbus-key.pem /inheritance:r
icacls .\nimbus-key.pem /grant:r "$($env:USERNAME):(R)"

# SSH into the server
ssh -i .\nimbus-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

### On macOS / Linux:
```bash
chmod 400 nimbus-key.pem
ssh -i nimbus-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

## 4. Step 2: Server Environment Setup

Once connected to your Ubuntu VM, run these commands to install the required tools:

### A. Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw
```

### B. Install Node.js 22 & PNPM
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pnpm@11.22.0 turbo
```

### C. Install Docker & Docker Compose
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Activate group without logging out
newgrp docker
```

### D. Install K3s (Lightweight Kubernetes) & Helm
```bash
# Install K3s
curl -sfL https://get.k3s.io | sh -

# Set up kubeconfig permissions
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown -R $USER:$USER ~/.kube/config
export KUBECONFIG=~/.kube/config
echo "export KUBECONFIG=~/.kube/config" >> ~/.bashrc

# Verify cluster
kubectl get nodes

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install KEDA (for autoscaling)
helm repo add kedacore https://kedacore.github.io/charts
helm repo update
helm install keda kedacore/keda --namespace keda --create-namespace
```

---

## 5. Step 3: Cloning & Configuring Nimbus CI

```bash
# Clone the repository
git clone https://github.com/<YOUR_GITHUB_USERNAME>/nimbus_ci.git ~/nimbus_ci
cd ~/nimbus_ci

# Install workspace dependencies
pnpm install
```

### Create Root `.env` on the Server
```bash
cat << 'EOF' > ~/nimbus_ci/.env
NODE_ENV=production
PORT=8000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_git_actions?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
STREAMER_PORT=8001
METRICS_PORT=9090
WORKSPACE_ROOT=/tmp/nimbus/workspaces
DOCKER_SOCKET=/var/run/docker.sock
EOF
```

---

## 6. Step 4: Running Database Migrations & Launching Services

### Option A: Using Docker Compose (Fastest & Simplest)
```bash
cd ~/nimbus_ci

# 1. Start Postgres & Redis
docker compose -f infra/docker-compose.yaml up -d postgres redis

# 2. Wait 5 seconds for Postgres to be ready, then run Prisma migrations
pnpm --filter @nimbus-ci/db prisma:migrate

# 3. Start all backend microservices
docker compose -f infra/docker-compose.yaml up -d --build
```

### Option B: Using Kubernetes Manifests (`infra/k8s/`)
```bash
cd ~/nimbus_ci

# 1. Run migrations first
docker run -d --name temp-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mini_git_actions postgres:17-alpine
pnpm --filter @nimbus-ci/db prisma:migrate

# 2. Apply all Kubernetes manifests
kubectl apply -f infra/k8s/
kubectl apply -f infra/k8s/keda/

# 3. Check running pods
kubectl get pods
```

### Verify Endpoints:
```bash
# Test API Health
curl http://localhost:8000/api/v1/health || curl http://localhost:8000/repositories

# Test Streamer Health
curl http://localhost:8001/health
```

---

## 7. Step 5: Connecting Your Frontend Locally

On your **local laptop**:

1. Open [apps/web/.env.local](file:///d:/WEB%20DEV%20udemy/FULLSTACK_PROJECTS/mini-github/nimbus_ci/apps/web/.env.local) and point it to your EC2 public IP:
```env
NEXT_PUBLIC_API_URL=http://<YOUR_EC2_PUBLIC_IP>:8000
NEXT_PUBLIC_WS_URL=ws://<YOUR_EC2_PUBLIC_IP>:8001
```

2. Start only the frontend locally on your laptop:
```bash
pnpm dev --filter @nimbus-ci/web
```

3. Open `http://localhost:3000` in your browser. All API calls, workflow triggers, and live streaming logs will now run against your cloud VM!

---

## 8. Step 6: Configuring Real GitHub Webhooks

You **no longer need `ngrok`**!

1. Go to your GitHub Repository $\rightarrow$ **Settings** $\rightarrow$ **Webhooks** $\rightarrow$ **Add webhook**.
2. **Payload URL**: `http://<YOUR_EC2_PUBLIC_IP>:8000/api/v1/webhooks/github`
3. **Content type**: `application/json`
4. **Events**: Select **"Pushes"** and **"Pull requests"**.
5. Click **Add webhook**. GitHub will send a test ping, which your EC2 API will receive immediately!

---

## 9. Step 7: Automated CI/CD via GitHub Actions

Whenever you push code changes to `main`, GitHub Actions will automatically update your EC2 backend.

### Set Up Repository Secrets on GitHub:
1. Go to your GitHub Repo $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
2. Add these two secrets:
   - `EC2_HOST`: `<YOUR_EC2_PUBLIC_IP>`
   - `EC2_SSH_KEY`: The entire contents of your `nimbus-key.pem` file.

The automated workflow [deploy-backend.yml](file:///.github/workflows/deploy-backend.yml) will trigger on every push and automatically update your services!

---

## 10. Step 8: Daily Start / Stop Routine (Preserving AWS Credits)

To make your $100 credit pool last 6–12+ months:

### When You Finish Working (End of Day):
1. Go to AWS Console $\rightarrow$ **EC2** $\rightarrow$ **Instances**.
2. Select `nimbus-ci-backend` $\rightarrow$ Click **Instance State $\rightarrow$ Stop instance**.
3. **Billing stops immediately ($0/hr). All files and databases remain saved.**

### When You Resume Working (Next Day):
1. AWS Console $\rightarrow$ Click **Instance State $\rightarrow$ Start instance**.
2. Copy the new **Public IPv4 address**.
3. Update `NEXT_PUBLIC_API_URL` in your local [apps/web/.env.local](file:///d:/WEB%20DEV%20udemy/FULLSTACK_PROJECTS/mini-github/nimbus_ci/apps/web/.env.local).
4. Run `pnpm dev --filter @nimbus-ci/web` on your laptop and start coding!

---

## 11. Troubleshooting & Diagnostics

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **Cannot SSH into EC2** | Permissions too open on `.pem` or wrong IP | Run `icacls .\nimbus-key.pem /inheritance:r` and check Security Group Port 22. |
| **API request times out** | Port 8000 blocked | Ensure Security Group `nimbus-ci-sg` has Inbound Rule for Port `8000` with Source `0.0.0.0/0`. |
| **WebSockets fail to connect** | Port 8001 blocked | Ensure Port `8001` is open in Security Group and URL uses `ws://<ip>:8001`. |
| **Docker Permission Denied** | User not in docker group | Run `sudo usermod -aG docker $USER && newgrp docker`. |
| **KEDA not scaling worker** | Prometheus metric mismatch | Run `kubectl get scaledobject` and verify `nimbus_ci_queue_waiting` query is active. |
