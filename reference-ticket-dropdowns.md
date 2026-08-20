# Reference: nested dropdowns on the last 4 ticket cards

Target: the bottom four tickets (`TKT-1034`, `TKT-1033`, `TKT-1032`, `TKT-1031`) stop
navigating to `ticket-detail.html` and instead expand in place. Two of them
(`TKT-1034`, `TKT-1032`) contain a **second-level** dropdown that reveals a list of
clickable leaf items.

Nothing is wired to an action yet — this is structure only.

---

## Where the change lives

| File | What changes |
|---|---|
| `assets/app.js` | New `TICKET_MENUS` config; `renderTicketsList()` emits a different card shape for configured tickets; the delegated click handler in `initTicketsList()` gains a guard and two new branches |
| `assets/styles.css` | New `.ticket-card.has-menu`, `.ticket-menu`, `.ticket-menu-item`, `.ticket-submenu`, `.ticket-menu-leaf` rules |
| `tickets.html` | **No change.** The list is generated entirely by JS |

---

## The key design decision: one structure, two behaviours

Accordion and popover share the *same DOM*. The only difference is whether the panel
is `position: static` (in flow, pushes siblings down) or `position: absolute` (floats
over them). So build one structure and put a single class on the list container:

```html
<div class="ticket-list" id="tickets-list">        <!-- accordion (default) -->
<div class="ticket-list menu-popover" id="tickets-list">  <!-- popover -->
```

That means you can flip between the two by toggling one class in the console —
handy when you're testing how Pendo behaves with each.

---

## Step 1 — the config (app.js)

Put this straight after `const SEED_TICKETS = [...]` (around line 142).

```js
// Which tickets render as expandable menus instead of links, and what's inside them.
// items[].children  -> renders a nested (second-level) dropdown
// items[] without children -> renders as a single clickable row
const TICKET_MENUS = {
  'TKT-1034': [
    { id: 'diagnostics', label: 'Diagnostics', children: [
      { id: 'agent-state',  label: 'Check agent state' },
      { id: 'dump-meta',    label: 'Dump metadata' },
      { id: 'clear-storage', label: 'Clear Pendo storage' }
    ]},
    { id: 'view-ticket', label: 'View full ticket' }
  ],
  'TKT-1033': [
    { id: 'reassign',  label: 'Reassign to Sasha' },
    { id: 'reopen',    label: 'Reopen ticket' }
  ],
  'TKT-1032': [
    { id: 'export', label: 'Export options', children: [
      { id: 'export-csv',  label: 'Export as CSV' },
      { id: 'export-json', label: 'Export as JSON' },
      { id: 'export-pdf',  label: 'Export as PDF' }
    ]},
    { id: 'duplicate', label: 'Duplicate ticket' }
  ],
  'TKT-1031': [
    { id: 'copy-link', label: 'Copy ticket link' },
    { id: 'archive',   label: 'Archive' }
  ]
};
```

**Why a config object rather than hardcoding the HTML?** Three reasons worth
internalising — they come up constantly in customer codebases:

1. The list is already data-driven (`SEED_TICKETS` → `renderTicketsList`). Hardcoding
   four cards in `tickets.html` would mean they'd vanish the moment you searched or
   filtered, because `renderTicketsList` rewrites `innerHTML` wholesale.
2. Adding a fifth menu later is a data edit, not a markup edit.
3. It gives you one place to look when Pendo's tagging doesn't match what you expect.

---

## Step 2 — the render function (app.js, ~line 314)

Replace the `list.innerHTML = filtered.map(...)` block with this. The first half is
unchanged; the branch at the top is new.

```js
  list.innerHTML = filtered.map(t => {
    const c = getContact(t.customerId);
    const customerLabel = c
      ? `<a class="customer-link" href="contact-detail.html?id=${c.id}">${escapeHtml(c.name)}</a> &middot; ${escapeHtml(c.company)}`
      : '-';
    const statusLabel = t.status === 'in-progress' ? 'In progress' : t.status;

    const pills = `
        <div class="ticket-pills">
          <span class="priority-pill ${t.priority}">${escapeHtml(t.priority)}</span>
          <span class="ticket-status-pill ${t.status}">${escapeHtml(statusLabel)}</span>
        </div>`;

    const main = `
        <div class="ticket-card-main">
          <div class="ticket-id">${escapeHtml(t.id)}</div>
          <div class="ticket-subject">${escapeHtml(t.subject)}</div>
          <div class="ticket-customer">${customerLabel}</div>
        </div>`;

    const menu = TICKET_MENUS[t.id];

    // --- Menu card: expands in place, does not navigate ---
    if (menu) {
      return `
      <div class="ticket-card-wrap" data-ticket-id="${escapeHtml(t.id)}">
        <div class="ticket-card has-menu"
             role="button"
             tabindex="0"
             aria-expanded="false"
             aria-controls="menu-${escapeHtml(t.id)}">
          ${main}
          ${pills}
          <span class="ticket-chevron" aria-hidden="true">&#9662;</span>
        </div>
        <div class="ticket-menu" id="menu-${escapeHtml(t.id)}" hidden>
          ${menu.map(item => renderTicketMenuItem(t.id, item)).join('')}
        </div>
      </div>`;
    }

    // --- Normal card: unchanged behaviour ---
    return `
      <div class="ticket-card" data-ticket-id="${escapeHtml(t.id)}" role="link" tabindex="0">
        ${main}
        ${pills}
      </div>`;
  }).join('');
```

