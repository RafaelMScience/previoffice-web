---
name: leis
description: "Consulte, pesquise e leia a legislação brasileira completa em Markdown a partir do acervo ctresb/leis (Constituição Federal de 1988, Leis Ordinárias, Leis Complementares, Códigos, Decretos-Lei, Decretos, Estatutos, Tratados e Súmulas). Permite extrair artigos específicos ou ler leis completas com metadados e ementas oficiais."
---

# Leis - Legislação Brasileira em Markdown

Utilize esta skill para consultar, buscar e ler qualquer norma do ordenamento jurídico brasileiro em formato Markdown estruturado, a partir do acervo do repositório `ctresb/leis` localizado localmente em `E:\PIA\leis`.

## 📌 Quando Utilizar
- Quando precisar consultar artigos de leis federais, códigos, estatutos ou da Constituição Federal de 1988.
- Para verificar a redação exata e vigente de artigos com parágrafos, incisos e alíneas (ex: Lei 8.213/91, LOAS, CLT, CPC, Código Civil, Estatuto da OAB, LGPD).
- Para conferir ementa, data de publicação, status de revogação, URN oficial e links de fontes primárias do Planalto e Congresso Nacional.

---

## 🛠️ Comandos Principais

O utilitário CLI está localizado em `C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py` e pode ser executado via Python:

```bash
python "C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py" <comando> [opções]
```

### 1. Ler Artigo Específico de uma Lei
Para ler a íntegra de um artigo com seus incisos, parágrafos e notas de vigência:
```bash
python "C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py" ler <lei> --artigo <numero>
```
**Exemplos:**
- Ler o Art. 18 da Lei de Benefícios da Previdência Social:
  ```bash
  python "C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py" ler 8213 --artigo 18
  ```
- Ler o Art. 201 da Constituição Federal:
  ```bash
  python "C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py" ler cf --artigo 201
  ```
- Ler o Art. 20 da LOAS (BPC):
  ```bash
  python "C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py" ler loas --artigo 20
  ```
- Ler o Art. 7º do Estatuto da OAB (Direitos do Advogado):
  ```bash
  python "C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py" ler oab --artigo 7
  ```

### 2. Ver Metadados e Ementa de uma Lei
Para inspecionar a ementa oficial, data, URN e status da norma sem imprimir o texto todo:
```bash
python "C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py" ler 8213 --info
```

### 3. Ler o Texto Completo de uma Norma
```bash
python "C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py" ler <lei> --linhas <limite>
```
*(Passe `--linhas 0` para imprimir o texto integral sem limite).*

### 4. Buscar Normas por Número ou Palavra-Chave
```bash
python "C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py" buscar "<termo>" --limite 15
```
**Exemplos:**
```bash
python "C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py" buscar "previdencia"
python "C:\Users\RafaelM\.gemini\config\skills\leis\scripts\leis.py" buscar "13846"
```

---

## 📖 Atalhos e Nomes Diretos (Aliases)

O utilitário reconhece automaticamente apelidos e números diretos:

| Atalho / Alias | Norma Correspondente | Caminho Interno |
| :--- | :--- | :--- |
| `cf`, `constituicao`, `cf88` | Constituição da República Federativa do Brasil de 1988 | `constituicao.md` |
| `8213`, `beneficios` | Lei nº 8.213/1991 (Planos de Benefícios da Previdência Social) | `federal/leis-ordinarias/1991/lei-8213-1991-07-24.md` |
| `8212`, `custeio` | Lei nº 8.212/1991 (Organização e Custeio da Seguridade Social) | `federal/leis-ordinarias/1991/lei-8212-1991-07-24.md` |
| `8742`, `loas` | Lei nº 8.742/1993 (Lei Orgânica da Assistência Social - BPC) | `federal/leis-ordinarias/1993/lei-8742-1993-12-07.md` |
| `3048`, `rps` | Decreto nº 3.048/1999 (Regulamento da Previdência Social) | `federal/decretos/1999/dec-3048-1999-05-06.md` |
| `clt`, `5452` | Decreto-Lei nº 5.452/1943 (Consolidação das Leis do Trabalho) | `federal/decretos-lei/1943/del-5452-1943-05-01.md` |
| `cpc`, `13105` | Lei nº 13.105/2015 (Código de Processo Civil) | `federal/leis-ordinarias/2015/lei-13105-2015-03-16.md` |
| `cc`, `10406` | Lei nº 10.406/2002 (Código Civil Brasileiro) | `federal/leis-ordinarias/2002/lei-10406-2002-01-10.md` |
| `oab`, `8906` | Lei nº 8.906/1994 (Estatuto da Advocacia e da OAB) | `federal/leis-ordinarias/1994/lei-8906-1994-07-04.md` |
| `lgpd`, `13709` | Lei nº 13.709/2018 (Lei Geral de Proteção de Dados) | `federal/leis-ordinarias/2018/lei-13709-2018-08-14.md` |
| `cdc`, `8078` | Lei nº 8.078/1990 (Código de Defesa do Consumidor) | `federal/leis-ordinarias/1990/lei-8078-1990-09-11.md` |
| `idoso`, `10741` | Lei nº 10.741/2003 (Estatuto da Pessoa Idosa) | `federal/leis-ordinarias/2003/lei-10741-2003-10-01.md` |
| `pcd`, `13146` | Lei nº 13.146/2015 (Estatuto da Pessoa com Deficiência) | `federal/leis-ordinarias/2015/lei-13146-2015-07-06.md` |
| `servidores`, `8112` | Lei nº 8.112/1990 (Regime Jurídico dos Servidores Públicos da União) | `federal/leis-ordinarias/1990/lei-8112-1990-12-11.md` |
| `9784` | Lei nº 9.784/1999 (Processo Administrativo Federal) | `federal/leis-ordinarias/1999/lei-9784-1999-01-29.md` |

---

## ⚡ Atualização do Acervo

O acervo local está armazenado de forma persistente em `E:\PIA\leis`. Para puxar novas normas e atualizações promulgadas:
```bash
git -C "E:\PIA\leis" pull origin main
```
