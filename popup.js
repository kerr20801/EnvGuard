// popup.js — EnvGuard v0.2.0

const I = {
  zh: {
    sub: '環境偵測 · 色條提示 · by Kerr',
    mark: '標記此網域為',
    clear_rule: '清除',
    unknown: '❓ 未知環境顯示灰條',
    unknown_sub: '關閉後未識別網站不顯示色條',
    whitelist: '🚫 忽略此網域',
    whitelisted: h => `✓ ${h} 已忽略，點擊移除`,
    source_user: '自訂規則',
    source_heuristic: '自動偵測',
    source_none: '未識別',
    na: '無法在此頁面執行',
    toast_cleared: '規則已清除',
    toast_marked: env => `已標記為 ${env}`,
    toast_ignored: '已忽略此網域',
    toast_removed: '已從忽略清單移除',
    lang_btn: 'EN',
  },
  en: {
    sub: 'Env detection · Color bar · by Kerr',
    mark: 'MARK THIS DOMAIN AS',
    clear_rule: 'Clear',
    unknown: '❓ Show grey bar for unknown sites',
    unknown_sub: 'Turn off to hide bar on unrecognized sites',
    whitelist: '🚫 Ignore this domain',
    whitelisted: h => `✓ ${h} ignored — click to remove`,
    source_user: 'custom rule',
    source_heuristic: 'auto-detected',
    source_none: 'not recognized',
    na: 'Cannot run on this page',
    toast_cleared: 'Rule cleared',
    toast_marked: env => `Marked as ${env}`,
    toast_ignored: 'Domain ignored',
    toast_removed: 'Removed from ignore list',
    lang_btn: '中文',
  }
};

const DOT_COLORS = {
  PROD: '#dc2626', STAGING: '#f97316', DEV: '#3b82f6', UNKNOWN: '#6b7280'
};

let lang = localStorage.getItem('envguard-lang') || (navigator.language.startsWith('zh') ? 'zh' : 'en');
let currentHost = '';
let currentEnv = 'UNKNOWN';
let isWhitelisted = false;

function applyLang() {
  const L = I[lang];
  document.getElementById('h-sub').textContent = L.sub;
  document.getElementById('lbl-mark').textContent = L.mark;
  document.getElementById('btn-clear-rule').textContent = L.clear_rule;
  document.getElementById('lbl-unknown').textContent = L.unknown;
  document.getElementById('lbl-unknown-sub').textContent = L.unknown_sub;
  document.getElementById('lang-btn').textContent = L.lang_btn;

  const wlBtn = document.getElementById('btn-whitelist');
  wlBtn.textContent = isWhitelisted ? L.whitelisted(currentHost) : L.whitelist;

  const srcEl = document.getElementById('source');
  if (srcEl) {
    const raw = srcEl.dataset.source;
    srcEl.textContent = raw === 'user' ? L.source_user : raw === 'heuristic' ? L.source_heuristic : raw === 'none' ? L.source_none : '';
  }
}

function toggleLang() {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('envguard-lang', lang);
  applyLang();
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1500);
}

async function refreshTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'REFRESH' }).catch(() => {});
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  let result;
  try {
    result = await chrome.tabs.sendMessage(tab.id, { type: 'GET_ENV' });
  } catch {
    document.getElementById('env-name').textContent = 'N/A';
    const srcEl = document.getElementById('source');
    srcEl.dataset.source = 'none';
    srcEl.textContent = I[lang].na;
    applyLang();
    return;
  }

  currentHost = result.host || '';
  currentEnv = result.env || 'UNKNOWN';

  document.getElementById('dot').style.background = DOT_COLORS[currentEnv] || '#6b7280';
  document.getElementById('env-name').textContent = currentEnv;

  const srcEl = document.getElementById('source');
  srcEl.dataset.source = result.source || 'none';

  document.getElementById('host').textContent = currentHost;

  const { rules = {}, whitelist = [], showUnknown = true } =
    await chrome.storage.sync.get(['rules', 'whitelist', 'showUnknown']);

  // Active rule button
  const activeEnv = rules[currentHost];
  if (activeEnv) {
    document.querySelector(`[data-env="${activeEnv}"]`)?.classList.add('active');
  }

  // Whitelist state
  isWhitelisted = whitelist.includes(currentHost);

  // Unknown toggle
  document.getElementById('toggle-unknown').checked = showUnknown;

  applyLang();
}

// Mark domain buttons
document.querySelectorAll('[data-env]').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!currentHost) return;
    const env = btn.dataset.env;
    const { rules = {} } = await chrome.storage.sync.get('rules');
    const L = I[lang];

    if (env === 'clear') {
      delete rules[currentHost];
      toast(L.toast_cleared);
    } else {
      rules[currentHost] = env;
      toast(L.toast_marked(env));
    }

    await chrome.storage.sync.set({ rules });
    document.querySelectorAll('[data-env]').forEach(b => b.classList.remove('active'));
    if (env !== 'clear') btn.classList.add('active');
    refreshTab();
  });
});

// Whitelist button
document.getElementById('btn-whitelist').addEventListener('click', async () => {
  if (!currentHost) return;
  const { whitelist = [] } = await chrome.storage.sync.get('whitelist');
  const L = I[lang];
  const idx = whitelist.indexOf(currentHost);

  if (idx >= 0) {
    whitelist.splice(idx, 1);
    isWhitelisted = false;
    toast(L.toast_removed);
  } else {
    whitelist.push(currentHost);
    isWhitelisted = true;
    toast(L.toast_ignored);
  }

  await chrome.storage.sync.set({ whitelist });
  applyLang();
  refreshTab();
});

// Unknown toggle
document.getElementById('toggle-unknown').addEventListener('change', async (e) => {
  const next = e.target.checked;
  await chrome.storage.sync.set({ showUnknown: next });
  refreshTab();
});

// Lang button
document.getElementById('lang-btn').addEventListener('click', toggleLang);

init();
