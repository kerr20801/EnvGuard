const BADGE = {
  PROD:    { text: 'P', color: '#dc2626' },
  STAGING: { text: 'S', color: '#f97316' },
  DEV:     { text: 'D', color: '#3b82f6' },
  UNKNOWN: { text: '',  color: '#6b7280' },
};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== 'ENV_DETECTED') return;
  const b = BADGE[msg.env] || BADGE.UNKNOWN;
  chrome.action.setBadgeText({ text: b.text });
  chrome.action.setBadgeBackgroundColor({ color: b.color });
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.sendMessage(tabId, { type: 'REFRESH' }).catch(() => {});
});
