# Termos de Responsabilidade LGPD & Tela de Bloqueio por Inatividade (45 min) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o Termo de Responsabilidade e Consentimento LGPD no primeiro acesso (pós-tour) com registro forense em `audit_logs`, e a Tela de Bloqueio por Inatividade de 45 minutos (com detecção contínua de scroll/digitação e desbloqueio em 1 clique sem perda de dados).

**Architecture:** O Termo LGPD é apresentado imediatamente após a conclusão do tour de boas-vindas e salva o aceite em `profiles` e em `audit_logs` com selo criptográfico. O Rastreador de Inatividade monitora continuamente interações do usuário (incluindo scroll, mouse wheel, digitação e toques) com sincronização multi-abas via `BroadcastChannel`. Ao atingir 45 minutos de ociosidade, uma tela de bloqueio com efeito fosco protege os dados visuais do segurado mantendo os formulários em aberto na memória, com desbloqueio em 1 clique.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Supabase SSR, BroadcastChannel API, Node Test Runner.

**Spec:** [docs/superpowers/specs/2026-11-23-terms-and-inactivity-lock-screen-design.md](file:///e:/PIA/AlexandrePontes/web/docs/superpowers/specs/2026-11-23-terms-and-inactivity-lock-screen-design.md)

## Global Constraints
- LGPD Compliance: Lei nº 13.709/2018 (Arts. 6º e 46) e Guia de Segurança e Cookies da ANPD.
- Inactivity Timeout: Exatamente 45 minutos (`45 * 60 * 1000 ms`).
- Zero Data Loss: Nenhuma saída abrupta de rota; formulários e modais em aberto permanecem na memória sob o véu de bloqueio.
- Responsive & Accessible: WCAG 2.2 AA (alto contraste, foco por teclado `Tab`, ativação por `Enter`).
- Paleta Institucional: Navy Profundo `#0B192E` e Dourado Champagne `#C89543`.

## Review Focus
- Scroll / Mouse Wheel Sensitivity: Rolar a página ou girar a rodinha do mouse (`wheel` / `scroll`) deve obrigatoriamente renovar o temporizador de atividade sem falhas.
- Multi-Tab Deduplication: Atividade na Aba 2 deve resetar o contador na Aba 1, e o log de auditoria `SESSION_LOCKED_INACTIVITY` só deve ser emitido por uma única aba líder.
- Modal Hierarchy & Focus Trap: O Termo LGPD não pode colidir visualmente com o Tour de boas-vindas; ele só deve abrir quando o tour for concluído ou dispensado.
- Single-Click Unlock: O botão "Continuar Atendimento" deve restabelecer o acesso imediatamente e registrar `SESSION_UNLOCKED` sem recarregar a página.
- Safe Sign Out: O botão "Trocar de Usuário / Sair" na tela de bloqueio deve executar `signOut()` e redirecionar para `/login`, prevenindo bypass não autenticado.

---

### Task 1: Security Types & Database Migration for LGPD Terms

**Files:**
- Modify: `src/types/security.ts`
- Create: `supabase/migrations/20261123000004_add_terms_to_profiles.sql`
- Test: `src/types/security.test.ts`

**Interfaces:**
- Produces: `AuditAction` extended with `'LGPD_TERMS_ACCEPTED' | 'SESSION_LOCKED_INACTIVITY' | 'SESSION_UNLOCKED'`.
- Produces: `UserProfile` / `TeamMember` interface awareness of `terms_accepted_at?: string` and `terms_version?: string`.

- [ ] **Step 1: Write the failing test**
Create `src/types/security.test.ts` verifying that `LGPD_TERMS_ACCEPTED`, `SESSION_LOCKED_INACTIVITY`, and `SESSION_UNLOCKED` are valid `AuditAction` types and that `generateIntegritySeal` creates valid 64-char hashes for them.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --experimental-strip-types --test src/types/security.test.ts`
Expected: FAIL due to missing types or missing test file.

- [ ] **Step 3: Update `src/types/security.ts` and create SQL migration**
Add actions to `AuditAction` in `src/types/security.ts`:
```typescript
export type AuditAction =
  | 'VIEW_CLIENT'
  | 'EDIT_CLIENT'
  | 'CREATE_CLIENT'
  | 'VIEW_INSS_PASSWORD'
  | 'PRINT_CONTRACT'
  | 'DISCHARGE_FEE'
  | 'EXPORT_REPORT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'UPDATE_PERMISSIONS'
  | 'RESET_PASSWORD'
  | 'FIRST_ACCESS_PASSWORD_SET'
  | 'LGPD_TERMS_ACCEPTED'
  | 'SESSION_LOCKED_INACTIVITY'
  | 'SESSION_UNLOCKED';
```
Create `supabase/migrations/20261123000004_add_terms_to_profiles.sql`:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0';
```

- [ ] **Step 4: Run test to verify it passes**
Run: `node --experimental-strip-types --test src/types/security.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/types/security.ts src/types/security.test.ts supabase/migrations/20261123000004_add_terms_to_profiles.sql
git commit -m "feat(security): adiciona acoes de auditoria LGPD e migracao de termos para profiles"
```

---

### Task 2: Server API Route `/api/security/accept-terms`

**Files:**
- Create: `src/app/api/security/accept-terms/route.ts`
- Test: `src/app/api/security/accept-terms/accept-terms.test.ts`

**Interfaces:**
- Consumes: `recordAuditLog` from `src/lib/services/audit-service.ts`.
- Consumes: `createClient` from `src/lib/supabase/server.ts`.
- Produces: POST endpoint returning `{ success: boolean, termsAcceptedAt: string, termsVersion: string }`.

- [ ] **Step 1: Write the failing test**
Create `src/app/api/security/accept-terms/accept-terms.test.ts` testing input validation, version checking (`version: "1.0"`), and response structure.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --experimental-strip-types --test src/app/api/security/accept-terms/accept-terms.test.ts`
Expected: FAIL (route module or handler not found).

- [ ] **Step 3: Implement `/api/security/accept-terms/route.ts`**
Extract user session from Supabase cookies, update `profiles` table setting `terms_accepted_at = new Date().toISOString()` and `terms_version = '1.0'`, call `recordAuditLog` with `action: 'LGPD_TERMS_ACCEPTED'`, and return `200 OK`.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --experimental-strip-types --test src/app/api/security/accept-terms/accept-terms.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/api/security/accept-terms/
git commit -m "feat(api): endpoint de aceite dos termos LGPD com registro forense"
```

---

### Task 3: LGPD Terms & Responsibility Modal (`TermsConsentModal`)

**Files:**
- Create: `src/components/terms/terms-consent-modal.tsx`
- Create: `src/components/terms/terms-content.ts`
- Test: `src/components/terms/terms-consent-modal.test.ts`

**Interfaces:**
- Consumes: `WelcomeModalContext` (to detect when the welcome tour is closed).
- Produces: `<TermsConsentModal isOpen={boolean} onAccepted={() => void} />`.

- [ ] **Step 1: Write the failing test**
Create `src/components/terms/terms-consent-modal.test.ts` verifying:
- Contains the 4 mandatory legal sections (Guarda e Sigilo de Senhas, Tratamento de Dados Sensíveis INSS, Bloqueio Físico de Estação, Cookies Essenciais).
- Checkbox begins unchecked and submit button is disabled.
- Checking the checkbox enables the "Aceitar e Acessar o Sistema" button.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --experimental-strip-types --test src/components/terms/terms-consent-modal.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `terms-content.ts` and `terms-consent-modal.tsx`**
Implement the structured legal copy based on LGPD Art. 6º, 46 and ANPD guidelines, with clean Tailwind styling in Navy/Gold. Handle API submission to `/api/security/accept-terms` and local storage caching for immediate responsiveness.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --experimental-strip-types --test src/components/terms/terms-consent-modal.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/terms/
git commit -m "feat(terms): modal de termos de responsabilidade e sigilo LGPD"
```

---

### Task 4: Inactivity Tracker & Multi-Tab Synchronization (`useInactivityTracker`)

**Files:**
- Create: `src/components/lock-screen/inactivity-tracker.ts`
- Test: `src/components/lock-screen/inactivity-tracker.test.ts`

**Interfaces:**
- Produces: `useInactivityTracker(options: { timeoutMs?: number, onLock?: () => void, onUnlock?: () => void })`.
- Produces: Shared BroadcastChannel event messages: `'ACTIVITY'` and `'UNLOCK'`.

- [ ] **Step 1: Write the failing test**
Create `src/components/lock-screen/inactivity-tracker.test.ts` verifying:
- Default timeout is 45 minutes (`45 * 60 * 1000 = 2,700,000 ms`).
- Activity listeners include `wheel`, `scroll`, `mousemove`, `mousedown`, `keydown`, `touchstart`, `touchmove`.
- Calling activity handler resets the timer.
- Multi-tab synchronization message broadcasts activity timestamp to other tabs.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --experimental-strip-types --test src/components/lock-screen/inactivity-tracker.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `inactivity-tracker.ts`**
Implement throttled event listeners (throttle rate: 1000ms) attached to `window`. Sync `lastActivityTimestamp` via `BroadcastChannel('previoffice_activity')` and fallback `localStorage`. Trigger lock when elapsed time reaches 45 minutes.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --experimental-strip-types --test src/components/lock-screen/inactivity-tracker.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/lock-screen/inactivity-tracker.ts src/components/lock-screen/inactivity-tracker.test.ts
git commit -m "feat(security): rastreador de inatividade de 45m com suporte a scroll e multi-abas"
```

---

### Task 5: Inactivity Lock Screen Component (`InactivityLockScreen`)

**Files:**
- Create: `src/components/lock-screen/inactivity-lock-screen.tsx`
- Test: `src/components/lock-screen/inactivity-lock-screen.test.ts`

**Interfaces:**
- Consumes: `useInactivityTracker`.
- Produces: `<InactivityLockScreen isLocked={boolean} onUnlock={() => void} user={...} />`.

- [ ] **Step 1: Write the failing test**
Create `src/components/lock-screen/inactivity-lock-screen.test.ts` testing:
- Renders operator avatar, name, and role.
- Shows status badge "Sessão Protegida por Inatividade (45 min)".
- Triggers `onUnlock` when "Continuar Atendimento" is clicked.
- Triggers `signOut` when "Trocar de Usuário / Sair" is clicked.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --experimental-strip-types --test src/components/lock-screen/inactivity-lock-screen.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `inactivity-lock-screen.tsx`**
Create premium UI with backdrop blur, shield icon in gold, user badge, single-click unlock button, and safe sign-out option. Ensure no form data or URL changes occur upon lock/unlock.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --experimental-strip-types --test src/components/lock-screen/inactivity-lock-screen.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/lock-screen/inactivity-lock-screen.tsx src/components/lock-screen/inactivity-lock-screen.test.ts
git commit -m "feat(ui): tela de bloqueio por inatividade com desbloqueio em 1 clique"
```

---

### Task 6: Dashboard Integration & End-to-End Verification

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/lib/i18n/dictionaries/pt.ts` and `en.ts`
- Test: `src/components/terms/terms-integration.test.ts`

**Interfaces:**
- Consumes: `TermsConsentModal`, `InactivityLockScreen`, `useInactivityTracker`.

- [ ] **Step 1: Write integration test**
Verify layout connects terms modal after welcome tour and locks screen upon 45m inactivity.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --experimental-strip-types --test src/components/terms/terms-integration.test.ts`
Expected: FAIL.

- [ ] **Step 3: Integrate components into `layout.tsx` and i18n dictionaries**
Mount `TermsConsentModal` and `InactivityLockScreen` inside `DashboardContent` in `src/app/(dashboard)/layout.tsx`. Ensure `TermsConsentModal` waits for `isWelcomeOpen` to be false before displaying itself.

- [ ] **Step 4: Run full verification suite and typecheck**
Run: `npm run typecheck; node --experimental-strip-types --test "src/**/*.test.ts"`
Expected: 0 type errors, all tests pass.

- [ ] **Step 5: Commit**
```bash
git add src/app/(dashboard)/layout.tsx src/lib/i18n/dictionaries/ src/components/terms/terms-integration.test.ts
git commit -m "feat(dashboard): integra modal de termos LGPD e tela de bloqueio por inatividade de 45m"
```
