---
title: Segurança e Checklist de Blindagem
date: 2026-11-24
tags:
  - seguranca
  - checklist
  - idor
  - xss
  - rls
  - owasp
aliases:
  - Checklist de Segurança
  - Blindagem Cibernética
status: ativo
versao: 1.0.0
---

# 🛡️ Segurança e Checklist de Blindagem

> [!important] Os 7 Escudos Cibernéticos do PreviOffice
> Resumo executivo de todas as travas e barreiras de proteção implementadas contra vulnerabilidades e acessos indevidos.

---

## 🛡️ Tabela dos 7 Vetores de Proteção

| Escudo | O Que Protege | Como Foi Blindado | Arquivo Principal |
| :--- | :--- | :--- | :--- |
| **1. Anti-IDOR** | Troca de IDs na URL | Validação forçada por `.eq('tenant_id', profile.tenant_id)`. Se for de outro escritório, dá 404. | `src/app/(dashboard)/clientes/[id]/page.tsx` |
| **2. Zero Chaves no Browser** | Chaves Mestras | Segredos como `SERVICE_ROLE` e `MASTER_ADMIN_KEY` rodam exclusivamente no Node.js server. | `src/app/api/admin/*` |
| **3. Anti-Escalação de Cargo** | Elevação de privilégios | Bloqueio no backend: assistentes e estagiários não podem se auto-promover a administrador. | `src/app/api/team/*` |
| **4. Anti-Força Bruta** | Adivinhação de senhas | Lockout automático de 60 segundos após 5 tentativas consecutivas incorretas no login. | `src/app/(auth)/login/page.tsx` |
| **5. Anti-Stored XSS** | Scripts em nomes | Função `sanitizePlainName()` e regex barram `<script>`, `onerror`, `javascript:` e HTML em nomes. | `src/lib/auth/team-utils.ts` |
| **6. Proteção do Git** | Vazamento no GitHub | `.gitignore` estrito barrando `.env*`. Apenas `.env.example` com valores ilustrativos é versionado. | `.gitignore` |
| **7. Supabase RLS Ativo** | Banco de Dados Aberto | `ENABLE ROW LEVEL SECURITY` ativo em 100% das tabelas com isolamento por `current_tenant_id()`. | `supabase/migrations/*` |

---

## 🔍 Como Testar e Validar Cada Escudo

### 1. Testar o Anti-IDOR
- Faça login com um escritório.
- Tente trocar a URL para `/clientes/00000000-0000-0000-0000-000000000000` (ou ID de outro escritório).
- **Resultado:** A aplicação exibe a página **404 - Não Encontrado**, sem expor nenhum dado de outro cliente.

### 2. Testar o Anti-Força Bruta
- Na tela `/login`, digite um e-mail e erre a senha 5 vezes seguidas.
- **Resultado:** O botão de login é desabilitado por 60 segundos com aviso: *"Acesso bloqueado temporariamente (tentativas excessivas). Aguarde 59s..."*.

### 3. Testar o Anti-XSS
- Ao cadastrar um membro da equipe ou escritório, tente colocar `<script>alert('xss')</script> Carlos`.
- **Resultado:** O backend e o validador rejeitam a operação com a mensagem: *"O nome contém caracteres ou scripts não permitidos."*

### 4. Testar a Rota `/admin`
- Acesse `https://previoffice.vercel.app/admin`.
- **Resultado:** Retorna erro **404 - Not Found**. O endereço de provisionamento não é revelado.
