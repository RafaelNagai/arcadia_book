# Arcádia API — Guia do Projeto para Claude

## Visão Geral

Backend Fastify + TypeScript para o sistema de fichas de RPG Arcádia.
Banco de dados via **Prisma 7** (PostgreSQL/Supabase). Auth e Storage via **Supabase JS**.

Roda em `http://localhost:3001`. Prefixo de todas as rotas: `/api/v1`.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js (ESModules) |
| Framework | Fastify 5 |
| Banco de dados (queries) | Prisma 7 + `@prisma/adapter-pg` |
| Auth + Storage | `@supabase/supabase-js` (service role) |
| Validação | Zod 3 |
| Linguagem | TypeScript 5.7 |

---

## Estrutura de Pastas

```
api/
├── prisma/
│   ├── schema.prisma          # Fonte da verdade do schema — edite aqui
│   └── migrations/            # Histórico de migrations (gerenciado pelo Prisma CLI)
├── prisma.config.ts           # Config do CLI Prisma (usa DIRECT_URL para DDL)
├── src/
│   ├── index.ts               # Entry point
│   ├── app.ts                 # Fastify instance + plugins + rotas
│   ├── config/env.ts          # Zod parse de variáveis de ambiente (falha na startup se inválido)
│   ├── generated/prisma/      # Client Prisma gerado — NÃO edite, NÃO commite
│   │
│   ├── plugins/
│   │   ├── prisma.ts          # PrismaClient via PrismaPg adapter → fastify.prisma
│   │   ├── supabase.ts        # SupabaseClient (service role) → fastify.supabase
│   │   ├── auth.ts            # Hook authenticate → fastify.authenticate(req)
│   │   └── cors.ts            # @fastify/cors com CORS_ORIGINS do env
│   │
│   ├── middleware/
│   │   └── error-handler.ts   # setErrorHandler global → envelope { error: { code, message } }
│   │
│   ├── schemas/               # Zod schemas — validação de entrada
│   │   ├── auth.schema.ts
│   │   ├── character.schema.ts
│   │   ├── inventory.schema.ts
│   │   ├── state.schema.ts
│   │   └── shared.schema.ts   # UUID params reutilizáveis
│   │
│   ├── repositories/          # Queries Prisma — sem lógica de negócio
│   │   ├── characters.repository.ts
│   │   ├── inventory.repository.ts
│   │   └── state.repository.ts
│   │
│   ├── services/              # Lógica de negócio + ownership checks
│   │   ├── auth.service.ts    # Supabase Auth (signup, signin, signout, reset)
│   │   ├── characters.service.ts
│   │   ├── inventory.service.ts
│   │   ├── state.service.ts
│   │   └── upload.service.ts  # Supabase Storage
│   │
│   ├── controllers/           # HTTP handlers — parse body, chama service, retorna JSON
│   │   ├── auth.controller.ts
│   │   ├── characters.controller.ts
│   │   ├── inventory.controller.ts
│   │   ├── state.controller.ts
│   │   └── upload.controller.ts
│   │
│   ├── routes/
│   │   └── index.ts           # Registra todos os controllers com seus prefixos
│   │
│   └── types/
│       ├── fastify.d.ts       # Augmentação: FastifyInstance.prisma, FastifyRequest.user
│       └── domain.ts          # Tipos auxiliares (DiceLogEntry, etc.)
│
└── supabase/migrations/       # SQL de referência (RLS policies, etc.) — rodar manualmente
    └── 004_rls_policies.sql   # IMPORTANTE: rodar no Supabase SQL Editor
```

---

## Fluxo de Dados

```
Request → Route → Controller → Service → Repository → PrismaClient → Supabase DB
                                       ↘ SupabaseClient → Auth / Storage
```

- **Controllers** nunca importam `PrismaClient` ou `SupabaseClient` diretamente
- **Services** recebem `PrismaClient` (via `fastify.prisma`) no construtor
- **Auth e Storage** usam `fastify.supabase` (SupabaseClient com `SERVICE_ROLE_KEY`)

---

## Autenticação

O hook `fastify.authenticate(req)` verifica o JWT via `supabase.auth.getUser(token)` e popula `req.user`.

```typescript
// Em qualquer controller — rota protegida:
await fastify.authenticate(req)
// req.user agora disponível (tipo User do Supabase)

// Rota pública com auth opcional:
const token = (req.headers.authorization ?? '').slice(7)
const { data } = await fastify.supabase.auth.getUser(token)
const userId = data.user?.id  // undefined se não autenticado
```

---

## Variáveis de Ambiente

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Prisma runtime (pgBouncer, porta 6543) |
| `DIRECT_URL` | Prisma CLI migrations (conexão direta, porta 5432) |
| `SUPABASE_URL` | Supabase Auth + Storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin (bypass RLS) |
| `SUPABASE_ANON_KEY` | Validação de JWT via `auth.getUser()` |
| `CORS_ORIGINS` | Origens permitidas, separadas por vírgula |
| `SUPABASE_STORAGE_BUCKET` | Nome do bucket de imagens (default: `character-portraits`) |
| `MAX_IMAGE_SIZE_MB` | Limite de upload para fotos de personagem (default: 15) |
| `MAX_MAP_IMAGE_SIZE_MB` | Limite de upload para imagens de layer de mapa (default: 30) |

