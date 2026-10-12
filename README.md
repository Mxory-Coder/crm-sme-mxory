# SME Connect CRM

A multi-tenant, white-label CRM and marketing automation platform for small and medium businesses, with AI built in through Anthropic (Claude) and OpenAI. It is modelled on GoHighLevel's feature set and API contracts, and branded as **SME Connect**.

## Features

- **CRM:** contacts, opportunities, pipelines and stages, calendars
- **Conversations:** unified inbox across SMS/WhatsApp (Twilio), email (SendGrid) and Meta channels, with AI-drafted replies
- **AI:** AI agents, voice AI, a knowledge base with pgvector search, content AI and an AI workflow builder
- **Marketing:** email campaigns, social planner, funnels, sites and forms
- **Engagement:** memberships, courses, communities, reputation management
- **Documents:** documents and e-signatures stored in S3-compatible storage
- **Agency layer:** sub-accounts (locations), white label, snapshots, billing (Stripe), reporting, team management and audit logs

## Tech stack

| Layer | Tools |
|---|---|
| Monorepo | pnpm workspaces, Turborepo, TypeScript |
| API (`apps/api`) | NestJS 11, TypeORM, PostgreSQL 16 + pgvector, Redis, BullMQ, Socket.IO, Swagger |
| Web (`apps/web`) | Next.js 16, React 19, Tailwind CSS 4 |
| Shared (`packages/shared`) | Shared types, permissions and Zod schemas |
| AI (`packages/ai`) | Anthropic and OpenAI SDK wrappers |
| Infrastructure | Docker Compose: Postgres, Redis, MinIO, Bull Board |

## Project structure

```
apps/
  api/        NestJS backend (src/modules/* is one folder per feature)
  web/        Next.js frontend (dashboard + agency admin portal)
packages/
  ai/         @sme/ai: AI provider wrappers
  shared/     @sme/shared: shared types and auth helpers
docs/
  MASTER_PLAN.md   Full build plan and design system
docker-compose.yml Local Postgres, Redis, MinIO and Bull Board
```

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start local services

```bash
docker compose up -d
```

| Service | URL |
|---|---|
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |
| MinIO API / console | http://localhost:9000 / http://localhost:9001 |
| Bull Board | http://localhost:3002 |

### 3. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in the values. Generate the JWT secrets with `openssl rand -hex 64` and the encryption key with `openssl rand -hex 32`. Keys for Anthropic, OpenAI, Twilio, SendGrid, Meta and Stripe are only needed for those features.

### 4. Run database migrations

```bash
pnpm migration:run
```

### 5. Start the apps

```bash
pnpm dev
```

| App | URL |
|---|---|
| Web | http://localhost:3000 |
| API | http://localhost:3001/api |
| API docs (Swagger) | http://localhost:3001/docs |

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs every app in watch mode |
| `pnpm build` | Builds all apps and packages |
| `pnpm lint` | Lints the workspace |
| `pnpm test` | Runs tests |
| `pnpm migration:run` | Applies database migrations |
| `pnpm migration:generate` | Generates a migration from entity changes |
| `pnpm migration:revert` | Reverts the last migration |
| `pnpm migration:show` | Lists migrations and their status |

## Build status

Built in phases, each with its own migration (`apps/api/src/database/migrations`):

1. Foundation: monorepo, auth, multi-tenancy, contacts, conversations, channels and AI reply drafts
2. Sales core: pipelines, opportunities, calendars, documents and billing
3. AI: AI agents, knowledge base (RAG), voice AI, workflow builder and content AI
4. Marketing: social planner, email marketing, funnels, sites and forms
5. Memberships, courses, communities and reputation
6. Agency layer, white label, billing, reporting and audit logs

The frontend covers all sub-account pages and the agency admin portal.

## Security

Never commit `.env` files. They are already in `.gitignore`.
