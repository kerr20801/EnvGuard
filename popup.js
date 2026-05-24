const DOT_COLORS = {
  PROD: '#dc2626', STAGING: '#f97316', DEV: '#3b82f6', UNKNOWN: '#6b7280'
};
const SOURCE_LABELS = {
  user: 'custom rule', heuristic: 'auto-detected', none: 'not recognized'
};

let currentHost = '';
let currentEnv = 'UNKNOWN';

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  // Get env from content script
  let result;
  try {
    result = await chrome.tabs.sendMessage(tab.id, { type: 'GET_ENV' });
  } catch {
    document.getElementById('env-name').textContent = 'N/A';
    document.getElementById('source').textContent = 'cannot run on this page';
    return;
  }

  currentHost = result.host || '';
  currentEnv = result.env || 'UNKNOWN';

  document.getElementById('dot').style.background = DOT_COLORS[currentEnv] || '#6b7280';
  document.getElementById('env-name').textContent = currentEnv;
  document.getElementById('source').textContent = SOURCE_LABELS[result.source] || '';
  document.getElementById('host').textContent = currentHost;

  // Load storage
  const { rules = {}, whitelist = [], showUnknown = true } =
    await chrome.storage.sync.get(['rules', 'whitelist', 'showUnknown']);

  // Highlight active rule button
  const activeEnv = rules[currentHost];
  if (activeEnv) {
    document.querySelector(`[data-env="${activeEnv}"]`)?.classList.add('active');
  }

  // Whitelist button state
  const isWhitelisted = whitelist.includes(currentHost);
  const wlBtn = document.getElementById('btn-whitelist');
  if (isWhitelisted) {
    wlBtn.textContent = '✓ Ignored — click to remove';
    wlBtn.classList.add('active');
  }

  // Unknown toggle
  const toggle = document.getElementById('toggle-unknown');
  if (showUnknown) toggle.classList.add('on');
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

// Mark domain buttons
document.querySelectorAll('[data-env]').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!currentHost) return;
    const env = btn.dataset.env;
    const { rules = {} } = await chrome.storage.sync.get('rules');

    if (env === 'clear') {
      delete rules[currentHost];
      toast('Rule cleared');
    } else {
      rules[currentHost] = env;
      toast(`Marked as ${env}`);
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
  const idx = whitelist.indexOf(currentHost);

  if (idx >= 0) {
    whitelist.splice(idx, 1);
    toast('Removed from ignore list');
    document.getElementById('btn-whitelist').textContent = 'Ignore this domain';
    document.getElementById('btn-whitelist').classList.remove('active');
  } else {
    whitelist.push(currentHost);
    toast('Domain ignored');
    document.getElementById('btn-whitelist').textContent = '✓ Ignored — click to remove';
    document.getElementById('btn-whitelist').classList.add('active');
  }

  await chrome.storage.sync.set({ whitelist });
  refreshTab();
});

// Unknown toggle
document.getElementById('toggle-unknown').addEventListener('click', async () => {
  const { showUnknown = true } = await chrome.storage.sync.get('showUnknown');
  const next = !showUnknown;
  await chrome.storage.sync.set({ showUnknown: next });
  document.getElementById('toggle-unknown').classList.toggle('on', next);
  refreshTab();
});

init();
