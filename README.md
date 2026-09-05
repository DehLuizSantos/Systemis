# Synthesis Bot — Dashboard

Dashboard com autenticação para acompanhar o que o **Synthesis Bot** monitora
no Tibia (OT server **Miracle 7.4**): scan de personagens, lista de inimigos
(hunted list), XP, mortes e loot.

## Papéis de usuário

- **Admin**: gerencia usuários (`/users`) e é o único que pode criar/editar/
  remover inimigos na lista de inimigos.
- **Membro**: acesso normal ao dashboard (scan, XP tracker, last-death,
  loot), sem gerenciar usuários nem cadastrar inimigos.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4** — cores da marca configuradas como design tokens em
  [`src/app/globals.css`](src/app/globals.css) (`primary`, `secondary`, `black`, `paper`)
- **Auth.js (NextAuth v5)** com Credentials provider + sessão JWT
- **Prisma 7** + SQLite (driver adapter `better-sqlite3`) como "backend" —
  rotas REST em `src/app/api/*`
- **Zod** para validação de payloads

## Arquitetura

Atomic Design combinado com organização por feature. Componentes realmente
compartilhados entre páginas ficam em `src/components/{atoms,molecules,organisms,templates}`;
cada página tem sua própria pasta com a mesma estrutura para o que é
específico dela:

```
src/app/
  login/
    page.tsx
    components/{atoms,molecules,organisms,templates}
  (dashboard)/                  # route group — não aparece na URL
    layout.tsx                  # protege a rota + monta o shell (Sidebar/Topbar)
    page.tsx                    # visão geral
    player-scan/
      page.tsx
      components/{atoms,molecules,organisms,templates}
    enemies/          → "lista de inimigos" (admin cadastra; todos visualizam)
      page.tsx
      [id]/           → detalhe de um inimigo (prova, histórico de XP/mortes)
      components/{atoms,molecules,organisms,templates}
    xp-tracker/        → "Inimigos-XP-Tracker"
    last-death/        → "inimigos e aliados Last-death"
    loot/
    users/             → gestão de usuários (somente admin)
  api/                 # backend: players, enemies, xp-records, deaths,
                        #          loot-search, users, player-scan,
                        #          uploads/evidence, auth
```

Cada página Server Component busca os dados via Prisma diretamente; os
formulários (Client Components, em `organisms/`) escrevem através das rotas
de API — o mesmo backend que o bot usaria para enviar dados via HTTP.

## Rodando localmente

```bash
pnpm install
cp .env.example .env      # gere um AUTH_SECRET novo: npx auth secret
pnpm db:push               # cria o SQLite (dev.db) a partir do schema
pnpm db:seed                # popula com dados de exemplo
pnpm dev
```

Acesse http://localhost:3000 — logins de exemplo criados pelo seed:

- **Admin:** `admin@miracle.bot` / `miracle123`
- **Membro:** `membro@miracle.bot` / `miracle123`

## Scripts úteis

| Comando            | Descrição                                  |
| ------------------ | ------------------------------------------- |
| `pnpm dev`          | ambiente de desenvolvimento                |
| `pnpm build` / `start` | build e servidor de produção            |
| `pnpm db:push`      | aplica `prisma/schema.prisma` no banco     |
| `pnpm db:migrate`   | cria uma migration versionada              |
| `pnpm db:seed`      | popula dados de exemplo                    |
| `pnpm db:studio`    | abre o Prisma Studio                       |

## Modelo de dados

`User` (login, com papel ADMIN/MEMBER) · `Player` (aliados) · `Enemy`
(inimigos/hunted list, com `EnemyEvidence` para as provas anexadas —
`createdAt` já é a data de cadastro exibida na UI, não existe campo
separado de "último login") · `XpRecord` (level/XP observado de um inimigo
ao longo do tempo) · `DeathEvent` (últimas mortes de inimigos e aliados) ·
`Item` + `ItemNpcPrice` (catálogo de itens para a busca de Loot) — veja
[`prisma/schema.prisma`](prisma/schema.prisma).

## Player Scan (mockado)

Ainda não existe bot de scan. `POST /api/player-scan` (usado pela página
Player Scan) gera um resultado mockado, porém **determinístico por nome**
(mesma busca = mesmo resultado), no formato do perfil do personagem + análise
de prováveis alts. Veja [`src/lib/mock-scan.ts`](src/lib/mock-scan.ts) — é o
único arquivo que precisa mudar quando o bot de scan de verdade existir,
desde que a resposta mantenha o mesmo formato.

## Loot (catálogo de itens real, via scraping)

A página Loot busca um item (nome) e mostra peso, melhor preço de venda e a
lista completa de NPCs que compram o item — dados **reais**, extraídos de
[miracle74.com/?subtopic=items](https://miracle74.com/?subtopic=items), não
mockados. O catálogo mora em [`prisma/data/items.ts`](prisma/data/items.ts)
(~390 itens) e é carregado pelo seed em `Item`/`ItemNpcPrice`.

Cobertura atual do "vender para" (NPC/cidade/preço): **100%** em Axes,
Swords, Clubs, Distance, Ammunition, Shields, Helmets e Armors. Legs, Boots,
Amulets, Rings, Valuables e Relics têm nome/peso completos, mas só uma
amostra tem preço de NPC — o restante aparece na busca com peso mas sem
lista de vendedores. Para completar, repita o mesmo processo de scraping
(uma consulta por item em `?subtopic=items&id=<id>`) e acrescente as
entradas que faltam em `items.ts`.

## Visão geral (dinâmica, com refresh manual)

A home (`(dashboard)/page.tsx`) é `force-dynamic`: "Inimigos online" e
"Aliados online" vêm de `COUNT` ao vivo no banco; "Players online no
servidor" vem de uma raspagem em tempo real da própria home do servidor
(`https://miracle74.com/`, elemento `<span class="playersNumber">`) — veja
[`src/lib/server-status.ts`](src/lib/server-status.ts). O botão **Atualizar
dados** (`router.refresh()`) reexecuta a página inteira, então repete tanto
as contagens do banco quanto essa raspagem. Se o site sair do ar ou mudar de
layout, o card mostra "indisponível" em vez de quebrar a página.

## Provas anexadas (upload de imagens)

Ao cadastrar um inimigo (somente admin), é possível anexar imagens como
prova. Elas são salvas em `storage/evidence/` (fora de `public/`, e
git-ignoradas) e servidas por uma rota dinâmica,
`GET /api/uploads/evidence/[filename]` — de propósito fora da pasta
`public/`, porque `next start` interpreta esse arquivo estático apenas no
momento em que o processo sobe, então um upload feito em runtime só
apareceria após reiniciar o servidor. Se for hospedar em uma plataforma sem
sistema de arquivos gravável/persistente, troque
[`src/lib/uploads.ts`](src/lib/uploads.ts) por um storage de objetos (S3 e
afins).

## Notas

- Banco padrão é SQLite (`dev.db`, git-ignorado) — troque `DATABASE_URL` e o
  adapter em [`src/lib/prisma.ts`](src/lib/prisma.ts) para Postgres/MySQL
  quando for para produção.
- Next 16 renomeou `middleware.ts` para `proxy.ts` — é ele quem protege as
  páginas do dashboard redirecionando para `/login`.
- Nome do servidor/versão (`Miracle 7.4`) e listas de vocação/cidade ficam
  em [`src/lib/constants.ts`](src/lib/constants.ts).
