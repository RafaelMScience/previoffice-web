#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
leis.py - Utilitário CLI para consulta, busca e leitura da legislação brasileira em Markdown
Integrado com o acervo ctresb/leis (Constituição Federal, Leis Federais, Decretos, etc.)
"""

import sys
import os
import re
import json
import argparse
import subprocess
from pathlib import Path

# Localização padrão do repositório clonado
DEFAULT_REPO_PATHS = [
    r"E:\PIA\leis",
    os.path.expanduser(r"~\leis"),
    os.path.expanduser(r"~\.leis"),
]

ALIASES = {
    # Direito Previdenciário e Social
    "8213": "federal/leis-ordinarias/1991/lei-8213-1991-07-24.md",
    "beneficios": "federal/leis-ordinarias/1991/lei-8213-1991-07-24.md",
    "lei-8213": "federal/leis-ordinarias/1991/lei-8213-1991-07-24.md",
    "8212": "federal/leis-ordinarias/1991/lei-8212-1991-07-24.md",
    "custeio": "federal/leis-ordinarias/1991/lei-8212-1991-07-24.md",
    "lei-8212": "federal/leis-ordinarias/1991/lei-8212-1991-07-24.md",
    "8742": "federal/leis-ordinarias/1993/lei-8742-1993-12-07.md",
    "loas": "federal/leis-ordinarias/1993/lei-8742-1993-12-07.md",
    "lei-8742": "federal/leis-ordinarias/1993/lei-8742-1993-12-07.md",
    "3048": "federal/decretos/1999/dec-3048-1999-05-06.md",
    "rps": "federal/decretos/1999/dec-3048-1999-05-06.md",
    "dec-3048": "federal/decretos/1999/dec-3048-1999-05-06.md",
    
    # Constituição
    "cf": "constituicao.md",
    "cf88": "constituicao.md",
    "constituicao": "constituicao.md",
    
    # Códigos e Estatutos Centrais
    "clt": "federal/decretos-lei/1943/del-5452-1943-05-01.md",
    "5452": "federal/decretos-lei/1943/del-5452-1943-05-01.md",
    "del-5452": "federal/decretos-lei/1943/del-5452-1943-05-01.md",
    
    "cc": "federal/leis-ordinarias/2002/lei-10406-2002-01-10.md",
    "10406": "federal/leis-ordinarias/2002/lei-10406-2002-01-10.md",
    "codigo-civil": "federal/leis-ordinarias/2002/lei-10406-2002-01-10.md",
    
    "cpc": "federal/leis-ordinarias/2015/lei-13105-2015-03-16.md",
    "13105": "federal/leis-ordinarias/2015/lei-13105-2015-03-16.md",
    "codigo-processo-civil": "federal/leis-ordinarias/2015/lei-13105-2015-03-16.md",
    
    "oab": "federal/leis-ordinarias/1994/lei-8906-1994-07-04.md",
    "8906": "federal/leis-ordinarias/1994/lei-8906-1994-07-04.md",
    "estatuto-oab": "federal/leis-ordinarias/1994/lei-8906-1994-07-04.md",
    
    "lgpd": "federal/leis-ordinarias/2018/lei-13709-2018-08-14.md",
    "13709": "federal/leis-ordinarias/2018/lei-13709-2018-08-14.md",
    
    "cdc": "federal/leis-ordinarias/1990/lei-8078-1990-09-11.md",
    "8078": "federal/leis-ordinarias/1990/lei-8078-1990-09-11.md",
    "consumidor": "federal/leis-ordinarias/1990/lei-8078-1990-09-11.md",
    
    "idoso": "federal/leis-ordinarias/2003/lei-10741-2003-10-01.md",
    "10741": "federal/leis-ordinarias/2003/lei-10741-2003-10-01.md",
    "estatuto-idoso": "federal/leis-ordinarias/2003/lei-10741-2003-10-01.md",
    
    "pcd": "federal/leis-ordinarias/2015/lei-13146-2015-07-06.md",
    "13146": "federal/leis-ordinarias/2015/lei-13146-2015-07-06.md",
    "deficiencia": "federal/leis-ordinarias/2015/lei-13146-2015-07-06.md",
    
    "processo-administrativo": "federal/leis-ordinarias/1999/lei-9784-1999-01-29.md",
    "9784": "federal/leis-ordinarias/1999/lei-9784-1999-01-29.md",
    
    "servidores": "federal/leis-ordinarias/1990/lei-8112-1990-12-11.md",
    "8112": "federal/leis-ordinarias/1990/lei-8112-1990-12-11.md",
}


def find_repo_path():
    env_path = os.environ.get("LEIS_REPO")
    if env_path and os.path.exists(os.path.join(env_path, ".git")):
        return env_path
    for p in DEFAULT_REPO_PATHS:
        if os.path.exists(os.path.join(p, ".git")):
            return p
    return None


def get_git_file(repo_dir, file_path):
    cmd = ["git", "-C", repo_dir, "show", f"HEAD:{file_path}"]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        return None
    return res.stdout


def parse_frontmatter(content):
    if not content or not content.startswith("---"):
        return {}, content
    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}, content
    fm_raw = parts[1]
    body = parts[2].strip()
    meta = {}
    for line in fm_raw.splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"').strip("'")
    return meta, body


def resolve_law_path(repo_dir, target):
    cleaned = target.lower().strip()
    if cleaned in ALIASES:
        return ALIASES[cleaned]
    
    # Se já é um caminho relativo direto
    if cleaned.endswith(".md"):
        return target

    # Extrai números
    digits = re.findall(r"\d+", cleaned)
    num = digits[0] if digits else cleaned
    
    # Busca rápida no git tree
    cmd = ["git", "-C", repo_dir, "ls-tree", "-r", "--name-only", "HEAD", "federal/"]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace")
    if res.returncode == 0:
        candidates = []
        for line in res.stdout.splitlines():
            if not line.endswith(".md"):
                continue
            fname = os.path.basename(line).lower()
            if f"-{num}-" in fname or f"_{num}_" in fname or fname.startswith(f"lei-{num}") or fname.startswith(f"dec-{num}") or fname.startswith(f"del-{num}"):
                candidates.append(line)
        if candidates:
            # Prefere leis ordinárias, depois decretos
            for c in candidates:
                if "leis-ordinarias" in c:
                    return c
            return candidates[0]

    return None


def extract_article(body, art_num):
    num_str = str(art_num).strip().lower()
    num_str = re.sub(r"[ºo\.]", "", num_str)
    
    pattern = rf'(?ms)(?:^|\n)(?:\*\*)?Art(?:igo|\.)\s*{re.escape(num_str)}[ºo\.\s\-].*?(?=(?:\n\s*(?:\*\*)?Art(?:igo|\.)\s*\d+)|\Z)'
    match = re.search(pattern, body)
    if match:
        return match.group(0).strip()
    return None


def cmd_read(args, repo_dir):
    path = resolve_law_path(repo_dir, args.alvo)
    if not path:
        print(f"Erro: Lei ou norma '{args.alvo}' não encontrada.", file=sys.stderr)
        sys.exit(1)

    content = get_git_file(repo_dir, path)
    if not content:
        print(f"Erro: Não foi possível carregar '{path}' do repositório.", file=sys.stderr)
        sys.exit(1)

    meta, body = parse_frontmatter(content)

    if args.info:
        print("=" * 60)
        print(f"Título: {meta.get('titulo', os.path.basename(path))}")
        print(f"Ementa: {meta.get('ementa', 'Sem ementa')}")
        print(f"Data: {meta.get('data', 'N/D')}")
        print(f"Tipo: {meta.get('tipo', 'N/D')}")
        print(f"Versão: {meta.get('versao_texto', 'N/D')}")
        print(f"URN: {meta.get('urn', 'N/D')}")
        print(f"Fonte: {meta.get('fonte', 'N/D')}")
        print(f"Caminho no acervo: {path}")
        print("=" * 60)
        return

    if args.artigo:
        art = extract_article(body, args.artigo)
        if art:
            print(f"# {meta.get('titulo', path)}\n")
            print(art)
        else:
            print(f"Artigo {args.artigo} não encontrado em {meta.get('titulo', path)}.", file=sys.stderr)
            sys.exit(1)
        return

    # Exibição do texto completo ou truncado
    if args.linhas and args.linhas > 0:
        lines = content.splitlines()
        print("\n".join(lines[:args.linhas]))
        if len(lines) > args.linhas:
            print(f"\n... [Truncado após {args.linhas} linhas de um total de {len(lines)}]")
    else:
        print(content)


def cmd_search(args, repo_dir):
    query = args.termo.lower().strip()
    cmd = ["git", "-C", repo_dir, "ls-tree", "-r", "--name-only", "HEAD", "federal/"]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        print("Erro ao listar arquivos do repositório.", file=sys.stderr)
        sys.exit(1)

    matches = []
    for line in res.stdout.splitlines():
        if not line.endswith(".md"):
            continue
        if query in line.lower():
            matches.append(line)
        if len(matches) >= args.limite:
            break

    print(f"Encontradas {len(matches)} normas para o termo '{args.termo}':\n")
    for m in matches:
        content = get_git_file(repo_dir, m)
        meta, _ = parse_frontmatter(content) if content else ({}, "")
        titulo = meta.get("titulo", os.path.basename(m))
        ementa = meta.get("ementa", "")
        if len(ementa) > 100:
            ementa = ementa[:97] + "..."
        print(f"• {titulo} ({m})")
        if ementa:
            print(f"  {ementa}")


def main():
    repo_dir = find_repo_path()
    if not repo_dir:
        print("Erro: Repositório de leis não encontrado em E:\\PIA\\leis ou caminhos padrão.", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Consulta rápida à Legislação Brasileira em Markdown")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcomando: ler
    read_parser = subparsers.add_parser("ler", help="Lê uma lei ou artigo específico")
    read_parser.add_argument("alvo", help="Nome, número ou atalho da lei (ex: 8213, cf, loas, clt, cpc, oab, lgpd)")
    read_parser.add_argument("--artigo", "-a", help="Número do artigo desejado (ex: 18, 201, 7)")
    read_parser.add_argument("--linhas", "-l", type=int, default=150, help="Limite de linhas (padrão 150, 0 para tudo)")
    read_parser.add_argument("--info", "-i", action="store_true", help="Mostra apenas metadados e ementa")

    # Subcomando: buscar
    search_parser = subparsers.add_parser("buscar", help="Busca normas por número ou palavra-chave")
    search_parser.add_argument("termo", help="Termo de pesquisa (ex: 8213, previdencia, honorarios)")
    search_parser.add_argument("--limite", type=int, default=15, help="Limite de resultados (padrão 15)")

    args = parser.parse_args()

    if args.command == "ler":
        cmd_read(args, repo_dir)
    elif args.command == "buscar":
        cmd_search(args, repo_dir)


if __name__ == "__main__":
    main()
