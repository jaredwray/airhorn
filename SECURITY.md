# Security Policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately through [GitHub's private vulnerability reporting](https://github.com/jaredwray/airhorn/security/advisories/new) or by emailing [me@jaredwray.com](mailto:me@jaredwray.com). Do not open a public issue.

Include the affected package and version, reproduction steps or a proof of concept, the expected impact, and any suggested mitigation. We will acknowledge the report, investigate it, and coordinate disclosure and a fix through a GitHub Security Advisory when appropriate.

Use the latest supported Airhorn release to receive current security fixes.

## How this repository is secured

This repository follows the [defense-in-depth](https://github.com/jaredwray/agentic/blob/main/skills/security/defense-in-depth-nodejs/SKILL.md) hardening checklist; progress is tracked in [DEFENSE_IN_DEPTH.md](./DEFENSE_IN_DEPTH.md). Measures currently in place:

- CI installs from the committed lockfile in frozen mode with a pinned pnpm version.
- npm publishing authenticates through short-lived OIDC credentials; the release workflow does not reference an npm token.
- Aikido scans builds, and Socket reviews dependency changes.
