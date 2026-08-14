# Defense in Depth

Tracking against https://github.com/jaredwray/agentic/blob/main/skills/security/defense-in-depth-nodejs/SKILL.md.

Profile: npm library · public

Status: `[ ]` not started, `[ ] ... (PR pending)` implementation awaiting merge, `[x]` verified live.

## 1. Security docs

- [ ] `SECURITY.md` present — contact info + "How this repository is secured" summary (PR pending)
- [ ] `DEFENSE_IN_DEPTH.md` present (this file) (PR pending)

## 2. Repository lockdown

- [ ] Lockdown script run; `lockdown-repo.sh --check` passes clean
- [ ] Pull requests required on the default branch; force pushes and deletion blocked
- [ ] Merges blocked unless required status checks pass (`--required-checks "<repo's CI jobs>"`)
- [ ] Tag ruleset "Tags only by admins" active
- [ ] Workflow runs from all outside collaborators require approval
- [ ] Default workflow token read-only; Actions cannot create or approve PRs
- [ ] Actions allowlist: GitHub-owned + verified + explicit patterns only (`--allowed-actions`)
- [ ] Secret scanning + push protection enabled
- [x] Private vulnerability reporting enabled — verified 2026-08-14
- [ ] Dependabot alerts enabled
- [ ] Phishing-resistant 2FA (passkeys / hardware keys) on the GitHub and npm accounts (manual)
- [ ] Recovery codes stored offline in a password manager (manual)
- [ ] Dev/release VM network egress filtered by a firewall (e.g. PMG) (manual)

## 3. Dependencies (pnpm)

- [x] `packageManager: pnpm@11.x` pinned in `package.json` — verified 2026-08-14
- [ ] Corepack pin upgraded to exact `pnpm@11.21.0` with its SHA-512 digest (PR pending)
- [ ] 7-day cooldown: `minimumReleaseAge: 10080`, `minimumReleaseAgeStrict: true`, `minimumReleaseAgeIgnoreMissingTime: false` (PR pending)
- [ ] Lifecycle scripts fail closed with `strictDepBuilds: true` and `dangerouslyAllowAllBuilds: false`; only `esbuild@0.25.12 || 0.28.0 || 0.28.1` and `workerd@1.20260801.1` are allowed (PR pending)
- [ ] `blockExoticSubdeps: true` (PR pending)
- [ ] `trustPolicy: no-downgrade` rejects dependency provenance/signature downgrades (PR pending)
- [ ] Broad `hookified` cooldown exemption removed (PR pending)
- [ ] Root `wrangler@4.119.0` and its `workerd@1.20260801.1` dependency are frozen in the lockfile (PR pending)
- [x] Lockfile committed; CI installs with `pnpm install --frozen-lockfile` — verified 2026-08-14
- [ ] Dependency-update tooling opens PRs only — never auto-merge (no dependency-update bot configured)
- [ ] New direct dependencies get human review; prefer `~` ranges over `^`

## 4. GitHub Actions

- [ ] `permissions: contents: read` (or `{}` + per-job grants) on every workflow (PR pending)
- [ ] Every action pinned to a full commit SHA (`npx actions-up`) (PR pending)
- [ ] `.github/workflows/check-workflows.yaml` lints workflows with zizmor on every PR (PR pending)
- [ ] `persist-credentials: false` on checkouts that don't push (PR pending)
- [ ] Site deployment reduced from `contents: write` to `contents: read` (PR pending)
- [ ] Automatic package-manager caching explicitly disabled in setup-node (PR pending)
- [ ] Unused `FIREBASE_CERT` exposure removed from test and coverage jobs (PR pending)
- [ ] CI uses non-mutating `pnpm test:ci`; coverage CI also validates all package tarballs (PR pending)
- [ ] Cloudflare Action uses frozen `wrangler@4.119.0` through pnpm instead of adding an unpinned latest version (PR pending)
- [x] No `pull_request_target` on workflows that run untrusted PR code — verified 2026-08-14
- [ ] No npm tokens (or other registry credentials) in Actions secrets

The current release workflow authenticates with OIDC and does not reference `NPM_TOKEN`; the unchecked item above still requires confirmation that no registry credentials remain stored as Actions secrets.

## 5. npm publishing — npm libraries only

- [ ] OIDC trusted publishing configured **stage-only** on npmjs.com for the publish workflow — it can stage, never publish live (manual)
- [ ] Staged publishing: CI runs `npm stage publish`; a maintainer promotes with 2FA (PR pending + manual npm configuration)
- [ ] Release runs only for a published GitHub release; manual dispatch and direct-publish scripts are removed (PR pending)
- [ ] Strict `vX.Y.Z` tag, release SHA, `main` ancestry, package-name, and six-manifest version checks run before dependency code (PR pending)
- [ ] Build/test/pack runs without OIDC; only checksummed, validated tarballs reach independent staging jobs (PR pending)
- [ ] A 30-day, run-scoped artifact supports failed-cell retries without rebuilding successful packages (PR pending)
- [ ] Five `fail-fast: false` staging cells have no checkout, project install, build, or test; only they receive `id-token: write` (PR pending)
- [ ] Staging installs exact `npm@11.19.0` with lifecycle scripts disabled, verifies every checksum and selected manifest, then stages one tarball (PR pending)
- [ ] Every package tarball is limited to `package.json`, `README.md`, `LICENSE`, and `dist/**` (PR pending)
- [ ] `@airhornjs/aws` has the same `files: ["dist", "LICENSE"]` publication boundary as the other packages (PR pending)
- [ ] Drydock connected — staged releases reviewed before promotion (manual)
- [ ] No direct publish rights: package requires 2FA and disallows tokens (manual)
- [x] `package.json` `repository.url` accurate so provenance maps to this repo — verified 2026-08-14

`npm stage publish` is not idempotent. After any matrix cell succeeds, re-run only failed cells. If npm accepted a request but the response was lost, inspect npm's Staged Packages before retrying.

## 6. Security tooling

- [x] Aikido runs on every build — verified 2026-08-14
- [ ] Aikido release gate uses exact client `1.0.17` and the immutable GitHub repository ID; every stage job `needs:` its passing dependency, SAST, IaC, and secret scan (PR pending)
- [x] Socket reviews every PR that changes dependencies — verified 2026-08-14

## Current PR verification

- Frozen install passes under pnpm 11.21.0; `pnpm ignored-builds` reports none.
- The reviewed lockfile keeps all 685 existing package keys, adds 85 while introducing the pinned Wrangler tree, and removes none.
- `pnpm build`, `pnpm test:ci`, `pnpm website:build`, and five-package archive verification pass.
- Exact `actions-up@1.17.0` reports all 24 action references current and pinned to full commit SHAs.
- actionlint 1.7.12 passes; offline zizmor 1.28.0 reports no findings, with two reviewed exact-CLI installation exceptions ignored inline.
