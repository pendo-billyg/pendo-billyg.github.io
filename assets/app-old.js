// ============================================================
// FAKE DATA
// ============================================================
const contacts = [
    { id: 'maya-rodriguez', initials: 'MR', name: 'Maya Rodriguez', email: 'maya.r@acmecorp.io', company: 'Acme Corp', status: 'active', role: 'VP Engineering', lastContacted: '2026-04-25', owner: 'Billy Grey' },
    { id: 'jamal-thompson', initials: 'JT', name: 'Jamal Thompson', email: 'jthompson@northwind.dev', company: 'Northwind Labs', status: 'pending', role: 'Product Manager', lastContacted: '2026-04-19', owner: 'Billy Grey' },
    { id: 'priya-patel', initials: 'PP', name: 'Priya Patel', email: 'priya@globex.io', company: 'Globex Solutions', status: 'active', role: 'Customer Success Lead', lastContacted: '2026-04-27', owner: 'Sasha Liu' },
    { id: 'hugo-bertrand', initials: 'HB', name: 'Hugo Bertrand', email: 'h.bertrand@initech.fr', company: 'Initech', status: 'inactive', role: 'Sales Director', lastContacted: '2026-02-12', owner: 'Billy Grey' },
    { id: 'lin-chen', initials: 'LC', name: 'Lin Chen', email: 'lin@stark-industries.com', company: 'Stark Industries', status: 'active', role: 'CTO', lastContacted: '2026-04-22', owner: 'Billy Grey' },
    { id: 'olusola-adeyemi', initials: 'OA', name: 'Olusola Adeyemi', email: 'olu@wayne.co', company: 'Wayne Enterprises', status: 'pending', role: 'DevOps Engineer', lastContacted: '2026-04-15', owner: 'Sasha Liu' },
    { id: 'sofia-lindqvist', initials: 'SL', name: 'Sofia Lindqvist', email: 'sofia@umbrella.se', company: 'Umbrella Co.', status: 'active', role: 'Designer', lastContacted: '2026-04-26', owner: 'Billy Grey' },
    { id: 'diego-vasquez', initials: 'DV', name: 'Diego Vasquez', email: 'diego@soylent.io', company: 'Soylent Inc.', status: 'active', role: 'Account Executive', lastContacted: '2026-04-24', owner: 'Sasha Liu' },
    { id: 'aaliyah-williams', initials: 'AW', name: 'Aaliyah Williams', email: 'aaliyah@tyrellcorp.com', company: 'Tyrell Corp', status: 'inactive', role: 'Marketing Manager', lastContacted: '2026-01-30', owner: 'Billy Grey' },
    { id: 'kenji-nakamura', initials: 'KN', name: 'Kenji Nakamura', email: 'kenji@cyberdyne.jp', company: 'Cyberdyne Systems', status: 'pending', role: 'Solutions Architect', lastContacted: '2026-04-20', owner: 'Billy Grey' }
];

