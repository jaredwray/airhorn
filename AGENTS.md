# AGENTS.md

## Overview

Airhorn is a cloud-native notifications library providing a unified API for SMS, Email, Mobile Push, and Webhook delivery. This is a pnpm monorepo with four packages under `packages/`.

## Packages

- `packages/airhorn` — Core library (`airhorn` on npm)
- `packages/twilio` — Twilio provider (`@airhornjs/twilio`)
- `packages/aws` — AWS provider (`@airhornjs/aws`)
- `packages/azure` — Azure provider (`@airhornjs/azure`)

## Commands

All commands use **pnpm** (not npm or yarn).

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Lint, test, and coverage for all packages
```

To run for a single package:

```bash
cd packages/airhorn
pnpm test             # Runs: biome lint + vitest with coverage
```

## Workflow

1. Make your changes in `src/` and `test/` within the relevant package
2. Run `pnpm test` from the repo root to lint, test, and check coverage across all packages
3. Target **100% code coverage** — every new or changed line must be tested
4. All tests must pass on Node.js 20, 22, and 24

## Testing

- **Framework:** Vitest
- **Coverage:** @vitest/coverage-v8
- **Linting:** Biome
- Each package's `pnpm test` runs linting first, then vitest with coverage
- Write tests in `packages/<name>/test/` using the `*.test.ts` naming convention

## Code Style

- TypeScript only, ESM modules
- Biome handles formatting and linting (no ESLint/Prettier)
- Double quotes, tab indentation
- Run `biome check --write --error-on-warnings` to auto-fix lint issues
