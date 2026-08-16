# ⚡ Nimbus CI

### Self-hosted distributed Continuous Integration platform

Nimbus CI is a lightweight, self-hosted CI platform inspired by systems like GitHub Actions.

It receives GitHub webhook events, queues CI jobs using **BullMQ + Redis**, distributes those jobs across independent runner workers, and executes them inside isolated **Docker containers**.

Build output is streamed to the dashboard in real time using **WebSockets**, while **PostgreSQL** maintains permanent build history and metadata.

> 🚧 Nimbus CI is currently under active development.

---

## ✨ What is Nimbus CI?

Traditional CI systems hide most of the infrastructure behind a managed service.

Nimbus CI is built to explore what happens underneath:

```text
Git Push
   │
   ▼
GitHub
   │
   │ Webhook
   ▼
Nimbus API
   │
   ▼
BullMQ + Redis
   │
   ├──────────────┬──────────────┐
   ▼              ▼              ▼
Worker 1       Worker 2       Worker 3
   │              │              │
   ▼              ▼              ▼
Docker          Docker         Docker
   │              │              │
   └──────────────┴──────────────┘
                  │
                  ▼
             CI Execution
                  │
                  ▼
            Build Result