And add this helper directly **above** `renderTicketsList`:

```js
function renderTicketMenuItem(ticketId, item) {
  const key = `${ticketId}:${item.id}`;

  if (!item.children) {
    return `<button type="button" class="ticket-menu-item" data-action="${escapeHtml(key)}">${escapeHtml(item.label)}</button>`;
  }

  const submenuId = `submenu-${escapeHtml(ticketId)}-${escapeHtml(item.id)}`;
  return `
    <div class="ticket-submenu-group">
      <button type="button"
              class="ticket-menu-item has-submenu"
              aria-expanded="false"
              aria-controls="${submenuId}"
              data-submenu="${submenuId}">
        ${escapeHtml(item.label)}
        <span class="ticket-chevron small" aria-hidden="true">&#9662;</span>
      </button>
      <div class="ticket-submenu" id="${submenuId}" hidden>
        ${item.children.map(child =>
          `<button type="button" class="ticket-menu-leaf" data-action="${escapeHtml(key + ':' + child.id)}">${escapeHtml(child.label)}</button>`
        ).join('')}
      </div>
    </div>`;
}
```

### Two things to notice

**The extra `.ticket-card-wrap` div.** The card and its menu need a shared parent
so the popover variant has something to position against (`position: relative` on the
wrap, `position: absolute` on the menu). Normal cards don't get a wrap — that keeps
your existing CSS and existing card behaviour untouched.

**`data-action` carries the full path.** `TKT-1034:diagnostics:clear-storage` rather
than just `clear-storage`. When you do wire behaviour up, one handler can read the
whole click path from a single attribute. This is also exactly the kind of stable,
descriptive attribute that makes a Pendo feature tag survive a re-render — worth
getting into the habit of.

---

## Step 3 — the click handling (app.js, ~line 798)

Your current handler navigates on any `.ticket-card` click. Menu cards are also
`.ticket-card`, so **it will hijack them** unless you guard. Replace the two
listeners with these:

```js
  document.getElementById('tickets-list')?.addEventListener('click', e => {
    if (e.target.closest('a')) return; // let the customer link handle its own clicks

    // 1. Second-level toggle — check this FIRST, it's the innermost target
    const subToggle = e.target.closest('.ticket-menu-item.has-submenu');
    if (subToggle) {
      const panel = document.getElementById(subToggle.dataset.submenu);
      const open = panel.hidden;
      panel.hidden = !open;
      subToggle.setAttribute('aria-expanded', String(open));
      return;
    }

    // 2. Leaf item — no behaviour yet, just don't fall through to navigation
    if (e.target.closest('.ticket-menu-leaf, .ticket-menu-item')) return;

    // 3. Top-level card that owns a menu
    const menuCard = e.target.closest('.ticket-card.has-menu');
    if (menuCard) {
      const panel = document.getElementById(menuCard.getAttribute('aria-controls'));
      const open = panel.hidden;
      panel.hidden = !open;
      menuCard.setAttribute('aria-expanded', String(open));
      menuCard.classList.toggle('open', open);
      return;
    }

    // 4. Normal card — unchanged
    const card = e.target.closest('.ticket-card');
    if (card?.dataset.ticketId) {
      location.href = `ticket-detail.html?id=${card.dataset.ticketId}`;
    }
  });

  document.getElementById('tickets-list')?.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target.closest('.ticket-menu, .ticket-card.has-menu')) {
      e.preventDefault();
      e.target.click();   // reuse the click logic above
      return;
    }
    const card = e.target.closest('.ticket-card');
    if (card?.dataset.ticketId) {
      e.preventDefault();
      location.href = `ticket-detail.html?id=${card.dataset.ticketId}`;
    }
  });
```

