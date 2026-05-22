// ═══════════════════════════════════════════════════════════════
// EnvGuard v1 — by Kerr
// Detects PROD / STAGING / UAT / DEV and shows a banner.
// Zero telemetry. All processing local.
// ═══════════════════════════════════════════════════════════════

// ── Environment config ─────────────────────────────────────────
const ENV = {
  prod:    { label: 'PRODUCTION', short: 'PROD', color: '#ef4444', dim: '#7f1d1d', text: '#fca5a5', border: '#991b1b' },
  staging: { label: 'STAGING',    short: 'STG',  color: '#f59e0b', dim: '#78350f', text: '#fcd34d', border: '#92400e' },
  uat:     { label: 'UAT',        short: 'UAT',  color: '#f97316', dim: '#7c2d12', text: '#fdba74', border: '#9a3412' },
  dev:     { label: 'DEV',        short: 'DEV',  color: '#22c55e', dim: '#14532d', text: '#86efac', border: '#166534' },
};

// ── Built-in heuristics (auto, zero-config) ────────────────────
const HEURISTICS = [
  { re: /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/, env: 'dev' },
  { re: /\.(local|dev|test|example)$/, env: 'dev' },
  { re: /^(staging|stg|stage|uat|qa|test|demo|preview)\d*\./i, env: 'staging' },
  { re: /-(staging|stg|stage|uat|qa|preview)\d*\./i, env: 'staging' },
  { re: /\.(staging|stg|stage|uat|qa)\./i, env: 'staging' },
];

// ── Built-in rules for known services ─────────────────────────
const BUILTIN_RULES = [
  { pattern: 'console.aws.amazon.com',    env: 'prod',    note: 'AWS Console' },
  { pattern: 'console.cloud.google.com',  env: 'prod',    note: 'GCP Console' },
  { pattern: 'portal.azure.com',          env: 'prod',    note: 'Azure Portal' },
  { pattern: 'app.datadoghq.com',         env: 'prod',    note: 'Datadog' },
  { pattern: 'grafana.com',               env: 'prod',    note: 'Grafana Cloud' },
  { pattern: 'sentry.io',                 env: 'prod',    note: 'Sentry' },
  { pattern: '*.vercel.app',              env: 'staging', note: 'Vercel Preview' },
  { pattern: '*.netlify.app',             env: 'staging', note: 'Netlify Preview' },
  { pattern: '*.ngrok.io',               env: 'staging', note: 'ngrok tunnel' },
  { pattern: '*.ngrok-free.app',          env: 'staging', note: 'ngrok tunnel' },
  { pattern: '*.preview.app',             env: 'staging', note: 'Preview deploy' },
  { pattern: '*.fly.dev',                 env: 'staging', note: 'Fly.io preview' },
  { pattern: '*.render.com',              env: 'staging', note: 'Render preview' },
];

// ── Pattern matching ───────────────────────────────────────────
function matchPattern(hostname, pattern) {
  if (pattern.startsWith('*.')) {
    const base = pattern.slice(2);
    return hostname === base || hostname.endsWith('.' + base);
  }
  return hostname === pattern;
}

// ── Core detection ─────────────────────────────────────────────
function detectEnv(url, userRules, builtinsEnabled) {
  let hostname;
  try { hostname = new URL(url).hostname; } catch { return null; }

  // 1. User-defined rules (highest priority)
  for (const rule of userRules) {
    if (matchPattern(hostname, rule.pattern)) {
      return { env: rule.env, label: rule.label || ENV[rule.env]?.label || rule.env.toUpperCase(), source: 'user' };
    }
  }

  // 2. Built-in heuristics
  for (const h of HEURISTICS) {
    if (h.re.test(hostname)) {
      return { env: h.env, label: ENV[h.env].label, source: 'heuristic' };
    }
  }

  // 3. Built-in rules
  if (builtinsEnabled) {
    for (const r of BUILTIN_RULES) {
      if (matchPattern(hostname, r.pattern)) {
        return { env: r.env, label: ENV[r.env].label, source: 'builtin', note: r.note };
      }
    }
  }

  return null;
}

// ── Banner injection (Shadow DOM) ──────────────────────────────
let _host = null;
let _currentEnv = null;

function removeBanner() {
  if (_host) { _host.remove(); _host = null; }
  // Restore title prefix if we added one
  if (document.title.match(/^\[(PROD|STG|UAT|DEV|PRODUCTION|STAGING)\] /)) {
    document.title = document.title.replace(/^\[[^\]]+\] /, '');
  }
}

