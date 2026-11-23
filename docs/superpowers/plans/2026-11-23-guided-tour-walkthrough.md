# Implementation Plan: Guided Tour & Interactive Spotlight Walkthrough

## Context & Objectives
Implement an interactive, spotlight-based guided tour (*walkthrough*) that automatically launches on first login (and can be re-triggered anytime via header button). The tour demonstrates core legal and receptionist workflows using realistic sandbox demo data (*Dra. Maria Francisca da Silva - Aposentadoria por Idade Rural*), highlighting specific buttons and UI elements with an elegant spotlight effect, and upon completion or dismissal, immediately purges all demo state leaving only genuine database records.

---

## Tour Steps Specification

| Step | Focus Area & Element | Content & Explanation | Demo Action |
|---|---|---|---|
| **1. Entrada Rápida vs. Ficha Completa** | Botões `#tour-fast-intake-btn` e `#tour-full-client-btn` na Recepção | Explica a diferença fundamental: **Entrada Rápida** faz triagem ágil em 30 segundos (Nome, Telefone, Espécie de Benefício e Localização Física da Pasta). **Ficha Completa** detalha todo o prontuário previdenciário (CNIS, vínculos, dependentes, estado civil e renda). | Destaque com spotlight nos dois botões; exibe pré-visualização de um formulário de balcão preenchido. |
| **2. Prontuário do Segurado** | Linha do cliente de demonstração `#tour-demo-client-row` | Mostra como a equipe visualiza os dados do cliente: qualificação, benefícios ativos, contatos e histórico de atendimentos. | Exibe cliente fictício destacado na tabela com etiqueta especial `[DEMO - Demonstração]`. |
| **3. Atendimento de Retorno** | Botão `#tour-return-attendance-btn` | Explica a importância de registrar cada retorno do segurado (ex: entrega de certidão de casamento rural ou extrato bancário). Mantém a linha do tempo forense inalterável. | Abre modal demonstrativo de retorno com anotações e pendências preenchidas. |
| **4. Contratos & Procurações** | Botão `#tour-contract-btn` | Mostra a geração automática de contratos com os 3 modelos de honorários: *Quota Litis* (êxito), *Parcelado* (carnê) e *Híbrido* (entrada + êxito). Explica também que o advogado titular pode alterar as minutas no menu Contratos. | Abre o modal demonstrativo com minuta formatada e cálculo de honorários simulado. |
| **5. Ficha Cadastral em PDF** | Botão `#tour-pdf-btn` | Detalha a utilidade da ficha em PDF: impressão imediata para assinatura física do cliente, protocolo administrativo, arquivo em armário físico e juntada em ação judicial. | Exibe o botão de exportação e a estrutura da ficha em alta definição. |
| **6. Vade Mecum Previdenciário** | Botão `#tour-vade-mecum-btn` no cabeçalho | Demonstra a busca instantânea da IN 128/2022, Lei 8.213/91 e súmulas federais diretamente durante a consulta com o segurado. | Destaca o botão do Vade Mecum no topo da tela. |
| **7. Configurações da Banca & Equipe** | Link `#tour-settings-btn` no menu | Apresenta a personalização do escritório (logo, OAB, regimes de honorários padrão), gestão de equipe com permissões granulares e a tela de Auditoria Forense LGPD. | Destaca a área de configurações e encerra o tour com limpeza total. |

---

## Architectural Decomposition & Files

1. **`src/types/tour.ts`**:
   - Definições de tipos: `TourStep`, `TourStepPlacement`, `TourContextState`.

2. **`src/lib/guided-tour/demo-data.ts`**:
   - Dados do cliente fictício (*Dona Maria Francisca da Silva*), prontuário, retorno e contrato de exemplo para uso exclusivo no sandbox do tour.

3. **`src/components/guided-tour/tour-steps.ts`**:
   - Lista dos 7 passos com textos detalhados em português, posições, seletores de destaque e ações interativas.

4. **`src/components/guided-tour/guided-tour-context.tsx`**:
   - Provedor do estado do tour: `isTourOpen`, `currentStepIndex`, `activeDemoClient`, `startTour()`, `nextStep()`, `prevStep()`, `skipTour()`, `completeTour()`.
   - Controla o flag de persistência local `previoffice_tour_completed_<userId>`.
   - **Garantia de Limpeza:** Ao chamar `skipTour()` ou `completeTour()`, zera `activeDemoClient = null` e remove qualquer resquício em memória.

5. **`src/components/guided-tour/guided-tour-overlay.tsx`**:
   - Componente visual com máscara escura (*backdrop*), recorte com brilho dourado (*spotlight* nas coordenadas do elemento alvo via `getBoundingClientRect()`), e cartão flutuante em Azul Noturno e Dourado com transições suaves.

6. **`src/components/layout/header.tsx` & `src/app/(dashboard)/layout.tsx`**:
   - Inserção do botão permanente "Tour Guiado" no cabeçalho para reabertura a qualquer momento.
   - Adição dos IDs de ancoragem nos botões principais (`#tour-fast-intake-btn`, `#tour-full-client-btn`, `#tour-vade-mecum-btn`).

7. **`src/app/(dashboard)/reception/page.tsx`**:
   - Integração segura com o `useTour()`: se o tour estiver ativo e no passo do cliente fictício, o cliente de demonstração é exibido temporariamente no topo da lista com selo visual `[Demonstração]`. Ao finalizar o tour, o cliente demo desaparece instantaneamente.

8. **Testes Automatizados (`src/components/guided-tour/guided-tour.test.ts`)**:
   - Teste de transição dos 7 passos.
   - Teste de limpeza total do cliente demo ao completar ou cancelar.
   - Teste de armazenamento de visualização (`first_login` flag).