const tickets = [
    { id: 'TKT-1042', subject: 'Login issue persists after password reset', customerId: 'maya-rodriguez', priority: 'high', status: 'open', description: 'Customer reports being unable to log in even after a successful password reset. Affects both web and mobile clients.', assignee: 'Billy Grey', created: '2026-04-27', updated: '2026-04-28' },
    { id: 'TKT-1041', subject: 'Need help configuring SSO with Okta', customerId: 'lin-chen', priority: 'medium', status: 'in-progress', description: 'Working with the customer through SAML claims setup; awaiting their IT team to update group attributes.', assignee: 'Sasha Liu', created: '2026-04-26', updated: '2026-04-27' },
    { id: 'TKT-1040', subject: 'Export to CSV produces empty file', customerId: 'jamal-thompson', priority: 'high', status: 'open', description: 'Reproduced internally on accounts with > 10k contacts. Likely streaming response issue.', assignee: 'Billy Grey', created: '2026-04-26', updated: '2026-04-26' },
    { id: 'TKT-1039', subject: 'Slow load times on dashboard', customerId: 'priya-patel', priority: 'medium', status: 'pending', description: 'Customer reports 8-12 second loads. Awaiting browser console logs from their side.', assignee: 'Billy Grey', created: '2026-04-25', updated: '2026-04-25' },
    { id: 'TKT-1038', subject: 'Question about API rate limits', customerId: 'sofia-lindqvist', priority: 'low', status: 'in-progress', description: 'Need to draft a clearer rate-limiting explainer for our public docs.', assignee: 'Sasha Liu', created: '2026-04-24', updated: '2026-04-26' },
    { id: 'TKT-1037', subject: 'Webhook not firing on contact update', customerId: 'olusola-adeyemi', priority: 'medium', status: 'open', description: '', assignee: 'Billy Grey', created: '2026-04-24', updated: '2026-04-24' },
    { id: 'TKT-1036', subject: 'Billing question: pro-rated invoice', customerId: 'diego-vasquez', priority: 'low', status: 'closed', description: 'Resolved - refund issued for the over-billed period.', assignee: 'Billy Grey', created: '2026-04-22', updated: '2026-04-25' },
    { id: 'TKT-1035', subject: 'Custom field type currency not saving', customerId: 'maya-rodriguez', priority: 'high', status: 'pending', description: 'Workaround provided; engineering ticket filed for proper fix.', assignee: 'Sasha Liu', created: '2026-04-21', updated: '2026-04-23' },
    { id: 'TKT-1034', subject: 'Dark mode preference not persisting', customerId: 'kenji-nakamura', priority: 'low', status: 'open', description: '', assignee: 'Billy Grey', created: '2026-04-20', updated: '2026-04-20' },
    { id: 'TKT-1033', subject: 'Filter by tag returns no results', customerId: 'priya-patel', priority: 'medium', status: 'closed', description: 'Resolved - the customer was filtering against archived tags. Updated the filter UI to surface that.', assignee: 'Sasha Liu', created: '2026-04-19', updated: '2026-04-23' },
    { id: 'TKT-1032', subject: 'Need to bulk-import 5000 contacts', customerId: 'lin-chen', priority: 'medium', status: 'closed', description: 'Walked customer through the CSV import wizard; all 5000 contacts imported cleanly.', assignee: 'Billy Grey', created: '2026-04-18', updated: '2026-04-22' },
    { id: 'TKT-1031', subject: 'How to set up custom Pendo guides?', customerId: 'aaliyah-williams', priority: 'low', status: 'closed', description: 'Sent links to the relevant Pendo docs and a follow-up call summary.', assignee: 'Billy Grey', created: '2026-04-15', updated: '2026-04-20' }
];

// In-memory settings state
const settings = {
    profile: {
        displayName: 'Billy Grey',
        email: 'billy.grey@pendo.io',
        role: 'Technical Support Engineer'
    },
    notifications: {
        newTicketAssigned: true,
        customerReplies: true,
        statusChanges: false,
        weeklyDigest: true
    }
};

const escapeHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
);

const getContact = id => contacts.find(c => c.id === id);
const getTicket = id => tickets.find(t => t.id === id);

