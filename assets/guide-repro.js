/* ============================================================
   GUIDE REDISPLAY REPRO HARNESS
   Ticket 237417 (Tipalti) — programmatic guide redisplaying

   Purpose: measure whether a guide is filtered out of the
   loaded payload after it has been seen, and how each "reload"
   path affects that.

   SETUP
   1. In your Pendo test subscription create a guide:
        - Status:     Public
        - Activation: API / programmatic
        - Segment:    <this guide> -> Not viewed -> ever
   2. Paste its guide ID into GUIDE_ID below.
   3. Commit + push (GitHub Pages), then open guide-repro.html.

   HOW TO RUN
   - Click "New test visitor" to start clean.
   - Click "Show guide", then dismiss or complete it.
   - Then use each reload path and watch whether the guide
     stays IN PAYLOAD or becomes "filtered out".
   - The log survives page reloads, so the whole run is visible.
   ============================================================ */

const GUIDE_ID = 'OdM_vaAsIB3Obs1s5Mm5AT1Wqc8';

const LOG_KEY = 'guide-repro-log';
const T0_KEY = 'guide-repro-t0';
const AUTH_KEY = 'billycrm-auth';

/* ---------- logging (persisted across page loads) ---------- */

function readLog() {
    try {
        return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    } catch (e) {
        return [];
    }
}

function writeLog(entries) {
    try {
        localStorage.setItem(LOG_KEY, JSON.stringify(entries));
    } catch (e) {}
}

// Time since the guide was first shown. This is the number that matters:
// it tells you how long after the view the segment still hadn't excluded.
function elapsed() {
    const t0 = Number(localStorage.getItem(T0_KEY));
    if (!t0) return '   --   ';
    const seconds = (Date.now() - t0) / 1000;
    return ('+' + seconds.toFixed(1) + 's').padStart(9);
}

function log(message) {
    const entries = readLog();
    entries.push(new Date().toLocaleTimeString() + '  ' + elapsed() + '  ' + message);
    writeLog(entries);
    render();
}

function render() {
    const el = document.getElementById('log');
    if (el) el.textContent = readLog().join('\n') || '(nothing logged yet)';
}

/* ---------- pendo helpers ---------- */

function pendoReady() {
    return typeof window.pendo !== 'undefined' && typeof window.pendo.findGuideById === 'function';
}

// The core question: is the guide still in the payload the agent holds?
function inPayload() {
    if (!pendoReady()) return 'PENDO NOT READY';
    return pendo.findGuideById(GUIDE_ID) ? 'IN PAYLOAD' : 'filtered out';
}

/* ---------- actions ---------- */

function actShowGuide() {
    if (!pendoReady()) return log('showGuideById skipped — pendo not ready');
    // Start the clock on the first show only.
    if (!localStorage.getItem(T0_KEY)) localStorage.setItem(T0_KEY, String(Date.now()));
    const result = pendo.showGuideById(GUIDE_ID);
    log('showGuideById() -> ' + result + '   (false = not in payload)');
}

function actCheckPayload() {
    log('check -> ' + inPayload());
}

// Path A: explicit refetch, no navigation.
function actLoadGuides() {
    if (!pendoReady()) return log('loadGuides skipped — pendo not ready');
    pendo.loadGuides();
    log('loadGuides() called');
    setTimeout(function () {
        log('   3s after loadGuides -> ' + inPayload());
    }, 3000);
}

// Path B: SPA-style URL change. A payment-batch submit is far more
// likely to be this than a real page load.
function actPushState() {
    const url = location.pathname + '?batch=' + Date.now();
    history.pushState({}, '', url);
    log('pushState -> ' + url);
    setTimeout(function () {
        log('   3s after pushState -> ' + inPayload());
    }, 3000);
}

// Path C: full page load — what Tina says happens at Tipalti.
function actFullReload() {
    log('--- full page reload ---');
    location.reload();
}

// Pushes queued events (including guideSeen) to Pendo immediately
// rather than waiting for the next flush tick.
function actFlushNow() {
    if (!pendoReady() || typeof pendo.flushNow !== 'function') {
        return log('flushNow unavailable');
    }
    pendo.flushNow();
    log('flushNow() called');
}

function actNewVisitor() {
    const id = 'repro-' + Date.now();
    const auth = {
        visitor: {
            id: id,
            email: id + '@example.com',
            name: 'Repro Tester',
            createdAt: Date.now()
        },
        account: {
            id: 'repro-account',
            name: 'Repro Account'
        }
    };
    try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    } catch (e) {}
    localStorage.removeItem(LOG_KEY);
    localStorage.removeItem(T0_KEY);
    location.reload();
}

function actClearLog() {
    localStorage.removeItem(LOG_KEY);
    localStorage.removeItem(T0_KEY);
    render();
}

/* ---------- page wiring ---------- */

function currentVisitorId() {
    try {
        const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
        return (auth.visitor && auth.visitor.id) || '(anonymous)';
    } catch (e) {
        return '(unreadable)';
    }
}

function showStatus() {
    const vid = document.getElementById('visitor-id');
    if (vid) vid.textContent = currentVisitorId();

    const gid = document.getElementById('guide-id');
    if (gid) gid.textContent = GUIDE_ID;

    const warn = document.getElementById('placeholder-warning');
    if (warn && GUIDE_ID !== 'PASTE_GUIDE_ID_HERE') warn.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    render();
    showStatus();

    const actions = {
        'btn-show': actShowGuide,
        'btn-check': actCheckPayload,
        'btn-loadguides': actLoadGuides,
        'btn-pushstate': actPushState,
        'btn-reload': actFullReload,
        'btn-flush': actFlushNow,
        'btn-newvisitor': actNewVisitor,
        'btn-clear': actClearLog
    };

    Object.keys(actions).forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', actions[id]);
    });

    // If a run is already in progress, record what the payload looks like
    // after this page load. Guides load asynchronously, so wait a moment.
    if (localStorage.getItem(T0_KEY)) {
        setTimeout(function () {
            log('page loaded -> ' + inPayload());
        }, 3000);
    }
});
