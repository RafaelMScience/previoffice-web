# PreviOffice Web Project Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize and scaffold the PreviOffice Web application adhering to Clean Code and Lean Architecture, with all codebase terms, schema, types, documentation, commits, and configurations in English, while supporting Docker and Git.

**Architecture:** Monolithic Next.js 15 (React 19) App Router structure with TypeScript strict mode and Tailwind CSS. Lean architecture with separation into `src/app` (pages/actions), `src/components` (reusable UI), `src/lib/domain` (pure business logic & calculators), `src/lib/supabase` (typed database access with multi-tenant RLS), and `src/types` (schema models).

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS, Zod, Lucide Icons, Supabase (PostgreSQL), Docker & Docker Compose.

**Spec:** `C:\Users\RafaelM\OneDrive\Documentos\Obsidian Vault\software advocacia\WEB\10 - Diretrizes de Engenharia Lean, Clean Code e Processos Operacionais.md` and `C:\Users\RafaelM\OneDrive\Documentos\Obsidian Vault\software advocacia\WEB\11 - Arquitetura de Seguranca Cibernetica, Defesa Anti-Hacker e Protecao Anti-DDoS.md`.

## Global Constraints

- All development code, functions, interfaces, database entities, commits, and comments must be strictly in English.
- Lean Clean Architecture: Maximum 300 lines per file where feasible, immutable state patterns, no speculative layers.
- Strict input validation at boundaries using Zod.
- Multi-tenant data isolation by `tenant_id` with Row-Level Security (RLS).
- Zero-cost tier compatibility (Vercel, Supabase, Cloudflare).

## Review Focus

1. Ensure the Supabase client handles `tenant_id` context reliably without leaks between law offices.
2. Confirm CPF and Brazilian social security calculators in `src/lib/domain` have unit test coverage.
3. Validate that Dockerfile creates an optimized multi-stage standalone Next.js image.
4. Verify `.gitignore` excludes node_modules, `.env`, `.next`, and build artifacts.
5. Ensure initial Git repository is initialized with conventional commit history.

---

### Task 1: Git Repository & Workspace Initialization

**Files:**
- Create: `.gitignore`
- Create: `.gitattributes`
- Execute: `git init`

- [ ] **Step 1.1**: Create comprehensive `.gitignore` for Next.js, Node, TypeScript, Docker, and IDEs.
- [ ] **Step 1.2**: Initialize Git repository (`git init -b main`).
- [ ] **Step 1.3**: Validate git status and verify unneeded temporary files are ignored.

---

### Task 2: Package Configuration & Tooling Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`

- [ ] **Step 2.1**: Generate `package.json` with Next.js 15, React 19, Lucide React, Zod, and Tailwind dependencies.
- [ ] **Step 2.2**: Configure `tsconfig.json` with strict mode and `@/*` path alias mapping to `./src/*`.
- [ ] **Step 2.3**: Configure `next.config.mjs` with OWASP-compliant security headers (HSTS, CSP, X-Frame-Options).
- [ ] **Step 2.4**: Run `npm install` to resolve dependencies cleanly.

---

### Task 3: Domain Models & Database Types (English)

**Files:**
- Create: `src/types/client.ts`
- Create: `src/types/attendance.ts`
- Create: `src/types/tenant.ts`
- Create: `src/types/document.ts`
- Create: `src/types/database.ts`

- [ ] **Step 3.1**: Define `Client` domain types corresponding to the 32 Drift table fields in English.
- [ ] **Step 3.2**: Define `Attendance` and `PendingItem` types representing the return and visit tracking workflow.
- [ ] **Step 3.3**: Define `Tenant` and `UserProfile` RBAC types (Admin Lawyer vs Receptionist).
- [ ] **Step 3.4**: Define database interface contracts for Supabase.

---

### Task 4: Core Domain Business Logic & Validators

**Files:**
- Create: `src/lib/domain/cpf-validator.ts`
- Create: `src/lib/domain/benefit-rules.ts`
- Create: `src/lib/schemas/client-schema.ts`
- Create: `src/lib/schemas/attendance-schema.ts`

- [ ] **Step 4.1**: Implement pure `isValidCpf` function and test with valid/invalid test cases.
- [ ] **Step 4.2**: Implement Social Security rule helpers (retirement age, rural status, LOAS per capita calculator).
- [ ] **Step 4.3**: Create Zod schemas for quick reception intake and full client profile registration.

---

### Task 5: Supabase Client & Multi-Tenant Infrastructure

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `supabase/migrations/20261115000000_initial_schema.sql`

- [ ] **Step 5.1**: Create typed browser and server Supabase client factories.
- [ ] **Step 5.2**: Write initial SQL migration with `tenants`, `profiles`, `clients`, `attendances`, `documents` tables and RLS policies.
- [ ] **Step 5.3**: Add column-level AES-256 encryption helper for sensitive data.

---

### Task 6: Presentation Layer & App Router Scaffold

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/page.tsx`
- Create: `src/app/(dashboard)/clients/[id]/page.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/reception/reception-table.tsx`
- Create: `src/components/memory-card/memory-card-modal.tsx`
- Create: `src/components/client-form/client-full-form.tsx`

- [ ] **Step 6.1**: Implement root layout with Plus Jakarta Sans and design tokens (`#0B192E`, `#C89543`).
- [ ] **Step 6.2**: Implement Dashboard layout with sticky sidebar and global search topbar.
- [ ] **Step 6.3**: Port Reception desk table with visit frequency badges and immediate memory card modal.
- [ ] **Step 6.4**: Port Single-page comprehensive client form (`client-full-form.tsx`).

---

### Task 7: Docker Containerization & Local Orchestration

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

- [ ] **Step 7.1**: Write multi-stage production Dockerfile (`deps`, `builder`, `runner`) with non-root security.
- [ ] **Step 7.2**: Write `docker-compose.yml` for unified local dev and testing.
- [ ] **Step 7.3**: Configure `.dockerignore`.

---

### Task 8: Documentation, Git Commit & Verification

**Files:**
- Create: `README.md`
- Create: `CLAUDE.md`
- Create: `LICENSE`

- [ ] **Step 8.1**: Write clear, comprehensive `README.md` in English detailing architecture, stack, setup, and Docker usage.
- [ ] **Step 8.2**: Create `CLAUDE.md` with developer guidelines and build/test commands.
- [ ] **Step 8.3**: Run build/typecheck to verify zero TypeScript errors.
- [ ] **Step 8.4**: Commit all staged files to Git with conventional commit message: `feat: scaffold initial PreviOffice Web platform`.
