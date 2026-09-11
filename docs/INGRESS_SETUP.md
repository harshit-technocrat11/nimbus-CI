# Nimbus CI — Kubernetes Ingress & NGINX Setup Guide

## 1. Infrastructure Architecture

Nimbus CI is deployed on an AWS EC2 instance using **K3s** (lightweight Kubernetes).

```
Public Internet (Vercel Frontend, GitHub Webhooks, Users)
                          │
                   (HTTP / HTTPS)
                          ▼
                   AWS EC2 Instance
                          │
                          ▼
               NGINX Ingress Controller
                          │
          ┌───────────────┴───────────────┐
          │ (ClusterIP internal routing)  │
          ▼                               ▼
  nimbus-api:8000                 nimbus-metrics:9090
          │
      (BullMQ / Redis)
          │
          ▼
   nimbus-worker
```

* **Frontend**: Next.js (deployed separately on Vercel).
* **Backend Services**: Run inside K3s as private `ClusterIP` Services (`nimbus-api`, `nimbus-worker`, `nimbus-metrics`, `Prometheus`).
* **Ingress**: NGINX Ingress Controller acts as the single public HTTP entry point into the cluster.

---

## 2. Architectural Decisions

### Why an Ingress Controller?
Kubernetes Services such as `nimbus-api` use the `ClusterIP` type. 

A `ClusterIP` Service is only reachable from inside the Kubernetes cluster. Backend microservices should not individually be exposed directly to the public internet on separate high ports.

Instead, an Ingress Controller acts as the single reverse proxy and API gateway:
* **Single Public Entrypoint**: All incoming traffic hits standard ports (`80` / `443`).
* **Private Microservices**: Application pods stay private and isolated inside the cluster network.
* **Centralized Edge Capabilities**: SSL/TLS termination, rate limiting, and CORS headers are managed in one place.

### Why NGINX over K3s Traefik?
K3s ships with **Traefik** pre-installed by default.

For Nimbus CI, Traefik was intentionally disabled and replaced with the **NGINX Ingress Controller**. Both are capable ingress controllers, but NGINX was chosen to gain hands-on production experience with the most widely used ingress architecture in enterprise Kubernetes.

---

## 3. Disabling Traefik in K3s

Traefik is disabled cleanly at the K3s configuration level rather than by manually deleting Kubernetes resources.

### Method A: Via K3s Config File (Recommended)
Add the `disable` directive in `/etc/rancher/k3s/config.yaml`:

```yaml
disable:
  - traefik
```

Then restart the K3s service:
```bash
sudo systemctl restart k3s
```

### Method B: During K3s Installation
If installing or reinstalling K3s:
```bash
curl -sfL https://get.k3s.io | sh -s - --disable traefik
```

Verify that Traefik is no longer running:
```bash
kubectl get pods -n kube-system | grep traefik
# Should return no running pods
```

---

## 4. Installing NGINX Ingress Controller

Deploy the official NGINX Ingress Controller manifest for bare-metal / generic cloud VMs:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/baremetal/deploy.yaml
```

Wait for the ingress controller pod to reach `Running` state:
```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

---

## 5. Ingress Routing Configuration

The routing rules are defined in [infra/k8s/ingress.yaml](../infra/k8s/ingress.yaml):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nimbus-ingress
  labels:
    app: nimbus-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nimbus-api
                port:
                  number: 8000
```

### Applying the Ingress:
```bash
kubectl apply -f infra/k8s/ingress.yaml
```

Verify the Ingress resource:
```bash
kubectl get ingress nimbus-ingress
```

---

## 6. Verification and End-to-End Testing

1. **Test Health Endpoint via Ingress (Port 80)**:
   ```bash
   curl http://<YOUR_EC2_PUBLIC_IP>/health
   ```
   **Expected Response**:
   ```json
   {"status":"ok","service":"nimbus-api"}
   ```

2. **Test Repositories Endpoint**:
   ```bash
   curl http://<YOUR_EC2_PUBLIC_IP>/repositories
   ```

3. **Check Ingress Controller Logs** (useful for debugging):
   ```bash
   kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller -f
   ```

---

## 7. Connecting the Vercel Frontend

When the frontend is deployed to Vercel, set its environment variable in the Vercel Dashboard:

```env
NEXT_PUBLIC_API_URL=http://<YOUR_EC2_PUBLIC_IP>
```
*(No port `:8000` is needed because NGINX routes standard HTTP port 80 directly to `nimbus-api`).*