> `DATABASE_URL` é usado pelo `PrismaPg` adapter em runtime.
> `DIRECT_URL` é usado pelo `prisma.config.ts` apenas no CLI (migrate/push).

---

## Scripts Disponíveis

```bash
npm run dev          # Servidor em modo watch (tsx)
npm run build        # Build de produção (tsup → dist/)
npm run start        # Roda o build
npm run typecheck    # tsc --noEmit

npm run db:generate  # Regenera src/generated/prisma/ após mudar schema.prisma
npm run db:push      # Aplica schema no banco sem migration (dev rápido)
npm run db:migrate   # Cria e aplica migration versionada
npm run db:studio    # Abre Prisma Studio (UI do banco)
```

> `postinstall` roda `prisma generate` automaticamente após `npm install`.

---

## Modelos Prisma (schema.prisma)

| Modelo | Tabela | Campos-chave |
|---|---|---|
| `Character` | `characters` | `userId`, `isPublic`, `attributes (Json)`, `skills (Json)` |
| `InventoryBag` | `inventory_bags` | `characterId`, `slots`, `sortOrder` |
| `InventoryItem` | `inventory_items` | `characterId`, `bagId?`, `weight`, `sortOrder` |
| `CharacterState` | `character_state` | `@@unique([characterId, userId])`, todos os campos Json |

> Campos Prisma são **camelCase**. Mapeados para snake_case no banco via `@map`.
> `attributes` e `skills` são `Json` — validados pelo Zod no controller, não pelo Prisma.

---

## Endpoints (31 total)

### Auth `/api/v1/auth`
```
POST   /signup              Criar conta
POST   /signin              Login → { access_token, refresh_token, user }
POST   /signout             Invalidar sessão (Bearer)
POST   /forgot-password     Envia email de reset
POST   /reset-password      Nova senha via token do email
GET    /me                  Perfil do usuário (Bearer)
POST   /refresh             Novo access_token via refresh_token
```

### Personagens `/api/v1/characters`
```
GET    /                    Listar fichas do usuário (Bearer)
POST   /                    Criar ficha (Bearer)
GET    /:id                 Ver ficha (livre se pública, Bearer se privada)
PUT    /:id                 Atualizar ficha completa (Bearer, owner)
PATCH  /:id/current-values  Atualizar HP/Sanidade atual (Bearer, owner)
PATCH  /:id/visibility      Toggle is_public (Bearer, owner)
DELETE /:id                 Deletar (Bearer, owner)
```

### Inventário `/api/v1/characters/:id/inventory`
```
GET    /                    Listar itens + bolsas
POST   /items               Criar item (Bearer)
PUT    /items/:itemId       Atualizar item (Bearer)
DELETE /items/:itemId       Deletar item (Bearer)
POST   /items/reorder       Reordenar drag-drop (Bearer)
POST   /bags                Criar bolsa (Bearer)
PUT    /bags/:bagId         Atualizar bolsa (Bearer)
DELETE /bags/:bagId         Deletar bolsa — itens voltam para root (Bearer)
```

### Estado de Sessão `/api/v1/characters/:id/state`
```
GET    /                    Estado completo (Bearer)
PATCH  /pe-checks           Checkboxes de PE (Bearer)
PATCH  /skill-modifiers     Modificadores temporários de perícia (Bearer)
PATCH  /defense-modifiers   DA/DP bonuses (Bearer)
POST   /dice-log            Append entrada no log (Bearer)
DELETE /dice-log            Limpar log (Bearer)
```

### Upload `/api/v1/upload`
```
POST   /character-image     multipart/form-data + field characterId → { url }
DELETE /character-image     { path } → 204
```

### Health
```
GET    /health              { status: "ok", timestamp }
```

---

## Tratamento de Erros

Todas as respostas de erro seguem o envelope:
```json
{ "error": { "code": "NOT_FOUND", "message": "Personagem não encontrado" } }
```

| Classe | HTTP | Code |
|---|---|---|
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ForbiddenError` | 403 | `FORBIDDEN` |
| `UnauthorizedError` | 401 | `UNAUTHORIZED` |
| `ValidationError` | 422 | `VALIDATION_ERROR` |
| `ConflictError` | 409 | `CONFLICT` |

---

## Configuração Supabase (checklist)

- [ ] Rodar `supabase/migrations/004_rls_policies.sql` no SQL Editor
- [ ] Criar bucket `character-portraits` (público, máx 5MB, tipos: jpeg/png/webp)
- [ ] Habilitar Email/Password em Authentication → Providers
- [ ] Configurar Site URL e Redirect URLs em Authentication → URL Configuration

---

## Regras Importantes

- Nunca commitar `.env` — contém `SERVICE_ROLE_KEY`
- Nunca commitar `src/generated/prisma/` — gerado automaticamente
- Ao mudar `schema.prisma`: rodar `npm run db:generate` antes de `typecheck`
- Para DDL (migrate/push): sempre usar `DIRECT_URL` (pgBouncer não suporta DDL)
- Ownership check sempre no **service layer** — não depender só do RLS
- `fastify.prisma` → queries de banco | `fastify.supabase` → Auth e Storage
