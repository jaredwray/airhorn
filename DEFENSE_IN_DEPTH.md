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

- [x] `packageManager` pins pnpm with a Corepack integrity digest — verified 2026-08-14
- [ ] Corepack pin updated to a reviewed exact pnpm release with its SHA-512 digest (PR pending)
- [ ] 7-day cooldown: `minimumReleaseAge: 10080`, `minimumReleaseAgeStrict: true`, `minimumReleaseAgeIgnoreMissingTime: false` (PR pending)
- [ ] Lifecycle scripts fail closed with `strictDepBuilds: true` and `dangerouslyAllowAllBuilds: false`; only explicitly reviewed, version-scoped `esbuild` and `workerd` releases are allowed (PR pending)
- [ ] `blockExoticSubdeps: true` (PR pending)
- [ ] `trustPolicy: no-downgrade` rejects dependency provenance/signature downgrades (PR pending)
- [ ] Broad `hookified` cooldown exemption removed (PR pending)
- [ ] The Cloudflare CLI and its worker runtime dependency are frozen in the lockfile (PR pending)
- [x] Lockfile committed; CI installs with `pnpm install --frozen-lockfile` — verified 2026-08-14
- [ ] Dependency-update tooling opens PRs only — never auto-merge (no dependency-update bot configured)
- [ ] New direct dependencies get human review; prefer `~` ranges over `^`

## 4. GitHub Actions

- [ ] `permissions: contents: read` (or `{}` + per-job grants) on every workflow (PR pending)
- [ ] Every action is pinned to a full commit SHA and verified by reviewed pin-update tooling (PR pending)
- [ ] `.github/workflows/check-workflows.yaml` lints workflows with zizmor on every PR (PR pending)
- [ ] `persist-credentials: false` on checkouts that don't push (PR pending)
- [ ] Site deployment reduced from `contents: write` to `contents: read` (PR pending)
- [ ] Automatic package-manager caching explicitly disabled in setup-node (PR pending)
- [ ] Unused `FIREBASE_CERT` exposure removed from test and coverage jobs (PR pending)
- [ ] CI uses non-mutating `pnpm test:ci`; coverage CI also validates all package tarballs (PR pending)
- [ ] Cloudflare Action uses the repository's frozen pnpm-resolved Wrangler toolchain instead of dynamically installing the latest version (PR pending)
- [x] No `pull_request_target` on workflows that run untrusted PR code — verified 2026-08-14
- [ ] No npm tokens (or other registry credentials) in Actions secrets

The current release workflow authenticates with OIDC and does not reference `NPM_TOKEN`; the unchecked item above still requires confirmation that no registry credentials remain stored as Actions secrets.

## 5. npm publishing — npm libraries only

- [ ] OIDC trusted publishing configured **stage-only** on npmjs.com for the publish workflow — it can stage, never publish live (manual)
- [ ] Staged publishing: CI runs `npm stage publish`; a maintainer promotes with 2FA (PR pending + manual npm configuration)
- [ ] Release runs only for a published GitHub release; manual dispatch and direct-publish scripts are removed (PR pending)
- [ ] Strict `vX.Y.Z` tag, release SHA, `main` ancestry, package-name, and root/package manifest version checks run before dependency code (PR pending)
- [ ] Build/test/pack runs without OIDC; only checksummed, validated tarballs reach independent staging jobs (PR pending)
- [ ] A 30-day, run-scoped artifact supports failed-cell retries without rebuilding successful packages (PR pending)
- [ ] One `fail-fast: false` staging cell per package has no checkout, project install, build, or test; only staging cells receive `id-token: write` (PR pending)
- [ ] Staging installs a reviewed exact npm CLI release with lifecycle scripts disabled, verifies every checksum and selected manifest, then stages one tarball (PR pending)
- [ ] Every package tarball is limited to `package.json`, `README.md`, `LICENSE`, and `dist/**` (PR pending)
- [ ] `@airhornjs/aws` has the same `files: ["dist", "LICENSE"]` publication boundary as the other packages (PR pending)
- [ ] Drydock connected — staged releases reviewed before promotion (manual)
- [ ] No direct publish rights: package requires 2FA and disallows tokens (manual)
- [x] `package.json` `repository.url` accurate so provenance maps to this repo — verified 2026-08-14

`npm stage publish` is not idempotent. After any matrix cell succeeds, re-run only failed cells. If npm accepted a request but the response was lost, inspect npm's Staged Packages before retrying.

## 6. Security tooling

- [x] Aikido runs on every build — verified 2026-08-14
- [ ] Aikido release gate uses a reviewed exact client release and the immutable GitHub repository ID; every stage job `needs:` its passing dependency, SAST, IaC, and secret scan (PR pending)
- [x] Socket reviews every PR that changes dependencies — verified 2026-08-14

## Current PR verification

- Frozen install passes under the pinned pnpm toolchain; `pnpm ignored-builds` reports none.
- The reviewed lockfile preserves the existing dependency graph while adding the expected pinned Cloudflare toolchain.
- `pnpm build`, `pnpm test:ci`, `pnpm website:build`, and every-package archive verification pass.
- Reviewed action-pin tooling reports every action reference current and pinned to a full commit SHA.
- actionlint passes; offline zizmor reports no findings, with reviewed exact-CLI installation exceptions ignored inline.