**Order matters here.** `closest()` walks *up* from the clicked element, so a click on
a leaf button matches `.ticket-menu-leaf` and `.ticket-card.has-menu` — the leaf is
inside the wrap, and the menu is a sibling of the card, so it actually won't match the
card, but the submenu toggle absolutely would if you checked the card first. Checking
innermost-to-outermost is the safe habit. The alternative is `e.stopPropagation()` on
each inner handler, but with delegation you only have one listener, so ordering is the
tool you've got.

---

## Step 4 — the CSS (styles.css)

Append after the existing `.ticket-card` block (~line 390).

```css
/* ---------- Expandable ticket menus ---------- */

.ticket-card-wrap {
  position: relative;
}

.ticket-card.has-menu {
  cursor: pointer;
}
.ticket-card.has-menu.open {
  background: var(--bg-box-hover);
  border-color: var(--sage);
}

.ticket-chevron {
  color: var(--text-secondary);
  font-size: 12px;
  flex-shrink: 0;
  transition: transform 0.15s;
}
.ticket-card.has-menu.open .ticket-chevron {
  transform: rotate(180deg);
}
.ticket-chevron.small {
  font-size: 10px;
  margin-left: auto;
}

.ticket-menu {
  background: var(--bg-box);
  border: 1px solid var(--border-box);
  border-radius: 10px;
  padding: 6px;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ticket-menu[hidden] { display: none; }

.ticket-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  background: none;
  border: 0;
  border-radius: 6px;
  padding: 9px 11px;
  font: inherit;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
}
.ticket-menu-item:hover { background: var(--bg-box-hover); }

.ticket-menu-item.has-submenu[aria-expanded="true"] .ticket-chevron {
  transform: rotate(180deg);
}

.ticket-submenu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 2px 0 2px 14px;
  padding-left: 10px;
  border-left: 1px solid var(--border-box);
  border-radius: 0;
}
.ticket-submenu[hidden] { display: none; }

.ticket-menu-leaf {
  width: 100%;
  text-align: left;
  background: none;
  border: 0;
  border-radius: 6px;
  padding: 8px 11px;
  font: inherit;
  font-size: 13px;
  color: var(--sage);
  cursor: pointer;
}
.ticket-menu-leaf:hover { background: var(--bg-sage-soft); }
```

### Popover variant — add this too

```css
/* Flip the whole list to floating panels by adding .menu-popover to #tickets-list */
.ticket-list.menu-popover .ticket-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  margin-top: 0;
  z-index: 50;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}
```

Then to test in the console:

```js
document.getElementById('tickets-list').classList.toggle('menu-popover');
```

Two notes on the CSS:

- `border-radius: 0` on `.ticket-submenu` is deliberate — it uses `border-left` only,
  and rounded corners on a single-sided border always look broken.
- `.ticket-menu[hidden] { display: none; }` is needed because `display: flex`
  overrides the browser's default `[hidden] { display: none }`. This trips people up
  constantly: `hidden` loses to any explicit `display` rule.

---

## Adjacent concepts worth knowing

**`hidden` vs a class.** This uses the `hidden` attribute rather than a `.open` class
on the panel, because `hidden` is a real accessibility signal — screen readers skip it,
and it pairs naturally with `aria-expanded` on the trigger. Pendo's guide targeting can
key off `aria-expanded="true"`, which is more stable than a CSS class you might rename.

**Why this matters for Pendo specifically.** Nested, dynamically-created DOM is one of
the most common sources of "my feature tag isn't tracking" tickets. Once this is built
you'll have a controlled reproduction: tag `.ticket-menu-leaf[data-action="..."]` and
watch whether clicks register when the element only exists after two levels of
interaction. That's a genuinely useful thing to be able to demo on a call.

---

## Try it

```bash
cd ~/path/to/billycrm
python3 -m http.server 8080
```

Then check:

1. First 8 tickets still navigate to the detail page
2. Last 4 expand instead
3. `TKT-1034` and `TKT-1032` have a working second level
4. Search for "dark" — the menu card still renders correctly after a re-render
5. Tab to a menu card, press Enter — it should expand
6. `document.getElementById('tickets-list').classList.toggle('menu-popover')` — flips style

## Commit

```bash
git switch -c feat/ticket-dropdowns
git add assets/app.js assets/styles.css
git commit -m "feat: expandable nested dropdowns on last four ticket cards"
git push -u origin feat/ticket-dropdowns
```

Branching first means `main` (and your GitHub Pages deploy) stays working while you
iterate. In GitHub Desktop that's *Branch → New Branch*, then *Publish branch*.
