/* ============================================================
PENDO INSTALL SNIPPET — paste your API key into PENDO_API_KEY
Reads visitor + account from localStorage so whoever's signed
in via the BillyCRM avatar is identified to Pendo at boot.
============================================================ */

const PENDO_API_KEY = '57085aa6-14e2-4993-ac54-76af5e72d836';

// Step 1: uncomment the loader to fetch the Pendo agent, add API key
(function (apiKey) {
    (function (p, e, n, d, o) {
        var v, w, x, y, z; o = p[d] = p[d] || {}; o._q = o._q || [];
        v = ['initialize', 'identify', 'updateOptions', 'pageLoad', 'track']; for (w = 0, x = v.length; w < x; ++w)(function (m) {
            o[m] = o[m] || function () { o._q[m === v[0] ? 'unshift' : 'push']([m].concat([].slice.call(arguments, 0))); };
        })(v[w]);
        y = e.createElement(n); y.async = !0; y.src = 'https://cdn.pendo.io/agent/static/' + apiKey + '/pendo.js';
        z = e.getElementsByTagName(n)[0]; z.parentNode.insertBefore(y, z);
    })(window, document, 'script', 'pendo');
})(PENDO_API_KEY);

// Step 2: uncomment the initializer below. It reads from localStorage so the
// BillyCRM auth state flows through to Pendo. If signed out, sends an
// anonymous visitor (matches what most real apps do for unauthenticated users).

(function () {
    let auth = {};
    try { auth = JSON.parse(localStorage.getItem('billycrm-auth') || '{}'); } catch (e) { }
    const visitor = auth.visitor || {};
    const account = auth.account || {};
    pendo.initialize({
        visitor: {
            id: visitor.id || 'visitor-anonymous',
            email: visitor.email || '',
            full_name: visitor.name || ''
        },
        account: {
            id: account.id || 'billycrm-sandbox',
            name: account.name || ''
        }
    });
})();