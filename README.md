# 🛡 EnvGuard

> **Know your environment.** Color-coded banner for PROD / STAGING / UAT / DEV on every page. Zero config, zero telemetry.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)]()

---

## The Problem

You have 8 tabs open. Three look identical. One is production.

You run the reset. Wrong tab.

EnvGuard puts a color bar at the top of every page — so you always know where you are before you act.

---

## What It Does (v0.1.0)

- **5px color bar** fixed at top of page via Shadow DOM — click to dismiss per session
- **Extension badge** — `P` / `S` / `D` on the icon
- **Popup** — shows detected environment, detection source, mark/ignore domain

| Environment | Color |
|-------------|-------|
| 🔴 PROD | Red `#dc2626` |
| 🟠 STAGING | Orange `#f97316` |
| 🔵 DEV | Blue `#3b82f6` |
| ⬜ Unknown | Grey `#6b7280` (toggleable) |

**Coming in v0.2:** tab title prefix `[PROD]`, wildcard custom rules, built-in cloud console rules.

---

## Detection (Three Layers)

**1. User-defined rules** (highest priority)  
Add your own patterns in the popup: `prod.company.com`, `*.prod.io`, `api.internal`

**2. Auto heuristics** (zero config)  
- `localhost` / `127.0.0.1` / `*.local` → DEV  
- `staging.*` / `stg.*` / `*.staging` / `uat.*` → STAGING

**3. Path keywords** (fallback)  
`/staging/`, `/uat/`, `/preprod/`, `/pre-prod/` in the URL path → STAGING

---

## Install

> Chrome Web Store submission coming soon. Manual install for now:

1. Download or clone this repo
2. `chrome://extensions/` → Enable **Developer mode**
3. **Load unpacked** → select the `envguard/` folder
4. Pin the extension

---

## Usage

**Popup:**
- See detected environment + source (auto-detected / custom rule)
- Mark current domain as PROD / STAGING / DEV (or clear)
- Ignore (whitelist) current domain
- Toggle: show grey bar on unrecognized sites

**Bar dismiss:**  
Click the color bar to hide it for the current session.

---

## Architecture

```
manifest.json    MV3, permissions: storage + tabs
├── content.js   Detection + Shadow DOM banner injection + SPA support
├── background.js Service worker — rule storage + tab badge
└── popup.html   Rule management + current page status
```

**Shadow DOM** — banner injected via `attachShadow({mode:'closed'})`. Page CSS resets, `overflow:hidden`, and aggressive style rules cannot affect the banner.

**SPA support** — hooks `history.pushState` and `replaceState` so banner updates on React/Vue/Next.js navigation without page reload.

---

## Privacy

- No backend, no analytics, no network requests
- Rules stored in `chrome.storage.sync` (your Google account, encrypted)
- Nothing sent anywhere

---

## Built by

**Kerr** — Security & DevOps tooling  
[github.com/kerr20801](https://github.com/kerr20801)

---

## License

MIT
