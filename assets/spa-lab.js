/* ============================================================
   SPA ROUTING LAB
   Repro harness: auto guide with a delay + "do not repeat"
   reshowing after dismissal on every client-side route change.

   THEORY UNDER TEST
   The agent loads once. Each client-side route change is treated
   as a new page view and starts its OWN delay timer, so the guide
   reappears ~<delay>s after every route change even though it was
   already dismissed and is set to show once.

   SETUP (done in Pendo, not here)
   1. Tag a Page rule that matches this lab's routes, e.g.
        contains  /spa-lab
      so all four views below count as the same Page — or tag them
      separately if you want to test per-route behaviour.
   2. Create a guide:
        Activation:   Automatic
        Delay:        30 seconds
        Display:      once / do not repeat
        Location:     the Page above
   3. Open this page, sign in via the avatar, and drive the routes.

   HOW TO RUN
   - Land here and wait out the delay until the guide shows.
   - Dismiss it.
   - Click through the sub-nav (or hit "Burst") WITHOUT reloading.
   - Watch the log: if the guide reappears, the elapsed time since
     the last route change is the number that proves the timer is
     restarting per route.

   NOTE: everything lives inside an IIFE. app.js declares some
   names at global scope and two classic scripts declaring the
   same const throws a SyntaxError that silently kills this file.
   ============================================================ */

