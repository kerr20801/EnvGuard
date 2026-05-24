# Changelog

## v0.1.0 — 2026-05-24

First working release. Core detection and UI complete.

### Added
- **3-layer environment detection**
  - Layer 1: User-defined hostname rules (stored in `chrome.storage.sync`)
  - Layer 2: Auto heuristics — localhost / private IPs / dev ports / staging patterns
  - Layer 3: Path keyword fallback (`/staging/`, `/uat/`, `/preprod/`)
- **Shadow DOM color bar** — fixed top of page, isolated from page CSS
  - 🔴 PROD · 🟠 STAGING · 🔵 DEV · ⬜ Unknown (toggleable)
  - Click bar to dismiss for current session
- **Extension badge** — P / S / D on the icon for at-a-glance status
- **Popup**
  - Shows detected environment + detection source (auto / custom rule)
  - Mark current domain as PROD / STAGING / DEV / clear
  - Ignore (whitelist) current domain
  - Toggle: show grey bar for unrecognized sites
- **SPA support** — hooks `history.pushState` and `popstate`, re-detects on navigation

### Known Limitations
- No built-in rules for cloud consoles (AWS, GCP, Azure) — manual rules for now
- No tab title prefix (`[PROD] Dashboard`) — planned for v0.2
- No floating pill — color bar only
- No wildcard patterns in custom rules (substring match only)

---

## Roadmap

### v0.2
- Tab title prefix: `[PROD]`, `[STG]`, `[DEV]`
- Wildcard support in custom rules (`*.prod.company.com`)
- Built-in rule packages: cloud consoles, common SaaS tools

### v0.3 (ML layer, opt-in)
- On-device classifier for environment detection from page content
- Catches edge cases that URL heuristics miss (random deploy preview URLs)
- User opts in explicitly at install; model ~8MB, downloaded once
