# CLAUDE.md - PreviOffice Web Development Guidelines

## Project Overview
PreviOffice Web is a Next.js 15 application written strictly in TypeScript for law practice front-desk reception, client qualification, and document tracking for Social Security law firms.

---

## Architectural Principles

1. **Lean Clean Architecture ("Apenas o Necessário")**:
   - Avoid overengineering, artificial repository wrappers with no second implementation, or unnecessary boilerplate layers.
   - Separate pure domain logic (`src/lib/domain/`) from presentation components (`src/components/`) and transport logic (`src/lib/supabase/`).

2. **Language Convention**:
   - All code, interfaces, function names, database columns, API endpoints, git commit messages, and developer documentation must be written in **English**.
   - Brazilian legal terms may be referenced inside strings or comments when necessary (e.g. `BPC/LOAS`, `PIS/PASEP`, `CNIS`, `Segurado Especial`).

3. **Immutability & Quality Standards**:
   - Never mutate state or objects directly; always return new copies.
   - Keep files focused and cohesive (< 350 lines).
   - Functions must have a single responsibility (< 50 lines).
   - Validate inputs at system boundaries using Zod schemas (`src/lib/schemas/`).

4. **Multi-Tenancy & Security Rules**:
   - Every database query must respect `tenant_id` via Supabase RLS.
   - When a receptionist is deactivated or deleted, client records must remain intact (`ON DELETE SET NULL` on `attendant_user_id`).
   - Physical documents remain in office folders; never force scanning/uploading overhead on receptionists.

---

## Commands

- **Install dependencies**: `npm install`
- **Development server**: `npm run dev`
- **Typecheck**: `npm run typecheck`
- **Production build**: `npm run build`
- **Lint**: `npm run lint`
- **Docker build**: `docker compose up --build`

---

## Directory Organization

- `src/types/`: TypeScript type definitions (client, attendance, tenant, document).
- `src/lib/domain/`: Pure business logic and calculation helpers (benefit rules, CPF validator).
- `src/lib/schemas/`: Zod validation schemas for forms and API payloads.
- `src/lib/supabase/`: Supabase client configurations (browser, server, middleware).
- `src/components/`: React client and server components organized by feature.
- `src/app/`: Next.js 15 App Router pages and route handlers.
- `supabase/migrations/`: SQL migration files for PostgreSQL.
