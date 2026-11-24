---
title: Comandos Úteis, Testes e Deploy
date: 2026-11-24
tags:
  - comandos
  - terminal
  - deploy
  - testes
  - vercel
  - npm
aliases:
  - Cheatsheet de Comandos
  - Roteiro de Build e Publicação
status: ativo
versao: 1.0.0
---

# 💻 Comandos Úteis, Testes e Deploy

> [!tip] Cheatsheet para Desenvolvedores
> Guia rápido de comandos de terminal para rodar o ambiente local, executar testes, verificar tipos e publicar em produção.

---

## 1. Ambiente Local de Desenvolvimento

```powershell
# Iniciar o servidor de desenvolvimento local
npm run dev

# Acessar no navegador
http://localhost:3000
```

---

## 2. Testes Automatizados e Qualidade

```powershell
# Executar a bateria completa de 205 testes automatizados
npm test

# Executar verificação estrita de tipagem TypeScript (sem emitir arquivos)
npm run typecheck

# Executar linter do projeto
npm run lint
```

---

## 3. Compilação e Build de Produção

```powershell
# Gerar o build de produção otimizado com todas as 29 rotas
npm run build

# Iniciar o servidor com o build compilado
npm run start
```

---

## 4. Publicação Imediata na Vercel (Produção)

```powershell
# Publicar o código mais recente em produção com o token do .env.local
$token = (Get-Content .env.local | Select-String "VERCEL_TOKEN=(.*)" | ForEach-Object { $_.Matches.Groups[1].Value.Trim() }); npx vercel --prod --token $token --yes
```

---

## 5. Sincronização e Git (develop = main)

```powershell
# Verificar status do repositório
git status

# Subir alterações para a branch develop
git push origin develop

# Deixar a branch main perfeitamente sincronizada com a develop
git checkout main
git merge develop
git push origin main
git push vercel-origin main
git checkout develop
```

---

## 6. Supabase Local (Docker)

```powershell
# Iniciar os containers do Supabase local (PostgreSQL, Auth, Storage, Studio)
npm run supabase:start

# Verificar o status dos serviços locais
npm run supabase:status

# Resetar o banco e reaplicar todas as migrações SQL
npm run supabase:reset

# Parar os containers locais
npm run supabase:stop
```