(function () {
    'use strict';

    var LOG_KEY  = 'spa-lab-log';
    var MODE_KEY = 'spa-lab-mode';   // 'push' | 'hash'

    var lastRouteChangeAt = Date.now();
    var lastRoute = null;
    var guideVisible = false;

    /* ---------- routes ---------- */

    var ROUTES = {
        overview: {
            title: 'Overview',
            body: '<div class="metric-grid">' +
                  '<div class="metric-card"><div class="metric-label">Open tickets</div><div class="metric-value">18</div></div>' +
                  '<div class="metric-card"><div class="metric-label">Active contacts</div><div class="metric-value">42</div></div>' +
                  '<div class="metric-card"><div class="metric-label">Closed this week</div><div class="metric-value">11</div></div>' +
                  '</div>'
        },
        accounts: {
            title: 'Accounts',
            body: '<div class="section-heading">Accounts</div>' +
                  '<p class="spa-body-copy">Northwind, Initech, Globex, Hooli. Rendered client-side &mdash; no document request was made to reach this view.</p>'
        },
        reports: {
            title: 'Reports',
            body: '<div class="section-heading">Reports</div>' +
                  '<p class="spa-body-copy">Usage, adoption and retention. Still the same document and the same agent instance.</p>'
        },
        billing: {
            title: 'Billing',
            body: '<div class="section-heading">Billing</div>' +
                  '<p class="spa-body-copy">Plan, seats and invoices. Fourth route, zero page loads.</p>'
        }
    };

    var DEFAULT_ROUTE = 'overview';

    /* ---------- logging (persisted across reloads) ---------- */

    function readLog() {
        try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
        catch (e) { return []; }
    }

    function writeLog(entries) {
        try { localStorage.setItem(LOG_KEY, JSON.stringify(entries)); } catch (e) {}
    }

    // Time since the last client-side route change. This is the number
    // that matters: a guide appearing at ~+30s after EVERY route change
    // is a per-route delay timer, not a one-off.
    function sinceRoute() {
        var seconds = (Date.now() - lastRouteChangeAt) / 1000;
        return ('+' + seconds.toFixed(1) + 's').padStart(9);
    }

    function log(message) {
        var entries = readLog();
        entries.push(new Date().toLocaleTimeString() + '  ' + sinceRoute() + '  ' + message);
        writeLog(entries);
        render();
    }

    function render() {
        var el = document.getElementById('spa-log');
        if (!el) return;
        el.textContent = readLog().join('\n') || '(nothing logged yet)';
        el.scrollTop = el.scrollHeight;
    }

    /* ---------- mode ---------- */

    function mode() {
        return localStorage.getItem(MODE_KEY) === 'hash' ? 'hash' : 'push';
    }

    function setMode(next) {
        localStorage.setItem(MODE_KEY, next);
        log('routing mode -> ' + next + ' (reloading once to reset the URL)');
        location.href = 'spa-lab.html';
    }

    /* ---------- router ---------- */

    function currentRoute() {
        if (mode() === 'hash') {
            var h = (location.hash || '').replace(/^#\/?/, '');
            return ROUTES[h] ? h : DEFAULT_ROUTE;
        }
        var m = /[?&]view=([a-z]+)/.exec(location.search);
        return (m && ROUTES[m[1]]) ? m[1] : DEFAULT_ROUTE;
    }

    function urlFor(slug) {
        return mode() === 'hash'
            ? 'spa-lab.html#/' + slug
            : 'spa-lab.html?view=' + slug;
    }

    function navigate(slug, viaPopstate) {
        if (!ROUTES[slug]) slug = DEFAULT_ROUTE;

        if (!viaPopstate) {
            if (mode() === 'hash') {
                location.hash = '#/' + slug;          // fires hashchange
            } else {
                history.pushState({ view: slug }, '', urlFor(slug));
                paint(slug);                           // pushState fires nothing
            }
        } else {
            paint(slug);
        }
    }

    function paint(slug) {
        var route = ROUTES[slug];
        var view  = document.getElementById('spa-view');
        if (view) view.innerHTML = route.body;

        var title = document.getElementById('spa-route-title');
        if (title) title.textContent = route.title;

        var links = document.querySelectorAll('#spa-subnav .spa-tab');
        for (var i = 0; i < links.length; i++) {
            links[i].classList.toggle('active', links[i].getAttribute('data-route') === slug);
        }

        var urlEl = document.getElementById('spa-url');
        if (urlEl) urlEl.textContent = location.pathname + location.search + location.hash;

        if (slug !== lastRoute) {
            lastRoute = slug;
            lastRouteChangeAt = Date.now();
            log('ROUTE CHANGE -> /' + slug + '   (' + mode() + ', no page load)');
        }
    }

    /* ---------- guide watcher ---------- */

    // Detects a guide becoming visible without knowing its ID, so this
    // works against whatever guide you build in Pendo.
    function visibleGuideEl() {
        var candidates = document.querySelectorAll(
            '#pendo-guide-container, [id^="pendo-g-"], ._pendo-guide-container_'
        );
        for (var i = 0; i < candidates.length; i++) {
            var el = candidates[i];
            if (el.offsetParent !== null || el.getClientRects().length) return el;
        }
        return null;
    }

    function watchGuides() {
        setInterval(function () {
            var el = visibleGuideEl();
            if (el && !guideVisible) {
                guideVisible = true;
                log('*** GUIDE VISIBLE *** after route /' + lastRoute + '   id=' + (el.id || '(unknown)'));
            } else if (!el && guideVisible) {
                guideVisible = false;
                log('guide hidden / dismissed');
            }
        }, 500);
    }

    /* ---------- pendo signals ---------- */

    function wirePendoEvents() {
        try {
            if (window.pendo && typeof pendo.events === 'function') {
                pendo.events
                    .ready(function ()         { log('pendo event: ready'); })
                    .guidesLoaded(function ()  { log('pendo event: guidesLoaded'); })
                    .guidesFailed(function ()  { log('pendo event: guidesFailed'); });
            }
        } catch (e) {
            log('could not wire pendo events: ' + e.message);
        }
    }

    function agentInfo() {
        var el = document.getElementById('spa-agent');
        if (!el) return;
        var parts = [];
        try {
            parts.push('agent: ' + (window.pendo && pendo.VERSION ? pendo.VERSION : 'not loaded'));
            parts.push('visitor: ' + (window.pendo && pendo.getVisitorId ? pendo.getVisitorId() : '--'));
            parts.push('account: ' + (window.pendo && pendo.getAccountId ? pendo.getAccountId() : '--'));
        } catch (e) {
            parts.push('agent not ready');
        }
        el.textContent = parts.join('   |   ');
    }

    /* ---------- wiring ---------- */

    function wire() {
        var subnav = document.getElementById('spa-subnav');
        if (subnav) {
            subnav.addEventListener('click', function (e) {
                var tab = e.target.closest('.spa-tab');
                if (!tab) return;
                e.preventDefault();
                navigate(tab.getAttribute('data-route'));
            });
        }

        window.addEventListener('popstate', function () {
            log('popstate (back/forward)');
            navigate(currentRoute(), true);
        });

        window.addEventListener('hashchange', function () {
            if (mode() === 'hash') paint(currentRoute());
        });

        var burst = document.getElementById('spa-burst');
        if (burst) burst.addEventListener('click', function () {
            var order = ['accounts', 'reports', 'billing', 'overview'];
            log('--- burst: 4 route changes, 2s apart ---');
            order.forEach(function (slug, i) {
                setTimeout(function () { navigate(slug); }, i * 2000);
            });
        });

        var clear = document.getElementById('spa-clear');
        if (clear) clear.addEventListener('click', function () {
            writeLog([]);
            lastRouteChangeAt = Date.now();
            log('log cleared');
        });

        var reload = document.getElementById('spa-reload');
        if (reload) reload.addEventListener('click', function () {
            log('--- full page reload (new agent load) ---');
            location.reload();
        });

        var copy = document.getElementById('spa-copy');
        if (copy) copy.addEventListener('click', function () {
            navigator.clipboard.writeText(readLog().join('\n'));
            copy.textContent = 'Copied';
            setTimeout(function () { copy.textContent = 'Copy log'; }, 1200);
        });

        var modeSel = document.getElementById('spa-mode');
        if (modeSel) {
            modeSel.value = mode();
            modeSel.addEventListener('change', function () { setMode(modeSel.value); });
        }
    }

    /* ---------- boot ---------- */

    window.addEventListener('DOMContentLoaded', function () {
        render();
        wire();
        log('=== page load (' + mode() + ' routing) — agent loads once from here ===');
        lastRouteChangeAt = Date.now();
        paint(currentRoute());
        watchGuides();
        setTimeout(function () { wirePendoEvents(); agentInfo(); }, 1500);
        setInterval(agentInfo, 5000);
    });

})();