function makeIdFromName(name) {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function makeInitials(name) {
    if (!name) return '?';
    return name.trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase() || '?';
}

// ============================================================
// AUTH STATE — persisted in localStorage
// ============================================================
const AUTH_KEY = 'billycrm-auth';
const DEFAULT_AUTH = {
    visitor: { id: 'billy-grey', name: 'Billy Grey', email: 'billy.grey@pendo.io' },
    account: { id: 'pendo', name: 'Pendo Inc.' }
};

function getAuth() {
    try {
        const raw = localStorage.getItem(AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}
function setAuth(auth) {
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(auth)); } catch (e) { }
}
function clearAuth() {
    try { localStorage.removeItem(AUTH_KEY); } catch (e) { }
}
function isSignedIn() {
    const a = getAuth();
    return !!(a && a.visitor && a.visitor.id);
}

// First run — default auth so the prototype starts as "Billy Grey / Pendo"
if (getAuth() === null) setAuth(DEFAULT_AUTH);

// ============================================================
// DASHBOARD METRICS
// ============================================================
function updateDashboardMetrics() {
    const today = new Date('2026-04-28');
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const metrics = {
        openTickets: tickets.filter(t => t.status === 'open').length,
        activeContacts: contacts.filter(c => c.status === 'active').length,
        closedThisWeek: tickets.filter(t => t.status === 'closed' && new Date(t.updated) >= weekAgo).length
    };

    for (const [key, value] of Object.entries(metrics)) {
        const el = document.querySelector(`[data-metric="${key}"]`);
        if (el) el.textContent = value;
    }
}

// ============================================================
// CONTACTS
// ============================================================
let contactSearch = '';
let contactStatusFilter = 'all';

function renderContactsList() {
    const tbody = document.getElementById('contacts-tbody');
    if (!tbody) return;

    const q = contactSearch.trim().toLowerCase();
    const filtered = contacts.filter(c => {
        if (contactStatusFilter !== 'all' && c.status !== contactStatusFilter) return false;
        if (!q) return true;
        return c.name.toLowerCase().includes(q)
            || c.email.toLowerCase().includes(q)
            || c.company.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<div class="empty-state">No contacts match your search.</div>';
        return;
    }

    tbody.innerHTML = filtered.map(c => `
      <a class="contact-row" href="#/contacts/${c.id}">
        <div><div class="contact-avatar">${escapeHtml(c.initials)}</div></div>
        <div>${escapeHtml(c.name)}</div>
        <div>${escapeHtml(c.email)}</div>
        <div>${escapeHtml(c.company)}</div>
        <div><span class="status-pill ${c.status}">${escapeHtml(c.status)}</span></div>
      </a>
    `).join('');
}

function renderContactDetail(id) {
    const wrap = document.getElementById('contact-detail-content');
    const c = getContact(id);

    if (!c) {
        wrap.innerHTML = `
        <button class="back-button" onclick="location.hash='#/contacts'">&larr; Back to Contacts</button>
        <div class="empty-state">Contact not found.</div>
      `;
        document.getElementById('page-title').textContent = 'Contact not found';
        return;
    }

    document.getElementById('page-title').textContent = c.name;

    wrap.innerHTML = `
      <button class="back-button" onclick="location.hash='#/contacts'">&larr; Back to Contacts</button>

      <div class="contact-detail-hero">
        <div class="contact-detail-avatar">${escapeHtml(c.initials)}</div>
        <div class="contact-detail-info">
          <h2>${escapeHtml(c.name)}</h2>
          <p>${escapeHtml(c.role || '-')} &middot; ${escapeHtml(c.company)}</p>
          <span class="status-pill ${c.status}">${escapeHtml(c.status)}</span>
        </div>
        <button class="secondary" id="edit-contact-button">Edit</button>
      </div>

      <div class="contact-detail-fields">
        <div class="field-row"><div class="field-label">Email</div>          <div class="field-value">${escapeHtml(c.email)}</div></div>
        <div class="field-row"><div class="field-label">Company</div>        <div class="field-value">${escapeHtml(c.company)}</div></div>
        <div class="field-row"><div class="field-label">Role</div>           <div class="field-value">${escapeHtml(c.role || '-')}</div></div>
        <div class="field-row"><div class="field-label">Owner</div>          <div class="field-value">${escapeHtml(c.owner || '-')}</div></div>
        <div class="field-row"><div class="field-label">Last contacted</div> <div class="field-value">${escapeHtml(c.lastContacted || '-')}</div></div>
      </div>
    `;

    wrap.querySelector('#edit-contact-button').addEventListener('click', () => openEditContactModal(id));
}

// ============================================================
// TICKETS
// ============================================================
let ticketSearch = '';
let ticketStatusFilter = 'all';
let ticketPriorityFilter = 'all';

function renderTicketsList() {
    const list = document.getElementById('tickets-list');
    if (!list) return;

    const q = ticketSearch.trim().toLowerCase();
    const filtered = tickets.filter(t => {
        if (ticketStatusFilter !== 'all' && t.status !== ticketStatusFilter) return false;
        if (ticketPriorityFilter !== 'all' && t.priority !== ticketPriorityFilter) return false;
        if (!q) return true;
        const cust = getContact(t.customerId);
        const customerName = cust ? cust.name : '';
        return t.subject.toLowerCase().includes(q)
            || t.id.toLowerCase().includes(q)
            || customerName.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state">No tickets match your filters.</div>';
        return;
    }

    list.innerHTML = filtered.map(t => {
        const c = getContact(t.customerId);
        const customerLabel = c
            ? `<a class="customer-link" href="#/contacts/${c.id}">${escapeHtml(c.name)}</a> &middot; ${escapeHtml(c.company)}`
            : '-';
        const statusLabel = t.status === 'in-progress' ? 'In progress' : t.status;
        return `
        <div class="ticket-card" data-ticket-id="${escapeHtml(t.id)}" role="link" tabindex="0">
          <div class="ticket-card-main">
            <div class="ticket-id">${escapeHtml(t.id)}</div>
            <div class="ticket-subject">${escapeHtml(t.subject)}</div>
            <div class="ticket-customer">${customerLabel}</div>
          </div>
          <div class="ticket-pills">
            <span class="priority-pill ${t.priority}">${escapeHtml(t.priority)}</span>
            <span class="ticket-status-pill ${t.status}">${escapeHtml(statusLabel)}</span>
          </div>
        </div>
      `;
    }).join('');
}

function renderTicketDetail(id) {
    const wrap = document.getElementById('ticket-detail-content');
    const t = getTicket(id);

    if (!t) {
        wrap.innerHTML = `
        <button class="back-button" onclick="location.hash='#/tickets'">&larr; Back to Tickets</button>
        <div class="empty-state">Ticket not found.</div>
      `;
        document.getElementById('page-title').textContent = 'Ticket not found';
        return;
    }

    document.getElementById('page-title').textContent = t.id;
    const c = getContact(t.customerId);
    const customerLabel = c
        ? `<a class="customer-link" href="#/contacts/${c.id}">${escapeHtml(c.name)}</a> &middot; ${escapeHtml(c.company)}`
        : '-';
    const statusLabel = t.status === 'in-progress' ? 'In progress' : t.status;

    wrap.innerHTML = `
      <button class="back-button" onclick="location.hash='#/tickets'">&larr; Back to Tickets</button>

      <div class="ticket-detail-hero">
        <div class="ticket-detail-info">
          <div class="ticket-id">${escapeHtml(t.id)}</div>
          <h2>${escapeHtml(t.subject)}</h2>
          <p>${customerLabel}</p>
          <div class="ticket-pills">
            <span class="priority-pill ${t.priority}">${escapeHtml(t.priority)}</span>
            <span class="ticket-status-pill ${t.status}">${escapeHtml(statusLabel)}</span>
          </div>
        </div>
        <button class="secondary" id="edit-ticket-button">Edit</button>
      </div>

      <div class="ticket-detail-fields">
        <div class="field-row">
          <div class="field-label">Customer</div>
          <div class="field-value">${customerLabel}</div>
        </div>
        <div class="field-row"><div class="field-label">Priority</div>    <div class="field-value">${escapeHtml(t.priority)}</div></div>
        <div class="field-row"><div class="field-label">Status</div>      <div class="field-value">${escapeHtml(statusLabel)}</div></div>
        <div class="field-row"><div class="field-label">Assignee</div>    <div class="field-value">${escapeHtml(t.assignee || '-')}</div></div>
        <div class="field-row"><div class="field-label">Created</div>     <div class="field-value">${escapeHtml(t.created)}</div></div>
        <div class="field-row"><div class="field-label">Last updated</div><div class="field-value">${escapeHtml(t.updated)}</div></div>
        <div class="field-row">
          <div class="field-label">Description</div>
          <div class="field-value long">${escapeHtml(t.description || '-')}</div>
        </div>
      </div>
    `;

    wrap.querySelector('#edit-ticket-button').addEventListener('click', () => openEditTicketModal(id));
}

// ============================================================
// SETTINGS — render + save handlers
// ============================================================
function renderSettings() {
    document.getElementById('s-displayName').value = settings.profile.displayName;
    document.getElementById('s-email').value = settings.profile.email;
    document.getElementById('s-role').value = settings.profile.role;

    document.getElementById('s-newTicket').checked = settings.notifications.newTicketAssigned;
    document.getElementById('s-replies').checked = settings.notifications.customerReplies;
    document.getElementById('s-statusChanges').checked = settings.notifications.statusChanges;
    document.getElementById('s-weeklyDigest').checked = settings.notifications.weeklyDigest;
}

function flashSaveConfirmation(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 1800);
}

// ============================================================
// USER MENU (top-right) — signed-in or signed-out states
// ============================================================
function renderUserMenu() {
    const wrapper = document.getElementById('user-menu-wrapper');
    const auth = getAuth();
    const signedIn = !!(auth && auth.visitor && auth.visitor.id);

    if (signedIn) {
        const initials = makeInitials(auth.visitor.name || auth.visitor.id);
        const displayName = auth.visitor.name || auth.visitor.id;
        wrapper.innerHTML = `
        <button class="user-avatar" id="user-avatar-btn" title="${escapeHtml(displayName)}" aria-label="User menu" aria-haspopup="true">${escapeHtml(initials)}</button>
        <div class="user-menu-dropdown" id="user-menu-dropdown" hidden>
          <div class="user-menu-section">
            <div class="user-menu-label">Visitor</div>
            <div class="user-menu-value">${escapeHtml(auth.visitor.name || '—')}</div>
            ${auth.visitor.email ? `<div class="user-menu-hint">${escapeHtml(auth.visitor.email)}</div>` : ''}
            <div class="user-menu-id">${escapeHtml(auth.visitor.id)}</div>
          </div>
          <div class="user-menu-divider"></div>
          <div class="user-menu-section">
            <div class="user-menu-label">Account</div>
            <div class="user-menu-value">${escapeHtml(auth.account.name || '—')}</div>
            <div class="user-menu-id">${escapeHtml(auth.account.id)}</div>
          </div>
          <div class="user-menu-divider"></div>
          <div class="user-menu-actions">
            <button class="secondary" id="sign-out-button">Sign out</button>
          </div>
        </div>
      `;
        document.getElementById('user-avatar-btn').addEventListener('click', e => {
            e.stopPropagation();
            const dd = document.getElementById('user-menu-dropdown');
            dd.hidden = !dd.hidden;
        });
        document.getElementById('sign-out-button').addEventListener('click', () => {
            clearAuth();
            renderUserMenu();
        });
    } else {
        wrapper.innerHTML = `<button class="signin-button" id="open-signin-button">Sign in</button>`;
        document.getElementById('open-signin-button').addEventListener('click', openSignInModal);
    }
}

// Close the user dropdown on outside click
document.addEventListener('click', e => {
    const dd = document.getElementById('user-menu-dropdown');
    if (!dd || dd.hidden) return;
    if (e.target.closest('.user-menu-container')) return;
    dd.hidden = true;
});

// ============================================================
// SIGN-IN MODAL
// ============================================================
const signinModal = document.getElementById('signin-modal');
const signinForm = document.getElementById('signin-form');

function openSignInModal() {
    signinForm.reset();
    signinModal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('si-visitor-id').focus();
}
function closeSignInModal() {
    signinModal.hidden = true;
    document.body.style.overflow = '';
    signinForm.reset();
}

signinForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(signinForm);
    const visitorId = data.get('visitorId').trim();
    const accountId = data.get('accountId').trim();
    if (!visitorId || !accountId) return;

    setAuth({
        visitor: {
            id: visitorId,
            name: (data.get('visitorName') || '').trim(),
            email: (data.get('visitorEmail') || '').trim()
        },
        account: {
            id: accountId,
            name: (data.get('accountName') || '').trim()
        }
    });

    closeSignInModal();
    renderUserMenu();
});

