---
title: Integração com Supabase, Deploy na Vercel e Blindagem de Produção
date: 2026-11-19
tags:
  - supabase
  - vercel
  - postgresql
  - rls
  - storage
  - producao
  - seguranca
  - devops
aliases:
  - Integração Supabase e Vercel
  - Infraestrutura e Deploy de Produção
  - Conexão do Banco e Storage sem Mock
status: ativo
versao: 1.0.0
---

# Integração com Supabase, Deploy na Vercel e Blindagem de Produção

> [!abstract] Resumo Executivo
> Este documento registra o processo de migração da infraestrutura simulada em memória (*mock*) para a infraestrutura real de produção em nuvem. Detalha a conexão com o **Supabase PostgreSQL 17**, a ativação do **Row Level Security (RLS)** blindado, o provisionamento do **Supabase Storage** para fotos e documentos, a integração do **Supabase Auth** no Next.js App Router e o deploy contínuo na **Vercel** com injeção segura de segredos via API.

---

## 🧭 Índice do Documento
- [[#1. Topologia de Produção e Arquitetura]]
- [[#2. Banco de Dados Supabase PostgreSQL e Regras RLS]]
- [[#3. Supabase Auth e Middleware de Sessão]]
- [[#4. Supabase Storage para Fotos e Documentos]]
- [[#5. Conexão das Telas ao Banco sem Mock]]
- [[#6. Deploy na Vercel e Gerenciamento Seguro de Variáveis]]
- [[#7. Blindagem Anti-Reconhecimento (Defesa Anti-Hacker)]]
- [[#Notas Relacionadas]]

---

## 1. Topologia de Produção e Arquitetura

O sistema opera sob modelo Serverless / Edge na Vercel conectado a um cluster gerenciado do Supabase:

```mermaid
flowchart TD
    subgraph Cliente["Navegador / Dispositivo"]
        Browser["Interface Web (Next.js 15)"]
    end

    subgraph VercelEdge["Vercel Cloud (Produção)"]
        Middleware["Middleware de Sessão (@supabase/ssr)"]
        AppRouter["App Router (SSR & Client Components)"]
        AdminAPI["Rota Administrativa Privada (/api/admin)"]
    end

    subgraph SupabaseCloud["Supabase Managed Cloud"]
        Auth["Supabase Auth (JWT & Cookies)"]
        Postgres["PostgreSQL 17 (Multi-tenant RLS)"]
        StorageBucket["Storage (client-photos & client-documents)"]
    end

    Browser -->|HTTPS / TLS| Middleware
    Middleware --> AppRouter
    AppRouter -->|Anon Key / RLS| Postgres
    AppRouter -->|Anon Key| StorageBucket
    AppRouter -->|Session Cookie| Auth
    AdminAPI -->|Service Role Key| Postgres
    AdminAPI -->|Service Role Key| Auth
```

---

## 2. Banco de Dados Supabase PostgreSQL e Regras RLS

O esquema do banco foi estruturado em conformidade com as melhores práticas de engenharia de banco de dados (`supabase-postgres-best-practices`):

### 2.1. Tabelas Criadas
1. **`public.tenants`**: Registro multi-tenant dos escritórios de advocacia, OAB, contatos e plano.
2. **`public.profiles`**: Perfis de operadores vinculados a `auth.users(id)` com papéis (`MANAGING_LAWYER`, `ASSOCIATE_LAWYER`, `RECEPTIONIST`).
3. **`public.clients`**: Ficha unificada do cliente com 32 campos, dados do INSS, categorização especial e soft delete (`deleted_at`).
4. **`public.attendances`**: Histórico detalhado de visitas, retornos e checklist de pendências físicas.
5. **`public.documents`**: Metadados de arquivos anexados e sincronizados com o Storage.

### 2.2. Blindagem de RLS e Subquery Caching
> [!security] Regra de Alta Performance & Segurança
> Políticas RLS convencionais que chamam funções diretamente linha a linha degradam o banco com milhares de execuções. Para resolver isso:
> 1. A função de resolução de escritório foi isolada em um schema restrito (`private.current_tenant_id()`), tornando-a invisível para a API REST pública.
> 2. Todas as cláusulas RLS foram encapsuladas em subconsultas cacheadas `(SELECT private.current_tenant_id())`, avaliando a função uma única vez por consulta.
> 3. Foi revogado o direito `EXECUTE` de roles públicas/anônimas em funções `SECURITY DEFINER`.

```sql
-- Schema Privado e Função Segura
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.current_tenant_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT COALESCE(
    NULLIF((SELECT auth.jwt() -> 'app_metadata' ->> 'tenant_id'), '')::uuid,
    (SELECT p.tenant_id FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
  );
$$;

-- Política com Subquery Caching
CREATE POLICY "Tenant Isolation for Clients"
ON public.clients FOR ALL
TO authenticated
USING (tenant_id = (SELECT private.current_tenant_id()))
WITH CHECK (tenant_id = (SELECT private.current_tenant_id()));
```

### 2.3. Auditoria do Banco
- **`supabase db lint --remote`**: 0 erros de integridade.
- **`supabase db advisors --remote`**: `No issues found` (100% aprovado).

---

## 3. Supabase Auth e Middleware de Sessão

A autenticação foi migrada para o **Supabase Auth nativo**, gratuito para até 50.000 usuários ativos por mês (MAU).

1. **Middleware (`src/middleware.ts`)**:
   Intercepta todas as rotas de páginas protegidas, chamando `updateSession(request)` via `@supabase/ssr` para renovar cookies e garantir sessões ativas sem falhas de SSR.
2. **Contexto de Autenticação (`src/lib/auth/auth-context.tsx`)**:
   Implementa `supabase.auth.onAuthStateChange`. Ao detectar o login, busca o perfil na tabela `profiles` e mapeia automaticamente os privilégios do operador.
3. **Página de Login (`src/app/(auth)/login/page.tsx`)**:
   Executa `supabase.auth.signInWithPassword({ email, password })`, protegida com feedback de erro amigável e redirecionamento instantâneo.

---

## 4. Supabase Storage para Fotos e Documentos

Foram provisionados dois buckets de armazenamento dedicados:

| Bucket | Visibilidade | Propósito | Regras RLS |
| :--- | :--- | :--- | :--- |
| **`client-photos`** | Público para Leitura | Fotos e avatares dos clientes | Leitura pública, escrita e exclusão restritas a autenticados |
| **`client-documents`** | Privado (Restrito) | RG, CPF, CNIS, laudos periciais | Acesso 100% restrito a operadores autenticados do escritório |

> [!tip] Regra de Upsert do Storage
> Conforme as regras do Supabase, substituição de arquivos (*upsert*) exige simultaneamente permissão de `INSERT`, `SELECT` e `UPDATE` nos objetos do storage.

---

## 5. Conexão das Telas ao Banco sem Mock

Todas as telas operacionais foram desacopladas do `MOCK_CLIENTS_MAP` e conectadas ao serviço `src/lib/services/client-service.ts`:

- **Dashboard da Recepção (`/`)**:
  - Consulta `public.clients` e `public.attendances` em tempo real filtrando pelo `tenant_id` do usuário logado.
  - Exibe cards de contagem de visitas, retornos e clientes cadastrados com dados reais.
  - Se o banco estiver recém-criado, exibe estado limpo e convite amigável para o primeiro cadastro.
- **Entrada Rápida (15s)**:
  - Cria o cliente em `public.clients` e a primeira visita em `public.attendances` instantaneamente via `createFastIntakeInDb()`.
- **Ficha Completa (32 Campos) com Foto (`/clientes/new`)**:
  - Upload de foto do cliente integrado ao bucket `client-photos` via `uploadClientPhotoToStorage()`.
  - Inserção de dados cadastrais, endereço, dados previdenciários e senha do Meu INSS via `createFullClientInDb()`.
- **Dossiê Completo (`/clientes/[id]`)**:
  - Busca SSR no PostgreSQL pelo ID do cliente, recuperando histórico de visitas e documentos físicos.

---

## 6. Deploy na Vercel e Gerenciamento Seguro de Variáveis

O deploy em produção está ativo em **`https://previoffice.vercel.app`**.

As variáveis de ambiente foram injetadas diretamente na Vercel via **Management API v10** (sem exposição em código ou commits):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://nebxogvuthuhbznezmbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi... (Pública)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (Sensitive / Secret)
NEXT_PUBLIC_APP_URL=https://previoffice.vercel.app
MASTER_ADMIN_KEY=po_adm_aLOMsQVEpXvRnbQZQZgnlKxJWrQaG6xg (Sensitive / Secret)
```

Ambos os repositórios remotos estão 100% sincronizados:
- `origin`: `RafaelMScience/previoffice-web`
- `vercel-origin`: `RafaelMScience/previoffice`

---

## 7. Blindagem Anti-Reconhecimento (Defesa Anti-Hacker)

> [!security] Diretriz de Ocultação de Tecnologia (*Information Hiding*)
> Para dificultar ataques direcionados e análise de vulnerabilidades por invasores:
> 1. **Remoção de Siglas e Protocolos**: Textos como *"Sessão protegida por TLS 1.3 & JWT seguro"* foram substituídos por apenas **"Sessão protegida"**.
> 2. **Remoção da Palavra "Chave"**: A tela `/admin/provisioning` não exibe a palavra "chave" nem "chave mestra", utilizando apenas **"Credencial de Acesso"** com campo mascarado.
> 3. **Eliminação de Dicas**: Foi removida qualquer dica ou exemplo de credencial exibido em tela.
> 4. **Nova Credencial Administrativa**: Gerada credencial forte de alta entropia (`po_adm_aLOMsQVEpXvRnbQZQZgnlKxJWrQaG6xg`).
> 5. **Proteção Anti-Timing & Rate Limit**: A validação no backend utiliza `crypto.timingSafeEqual` com bloqueio por IP após 5 tentativas em 15 minutos.

---

## 8. Máscaras Dinâmicas e Formatação de Dados Brasileiros

Para garantir usabilidade de alto nível no escritório de advocacia e eliminar erros de digitação, foi implementado um motor nativo e puro de máscaras reativas em `src/lib/utils/masks.ts` (sem bibliotecas externas pesadas, 100% compatível com React 19 e SSR):

| Tipo de Dado | Padrão da Máscara | Comportamento Reativo | Telas Integradas |
| :--- | :--- | :--- | :--- |
| **CPF** | `000.000.000-00` | Máscara progressiva até 11 dígitos, cálculo reativo de validação de dígitos | Entrada Rápida 15s, Ficha Completa, Dossiê, Contratos, PDFs |
| **CNPJ / CPF Híbrido** | `00.000.000/0001-00` | Aplica CPF até 11 dígitos e transmuta para CNPJ automaticamente ao passar de 11 dígitos | Provisionamento do Escritório (`/admin/provisioning`) |
| **Celular / Telefone** | `(00) 90000-0000` / `(00) 0000-0000` | Identifica automaticamente telefones fixos (8 dígitos) e celulares modernos (9 dígitos) ajustando o hífen dinamicamente | Entrada Rápida, Ficha Completa, Provisionamento, Relatórios PDF |
| **CEP** | `00000-000` | Insere hífen automaticamente no 5º dígito | Ficha Completa (Endereço) |
| **Número do Benefício (NB)** | `000.000.000-0` | Formatação oficial do INSS com 10 dígitos | Ficha Completa (Dados Previdenciários) |

### 8.1. Bateria de Testes Automatizada
- Testes unitários puros com `node --test` e `node:assert/strict` em `src/lib/utils/masks.test.ts`.
- 11 subtestes com 100% de aprovação e cobertura completa para entradas truncadas, incompletas, `null` ou `undefined`.

---

## 9. Ambiente Emulado Local do Supabase (Docker)

Para permitir testes exploratórios, exclusões, edições de esquema e novos fluxos sem qualquer risco de poluir o banco de dados de produção na nuvem, foi ativado o cluster local do Supabase via Docker:

```mermaid
flowchart LR
    Dev["Desenvolvedor (localhost:3000)"]
    DockerCluster["Docker Local Cluster (127.0.0.1)"]
    Studio["Supabase Studio (127.0.0.1:54323)"]
    Mailpit["Inbucket/Mailpit (127.0.0.1:54324)"]
    PostgresLocal[("PostgreSQL 17 Local (:54322)")]

    Dev --> DockerCluster
    Studio --> PostgresLocal
    DockerCluster --> PostgresLocal
    DockerCluster --> Mailpit
```

### 9.1. URLs e Painéis do Ambiente Local
| Serviço | URL Local | Descrição |
| :--- | :--- | :--- |
| **Supabase Studio** | `http://127.0.0.1:54323` | Dashboard visual completo (igual ao da nuvem) para inspecionar e editar tabelas e Storage. |
| **Mailpit / Inbucket** | `http://127.0.0.1:54324` | Caixa postal de e-mails capturados para testar confirmação de conta e resets de senha. |
| **API REST / PostgREST** | `http://127.0.0.1:54321` | Gateway da API de dados local com isolamento RLS. |
| **PostgreSQL 17 Direto** | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Conexão direta de banco para DBeaver ou psql. |

### 9.2. Comandos Operacionais Criados no `package.json`
- `npm run supabase:start`: Inicia os containers locais.
- `npm run supabase:stop`: Pausa os containers economizando memória.
- `npm run supabase:status`: Exibe URLs e chaves ativas do cluster local.
- `npm run supabase:reset`: Apaga o banco local e reaplica todas as tabelas e migrations do zero em segundos.

---

## Notas Relacionadas
- [[00 - Planejamento Geral e Arquitetura da Versão Web]] — Visão geral da plataforma
- [[11 - Arquitetura de Seguranca Cibernetica, Defesa Anti-Hacker e Protecao Anti-DDoS]] — Defesa cibernética e blindagem
- [[12 - Autenticacao, Login do Escritorio e Gateway Master de Provisionamento]] — Gateway de provisionamento e login
- [[13 - Entrada Rapida de Balcao (15s) e Triagem de Fila com Modal Overlay]] — Entrada rápida conectada ao banco
- [[14 - Mesa do Advogado, CRM de Retornos, Ficha Unica e Emissao de Contratos OAB]] — Ficha unificada e emissão de contratos
