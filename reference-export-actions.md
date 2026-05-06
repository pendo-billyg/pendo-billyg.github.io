# Reference: Export Actions Implementation

This doc walks through every change needed to add the "⋯ More actions" dropdown
with Export-to-CSV and a simulated action, plus a bottom-right toast.

## Files touched

- `assets/styles.css` — append new styles at the end
- `assets/app.js` — three additions: helpers at top, hookup inside initContactsList, hookup inside initTicketsList
- `contacts.html` — add a dropdown to the toolbar
- `tickets.html` — add a dropdown to the toolbar

---

## 1. CSS additions — append to `assets/styles.css`

```css
/* ---------- Actions dropdown (Contacts / Tickets toolbar) ---------- */
.actions-menu-container {
  position: relative;
  flex-shrink: 0;
}

.actions-trigger {
  /* matches the existing .icon-button (38px square) */
  width: 38px;
  height: 38px;
  padding: 0;
  font-size: 18px;
  line-height: 1;
}

.actions-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--bg-box);
  border: 1px solid var(--border-box);
  border-radius: 10px;
  padding: 6px;
  min-width: 240px;
  z-index: 50;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.actions-item {
  background: transparent;
  border: none;
  text-align: left;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
}

.actions-item:hover {
  background: var(--bg-box-hover);
}

.actions-item[data-busy="true"] {
  opacity: 0.7;
  cursor: progress;
}

/* ---------- Toast (bottom-right) ---------- */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  z-index: 200;
  pointer-events: none;
}

.toast {
  background: var(--bg-box);
  border: 1px solid var(--border-box);
  border-radius: 10px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  pointer-events: auto;
  min-width: 220px;
  max-width: 360px;
  opacity: 0;
  transform: translateX(20px);
  animation: toast-in 0.2s ease forwards;
}

.toast.fade-out {
  animation: toast-out 0.4s ease forwards;
}

@keyframes toast-in {
  to { opacity: 1; transform: translateX(0); }
}

@keyframes toast-out {
  to { opacity: 0; transform: translateX(20px); }
}
```

---

## 2. JS additions — `assets/app.js`

### 2a. Top-level helpers — add near the other helpers (around line ~30, after `makeIdFromName`)

```javascript
// ---------- CSV EXPORT ----------
function escapeCsvCell(value) {
  const s = String(value == null ? '' : value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename, headers, rows) {
  const lines = [headers.map(escapeCsvCell).join(',')];
  for (const row of rows) lines.push(row.map(escapeCsvCell).join(','));
  const csv = lines.join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function todayStamp() {
  // hardcoded so behavior is deterministic in this sandbox
  return '2026-04-29';
}

// ---------- TOAST ----------
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('fade-out'), 2200);
  setTimeout(() => toast.remove(), 2700);
}

// ---------- ACTIONS DROPDOWN ----------
function wireActionsDropdown(triggerId, dropdownId) {
  const trigger  = document.getElementById(triggerId);
  const dropdown = document.getElementById(dropdownId);
  if (!trigger || !dropdown) return;

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.hidden = !dropdown.hidden;
  });

  // Close when clicking outside the dropdown / trigger
  document.addEventListener('click', e => {
    if (dropdown.hidden) return;
    if (e.target.closest('.actions-menu-container')) return;
    dropdown.hidden = true;
  });
}

// ---------- SIMULATED ACTION (loading -> success toast) ----------
function runSimulatedAction(button, computeSuccessMessage) {
  if (button.dataset.busy === 'true') return;
  button.dataset.busy = 'true';
  const originalText = button.textContent;
  button.textContent = 'Working...';

  setTimeout(() => {
    button.textContent = originalText;
    button.dataset.busy = 'false';

    // Close the dropdown the button lives inside, if any
    const dropdown = button.closest('.actions-dropdown');
    if (dropdown) dropdown.hidden = true;

    showToast(computeSuccessMessage());
  }, 1500);
}
```

### 2b. Inside `initContactsList()` — add at the end of the function (after `render()`)

```javascript
  wireActionsDropdown('contacts-actions-trigger', 'contacts-actions-dropdown');

  document.getElementById('contacts-export-csv')?.addEventListener('click', () => {
    const headers = ['id', 'name', 'email', 'company', 'status', 'role', 'lastContacted', 'owner'];
    const rows = contacts.map(c => [c.id, c.name, c.email, c.company, c.status, c.role, c.lastContacted, c.owner]);
    downloadCsv(`contacts-${todayStamp()}.csv`, headers, rows);
    document.getElementById('contacts-actions-dropdown').hidden = true;
    showToast(`Exported ${contacts.length} contacts`);
  });

  document.getElementById('contacts-generate-report')?.addEventListener('click', e => {
    runSimulatedAction(e.target, () => {
      const activeCount = contacts.filter(c => c.status === 'active').length;
      return `Engagement report generated for ${activeCount} active contacts`;
    });
  });
```

### 2c. Inside `initTicketsList()` — add at the end of the function (after `render()`)

