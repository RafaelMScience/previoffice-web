---
title: Rotas, URLs e Painel de Controle
date: 2026-11-24
tags:
  - rotas
  - urls
  - painel-de-controle
  - endpoints
aliases:
  - Mapeamento de Rotas
  - Catálogo de URLs
status: ativo
versao: 1.0.0
---

# 🌐 Rotas, URLs e Painel de Controle

> [!info] Mapa de Rotas do PreviOffice Web
> Total de 29 rotas compiladas e ativas entre páginas públicas, áreas autenticadas de escritório e endpoints de API.

---

## 1. Rotas de Navegação (Páginas do Navegador)

| Rota | Tipo | Papel / Permissão | Descrição |
| :--- | :--- | :--- | :--- |
| `/` | Estática | Autenticado | Dashboard principal, balcão de entrada rápida e fila de atendimentos |
| `/login` | Estática | Público | Tela de login do escritório com defesa anti-brute-force |
| `/definir-senha` | Estática | Autenticado (1º Acesso) | Troca obrigatória de senha temporária |
| `/clientes` | Dinâmica | Autenticado | Listagem completa de clientes com filtros e busca rápida |
| `/clientes/new` | Estática | Autenticado | Cadastro detalhado de novo cliente |
| `/clientes/[id]` | Dinâmica | Autenticado (Tenant) | Mesa do Advogado, CRM de retornos, documentos e contratos (Blindado anti-IDOR) |
| `/attendances` | Estática | Autenticado | Histórico geral e fila de atendimentos |
| `/contracts` | Estática | Autenticado | Emissão e gestão de contratos OAB e minutas PDF |
| `/preview-contrato` | Estática | Autenticado | Visualização e impressão CSS Print de minutas |
| `/settings` | Estática | Autenticado (Admin) | Gestão de equipe, permissões granulares e dados do escritório |
| `/security` | Estática | Autenticado | Termos LGPD e encerramento de sessões ativas |
| `/vade-mecum` | Estática | Autenticado | Consulta rápida da legislação previdenciária e EC 103/2019 |
| `/admin/provisioning` | Estática | Master Key | Terminal de criação de escritórios e advogado titular |
| `/admin` | N/A | **Bloqueada (404)** | Retorna 404 (redirecionamento removido por segurança) |

---

## 2. Rotas de API e Serviços de Backend (`/api/*`)

| Endpoint | Método | Proteção | Finalidade |
| :--- | :--- | :--- | :--- |
| `/api/admin/verify-master` | POST | Master Secret + Rate Limit | Valida a credencial mestra com tempo constante |
| `/api/admin/provision-office` | POST | Master Secret | Cria sociedade (PJ), titular (PF) e tenant |
| `/api/team/create-member` | POST | Managing Lawyer | Cria advogado associado, assistente ou estagiário |
| `/api/team/update-member` | POST | Managing Lawyer | Atualiza permissões de membros (anti-escalação) |
| `/api/team/reset-password` | POST | Managing Lawyer | Gera nova senha temporária para colaborador |
| `/api/security/accept-terms` | POST | Sessão Autenticada | Registro de aceite dos termos da LGPD com timestamp |
| `/api/security/terminate-session` | POST | Sessão Autenticada | Encerramento de sessão remota em outros dispositivos |
| `/api/documents/upload` | POST | Sessão Autenticada | Upload seguro para o bucket de documentos do cliente |
| `/api/clients/[id]/inss-password` | POST/GET | Sessão Autenticada | Cifra/Decifra sob demanda da senha do Meu INSS |
| `/api/health` | GET | Aberto | Verificação de integridade e uptime da aplicação |
