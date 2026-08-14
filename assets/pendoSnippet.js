/* ============================================================
PENDO INSTALL SNIPPET — paste your API key into PENDO_API_KEY
Reads visitor + account from localStorage so whoever's signed
in via the BillyCRM avatar is identified to Pendo at boot.
============================================================ */

const PENDO_API_KEY = '4298b339-33d2-49e7-87e6-dcd5b240f48c';
const INTERCOM_SNIPPET_DELAY_MS = 10000;

(function (apiKey) {
    (function (p, e, n, d, o) {
        var v, w, x, y, z;
        o = p[d] = p[d] || {};
        o._q = o._q || [];
        v = ['initialize', 'identify', 'updateOptions', 'pageLoad', 'track'];
        for (w = 0, x = v.length; w < x; ++w)(function (m) {
            o[m] = o[m] || function () {
                o._q[m === v[0] ? 'unshift' : 'push']([m].concat([].slice.call(arguments, 0)));
            };
        })(v[w]);
        y = e.createElement(n);
        y.async = !0;
        y.src = 'https://cdn.pendo.io/agent/static/' + apiKey + '/pendo.js';
        z = e.getElementsByTagName(n)[0];
        z.parentNode.insertBefore(y, z);
    })(window, document, 'script', 'pendo');
})(PENDO_API_KEY);

let auth = {};
try {
    auth = JSON.parse(localStorage.getItem('billycrm-auth') || '{}');
} catch (e) {}
const visitor = auth.visitor || {};
const account = auth.account || {};
 
console.log('[racetest] ' + new Date().toISOString() + ' calling pendo.initialize');
pendo.initialize({
    visitor: {
        id: visitor.id || '',
        email: visitor.email || '',
        full_name: visitor.name || '',
        createdAt: visitor.createdAt || null
    },
    account: {
        id: account.id || '',
        name: account.name || ''
    }
});
 
/* ============================================================
DELAYED INTERCOM — nothing Intercom-related exists on the page
until this fires: no window.intercomSettings, no window.Intercom
stub, no widget script request.
============================================================ */
setTimeout(function () {
    console.log('[racetest] ' + new Date().toISOString() + ' injecting Intercom snippet');
 
    window.intercomSettings = {
        api_base: "https://api-iam.intercom.io",
        app_id: "m0avo01z",
        user_id: visitor.id,
        name: visitor.name,
        email: visitor.email,
        hide_default_launcher: false,
        // Intercom expects created_at as Unix seconds; visitor.createdAt is stored in ms
        created_at: visitor.createdAt ? Math.floor(visitor.createdAt / 1000) : null
    };
 
    (function () {
        var w = window;
        var ic = w.Intercom;
        if (typeof ic === "function") {
            ic('reattach_activator');
            ic('update', w.intercomSettings);
        } else {
            var d = document;
            var i = function () {
                i.c(arguments);
            };
            i.q = [];
            i.c = function (args) {
                i.q.push(args);
            };
            w.Intercom = i;
            var l = function () {
                var s = d.createElement('script');
                s.type = 'text/javascript';
                s.async = true;
                s.src = 'https://widget.intercom.io/widget/m0avo01z';
                var x = d.getElementsByTagName('script')[0];
                x.parentNode.insertBefore(s, x);
            };
            // readyState will be 'complete' by the time this runs, so l() fires
            // directly rather than waiting on the load event
            if (document.readyState === 'complete') {
                l();
            } else if (w.attachEvent) {
                w.attachEvent('onload', l);
            } else {
                w.addEventListener('load', l, false);
            }
        }
    })();
}, INTERCOM_SNIPPET_DELAY_MS);
 