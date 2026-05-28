# EnvGuard — Chrome Web Store Listing

> This file is the canonical source for the Store description.
> Update here first, then copy to the Chrome Web Store when submitting a new version.

---

## Name

EnvGuard — Environment Indicator

---

## Short Description (132 chars max)

Instantly shows whether you're on PROD, STAGING, or DEV with a color bar. Never deploy to the wrong environment again.

---

## Full Description (EN)

🛡️ EnvGuard — Never Mistake PROD for STAGING Again

Every developer has done it: opened a tab, run a command, deployed a change — and only realized afterward it was the wrong environment. PROD, STAGING, and DEV can look identical. EnvGuard makes them impossible to confuse.

A color bar appears at the top of every page, telling you exactly where you are:

🔴 PROD — red, always visible
🟠 STAGING — orange
🔵 DEV — blue
⬜ Unknown — grey (optional)

**How detection works — three layers:**

1. **Your own rules first.** Mark any domain as PROD, STAGING, or DEV from the popup. Your rule takes precedence over everything else. Stored locally, synced across your Chrome profile.

2. **Automatic heuristics.** If no rule exists, EnvGuard detects localhost, private IPs (192.168.x, 10.x, 172.16–31.x), common dev ports (3000, 5173, 8080…), and URL patterns like staging., uat., preprod., .dev., .local.

3. **Path keyword fallback.** URLs containing /staging/, /uat/, /preprod/ are caught even when the domain looks neutral.

**Built for modern apps:**
- Shadow DOM color bar — isolated from page CSS, always visible
- SPA-aware — re-detects on `pushState` navigation, works with React/Vue/Angular
- Per-domain ignore list — whitelist sites where the bar isn't useful
- Toggle unknown grey bar on or off

💡 Zero telemetry. No data leaves your browser. All rules stored in `chrome.storage.sync`.

---

## Full Description (ZH)

🛡️ EnvGuard — 再也不會搞混正式與測試環境

每個開發者都遇過：開啟分頁、執行指令、部署變更，事後才發現打到了錯誤的環境。PROD、STAGING、DEV 的介面可能長得一模一樣，EnvGuard 讓它們從此一眼就能辨識。

頁面頂端會出現一條顏色邊條，告訴你現在在哪裡：

🔴 PROD（正式環境）— 紅色
🟠 STAGING（測試環境）— 橘色
🔵 DEV（開發環境）— 藍色
⬜ 未知 — 灰色（可關閉）

**三層偵測機制：**

1. **優先採用您的自訂規則。** 從 popup 手動將任何網域標記為 PROD、STAGING 或 DEV，您的設定優先於所有自動偵測。儲存於本機，透過 Chrome 帳號同步。

2. **自動啟發式偵測。** 若無自訂規則，EnvGuard 會自動識別 localhost、私有 IP（192.168.x、10.x、172.16–31.x）、常見開發 Port（3000、5173、8080…）以及 staging.、uat.、preprod.、.dev.、.local 等 URL 模式。

3. **路徑關鍵字兜底。** URL 含有 /staging/、/uat/、/preprod/ 路徑時，即使網域看起來正常也會被偵測到。

**為現代 Web App 設計：**
- Shadow DOM 色條 — 獨立於頁面 CSS，永遠不被覆蓋
- SPA 支援 — 監聽 pushState 導覽，相容 React / Vue / Angular
- 網域忽略清單 — 白名單不需要顯示色條的網站
- 未知環境灰條可開關

💡 零遙測。所有設定儲存於瀏覽器本機，資料不外傳。

---

## Category

Developer Tools

## Language

English + 繁體中文 (Traditional Chinese)

## Screenshots needed

1. PROD red bar on a production site
2. STAGING orange bar on a staging site
3. DEV blue bar on localhost
4. Popup showing environment + mark domain buttons
