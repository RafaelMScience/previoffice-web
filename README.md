# PreviOffice Web - Legal Practice Front Desk & Social Security SaaS

PreviOffice Web is the enterprise desktop and front desk platform for Brazilian Social Security (Direito Previdenciário) law firms. It synchronizes seamlessly with the PreviOffice Flutter mobile application while offering front-desk reception intake, client return workflows, physical document tracking, and administrative team management.

---

## Key Highlights

- **Lean Clean Architecture**: Purpose-driven software engineering avoiding overengineered micro-abstractions ("only what is necessary").
- **Front Desk Return Workflow**: Immediate Memory Card modal providing instant context on return visits (< 3 seconds) without digging through paper files.
- **Strict Multi-Tenancy**: Data isolated at PostgreSQL database level using Supabase Row Level Security (RLS) and Tenant IDs.
- **Auditor & Receptionist Lifecycle Policy**: Receptionists can be deactivated or removed by the managing lawyer without breaking client audit trails or visit logs (`ON DELETE SET NULL` with denormalized operator signatures).
- **$0 Cloud Architecture**: Documents stay in law firm physical folders; only compressed client headshots and structured relational records are synced to the cloud, ensuring zero storage costs on free tiers.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, Server Components)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS & Lucide Icons
- **Database & Auth**: Supabase (PostgreSQL with RLS & SSR cookie sessions)
- **Validation**: Zod schema validation
- **Containerization**: Docker (Multi-stage build on `node:22-alpine`)

---

## Project Structure

```text
web/
├── .agents/                    # Multi-agent capabilities and guidelines
├── public/                     # Static assets (robots.txt, images)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Authenticated law firm workspace
│   │   │   ├── clientes/[id]/  # Full 32-field client qualification
│   │   │   ├── layout.tsx      # Sidebar, brand (§), and global topbar
│   │   │   └── page.tsx        # Front desk dashboard & reception table
│   │   ├── api/health/         # Docker healthcheck endpoint
│   │   ├── globals.css         # Tailwind tokens & custom utilities
│   │   └── layout.tsx          # Root HTML shell
│   ├── components/
│   │   ├── client-form/        # Single-page 32-field qualification form
│   │   ├── memory-card/        # Instant client memory card modal
│   │   ├── reception/          # Reception queue & visit status table
│   │   └── ui/                 # Reusable semantic atoms (badges, inputs)
│   ├── lib/
│   │   ├── domain/             # Pure business rules (CPF validation, LOAS/Rural rules)
│   │   ├── schemas/            # Zod validation schemas
│   │   └── supabase/           # Server, Client, and Middleware Supabase handlers
│   └── types/                  # Typed contracts (client, attendance, tenant, document)
├── supabase/
│   └── migrations/             # Production-grade PostgreSQL DDL & RLS policies
├── Dockerfile                  # Production standalone container definition
├── docker-compose.yml          # Local container orchestration
└── package.json                # Project dependencies and npm scripts
```

---

## Getting Started

### 1. Prerequisites
- Node.js 22 LTS or newer
- npm 10+
- Docker & Docker Compose (optional, for containerized run)

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Installation
```bash
npm install
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 5. Running Typecheck & Build
```bash
npm run typecheck
npm run build
```

---

## Docker Deployment

To build and run the platform in a production-ready container:

```bash
docker compose up --build -d
```

Check the health status:
```bash
curl http://localhost:3000/api/health
```

---

## Database Migrations

Apply the initial schema to your Supabase project:

```bash
npx supabase db push
```
Or execute the script in `supabase/migrations/20261115000000_initial_schema.sql` via Supabase SQL Editor.

---

## License & Intellectual Property
PreviOffice & Alexandre Pontes Advocacia. All rights reserved.