document.getElementById('cancel-signin').addEventListener('click', closeSignInModal);
signinModal.addEventListener('click', e => { if (e.target === signinModal) closeSignInModal(); });

// ============================================================
// CONTACT FORM MODAL
// ============================================================
const contactModal = document.getElementById('contact-modal');
const contactForm = document.getElementById('contact-form');
const contactModalTitle = document.getElementById('contact-modal-title');
const contactSaveBtn = document.getElementById('save-contact');
let editingContactId = null;

function openAddContactModal() {
    editingContactId = null;
    contactModalTitle.textContent = 'Add contact';
    contactSaveBtn.textContent = 'Save contact';
    contactForm.reset();
    document.getElementById('cf-status').value = 'active';
    showContactModal();
}

function openEditContactModal(id) {
    const c = getContact(id);
    if (!c) return;
    editingContactId = id;
    contactModalTitle.textContent = 'Edit contact';
    contactSaveBtn.textContent = 'Save changes';
    document.getElementById('cf-name').value = c.name;
    document.getElementById('cf-email').value = c.email;
    document.getElementById('cf-company').value = c.company;
    document.getElementById('cf-status').value = c.status;
    document.getElementById('cf-role').value = c.role || '';
    document.getElementById('cf-last-contacted').value = c.lastContacted || '';
    document.getElementById('cf-owner').value = c.owner || '';
    showContactModal();
}

