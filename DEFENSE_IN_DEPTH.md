# Defense in Depth

Tracking against https://github.com/jaredwray/agentic/blob/main/skills/security/defense-in-depth-nodejs/SKILL.md.

Profile: npm library · public

## 1. Security docs

- [ ] `SECURITY.md` present — contact info + "How this repository is secured" summary (PR #635 pending)
- [ ] `DEFENSE_IN_DEPTH.md` present (this file) (PR #635 pending)

## 2. CODEOWNERS and cloud bootstrap

- [ ] `.github/CODEOWNERS` covers `/.github/`, `/.cursor/`, `/.devcontainer/`, `/scripts/` with owners the maintainer names
- [ ] Codespaces and Cursor Cloud Agents bootstrap Aikido Safe Chain via scripts/setup-cloud-environment.sh (--ci shims, frozen lockfile)

## 3. Dependencies (pnpm)

- [ ] `packageManager: pnpm@11.3+` pinned in `package.json`
- [ ] 7-day cooldown: `minimumReleaseAge: 10080`, `minimumReleaseAgeStrict: true`, `minimumReleaseAgeIgnoreMissingTime: false`; no first-party `minimumReleaseAgeExclude`
- [ ] `trustPolicy: no-downgrade`; no first-party `trustPolicyExclude`
- [ ] Lifecycle scripts blocked: `strictDepBuilds: true`, `dangerouslyAllowAllBuilds: false`, `allowBuilds: {}` baseline
- [ ] `blockExoticSubdeps: true`
- [ ] Lockfile committed; CI installs with `pnpm install --frozen-lockfile`
- [ ] No `.github/dependabot.yml`; other dependency-update tools (if any) open PRs only — never auto-merge

## 4. GitHub Actions

- [ ] `permissions: contents: read` (or `{}` + per-job grants) on every workflow
- [ ] No `contents: write` except jobs whose purpose is mutating the repo (GitHub Release, Changesets version PR); generated output is a workflow artifact, never committed back from CI
- [ ] Every action pinned to a full commit SHA (`npx actions-up`)
- [ ] Every job installs Socket Firewall (`SocketDev/action` SHA-pinned, `firewall-version` pinned); `pnpm install` / `npm install` run as `sfw pnpm install` / `sfw npm install`
- [ ] `.github/workflows/check-workflows.yaml` lints workflows with zizmor on every PR
- [ ] `persist-credentials: false` on checkouts that don't push
- [ ] No `pull_request_target` on workflows that run untrusted PR code
- [ ] Artifact-publishing workflows disable `actions/setup-node` default caching (`package-manager-cache: false`) to prevent cache poisoning
- [ ] No npm tokens (or other registry credentials) in Actions secrets

## 5. npm publishing — npm libraries only

- [ ] OIDC trusted publishing configured **stage-only** on npmjs.com for the publish workflow — it can stage, never publish live (manual)
- [ ] `.github/workflows/release.yaml` packs then stages with `pnpm stage publish ./packed/*.tgz --no-git-checks`
- [ ] Maintainer promotes staged versions with 2FA (manual)
- [ ] Drydock connected — staged releases reviewed before promotion (manual)
- [ ] No direct publish rights: package requires 2FA and disallows tokens (manual)
- [ ] `package.json` `repository.url` accurate so provenance maps to this repo

## 6. Security tooling

- [ ] Aikido runs on every build
- [ ] Aikido release gate: the release workflow's stage-publish job `needs:` a passing `scan-release`
- [ ] Socket reviews every PR that changes dependencies

## 7. Repository lockdown

- [ ] `lockdown-repo.sh` applied; `--check` with `--required-checks` and `--allowed-actions` passes (PRs required on the default branch, merges blocked unless required status checks pass, tag ruleset, immutable releases, fork-PR approval, read-only workflow tokens, Actions allowlist, secret scanning, Dependabot disabled, private vulnerability reporting as applicable)
- [ ] Phishing-resistant 2FA (passkeys / hardware keys) on the GitHub and npm accounts (manual)
- [ ] Recovery codes stored offline in a password manager (manual)
