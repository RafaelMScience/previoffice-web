# Design Spec: Termo de Responsabilidade LGPD & Tela de Bloqueio por Inatividade (45 min)

## 1. Visão Geral e Propósito
Este projeto implementa duas salvaguardas essenciais de conformidade com a **Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - Arts. 6º e 46)**, o **Estatuto da OAB (Lei 8.906/94)** e as **Diretrizes de Segurança da ANPD** para o sistema PreviOffice:

1. **Termo de Responsabilidade e Consentimento LGPD (Primeiro Acesso):**
   - Modal obrigatório apresentado logo após a conclusão ou fechamento da introdução (Welcome Tour) do sistema para operadores que ainda não formalizaram o aceite.
   - Estabelece os deveres de guarda de senha individual, sigilo de dados previdenciários sensíveis, proteção de terminal físico e transparência de cookies estritamente necessários.
   - Registro permanente no perfil do usuário (`profiles.terms_accepted_at`, `profiles.terms_version`) e na trilha de **Auditoria Forense (`audit_logs`)** com selo digital criptográfico.

2. **Proteção e Bloqueio por Inatividade (45 minutos):**
   - Monitoramento passivo de atividade do usuário (mouse, teclado, rolagem e toques) com renovação contínua enquanto estiver em uso ativo, sincronizado entre abas abertas.
   - Ao atingir **45 minutos** contínuos sem atividade em nenhuma aba, o sistema aciona uma **Tela de Bloqueio (Lock Screen)** elegante e fosca.
   - Oculta imediatamente da visão física os dados confidenciais de segurados que estavam na tela (prevenção contra acessos indevidos no escritório).
   - **Zero Perda de Dados:** Preserva todos os formulários e rascunhos em aberto na memória.
   - **Desbloqueio com 1 Clique:** O operador visualiza sua foto/iniciais e cargo e pode retornar instantaneamente ao trabalho clicando em *"Continuar Atendimento"*, com registro de auditoria forense.

---

## 2. Metas, Não-Metas e Decisões de Arquitetura

### 2.1. Metas (Goals):
- Garantir rastreabilidade jurídica formal de cada operador que opera dados de segurados no escritório.
- Impedir que terceiros que passem pela mesa de trabalho vejam dados confidenciais em computadores ociosos há mais de 45 minutos.
- Eliminar qualquer atrito de "perder formulário digitado": os modais de cadastro rápido, atendimento ou minutas de contrato permanecem intactos sob o véu de bloqueio.
- Registrar eventos de aceite, bloqueio e desbloqueio na tabela `audit_logs` com hash de integridade tamper-evident.

### 2.2. Decisões Consolidadas da Revisão Técnica:
1. **Sequenciamento dos Modais no Primeiro Acesso:**
   - O Welcome Tour (`WelcomeModal`) tem precedência inicial de exibição.
   - O Termo LGPD (`TermsConsentModal`) monitora o estado de abertura do tour e é disparado **imediatamente após** o usuário concluir ou fechar o tour de boas-vindas. Enquanto o termo não for aceito, a interação com o painel fica bloqueada pelo modal de termos.
2. **Sincronização Multi-Abas:**
   - O rastreador de inatividade utiliza um canal compartilhado via `BroadcastChannel` (com fallback em `localStorage`).
   - Se o operador estiver interagindo na Aba 2, o contador da Aba 1 é renovado automaticamente, evitando falsos bloqueios e duplicidade de logs de auditoria.
3. **Comportamento do Botão "Trocar de Usuário / Sair" na Tela de Bloqueio:**
   - Executa o encerramento seguro da sessão (`signOut`), redirecionando para a tela de login principal (`/login`). Isso impede que qualquer pessoa não autorizada selecione outro operador no terminal bloqueado sem digitar credenciais.
4. **Versionamento de Termos (`terms_version`):**
   - Constante `CURRENT_TERMS_VERSION = '1.0'`.
   - Se o escritório lançar uma nova versão no futuro (ex: 2.0), o sistema identifica a defasagem (`terms_version < CURRENT_TERMS_VERSION`) e reapresenta o termo para novo aceite com registro de auditoria.

---

## 3. Componentes e Fluxo de Dados

