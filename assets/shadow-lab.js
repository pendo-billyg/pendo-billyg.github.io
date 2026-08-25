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