```javascript
  wireActionsDropdown('tickets-actions-trigger', 'tickets-actions-dropdown');

  document.getElementById('tickets-export-csv')?.addEventListener('click', () => {
    const headers = ['id', 'subject', 'customer', 'priority', 'status', 'assignee', 'created', 'updated'];
    const rows = tickets.map(t => {
      const c = getContact(t.customerId);
      const customer = c ? c.name : '';
      return [t.id, t.subject, customer, t.priority, t.status, t.assignee, t.created, t.updated];
    });
    downloadCsv(`tickets-${todayStamp()}.csv`, headers, rows);
    document.getElementById('tickets-actions-dropdown').hidden = true;
    showToast(`Exported ${tickets.length} tickets`);
  });

  document.getElementById('tickets-generate-summary')?.addEventListener('click', e => {
    runSimulatedAction(e.target, () => {
      const open = tickets.filter(t => t.status === 'open').length;
      const today = new Date('2026-04-28');
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      const closedThisWeek = tickets.filter(t =>
        t.status === 'closed' && new Date(t.updated) >= weekAgo
      ).length;
      return `Weekly summary generated — ${open} open, ${closedThisWeek} closed this week`;
    });
  });
```

---

## 3. HTML additions

### 3a. `contacts.html` — toolbar additions

Find your existing `<div class="page-toolbar">` and add the new dropdown block **after** the `+` button:

```html
<div class="page-toolbar">
  <input class="search-input" id="search-input" type="text" placeholder="Search by name, email, or company..." />
  <select class="filter-select" id="status-filter">
    <option value="all">All statuses</option>
    <option value="active">Active</option>
    <option value="pending">Pending</option>
    <option value="inactive">Inactive</option>
  </select>
  <button class="primary icon-button" id="add-contact-button" title="Add contact" aria-label="Add contact">+</button>

  <!-- NEW: Actions dropdown -->
  <div class="actions-menu-container">
    <button class="secondary icon-button actions-trigger"
            id="contacts-actions-trigger"
            title="More actions"
            aria-label="More actions"
            aria-haspopup="true">⋯</button>
    <div class="actions-dropdown" id="contacts-actions-dropdown" hidden>
      <button class="actions-item" id="contacts-export-csv">Export to CSV</button>
      <button class="actions-item" id="contacts-generate-report">Generate engagement report</button>
    </div>
  </div>
</div>
```

### 3b. `tickets.html` — toolbar additions

Same pattern — add after the `+` button in the existing toolbar:

```html
<!-- NEW: Actions dropdown -->
<div class="actions-menu-container">
  <button class="secondary icon-button actions-trigger"
          id="tickets-actions-trigger"
          title="More actions"
          aria-label="More actions"
          aria-haspopup="true">⋯</button>
  <div class="actions-dropdown" id="tickets-actions-dropdown" hidden>
    <button class="actions-item" id="tickets-export-csv">Export to CSV</button>
    <button class="actions-item" id="tickets-generate-summary">Generate weekly summary</button>
  </div>
</div>
```

### 3c. Toast container — optional

The `showToast()` helper auto-creates the container if it's missing, so technically you don't need to add anything. But if you'd rather have it explicit in HTML, add this just before the closing `</body>` tag in **both** `contacts.html` and `tickets.html` (and any other pages you want toasts on):

```html
<div class="toast-container" id="toast-container"></div>
```

I'd skip it and let JS create it on demand — keeps your HTML cleaner.

---

## 4. How to test

1. Reload `contacts.html` (or `tickets.html`).
2. Click the `⋯` button in the toolbar — dropdown should appear directly below.
3. Click outside the dropdown — it closes.
4. Click "Export to CSV" — browser triggers a real file download (`contacts-2026-04-29.csv` or similar). A toast appears bottom-right. Open the CSV and verify the columns and data look right.
5. Click "Generate engagement report" — the menu item text changes to "Working..." for ~1.5s, then the dropdown closes and a toast appears with a stat message. Click again — same behavior.

---

## 5. Pendo testing notes

Each of these gives you distinct tagging surfaces:

- **Click on the `⋯` trigger** — captures "user opened the actions menu" — useful for measuring engagement with the feature.
- **Click on each menu item** — separate Track Events per action, e.g., `contacts_export_csv_clicked` and `contacts_generate_report_clicked`.
- **The simulated loading state** — `data-busy="true"` is briefly on the button. If you wanted to time it, you could fire a `pendo.track('export_started', ...)` at click time and another `pendo.track('export_complete', ...)` when the toast appears.
- **Toast appearance** — represents "successful completion." You can think of it as a Page-rule-like state ("toast is visible") if you wanted to gate guides on success.

For Pendo customers, this kind of dropdown + toast pattern is everywhere — Salesforce, HubSpot, Zendesk all use it for bulk actions, exports, etc. So tagging it well here translates directly to real customer scenarios.

---

## 6. A few things worth knowing as you integrate

**`Blob` and `URL.createObjectURL`** — the standard browser-native way to generate a downloadable file from JavaScript without a server. You wrap your data in a Blob, get a temporary URL pointing to it, and trigger a download with a hidden `<a>` tag. The `URL.revokeObjectURL` at the end frees the memory once the download is done. Pattern works for any file type — CSV, JSON, plain text, even small images.

**CSV escaping rules** — if a cell contains a comma, quote, or newline, the cell needs to be wrapped in double quotes, and any internal quotes need to be doubled (`"He said ""hi"""`). The `escapeCsvCell` helper handles this. You can paste any of your contact data with commas in companies (e.g., "Smith, Jones & Co.") and it'll round-trip correctly.

**Why `computeSuccessMessage` is a function**, not a string — the action runs after a 1.5s delay. If the user adds/removes a contact during that delay, you want the message to reflect *current* state, not state at click time. Passing a function defers the calculation until the timeout fires.

**`button.dataset.busy`** — using a `data-` attribute as a poor-man's state machine. Stops a frantically clicking user from queueing up 10 simulated actions in parallel. Real apps usually disable the button or show a spinner; we're keeping it simple.
