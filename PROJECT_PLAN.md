# Multi-Tenant Expense Tracking SaaS — Master Project Plan & Architectural Blueprint

## 1. Executive Summary & Core Objectives
**AetherLedger** is a zero-cost-to-prototype, multi-tenant Node.js expense platform designed around four novel architectural pillars:

1. **Triple-Layer Isolation Guard:** Enforces tenant boundaries strictly across three distinct layers: JWT Claims (Auth), Node.js `AsyncLocalStorage` (Application Context), and PostgreSQL Row-Level Security / Schema Isolation (Database Layer).
2. **AI-Forecasted Adaptive Tenancy:** Dynamically routes tenants between a shared schema pool (isolated by RLS) and dedicated DB schemas based on real-time load forecasting.
3. **Hash-Chained Audit Ledger:** Emits append-only events for all expense mutations to Redpanda, forming a cryptographically verifiable SHA-256 hash chain with Merkle root anchoring.
4. **AI Fraud & Copilot Layer:** Self-hosted OCR (Tesseract.js), local LLM expense Q&A (Ollama Llama 3 8B), and anomaly detection (ml.js) operating at zero API cost.

---

## 2. Technology Stack & Specs

| Layer | Technology | Role / Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, CSS (Glassmorphism UI) | Tenant admin dashboard & interactive ledger |
| **API Gateway** | Node.js, Fastify | High-performance async REST service layer |
| **Application Context** | Node `AsyncLocalStorage` | Request-scoped tenant context binding |
| **ORM & Database** | Prisma, PostgreSQL (Neon / Supabase) | Multi-schema & Row-Level Security (RLS) |
| **Connection Pooling** | PgBouncer | Lightweight database connection management |
| **Event Log** | Redpanda (Kafka-API) | Immutable event streaming log |
| **AI Layer** | Ollama (Llama 3 8B), Tesseract.js, ml.js | OCR receipt parsing, fraud detection, NL Copilot |
| **DevOps** | Docker, K3d, KEDA, Prometheus, Grafana | Auto-scaling & observability infrastructure |

---

## 3. System Architecture & Pillars

```text
               +----------------------------------+
               |        REACT CLIENT (WEB)        |
               |    Tenant Dashboard & Ledger     |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |      AUTH & TENANT GATEWAY       |
               |   JWT + AsyncLocalStorage Context|
               +----------------------------------+
                                |
         +----------------------+----------------------+
         |                      |                      |
         v                      v                      v
+------------------+   +------------------+   +------------------+
|  TENANCY ROUTER  |   | EXPENSE SERVICE  |   | AI INTELLIGENCE  |
| Shared-RLS vs    |   | CRUD & Ledger    |   | Ollama + OCR     |
| Dedicated Schema |   | Event Dispatcher |   | Anomaly Detector |
+------------------+   +------------------+   +------------------+
         |                      |                      |
         v                      v                      v
+------------------+   +------------------+   +------------------+
|    POSTGRESQL    |   | REDPANDA STREAM  |   | PROMETHEUS &     |
| Per-Tenant DB    |   | Hash-Chained     |   | GRAFANA          |
| / Shared Tables  |   | Audit Trail      |   | Metrics          |
+------------------+   +------------------+   +------------------+
```

---

## 4. Pillar Breakdown & Implementation Details

### Pillar 1: Triple-Layer Isolation Guard
- **JWT Layer:** Token contains `tenantId`, `userId`, and assigned `routingStrategy`.
- **Application Layer:** Fastify `onRequest` hook extracts the JWT and wraps downstream execution in `AsyncLocalStorage.run({ tenantId, userId, routingStrategy }, callback)`.
- **Database Layer:** Prisma query extension injects `SET LOCAL app.current_tenant = '<tenantId>'` before executing any Postgres query, satisfying RLS policies:
  ```sql
  CREATE POLICY tenant_expenses_isolation ON "Expense"
  USING (tenant_id = current_setting('app.current_tenant'));
  ```

### Pillar 2: AI-Forecasted Adaptive Tenancy
- **Shared Schema (RLS):** Default pool for new and low-to-medium usage tenants.
- **Dedicated Schema:** Automatically created for high-volume enterprise tenants (`tenant_<id>`).
- **Migrator Service:** Background worker monitors IOPS, throughput, and query latency. When load exceeds threshold, it executes a zero-downtime schema migration script.

### Pillar 3: Hash-Chained Audit Ledger
- **SHA-256 Event Hashing:** Every expense creation generates a deterministic digest:
  $$\text{Hash}_n = \text{SHA256}(\text{TenantID} \parallel \text{UserID} \parallel \text{Amount} \parallel \text{Vendor} \parallel \text{Date} \parallel \text{Hash}_{n-1})$$
- **Redpanda Dispatch:** Events are pushed asynchronously to the `expense-events-log` topic.
- **Verification Endpoint:** Allows auditors to re-calculate the hash sequence from block 0 to current and verify zero tampering.

### Pillar 4: AI Fraud & Copilot Layer
- **Tesseract.js OCR:** Parses uploaded receipt images to extract vendor, date, total amount, and category.
- **ml.js Anomaly Detection:** Computes isolation/z-scores based on tenant historical spending to flag statistical outliers.
- **Ollama Expense Copilot:** Local Llama 3 8B model connected to Fastify endpoint `/api/v1/expenses/copilot`, answering spending questions grounded strictly in the tenant's current dataset.

---

## 5. API Reference & Endpoints

- `GET /ping` — Server health check
- `GET /api/v1/expenses` — List tenant-scoped expenses
- `POST /api/v1/expenses` — Create expense (computes SHA-256 hash, runs anomaly scoring, emits event)
- `POST /api/v1/expenses/ocr` — Scan receipt image via Tesseract.js
- `POST /api/v1/expenses/copilot` — Natural language query endpoint

---

## 6. Local Setup & Execution Guide

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Generate Prisma Client:**
   ```bash
   cd apps/api && npx prisma generate
   ```
3. **Start Development Servers:**
   - Frontend Web App: `http://localhost:5173/`
   - Backend Fastify API: `http://localhost:3001/`
