(() => {
  if (window !== window.top) return; // top frame only

  const BAR_ID = '__envguard_host__';

  const ENV = {
    PROD:    { bg: '#dc2626', text: '#fff', label: 'PROD' },
    STAGING: { bg: '#f97316', text: '#fff', label: 'STAGING' },
    DEV:     { bg: '#3b82f6', text: '#fff', label: 'DEV' },
    UNKNOWN: { bg: '#6b7280', text: '#fff', label: '?' },
  };

  const DEV_HOST_RE = [
    /^localhost$/,
    /^127\.\d+\.\d+\.\d+$/,
    /^192\.168\.\d+\.\d+$/,
    /^10\.\d+\.\d+\.\d+$/,
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
    /\.local$/,
    /(^|\.)dev\./,
    /(^|\.)development\./,
  ];

  const DEV_PORTS = new Set([3000, 3001, 3002, 4200, 5173, 5174, 8000, 8001, 8080, 8888, 9000]);

  const STAGING_HOST_RE = [
    /(^|\.)staging\./,
    /(^|\.)stage\./,
    /(^|\.)uat\./,
    /(^|\.)preprod\./,
    /(^|\.)pre-prod\./,
    /(^|\.)qa\./,
    /(^|\.)sandbox\./,
    /(^|\.)test\./,
  ];

  const STAGING_PATH_RE = [
    /\/staging\//,
    /\/stage\//,
    /\/uat\//,
    /\/preprod\//,
    /\/pre-prod\//,
  ];

  const PROD_HOST_RE = [
    /(^|\.)prod\./,
    /(^|\.)production\./,
    /(^|\.)live\./,
  ];

  function detect(href, userRules) {
    let url;
    try { url = new URL(href); } catch { return { env: 'UNKNOWN', source: 'none' }; }

    const host = url.hostname.toLowerCase();
    const port = url.port ? parseInt(url.port) : null;
    const path = url.pathname.toLowerCase();

    // Layer 1: user rules (exact hostname substring match)
    for (const [pattern, env] of Object.entries(userRules)) {
      if (host.includes(pattern.toLowerCase())) {
        return { env, source: 'user' };
      }
    }

    // Layer 2: heuristics — DEV
    for (const re of DEV_HOST_RE) {
      if (re.test(host)) return { env: 'DEV', source: 'heuristic' };
    }
    if (port && DEV_PORTS.has(port)) return { env: 'DEV', source: 'heuristic' };

    // Layer 2: heuristics — STAGING
    for (const re of STAGING_HOST_RE) {
      if (re.test(host + '.')) return { env: 'STAGING', source: 'heuristic' };
    }
    for (const re of STAGING_PATH_RE) {
      if (re.test(path)) return { env: 'STAGING', source: 'heuristic' };
    }

    // Layer 2: heuristics — explicit PROD markers
    for (const re of PROD_HOST_RE) {
      if (re.test(host + '.')) return { env: 'PROD', source: 'heuristic' };
    }

    return { env: 'UNKNOWN', source: 'none' };
  }

  function removeBar() {
    document.getElementById(BAR_ID)?.remove();
  }

  function injectBar(env) {
    removeBar();
    const cfg = ENV[env];
    if (!cfg) return;

    const host = document.createElement('div');
    host.id = BAR_ID;
    host.style.cssText =
      'position:fixed;top:0;left:0;width:100%;z-index:2147483647;pointer-events:none;';

    const shadow = host.attachShadow({ mode: 'closed' });

    const bar = document.createElement('div');
    bar.style.cssText = [
      `background:${cfg.bg}`,
      `color:${cfg.text}`,
      'width:100%',
      'height:5px',
      'display:flex',
      'align-items:center',
      'justify-content:flex-end',
      'padding:0 10px',
      'box-sizing:border-box',
      'font:700 10px/5px -apple-system,sans-serif',
      'letter-spacing:.08em',
      'pointer-events:auto',
      'cursor:pointer',
      'user-select:none',
    ].join(';');
    bar.textContent = cfg.label;
    bar.title = `EnvGuard: ${cfg.label} — click to dismiss`;

    bar.addEventListener('click', () => { host.style.display = 'none'; });

    shadow.appendChild(bar);
    (document.documentElement || document.body).prepend(host);
  }

  let lastEnv = null;

  async function run() {
    let storage;
    try {
      storage = await chrome.storage.sync.get(['rules', 'whitelist', 'showUnknown']);
    } catch {
      return; // extension context invalidated
    }

    const rules     = storage.rules      || {};
    const whitelist = storage.whitelist  || [];
    const showUnknown = storage.showUnknown !== false;

    const host = location.hostname;
    if (whitelist.some(w => host.includes(w))) { removeBar(); return; }

    const result = detect(location.href, rules);
    lastEnv = result;

    if (result.env === 'UNKNOWN' && !showUnknown) { removeBar(); return; }

    injectBar(result.env);

    chrome.runtime.sendMessage({ type: 'ENV_DETECTED', ...result, host }).catch(() => {});
  }

  // SPA navigation hook
  const _push = history.pushState.bind(history);
  const _replace = history.replaceState.bind(history);
  history.pushState = (...a) => { _push(...a); setTimeout(run, 150); };
  history.replaceState = (...a) => { _replace(...a); setTimeout(run, 150); };
  window.addEventListener('popstate', () => setTimeout(run, 150));

  // Popup asks for current env
  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    if (msg.type === 'GET_ENV') {
      chrome.storage.sync.get(['rules', 'whitelist']).then(storage => {
        const result = detect(location.href, storage.rules || {});
        reply({ ...result, host: location.hostname, href: location.href });
      });
      return true;
    }
    if (msg.type === 'REFRESH') run();
  });

  run();
})();