function injectBanner(detection) {
  removeBanner();
  if (!detection) return;

  const cfg = ENV[detection.env] || { color: '#6b7280', dim: '#374151', text: '#d1d5db', border: '#4b5563', label: detection.env };
  const sessionKey = `eg_dismissed_${detection.env}_${location.hostname}`;
  if (sessionStorage.getItem(sessionKey)) return;

  // Shadow host
  _host = document.createElement('div');
  _host.id = '__envguard__';
  _host.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;pointer-events:none';
  document.documentElement.appendChild(_host);

  const shadow = _host.attachShadow({ mode: 'closed' });

  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .bar {
        position: fixed; top: 0; left: 0; right: 0;
        height: 4px; background: ${cfg.color};
        box-shadow: 0 0 8px ${cfg.color}88;
        pointer-events: none; z-index: 2147483647;
      }
      .pill {
        position: fixed; top: 8px; right: 12px;
        background: ${cfg.dim}; border: 1.5px solid ${cfg.border};
        border-radius: 6px; padding: 5px 10px 5px 8px;
        display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
        font-size: 12px; font-weight: 700; color: ${cfg.text};
        box-shadow: 0 2px 12px rgba(0,0,0,.4);
        pointer-events: auto; cursor: default;
        user-select: none;
        z-index: 2147483647;
        transition: opacity .15s;
      }
      .pill:hover { opacity: .85; }
      .dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: ${cfg.color};
        box-shadow: 0 0 6px ${cfg.color};
        flex-shrink: 0;
      }
      .env-name { letter-spacing: .06em; }
      .note { font-weight: 400; opacity: .7; font-size: 10px; }
      .close {
        background: none; border: none; color: ${cfg.text};
        cursor: pointer; font-size: 13px; line-height: 1;
        padding: 0 0 0 4px; opacity: .6; flex-shrink: 0;
      }
      .close:hover { opacity: 1; }
    </style>
    <div class="bar"></div>
    <div class="pill" id="pill">
      <div class="dot"></div>
      <span class="env-name">${detection.label || cfg.label}</span>
      ${detection.note ? `<span class="note">${detection.note}</span>` : ''}
      <button class="close" id="close-btn" title="Dismiss for this session">✕</button>
    </div>
  `;

  shadow.getElementById('close-btn').onclick = () => {
    sessionStorage.setItem(sessionKey, '1');
    removeBanner();
  };

  // Tab title prefix
  const prefix = `[${detection.env === 'staging' ? 'STG' : detection.env.toUpperCase()}] `;
  if (!document.title.startsWith(prefix)) {
    document.title = prefix + document.title;
  }

  // Notify background for badge
  chrome.runtime.sendMessage({ type: 'set_badge', env: detection.env }).catch(() => {});
}

// ── Main ───────────────────────────────────────────────────────
let _rules = [];
let _builtinsEnabled = true;

function check() {
  const result = detectEnv(location.href, _rules, _builtinsEnabled);
  if (result?.env !== _currentEnv) {
    _currentEnv = result?.env || null;
    injectBanner(result);
    if (!result) {
      chrome.runtime.sendMessage({ type: 'set_badge', env: null }).catch(() => {});
    }
  }
}

async function init() {
  let data;
  try {
    data = await chrome.runtime.sendMessage({ type: 'get_rules' });
  } catch {
    // SW may still be waking up — retry once after a short delay
    await new Promise(r => setTimeout(r, 150));
    try { data = await chrome.runtime.sendMessage({ type: 'get_rules' }); } catch { /* use defaults */ }
  }
  _rules = data?.rules || [];
  _builtinsEnabled = data?.builtinsEnabled !== false;
  check();
}

init();

// ── SPA navigation support ────────────────────────────────────
const _origPush = history.pushState.bind(history);
history.pushState = (...args) => { _origPush(...args); check(); };
const _origReplace = history.replaceState.bind(history);
history.replaceState = (...args) => { _origReplace(...args); check(); };
window.addEventListener('popstate', check);

// ── Messages from popup ────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type === 'rules_updated') {
    init();
    return false; // fire-and-forget, no reply
  }
  if (msg.type === 'get_detection') {
    reply(detectEnv(location.href, _rules, _builtinsEnabled) || null);
    return false; // reply is synchronous, channel can close
  }
  return false;
});
