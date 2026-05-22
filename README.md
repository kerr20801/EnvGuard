# 🛡 EnvGuard

> **Know your environment.** Color-coded banner for PROD / STAGING / UAT / DEV on every page. Zero config, zero telemetry.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)]()

---

## The Problem

You have 8 tabs open. Three look identical. One is production.

You run the reset. Wrong tab.

EnvGuard puts a color bar at the top of every page and prefixes the tab title — so you always know where you are before you act.

---

## What It Does

- **4px color bar** fixed at top of page
- **Floating pill** (top-right) showing the environment name — dismiss per session
- **Tab title prefix**: `[PROD] Dashboard`, `[STG] Admin Panel`
- **Extension badge**: `PRD` / `STG` / `UAT` / `DEV` on the icon

| Environment | Color | 
|-------------|-------|
| 🔴 PRODUCTION | Red `#ef4444` |
| 🟡 STAGING | Amber `#f59e0b` |
| 🟠 UAT | Orange `#f97316` |
| 🟢 DEV | Green `#22c55e` |

---

## Detection (Three Layers)

**1. User-defined rules** (highest priority)  
Add your own patterns in the popup: `prod.company.com`, `*.prod.io`, `api.internal`

**2. Auto heuristics** (zero config)  
- `localhost` / `127.0.0.1` / `*.local` → DEV  
- `staging.*` / `stg.*` / `*.staging` / `uat.*` → STAGING

**3. Built-in rules** (toggle on/off)  
Pre-configured for common services:

| Service | Environment |
|---------|-------------|
| console.aws.amazon.com | PROD |
| console.cloud.google.com | PROD |
| portal.azure.com | PROD |
| app.datadoghq.com | PROD |
| *.vercel.app | STAGING |
| *.netlify.app | STAGING |
| *.ngrok.io / *.ngrok-free.app | STAGING |
| *.fly.dev / *.render.com | STAGING |

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
- See current page's detected environment
- Add custom rules (`prod.company.com` → PROD)
- Toggle built-in rules on/off
- Bilingual: 繁中 / EN

**Pill dismiss:**  
Click ✕ on the pill to hide it for the current session. Reappears on next visit.

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
