# Geenius App

Multi-tenant SaaS platform for AI-powered lead generation, reseller management, and campaign automation.

## Overview

Geenius is a full-stack monorepo built with **Convex**, **React**, and **Turborepo**. It provides:

- **AI-powered lead generation** — automated prospect research and outreach
- **Campaign management** — multi-channel campaign orchestration
- **Reseller portal** — white-label reseller management with branding
- **Admin dashboard** — full control over users, projects, and compliance
- **Domain management** — custom domain routing per tenant

## Architecture

```
apps/
  admin-web/      # Admin dashboard (Vite + React)
  admin-mobile/   # Admin mobile app (Expo)
  reseller-web/   # Reseller portal (Vite + React)
  user-web/       # End-user portal (Vite + React)
  user-mobile/    # End-user mobile app (Expo)
  api/            # Express API server
  worker/         # Background job worker

packages/
  backend/        # Convex backend (schema, queries, mutations, actions)
  shared-types/   # Shared TypeScript types
  shared-validators/ # Shared validation schemas
  shared-api-client/ # API client utilities
  shared-ui-tokens/  # Design tokens
  eslint-config/  # Shared ESLint config
  tsconfig/       # Shared TypeScript configs
```

## Setup

### Prerequisites

- Node.js ≥ 20.0.0
- pnpm 10.x

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
# Fill in your Convex deployment URL and API keys

# Start all services in development
pnpm dev
```

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps and backend in dev mode |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm stop` | Kill all dev server ports |

## License

UNLICENSED — Private client project.
