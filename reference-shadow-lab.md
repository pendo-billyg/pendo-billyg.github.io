# Reference: shadow DOM nav lab

A 7th page, `shadow-lab.html`, reproducing the Okta/Odyssey pattern: a collapsible
sidebar built from custom elements with **nested** shadow roots, expandable sections,
and a third-level dropdown inside one of them.

One section deliberately uses `mode: 'closed'` so you have a provably-broken case to
compare against.

Your existing 6 pages are untouched.

---

## Why this is worth building

[Pendo only supports shadow roots in **open** mode](https://support.pendo.io/hc/en-us/articles/360038410952-Tag-Features-in-a-shadow-DOM), on Web SDK 2.38.0+.
[Guides and analytics inside shadow DOM arrived in agent 2.39.1](https://www.pendo.io/developers/sdk-updates/agent-2-39-1/); [hover activation in 2.44.1](https://www.pendo.io/developers/sdk-updates/agent-2-44-1/).

Pendo's docs say to start from the suggested match rule and **keep the `::shadow` parts
intact**, adjusting only the most specific segment. This lab gives you somewhere to
practise that on selectors you wrote yourself, so you know what the right answer looks
like before you're doing it live on a customer's app.

---

## Files to create

| File | Purpose |
|---|---|
| `shadow-lab.html` | Page shell (light DOM) + debug panel |
| `assets/shadow-lab.js` | Custom element definitions + the shadow-path debugger |

No changes to `app.js` or `styles.css`. The lab page still loads `styles.css` for the
design tokens — see the note on custom properties below.

---

## File 1 — `shadow-lab.html`

```html
<!DOCTYPE html>
<html lang="en" style="color-scheme: dark;">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Shadow DOM lab - BillyCRM</title>
<script src="assets/pendoSnippet.js"></script>
<link rel="stylesheet" href="assets/styles.css">
</head>
<body data-page="shadow-lab">

<div class="app">

  <crm-shadow-sidebar id="lab-sidebar"></crm-shadow-sidebar>

  <main class="content">

    <div class="page-header">
      <p class="page-title">Shadow DOM lab</p>
      <div class="user-menu-container" id="user-menu-wrapper"></div>
    </div>

    <div class="lab-panel">
      <p class="lab-heading">Scroll mode</p>
      <select class="filter-select" id="lab-scroll-mode">
        <option value="sidebar">Sidebar scrolls (Okta-style, default)</option>
        <option value="page">Page scrolls</option>
      </select>
    </div>

    <div class="lab-panel">
      <p class="lab-heading">Last clicked element</p>
      <pre class="lab-path" id="lab-path">Click anything in the sidebar.</pre>
      <div class="lab-meta" id="lab-meta"></div>
    </div>

    <div class="lab-panel">
      <p class="lab-heading">Shadow root inventory</p>
      <div class="lab-meta" id="lab-inventory"></div>
    </div>

    <div class="lab-panel">
      <p class="lab-heading">Notes</p>
      <ul class="lab-notes">
        <li>The <code>Reports</code> section uses <code>mode: 'closed'</code>. Pendo cannot see inside it.</li>
        <li>Everything else is <code>mode: 'open'</code> and should tag normally.</li>
        <li><code>Administrators</code> sits three shadow boundaries deep.</li>
        <li><code>Identity governance &rarr; Lifecycle management</code> is below the fold. Scroll the sidebar to reach it.</li>
      </ul>
    </div>

  </main>
</div>

<!-- SIGN-IN MODAL (same markup as the other pages, so pendo.identify still works here) -->
<div class="modal-backdrop" id="signin-modal" hidden>
  <form class="modal" id="signin-form">
    <h3 class="modal-title">Sign in</h3>
    <div class="form-field form-field-required">
      <label for="si-visitor-id">Visitor ID</label>
      <input id="si-visitor-id" name="visitorId" type="text" required autocomplete="off" />
    </div>
    <div class="form-field">
      <label for="si-visitor-name">Visitor name <span class="optional">(optional)</span></label>
      <input id="si-visitor-name" name="visitorName" type="text" autocomplete="off" />
    </div>
    <div class="form-field">
      <label for="si-visitor-email">Visitor email <span class="optional">(optional)</span></label>
      <input id="si-visitor-email" name="visitorEmail" type="email" autocomplete="off" />
    </div>
    <div class="form-field">
      <label for="si-visitor-created">Visitor created at <span class="optional">(optional)</span></label>
      <input id="si-visitor-created" name="visitorCreatedAt" type="datetime-local" />
    </div>
    <div class="form-field form-field-required">
      <label for="si-account-id">Account ID</label>
      <input id="si-account-id" name="accountId" type="text" required autocomplete="off" />
    </div>
    <div class="form-field">
      <label for="si-account-name">Account name <span class="optional">(optional)</span></label>
      <input id="si-account-name" name="accountName" type="text" autocomplete="off" />
    </div>
    <div class="modal-buttons">
      <button type="button" class="secondary" id="cancel-signin">Cancel</button>
      <button type="submit" class="primary">Sign in</button>
    </div>
  </form>
</div>

<script src="assets/app.js"></script>
<script src="assets/shadow-lab.js"></script>

<div class="toast-container" id="toast-container"></div>

</body>
</html>
```

`app.js` loads first so the user menu and sign-in still work. Its dispatcher won't
match `data-page="shadow-lab"`, so no page-specific init runs — which is what we want.

---

## File 2 — `assets/shadow-lab.js`

```js
/* ============================================================
SHADOW DOM LAB
Nested custom elements mirroring the Odyssey/Okta pattern:
  crm-shadow-sidebar  (open)
    -> crm-nav-section  (open, except "Reports" which is closed)
         -> crm-nav-item  (open)  for entries that have children
============================================================ */

(function () {
  'use strict';

  // ---------- Nav data ----------
  // Deliberately long. With Security and Identity governance both expanded by
  // default, the nested dropdowns near the bottom sit below the fold and require
  // scrolling the sidebar's own scroll container to reach.
  const NAV = [
    {
      id: 'dashboard', label: 'Dashboard',
      items: [
        { id: 'overview', label: 'Overview' },
        { id: 'activity', label: 'Recent activity' }
      ]
    },
    {
      id: 'security', label: 'Security',
      expanded: true,
      items: [
        { id: 'general',            label: 'General' },
        { id: 'healthinsight',      label: 'HealthInsight' },
        { id: 'authenticators',     label: 'Authenticators' },
        { id: 'auth-policies',      label: 'Authentication policies' },
        { id: 'global-session',     label: 'Global session policy' },
        { id: 'entity-risk',        label: 'Entity risk policy' },
        { id: 'threat-protection',  label: 'Identity threat protection' },
        { id: 'user-profile',       label: 'User profile policies' },
        { id: 'identity-providers', label: 'Identity providers' },
        { id: 'delegated',          label: 'Delegated authentication' },
        { id: 'networks',           label: 'Networks' },
        { id: 'behavior-detection', label: 'Behavior detection' },
        { id: 'posture-checks',     label: 'Advanced posture checks' },
        { id: 'device-assurance',   label: 'Device assurance policies' },
        { id: 'device-integrations', label: 'Device integrations' },
        {
          id: 'administrators', label: 'Administrators',
          children: [
            { id: 'super-admin',      label: 'Super admin' },
            { id: 'org-admin',        label: 'Org admin' },
            { id: 'app-admin',        label: 'Application admin' },
            { id: 'group-admin',      label: 'Group admin' },
            { id: 'read-only-admin',  label: 'Read-only admin' },
            { id: 'help-desk-admin',  label: 'Help desk admin' },
            { id: 'report-admin',     label: 'Report admin' }
          ]
        },
        { id: 'api', label: 'API' }
      ]
    },
    {
      id: 'governance', label: 'Identity governance',
      expanded: true,
      items: [
        { id: 'access-requests',  label: 'Access requests' },
        { id: 'access-policies',  label: 'Access policies' },
        { id: 'entitlements',     label: 'Entitlement management' },
        { id: 'separation',       label: 'Separation of duties' },
        { id: 'reviews',          label: 'Access reviews' },
        {
          id: 'certifications', label: 'Certifications',
          children: [
            { id: 'active-campaigns',   label: 'Active campaigns' },
            { id: 'past-campaigns',     label: 'Past campaigns' },
            { id: 'scheduled-campaigns', label: 'Scheduled campaigns' },
            { id: 'campaign-templates', label: 'Campaign templates' },
            { id: 'remediation',        label: 'Remediation queue' }
          ]
        },
        {
          id: 'lifecycle', label: 'Lifecycle management',
          children: [
            { id: 'joiners',  label: 'Joiners' },
            { id: 'movers',   label: 'Movers' },
            { id: 'leavers',  label: 'Leavers' },
            { id: 'rehires',  label: 'Rehires' }
          ]
        }
      ]
    },
    {
      id: 'directory', label: 'Directory',
      items: [
        { id: 'people',       label: 'People' },
        { id: 'groups',       label: 'Groups' },
        { id: 'profile-edit', label: 'Profile editor' },
        { id: 'directory-int', label: 'Directory integrations' },
        { id: 'profile-src',  label: 'Profile sources' }
      ]
    },
    {
      id: 'workflow', label: 'Workflow',
      items: [
        { id: 'automations', label: 'Automations' },
        { id: 'event-hooks', label: 'Event hooks' },
        { id: 'inline-hooks', label: 'Inline hooks' }
      ]
    },
    {
      id: 'reports', label: 'Reports',
      mode: 'closed',                       // <-- the negative test
      items: [
        { id: 'system-log',  label: 'System log' },
        { id: 'usage',       label: 'Usage' },
        { id: 'sso-reports', label: 'SSO reports' }
      ]
    },
    {
      id: 'settings', label: 'Settings',
      items: [
        { id: 'account',     label: 'Account' },
        { id: 'appearance',  label: 'Appearance' },
        { id: 'downloads',   label: 'Downloads' }
      ]
    }
  ];

  // ---------- Shared stylesheet ----------
  // One CSSStyleSheet object adopted by every shadow root. Cheaper than a
  // <style> tag per component, and there's only one place to edit.
  const CSS = `
    :host { display: block; }
    button {
      display: flex; align-items: center; gap: 8px;
      width: 100%; text-align: left;
      background: none; border: 0; border-radius: 6px;
      font: inherit; font-size: 13px;
      color: var(--sidebar-text, #9A968C);
      padding: 8px 12px; cursor: pointer;
    }
    button:hover { background: var(--bg-surface, #232019); color: var(--text-primary, #E8E6DD); }
    .chev { margin-left: auto; font-size: 10px; transition: transform .15s; }
    [aria-expanded="true"] .chev { transform: rotate(180deg); }

    .sec-head { font-weight: 500; color: var(--text-primary, #E8E6DD); }
    .sec-items { display: flex; flex-direction: column; gap: 1px; padding-left: 10px; }
    .sec-items[hidden] { display: none; }

    .item { font-size: 13px; }
    .item.active {
      background: var(--bg-surface-active, #2A2620);
      border-left: 2px solid var(--sage, #8FAE8F);
      border-radius: 0;
      color: var(--text-primary, #E8E6DD);
    }

    .children { display: flex; flex-direction: column; gap: 1px;
                margin: 2px 0 2px 12px; padding-left: 10px;
                border-left: 1px solid var(--border, #2A2620); border-radius: 0; }
    .children[hidden] { display: none; }
    .leaf { font-size: 12px; color: var(--sage, #8FAE8F); }
    .leaf:hover { background: var(--bg-sage-soft, #2D3A2D); }
  `;

  let sheet = null;
  function sharedSheet() {
    if (!sheet) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(CSS);
    }
    return sheet;
  }

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Level 3: an item that owns a sub-dropdown ----------
  class CrmNavItem extends HTMLElement {
    connectedCallback() {
      if (this._root) return;
      const root = this.attachShadow({ mode: 'open' });
      this._root = root;
      root.adoptedStyleSheets = [sharedSheet()];

      const label = this.getAttribute('label') || '';
      const itemId = this.getAttribute('item-id') || '';
      const children = JSON.parse(this.getAttribute('children-json') || '[]');

      root.innerHTML = `
        <button class="item has-children" part="item"
                data-item="${esc(itemId)}"
                aria-expanded="false" aria-controls="children">
          <span>${esc(label)}</span>
          <span class="chev" aria-hidden="true">&#9662;</span>
        </button>
        <div class="children" id="children" hidden>
          ${children.map(c =>
            `<button class="leaf" part="leaf" data-leaf="${esc(c.id)}">${esc(c.label)}</button>`
          ).join('')}
        </div>`;

      const trigger = root.querySelector('.has-children');
      const panel = root.getElementById('children');
      trigger.addEventListener('click', () => {
        const open = panel.hidden;
        panel.hidden = !open;
        trigger.setAttribute('aria-expanded', String(open));
      });
    }
  }

  // ---------- Level 2: a nav section ----------
  class CrmNavSection extends HTMLElement {
    connectedCallback() {
      if (this._root) return;

      const mode = this.getAttribute('shadow-mode') === 'closed' ? 'closed' : 'open';
      const root = this.attachShadow({ mode });
      // In closed mode this.shadowRoot is null, so keep our own handle.
      this._root = root;
      this._mode = mode;

      root.adoptedStyleSheets = [sharedSheet()];

      const label = this.getAttribute('label') || '';
      const sectionId = this.getAttribute('section-id') || '';
      const items = JSON.parse(this.getAttribute('items-json') || '[]');
      const startOpen = this.hasAttribute('expanded');

      root.innerHTML = `
        <button class="sec-head" part="section-header"
                data-section="${esc(sectionId)}"
                aria-expanded="${startOpen}" aria-controls="items">
          <span>${esc(label)}</span>
          <span class="chev" aria-hidden="true">&#9662;</span>
        </button>
        <div class="sec-items" id="items" ${startOpen ? '' : 'hidden'}></div>`;

      const wrap = root.getElementById('items');

      items.forEach(item => {
        if (item.children) {
          const el = document.createElement('crm-nav-item');
          el.setAttribute('label', item.label);
          el.setAttribute('item-id', item.id);
          el.setAttribute('children-json', JSON.stringify(item.children));
          wrap.appendChild(el);
        } else {
          const b = document.createElement('button');
          b.className = 'item';
          b.setAttribute('part', 'item');
          b.dataset.item = item.id;
          b.textContent = item.label;
          wrap.appendChild(b);
        }
      });

      const head = root.querySelector('.sec-head');
      head.addEventListener('click', () => {
        const open = wrap.hidden;
        wrap.hidden = !open;
        head.setAttribute('aria-expanded', String(open));
      });
    }
  }

  // ---------- Level 1: the sidebar ----------
  class CrmShadowSidebar extends HTMLElement {
    connectedCallback() {
      if (this._root) return;
      const root = this.attachShadow({ mode: 'open' });
      this._root = root;

      const own = new CSSStyleSheet();
      own.replaceSync(`
        :host {
          display: flex;
          flex-direction: column;
          width: 210px;
          flex-shrink: 0;
          background: var(--bg-sidebar, #141210);
          border-right: 1px solid var(--border, #2A2620);
          padding: 18px 10px;
          transition: width .18s;

          /* Okta-style: the sidebar is its own scroll container, pinned to the
             viewport. Lower nav items are clipped, not just pushed down the page. */
          position: sticky;
          top: 0;
          height: 100vh;
          box-sizing: border-box;
        }

        /* Escape hatch: <crm-shadow-sidebar page-scroll> lets the sidebar grow
           and the whole page scroll instead. Different Pendo behaviour entirely. */
        :host([page-scroll]) {
          position: static;
          height: auto;
          min-height: 100vh;
        }
        :host([page-scroll]) .nav { overflow: visible; }

        :host([collapsed]) { width: 56px; }
        :host([collapsed]) .nav { display: none; }

        .brand { display: flex; align-items: center; gap: 8px; padding: 0 6px 16px; flex-shrink: 0; }
        .mark { width: 14px; height: 14px; border-radius: 3px; background: var(--sage, #8FAE8F); }
        .name { font-size: 14px; font-weight: 500; color: var(--text-primary, #E8E6DD); }
        :host([collapsed]) .name { display: none; }
        .collapse {
          margin-left: auto; background: none; border: 0; cursor: pointer;
          color: var(--text-secondary, #7A8079); font-size: 14px; padding: 2px 4px;
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
          flex: 1;
          min-height: 0;          /* without this, flex refuses to shrink and never scrolls */
          scrollbar-width: thin;
        }
        .nav::-webkit-scrollbar { width: 8px; }
        .nav::-webkit-scrollbar-thumb {
          background: var(--border, #2A2620); border-radius: 4px;
        }
      `);
      root.adoptedStyleSheets = [own];

      root.innerHTML = `
        <div class="brand">
          <span class="mark"></span>
          <span class="name">BillyCRM</span>
          <button class="collapse" part="collapse" aria-label="Collapse sidebar">&#10094;</button>
        </div>
        <div class="nav" id="nav"></div>`;

      const nav = root.getElementById('nav');
      NAV.forEach(sec => {
        const el = document.createElement('crm-nav-section');
        el.setAttribute('label', sec.label);
        el.setAttribute('section-id', sec.id);
        el.setAttribute('items-json', JSON.stringify(sec.items));
        if (sec.mode === 'closed') el.setAttribute('shadow-mode', 'closed');
        if (sec.expanded) el.setAttribute('expanded', '');
        nav.appendChild(el);
      });

      root.querySelector('.collapse').addEventListener('click', () => {
        this.toggleAttribute('collapsed');
      });
    }
  }

  customElements.define('crm-nav-item', CrmNavItem);
  customElements.define('crm-nav-section', CrmNavSection);
  customElements.define('crm-shadow-sidebar', CrmShadowSidebar);

  // ============================================================
  // DEBUG HELPERS
  // ============================================================

  function selectorFor(node) {
    if (!node || node.nodeType !== 1) return '?';
    let s = node.tagName.toLowerCase();
    if (node.id) return s + '#' + node.id;
    if (node.dataset.leaf)    return s + `[data-leaf="${node.dataset.leaf}"]`;
    if (node.dataset.item)    return s + `[data-item="${node.dataset.item}"]`;
    if (node.dataset.section) return s + `[data-section="${node.dataset.section}"]`;
    const label = node.getAttribute && node.getAttribute('label');
    if (label) return s + `[label="${label}"]`;
    if (node.className && typeof node.className === 'string' && node.className.trim()) {
      return s + '.' + node.className.trim().split(/\s+/)[0];
    }
    return s;
  }

  // Builds a Pendo-style path: host::shadow child::shadow grandchild
  window.shadowPath = function shadowPath(el) {
    const segs = [];
    let node = el;
    while (node) {
      segs.unshift(selectorFor(node));
      const root = node.getRootNode();
      if (root instanceof ShadowRoot) {
        segs.unshift('::shadow');
        node = root.host;
      } else {
        break;
      }
    }
    return segs.join(' ').replace(/ ::shadow /g, '::shadow ');
  };

  window.shadowDepth = function shadowDepth(el) {
    let n = 0, node = el;
    while (node) {
      const root = node.getRootNode();
      if (root instanceof ShadowRoot) { n++; node = root.host; } else break;
    }
    return n;
  };

  // Walks up through shadow boundaries looking for scrollable ancestors, and
  // reports whether the element is actually visible right now.
  window.visibilityReport = function visibilityReport(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight, vw = window.innerWidth;
    const inViewport = r.top >= 0 && r.left >= 0 && r.bottom <= vh && r.right <= vw;

    const clippers = [];
    let node = el.parentNode;
    while (node) {
      if (node.nodeType === 1) {
        const cs = getComputedStyle(node);
        const scrolls = /(auto|scroll|overlay)/.test(cs.overflowY + cs.overflowX);
        if (scrolls && node.scrollHeight > node.clientHeight + 1) {
          const nr = node.getBoundingClientRect();
          clippers.push({
            el: selectorFor(node),
            clipping: r.bottom > nr.bottom || r.top < nr.top,
            scrollTop: Math.round(node.scrollTop),
            scrollable: Math.round(node.scrollHeight - node.clientHeight)
          });
        }
      }
      const root = node.getRootNode ? node.getRootNode() : null;
      if (node.parentNode) node = node.parentNode;
      else if (root instanceof ShadowRoot) node = root.host;
      else node = null;
    }

    return {
      rectTop: Math.round(r.top),
      rectBottom: Math.round(r.bottom),
      viewportHeight: vh,
      inViewport,
      belowFold: r.top > vh,
      scrollAncestors: clippers
    };
  };

  document.addEventListener('click', e => {
    // composedPath()[0] is the REAL target. e.target is retargeted to the host.
    const real = e.composedPath()[0];
    if (!(real instanceof Element)) return;
    if (!real.closest && !real.getRootNode()) return;

    const pathEl = document.getElementById('lab-path');
    const metaEl = document.getElementById('lab-meta');
    if (!pathEl) return;

    const inSidebar = e.composedPath().some(n => n.tagName === 'CRM-SHADOW-SIDEBAR');
    if (!inSidebar) return;

    const vis = window.visibilityReport(real);
    const clip = vis.scrollAncestors.length
      ? vis.scrollAncestors.map(c =>
          `<div>&nbsp;&nbsp;&mdash; <code>${c.el}</code> scrollTop ${c.scrollTop} / ${c.scrollable}${c.clipping ? ' <span style="color:#D08A6A">(clipping this element)</span>' : ''}</div>`
        ).join('')
      : '<div>&nbsp;&nbsp;&mdash; none</div>';

    pathEl.textContent = window.shadowPath(real);
    metaEl.innerHTML = `
      <div><strong>e.target</strong> (retargeted): <code>${selectorFor(e.target)}</code></div>
      <div><strong>composedPath()[0]</strong> (real): <code>${selectorFor(real)}</code></div>
      <div><strong>Shadow depth:</strong> ${window.shadowDepth(real)}</div>
      <div><strong>Rect top / bottom:</strong> ${vis.rectTop} / ${vis.rectBottom} (viewport ${vis.viewportHeight})</div>
      <div><strong>Fully in viewport:</strong> <span style="color:${vis.inViewport ? 'var(--sage)' : '#D08A6A'}">${vis.inViewport}</span></div>
      <div><strong>Scrollable ancestors:</strong></div>${clip}`;
  });

  // Scroll-mode toggle, wired from the light DOM control on the page
  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('lab-scroll-mode')?.addEventListener('change', e => {
      const bar = document.querySelector('crm-shadow-sidebar');
      bar.toggleAttribute('page-scroll', e.target.value === 'page');
    });
  });

  // Inventory of every shadow root on the page
  window.addEventListener('load', () => {
    const out = document.getElementById('lab-inventory');
    if (!out) return;
    const rows = [];
    document.querySelectorAll('crm-shadow-sidebar, crm-nav-section, crm-nav-item')
      .forEach(() => {});
    function walk(rootNode, depth) {
      rootNode.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) {
          rows.push(`<div>${'&nbsp;'.repeat(depth * 4)}${el.tagName.toLowerCase()} &mdash; <span style="color:var(--sage)">open</span></div>`);
          walk(el.shadowRoot, depth + 1);
        } else if (el.tagName && el.tagName.startsWith('CRM-')) {
          rows.push(`<div>${'&nbsp;'.repeat(depth * 4)}${el.tagName.toLowerCase()} &mdash; <span style="color:#D08A6A">closed (invisible to Pendo)</span></div>`);
        }
      });
    }
    walk(document, 0);
    out.innerHTML = rows.join('');
  });

})();
```

---

## Minimal CSS for the lab panels

Append to `styles.css`, or drop it in a `<style>` block in `shadow-lab.html`:

```css
.lab-panel {
  background: var(--bg-box);
  border: 1px solid var(--border-box);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.lab-heading {
  font-size: 11px; color: var(--brown); text-transform: uppercase;
  letter-spacing: 0.05em; margin: 0 0 10px;
}
.lab-path {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px; color: var(--sage); margin: 0 0 10px;
  white-space: pre-wrap; word-break: break-all;
}
.lab-meta { font-size: 12px; color: var(--text-secondary); line-height: 1.9; }
.lab-meta code { color: var(--text-primary); }
.lab-notes { font-size: 13px; color: var(--text-secondary); margin: 0; padding-left: 18px; line-height: 1.8; }
```

---

## The four concepts this is actually teaching

### 1. Custom properties cross shadow boundaries. Normal selectors don't.

This is the single most useful thing to internalise. Your `styles.css` rule
`.nav-item { ... }` will **not** apply inside a shadow root — the boundary blocks
selector matching. But `var(--sage)` inside the shadow root resolves fine, because
custom properties inherit down through the boundary like any inherited property.

That's why every component above uses `var(--sage, #8FAE8F)` with a fallback: the token
comes from `:root` in `styles.css`, and the fallback covers the case where the sheet
hasn't loaded.

Verify it: change `--sage` in `styles.css` and watch the shadow-root leaf items change
colour without touching `shadow-lab.js`.

### 2. Events are retargeted at the boundary

Click "Super admin" and check the debug panel. `e.target` on the document listener
reports `crm-shadow-sidebar` — the host — not the button you clicked. The browser
deliberately hides shadow internals from outside listeners.

`e.composedPath()[0]` gives you the real element. This is the mechanism Pendo has to
work through too, and it's why event delegation written against `e.target` silently
stops working the moment someone wraps your UI in a web component.

Directly relevant to the ticket dropdowns you just built, incidentally — that pattern
relies entirely on `e.target.closest()`. Move those cards into a shadow root and the
delegation breaks until you switch to `composedPath()`.

### 3. `mode: 'closed'` means `element.shadowRoot === null`

Try it in the console:

```js
document.querySelector('crm-nav-section[section-id="security"]').shadowRoot  // ShadowRoot
document.querySelector('crm-nav-section[section-id="reports"]').shadowRoot   // null
```

That `null` is the whole story for Pendo. There is no API to reach in — not for Pendo,
not for you, not for a browser extension. When a customer says "Pendo can't tag our
component", checking `.shadowRoot` for null is a two-second triage step that either
ends the ticket or rules out the most common cause.

Note the component keeps its own `this._root` reference. That's the only way a closed
component can access its own internals — a decent illustration of what "closed" buys
you (encapsulation from *outside* code, including your own).

### 4. Off-viewport elements inside a shadow scroll container

This is the case you specifically wanted, and it's the nastiest of the four.

With the default `sidebar` scroll mode, `.nav` inside the sidebar's shadow root is a
scroll container pinned to `100vh`. `Identity governance → Lifecycle management` and its
four children live below that clip line at any normal window height, so they exist in the
DOM but are not on screen.

Three separate problems stack up here, and it's worth being able to name them separately
when a customer describes the symptom:

**Finding the element.** Pendo has to traverse into the shadow root to match the
selector. That part works in open mode regardless of scroll position — DOM presence and
visibility are independent.

**Scrolling it into view.** To anchor a guide, Pendo needs the element visible. Browsers
scroll the *nearest scrollable ancestor*, and here that ancestor is inside a shadow root.
`scrollIntoView()` handles this correctly, but any custom scroll logic written against
`window.scrollTo` will not — it'll scroll the page, which does nothing, and the guide
lands in the wrong place or doesn't appear.

**Staying anchored.** Once the sidebar scrolls, the element's viewport coordinates change.
A guide positioned on first paint drifts unless it recalculates on the container's scroll
event — and a `scroll` listener on `window` won't fire for an inner container's scroll.

The debug panel reports all three inputs: rect top/bottom versus viewport height, whether
the element is fully in the viewport, and every scrollable ancestor with its current
`scrollTop`, flagging which one is doing the clipping.

Try this in the console to see the scroll ancestor being found through the boundary:

```js
const bar = document.querySelector('crm-shadow-sidebar');
const gov = bar.shadowRoot.querySelector('crm-nav-section[section-id="governance"]');
const life = gov.shadowRoot.querySelector('crm-nav-item[item-id="lifecycle"]');
visibilityReport(life.shadowRoot.querySelector('button'));
```

Then compare the two scroll modes. In `page` mode the sidebar grows and the *document*
scrolls, so the scrollable ancestor is the document rather than a shadow-root child —
a materially easier case, and a useful A/B when you're trying to work out whether a
customer's problem is the shadow boundary or the scroll container.

Note the `min-height: 0` on `.nav`. Flex items default to `min-height: auto`, which
refuses to shrink below content size, so `overflow-y: auto` never engages and you get no
scrollbar at all. It's a one-line omission that produces exactly the "my container won't
scroll" symptom, and it comes up constantly.

### 5. Depth compounds in the selector

Click "Super admin" and you should see roughly:

```
crm-shadow-sidebar::shadow crm-nav-section[label="Security"]::shadow crm-nav-item[item-id="administrators"]::shadow button[data-leaf="super-admin"]
```

Three boundaries, three `::shadow` hops. Per Pendo's guidance, when you tag this in the
Designer you keep those hops exactly as suggested and only loosen or tighten the final
segment. Rewriting the middle is what breaks the rule.

---

## Try it

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/shadow-lab.html`, then:

1. Expand "Administrators" under Security — three levels deep
2. Watch the path readout update, and note `e.target` vs `composedPath()[0]`
3. Scroll the sidebar down to "Identity governance → Lifecycle management" and expand it.
   Click a child and check the panel: `Fully in viewport: false`, with `div.nav` listed
   as the clipping ancestor
4. Switch scroll mode to "Page scrolls" and repeat — the clipping ancestor changes
5. Expand "Reports" — it works visually, but check the inventory panel: closed
6. In Chrome DevTools → Preferences → Elements, tick **Show user agent shadow DOM**,
   then find the `#shadow-root (open)` nodes in the Elements tree
7. Console: `document.querySelector('crm-nav-section[section-id="reports"]').shadowRoot`
8. Tag "Administrators" as a Feature in Pendo and compare Pendo's suggested selector to
   what `shadowPath()` printed
9. Anchor a guide to a below-the-fold item like "Leavers" and see whether Pendo scrolls
   the sidebar to it — this is the interesting one
10. Try to tag anything inside "Reports" — it should be impossible

## Commit

```bash
git switch -c feat/shadow-dom-lab
git add shadow-lab.html assets/shadow-lab.js assets/styles.css
git commit -m "feat: shadow DOM nav lab with nested roots and closed-mode negative test"
git push -u origin feat/shadow-dom-lab
```

---

## One thing to check before you trust the results

Confirm your agent version is 2.38.0+ before concluding anything about tagging:

```js
pendo.VERSION
```

If that's undefined, the agent didn't load at all — which, per the `apiKey` bug, can
happen while `window.pendo` still looks healthy.

## Sources

- [Tag Features in a shadow DOM — Pendo Help Center](https://support.pendo.io/hc/en-us/articles/360038410952-Tag-Features-in-a-shadow-DOM)
- [Agent 2.39.1 — shadow DOM support for guides and analytics](https://www.pendo.io/developers/sdk-updates/agent-2-39-1/)
- [Agent 2.44.1 — hover activation for guides in shadow DOM](https://www.pendo.io/developers/sdk-updates/agent-2-44-1/)