### 3.1. Termo de Responsabilidade e Consentimento LGPD (`TermsConsentModal`)
- **Localização:** `src/components/terms/terms-consent-modal.tsx`
- **Gatilho:** Renderizado no layout autenticado do dashboard. Verifica se `profile.terms_accepted_at` está preenchido e compatível com a versão atual.
- **Conteúdo dos Termos:**
  1. *Guarda Pessoal e Intransferível de Credenciais:* Vedado empréstimo ou compartilhamento de senhas individuais entre membros da equipe.
  2. *Sigilo de Dados Pessoais Sensíveis:* Dados de benefícios, perícias e laudos médicos vinculados ao INSS sob dever de sigilo ético e legal.
  3. *Segurança Física da Estação:* Obrigação de bloquear a tela ou sair do sistema ao se afastar do terminal.
  4. *Política de Cookies:* Informação transparente de que o PreviOffice utiliza unicamente cookies essenciais criptografados para sessão e segurança.
- **Interação:**
  - Checkbox obrigatório: *"Declaro que li, compreendi e assumo a responsabilidade pelas diretrizes de sigilo, proteção de senhas e LGPD"*.
  - Botão de confirmação: *"Aceitar e Acessar o Sistema"* (habilitado apenas após marcar o checkbox).
- **Ação:** Chama endpoint `/api/security/accept-terms` que atualiza o perfil e gera o registro `LGPD_TERMS_ACCEPTED` em `audit_logs`.

### 3.2. Rastreador de Inatividade e Tela de Bloqueio (`InactivityLockScreen`)
- **Hook / Contexto:** `src/components/lock-screen/inactivity-tracker.tsx`
  - Timer configurado para **45 minutos** (`45 * 60 * 1000 ms`).
  - Listeners passivos e throttled para `mousemove`, `keydown`, `click`, `scroll`, `touchstart`.
  - Ao bater 45 minutos sem atividade em nenhuma aba:
    - Seta estado `isLocked = true`.
    - Dispara registro assíncrono em auditoria: `action: 'SESSION_LOCKED_INACTIVITY'`, `severity: 'INFO'`.
- **Componente Visual `InactivityLockScreen`:**
  - Localização: `src/components/lock-screen/inactivity-lock-screen.tsx`
  - Overlay em camada superior (`z-[9999]`) com efeito *backdrop-blur-md* e fundo azul-marinho translúcido (`#0B192E/95`).
  - Card central elegante:
    - Escudo de segurança dourado (`#C89543`).
    - Foto ou iniciais do operador atual + Nome Completo + Cargo OAB/Recepção.
    - Indicador de status: *"Sessão Protegida por Inatividade (45 min)"*.
    - Texto tranquilizador: *"Seus dados, cadastros e atendimentos continuam preservados com segurança."*
    - Botão principal: *"Continuar Atendimento"* (desbloqueio em 1 clique).
    - Botão secundário: *"Trocar de Usuário / Sair"*.
- **Desbloqueio:**
  - Ao clicar em *"Continuar Atendimento"*, `isLocked` volta para `false` em todas as abas.
  - Timer reinicia a contagem de 45 minutos do zero.
  - Dispara registro assíncrono em auditoria: `action: 'SESSION_UNLOCKED'`, `severity: 'INFO'`.

---

## 4. Auditoria Forense e Banco de Dados
- **Novas Ações no tipo `AuditAction` (`src/types/security.ts`):**
  - `LGPD_TERMS_ACCEPTED`
  - `SESSION_LOCKED_INACTIVITY`
  - `SESSION_UNLOCKED`
- **Tabela `profiles` (Supabase Migration):**
  - `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;`
  - `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_version TEXT;`
- **API Endpoint:** `/api/security/accept-terms/route.ts` autenticado, persistindo no banco e chamando `recordAuditLog`.

---

## 5. Direção Visual Frontend (Design Direction)
- Alinhada à paleta premium do PreviOffice:
  - Fundo institucional: `#0B192E` (Navy Profundo).
  - Acentos de prestígio: `#C89543` (Dourado Champagne).
  - Tipografia: Inter / Sans serif refinada, hierarquia clara com espaçamentos confortáveis (`px-6 py-4`).
  - Total conformidade com acessibilidade WCAG (alto contraste, foco por teclado `Tab`, tecla `Enter` para desbloquear).