function showContactModal() {
    contactModal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('cf-name').focus();
}

function closeContactModal() {
    contactModal.hidden = true;
    document.body.style.overflow = '';
    contactForm.reset();
    editingContactId = null;
}

contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = data.get('name').trim();
    const email = data.get('email').trim();
    const company = data.get('company').trim();
    const status = data.get('status');
    if (!name || !email || !company || !status) return;

    const fields = {
        name, email, company, status,
        initials: makeInitials(name),
        role: (data.get('role') || '').trim(),
        lastContacted: (data.get('lastContacted') || ''),
        owner: (data.get('owner') || '').trim()
    };

    if (editingContactId) {
        const c = getContact(editingContactId);
        if (c) Object.assign(c, fields);
        closeContactModal();
        showPage();
    } else {
        let id = makeIdFromName(name);
        let n = 1;
        while (contacts.some(c => c.id === id)) {
            id = `${makeIdFromName(name)}-${++n}`;
        }
        contacts.unshift({ id, ...fields });
        closeContactModal();
        location.hash = `#/contacts/${id}`;
    }
});

document.getElementById('cancel-contact').addEventListener('click', closeContactModal);
contactModal.addEventListener('click', e => { if (e.target === contactModal) closeContactModal(); });
document.getElementById('add-contact-from-dashboard').addEventListener('click', openAddContactModal);
document.getElementById('add-contact-button').addEventListener('click', openAddContactModal);

