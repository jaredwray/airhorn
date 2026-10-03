# AGENTS.md

## Overview

Airhorn is a cloud-native notifications library providing a unified API for SMS, Email, Mobile Push, and Webhook delivery. This is a pnpm monorepo with five packages under `packages/`.

## Packages

- `packages/airhorn` — Core library (`airhorn` on npm)
- `packages/twilio` — Twilio provider (`@airhornjs/twilio`)
- `packages/aws` — AWS provider (`@airhornjs/aws`)
- `packages/azure` — Azure provider (`@airhornjs/azure`)
- `packages/pingram` — Pingram provider (`@airhornjs/pingram`)

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
4. All tests must pass on Node.js 22, 24, and 26

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

## Safe Chain

Package installs in this environment go through Aikido Safe Chain shims. Never bypass them:

- Keep `~/.safe-chain/shims` first on `PATH`.
- Do not call unshimmed `npm`, `pnpm`, `npx`, or `pnpx`.
- Do not install packages with `curl | sh` or by pointing at a package manager outside the shim directory.

## Pull requests

Opening a pull request is not the end of the task. Wait about 20 minutes for automated and human code
reviews to land, then follow up on every comment that carries a finding, question, or change request
before starting anything else:

- Judge each comment against the code, not against the reviewer: is the finding actually true here?
- Valid: make the fix, run the same checks CI runs, push, and reply inline on that thread with what
  changed and the commit SHA.
- Not valid: reply inline on that thread with the concrete reason it does not apply (cite the file and
  line), and leave the thread open for the reviewer to close.
- Never leave such a comment unanswered, and never resolve a thread you disagree with. The only
  comments to skip are ones that need no answer — your own replies echoed back, plain approvals,
  pleasantries, and status-only bot notices — because answering those just restarts the loop.
- After each push, wait again and repeat until CI is green and every actionable thread has a reply.

## Test audit

Every pull request that adds, changes, or deletes a test puts those tests through this gate before it
is opened or updated. It is the authoring gate of the `test-audit` skill from `jaredwray/agentic`; run
that skill when it is installed. Keep a new or changed test only when all four have an answer:

1. What observable behavior, invariant, or contract does it protect?
2. What credible regression makes it fail?
3. Why doesn't existing coverage already catch that? Extend the owning test or its table rather than
   adding a near-duplicate.
4. Does it need an export, flag, or hook that no production caller uses? Then test at the real
   boundary instead.

- A bug-fix regression test must fail on the pre-fix code for the intended reason.
- Drop tests that assert nothing, restate the implementation or what the type checker enforces, or
  prove only a mock.
- Coverage targets never lower this bar: reach an uncovered line through its public entry point, and
  remove a branch no caller can reach rather than probing it.
- Delete a test only by naming the test that still proves its contract, or why the contract is gone.
  Never delete a test because it fails.
- Note the gate in the PR body's verification list, with each test it dropped, rewrote, or deleted
  and why.
- Leave existing tests this change does not touch to a separate audit pull request.
