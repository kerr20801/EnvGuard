// EnvGuard v1 — Background Service Worker

const DEFAULT_RULES = [];

// ── Storage helpers ────────────────────────────────────────────
async function getRules() {
  const d = await chrome.storage.sync.get(['rules', 'builtinsEnabled']);
  return {
    rules: d.rules || DEFAULT_RULES,
    builtinsEnabled: d.builtinsEnabled !== false,
  };
}

// ── Notify all tabs helper ─────────────────────────────────────
function notifyAllTabs(msg) {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(t =>
      chrome.tabs.sendMessage(t.id, msg, () => void chrome.runtime.lastError)
    );
  });
}

// ── Message handler ────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === 'get_rules') {
    getRules().then(reply);
    return true; // keep channel open for async reply
  }
  if (msg.type === 'set_rules') {
    // Use callback so SW stays alive until storage write completes
    chrome.storage.sync.set({ rules: msg.rules }, () => notifyAllTabs({ type: 'rules_updated' }));
    return true;
  }
  if (msg.type === 'set_builtins') {
    chrome.storage.sync.set({ builtinsEnabled: msg.enabled }, () => notifyAllTabs({ type: 'rules_updated' }));
    return true;
  }
  if (msg.type === 'set_badge') {
    const tabId = sender.tab?.id;
    if (tabId) {
      if (msg.env) {
        const colors = { prod: '#ef4444', staging: '#f59e0b', uat: '#f97316', dev: '#22c55e' };
        const labels = { prod: 'PRD', staging: 'STG', uat: 'UAT', dev: 'DEV' };
        chrome.action.setBadgeText({ text: labels[msg.env] || msg.env.slice(0,3).toUpperCase(), tabId });
        chrome.action.setBadgeBackgroundColor({ color: colors[msg.env] || '#6b7280', tabId });
      } else {
        chrome.action.setBadgeText({ text: '', tabId });
      }
    }
    return true;
  }
  return true;
});