// ============================================================
// TICKET FORM MODAL
// ============================================================
const ticketModal = document.getElementById('ticket-modal');
const ticketForm = document.getElementById('ticket-form');
const ticketModalTitle = document.getElementById('ticket-modal-title');
const ticketSaveBtn = document.getElementById('save-ticket');
let editingTicketId = null;

function populateCustomerOptions(selectedId) {
    const select = document.getElementById('tf-customer');
    select.innerHTML = contacts.map(c =>
        `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${escapeHtml(c.name)} &middot; ${escapeHtml(c.company)}</option>`
    ).join('');
}

function openAddTicketModal() {
    editingTicketId = null;
    ticketModalTitle.textContent = 'New ticket';
    ticketSaveBtn.textContent = 'Save ticket';
    ticketForm.reset();
    populateCustomerOptions();
    document.getElementById('tf-priority').value = 'medium';
    document.getElementById('tf-status').value = 'open';
    showTicketModal();
}

function openEditTicketModal(id) {
    const t = getTicket(id);
    if (!t) return;
    editingTicketId = id;
    ticketModalTitle.textContent = 'Edit ticket';
    ticketSaveBtn.textContent = 'Save changes';
    populateCustomerOptions(t.customerId);
    document.getElementById('tf-subject').value = t.subject;
    document.getElementById('tf-priority').value = t.priority;
    document.getElementById('tf-status').value = t.status;
    document.getElementById('tf-assignee').value = t.assignee || '';
    document.getElementById('tf-description').value = t.description || '';
    showTicketModal();
}

function showTicketModal() {
    ticketModal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('tf-subject').focus();
}

function closeTicketModal() {
    ticketModal.hidden = true;
    document.body.style.overflow = '';
    ticketForm.reset();
    editingTicketId = null;
}

function nextTicketId() {
    const numbers = tickets
        .map(t => parseInt((t.id.match(/(\d+)$/) || [])[1], 10))
        .filter(n => !isNaN(n));
    const next = (numbers.length ? Math.max(...numbers) : 1000) + 1;
    return `TKT-${next}`;
}

ticketForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(ticketForm);
    const subject = data.get('subject').trim();
    const customerId = data.get('customerId');
    const priority = data.get('priority');
    const status = data.get('status');
    if (!subject || !customerId || !priority || !status) return;

    const today = '2026-04-28';
    const fields = {
        subject, customerId, priority, status,
        assignee: (data.get('assignee') || '').trim(),
        description: (data.get('description') || '').trim(),
        updated: today
    };

    if (editingTicketId) {
        const t = getTicket(editingTicketId);
        if (t) Object.assign(t, fields);
        closeTicketModal();
        showPage();
    } else {
        const id = nextTicketId();
        tickets.unshift({ id, ...fields, created: today });
        closeTicketModal();
        location.hash = `#/tickets/${id}`;
    }
});

document.getElementById('cancel-ticket').addEventListener('click', closeTicketModal);
ticketModal.addEventListener('click', e => { if (e.target === ticketModal) closeTicketModal(); });
document.getElementById('add-ticket-button').addEventListener('click', openAddTicketModal);

// Esc closes whichever modal is open
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!contactModal.hidden) closeContactModal();
    if (!ticketModal.hidden) closeTicketModal();
    if (!signinModal.hidden) closeSignInModal();
});

// ============================================================
// SEARCH + FILTER LISTENERS
// ============================================================
document.getElementById('search-input').addEventListener('input', e => {
    contactSearch = e.target.value;
    renderContactsList();
});
document.getElementById('status-filter').addEventListener('change', e => {
    contactStatusFilter = e.target.value;
    renderContactsList();
});

document.getElementById('ticket-search-input').addEventListener('input', e => {
    ticketSearch = e.target.value;
    renderTicketsList();
});
document.getElementById('ticket-status-filter').addEventListener('change', e => {
    ticketStatusFilter = e.target.value;
    renderTicketsList();
});
document.getElementById('ticket-priority-filter').addEventListener('change', e => {
    ticketPriorityFilter = e.target.value;
    renderTicketsList();
});

// ============================================================
// SETTINGS — save handlers
// ============================================================
document.getElementById('save-profile-button').addEventListener('click', () => {
    settings.profile.displayName = document.getElementById('s-displayName').value.trim();
    settings.profile.email = document.getElementById('s-email').value.trim();
    settings.profile.role = document.getElementById('s-role').value.trim();
    flashSaveConfirmation('profile-save-confirmation');
});

document.getElementById('save-notifications-button').addEventListener('click', () => {
    settings.notifications.newTicketAssigned = document.getElementById('s-newTicket').checked;
    settings.notifications.customerReplies = document.getElementById('s-replies').checked;
    settings.notifications.statusChanges = document.getElementById('s-statusChanges').checked;
    settings.notifications.weeklyDigest = document.getElementById('s-weeklyDigest').checked;
    flashSaveConfirmation('notifications-save-confirmation');
});

// ============================================================
// TICKET CARD NAVIGATION — delegated click + keyboard handlers
// ============================================================
document.getElementById('tickets-list').addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const card = e.target.closest('.ticket-card');
    if (card && card.dataset.ticketId) {
        location.hash = `#/tickets/${card.dataset.ticketId}`;
    }
});

document.getElementById('tickets-list').addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.ticket-card');
    if (card && card.dataset.ticketId) {
        e.preventDefault();
        location.hash = `#/tickets/${card.dataset.ticketId}`;
    }
});

// ============================================================
// INITIAL RENDER
// ============================================================
renderUserMenu();