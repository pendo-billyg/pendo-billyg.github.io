/* ============================================================
vh-lab.js — Validation Hold lab (replica for Zendesk 240607)

Mimics the customer's Kendo hierarchy grid closely enough to test
Pendo element targeting and code-block advance behaviour:
  - grid only exists / shows after Search (simulated async fetch)
  - #validationHoldKendoGrid > table[role=treegrid] with <colgroup>
  - tr.k-master-row / tr.k-alt.k-master-row, td.k-hierarchy-cell,
    three display:none cells, checkbox cell, then the Patient cell
  - Patient cell holds a.lnkPatientName with a javascript: href
    (no element exists for the column as a whole)
  - sorting and paging re-render <tbody>, expanding inserts a
    tr.k-detail-row, so listeners bound to rows/links get lost
============================================================ */
(function () {
  'use strict';

  // ---------- lab settings (persisted per browser) ----------
  const LAB_KEY = 'billycrm-vh-lab';
  function loadLab() {
    try { return Object.assign({ mount: 'create', delay: 800, linkTarget: '_blank', autoExpand: true }, JSON.parse(localStorage.getItem(LAB_KEY) || '{}')); }
    catch (e) { return { mount: 'create', delay: 800, linkTarget: '_blank' }; }
  }
  function saveLab(s) { try { localStorage.setItem(LAB_KEY, JSON.stringify(s)); } catch (e) {} }
  const lab = loadLab();

  // ---------- data ----------
  const PATIENTS = [
    { id: 'p-2101280539', name: 'DONOTTOUCHTESTPATIENT, PatientRecordHospicePatient 2', mrn: '2101280539', payor: 'VBP PPS Payor', plan: 'Plan One', careLocation: 'Home', loc: 'General Inpatient' },
    { id: 'p-38726', name: 'TESTHISL, TESTHISF', mrn: '38726', payor: 'Hospice NOE Payor', plan: 'NOE Plan One', careLocation: 'Hospital', loc: 'Routine Home Care' },
    { id: 'p-33814', name: 'addendum, Shirley', mrn: '33814', payor: "Dean's Payor (Medicare)", plan: 'Plan2 HH', careLocation: 'Assisted Living', loc: 'Continuous Home Care' },
    { id: 'p-2389', name: 'Henderson, Kent', mrn: '2389', payor: 'Hospice Medicare Part B', plan: 'Hospice Part B Plan', careLocation: 'Home', loc: 'Inpatient Respite' },
    { id: 'p-34581', name: 'Bear, Panda', mrn: '34581', payor: '', plan: '', careLocation: 'Nursing Facility', loc: 'Routine Home Care' },
    { id: 'p-36492', name: 'Incomplete8, Incomplete8', mrn: '36492', payor: '', plan: '', careLocation: 'Home', loc: 'General Inpatient' },
    { id: 'p-37160', name: 'Raksh, Yash', mrn: '37160', payor: '', plan: '', careLocation: 'Hospital', loc: 'Continuous Home Care' },
    { id: 'p-20261013', name: 'DONOTTOUCHTESTPATIENT, PatientHeaderHHTestPatient', mrn: '20261013173816', payor: 'ZZ Medicare HMO ZZ', plan: 'Aetna Health', careLocation: 'Home', loc: 'Inpatient Respite' }
  ];
  const byId = Object.fromEntries(PATIENTS.map(p => [p.id, p]));
  // Badge in the customer's guide targets:
  // [role="gridcell"]:contains("Care Location/LOC Mismatch: Type and Location in the Personal Info > Care Location screen does not match the LOC & Code in the")
  const HOLD_TEXT = 'Care Location/LOC Mismatch: Type and Location in the Personal Info > Care Location screen does not match the LOC & Code in the Daily Charges screen.';

  function uid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }); }
  const HOLDS = [];
  (function seed() {
    let d = new Date('2026-11-11T12:00:00');
    for (let i = 0; i < 34; i++) {
      const p = PATIENTS[i < 12 ? 0 : (i % PATIENTS.length)];
      HOLDS.push({
        uid: uid(), patientId: p.id, admissionId: uid().toUpperCase(),
        eventDate: new Date(d.getTime() - Math.floor(i / 2) * 86400000),
        clinician: i % 5 === 0 ? 'qaAutomationT6' : '', eventType: i % 7 === 3 ? 'IN' : 'VI'
      });
    }
  })();

  // ---------- link handler, shaped like the customer's ----------
  // href="javascript:H.App.Patient.GridHelper.insertAndSelectPatientAndAdmission('<patient>','<admission>','Default')"
  window.H = window.H || {};
  H.App = H.App || {};
  H.App.Patient = H.App.Patient || {};
  H.App.Patient.GridHelper = {
    insertAndSelectPatientAndAdmission: function (patientId, admissionId) {
      const url = 'patient-record.html?patient=' + encodeURIComponent(patientId) + '&admission=' + encodeURIComponent(admissionId);
      if (loadLab().linkTarget === '_self') location.href = url;
      else window.open(url, '_blank');
    }
  };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = d => (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getDate().toString().padStart(2, '0') + '/' + d.getFullYear();

  // ---------- Validation Hold page ----------
  function initValidationHold() {
    const host = document.getElementById('gridHost');
    const state = { rows: [], sortDir: 'desc', page: 1, pageSize: 20 };

    // lab controls
    document.querySelectorAll('input[name="mount"]').forEach(r => { r.checked = r.value === lab.mount; r.addEventListener('change', () => { lab.mount = r.value; saveLab(lab); }); });
    document.querySelectorAll('input[name="linkTarget"]').forEach(r => { r.checked = r.value === lab.linkTarget; r.addEventListener('change', () => { lab.linkTarget = r.value; saveLab(lab); }); });
    const autoEx = document.getElementById('labAutoExpand');
    autoEx.checked = !!lab.autoExpand;
    autoEx.addEventListener('change', () => { lab.autoExpand = autoEx.checked; saveLab(lab); });
    const delayInput = document.getElementById('labDelay');
    delayInput.value = lab.delay;
    delayInput.addEventListener('change', () => { lab.delay = Math.max(0, +delayInput.value || 0); saveLab(lab); });

    function gridShell() {
      const div = document.createElement('div');
      div.innerHTML =
        '<div class="grid-toolbar"><button type="button" class="k-button k-primary" id="btnProcessNoCharge">Process No Charge</button></div>' +
        '<div class="k-widget k-grid" data-form="validationHoldForm" id="validationHoldKendoGrid" data-role="grid" data-onvisible="validationHoldKendoGridHandleVisible">' +
          '<table role="treegrid">' +
            '<colgroup><col class="k-hierarchy-col" style="width:45px"><col style="width:1%"><col><col><col><col><col><col><col><col><col><col style="width:30px"><col></colgroup>' +
            '<thead class="k-grid-header" role="rowgroup"><tr>' +
              '<th class="k-hierarchy-cell k-header" scope="col">Expand</th>' +
              '<th class="k-header" style="display:none" data-field="HoldId" data-index="0" scope="col"></th>' +
              '<th class="k-header" style="display:none" data-field="AdmissionKey" data-index="1" scope="col"></th>' +
              '<th class="k-header" style="display:none" data-field="IsActive" data-index="2" scope="col"></th>' +
              '<th class="k-header" data-field="Selected" data-index="3" scope="col"><input type="checkbox" id="selectAll" aria-label="Select all"></th>' +
              '<th class="k-header" data-field="PatientName" data-index="4" data-title="Patient" scope="col" data-role="columnsorter">Patient</th>' +
              '<th class="k-header" data-field="Payor" data-index="5" data-title="Payor" scope="col">Payor</th>' +
              '<th class="k-header" data-field="Plan" data-index="6" data-title="Plan" scope="col">Plan</th>' +
              '<th class="k-header" data-field="EventDate" data-index="7" data-title="Event Date" scope="col" data-role="columnsorter" data-sortable>Event Date <span id="sortArrow"></span></th>' +
              '<th class="k-header" data-field="Clinician" data-index="8" data-title="Clinician" scope="col">Clinician</th>' +
              '<th class="k-header" data-field="EventType" data-index="9" data-title="Event Type" scope="col">Event Type</th>' +
              '<th class="k-header" data-field data-index="10" data-title scope="col"></th>' +
              '<th class="k-header" data-field data-index="11" data-title scope="col"></th>' +
            '</tr></thead>' +
            '<tbody role="rowgroup"></tbody>' +
          '</table>' +
          '<div class="k-pager" id="vhPager"></div>' +
        '</div>';
      return div;
    }

    function ensureGrid() {
      let wrap = document.getElementById('vhGridWrap');
      if (!wrap) {
        wrap = gridShell();
        wrap.id = 'vhGridWrap';
        host.innerHTML = '';
        host.appendChild(wrap);
        wireGrid(wrap);
      }
      return wrap;
    }

    // "hide" mode: grid is in the DOM from page load, just hidden
    if (lab.mount === 'hide') { ensureGrid().style.display = 'none'; }

    function renderBody() {
      const grid = document.getElementById('validationHoldKendoGrid');
      const tbody = grid.querySelector('tbody');
      const sorted = state.rows.slice().sort((a, b) => state.sortDir === 'desc' ? b.eventDate - a.eventDate : a.eventDate - b.eventDate);
      const pages = Math.max(1, Math.ceil(sorted.length / state.pageSize));
      state.page = Math.min(state.page, pages);
      const slice = sorted.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);

      // Kendo replaces the whole tbody on sort/page — so do we.
      tbody.innerHTML = slice.map((h, i) => {
        const p = byId[h.patientId];
        return '<tr class="' + (i % 2 ? 'k-alt ' : '') + 'k-master-row" data-uid="' + h.uid + '" role="row">' +
          '<td class="k-hierarchy-cell" role="gridcell"><a class="k-icon k-plus" href="#" aria-label="Expand" data-expand>&#9654;</a></td>' +
          '<td style="display:none" role="gridcell">' + h.admissionId + '</td>' +
          '<td style="display:none" role="gridcell">' + h.admissionId + '</td>' +
          '<td style="display:none" role="gridcell">true</td>' +
          '<td role="gridcell" class=""><input type="checkbox" class="row-select" aria-label="Select row"></td>' +
          '<td role="gridcell" class=""><a class="lnkPatientName" href="javascript:H.App.Patient.GridHelper.insertAndSelectPatientAndAdmission(\'' + p.id + '\', \'' + h.admissionId + '\', \'Default\')">' + esc(p.name) + ' (' + esc(p.mrn) + ')</a></td>' +
          '<td role="gridcell">' + esc(p.payor) + '</td>' +
          '<td role="gridcell">' + esc(p.plan) + '</td>' +
          '<td role="gridcell">' + fmt(h.eventDate) + '</td>' +
          '<td role="gridcell">' + esc(h.clinician) + '</td>' +
          '<td role="gridcell">' + h.eventType + '</td>' +
          '<td class="text-center" role="gridcell"><span class="info-icon" title="MRN: ' + esc(p.mrn) + ' | Care Location: ' + esc(p.careLocation) + ' | LOC: ' + esc(p.loc) + '">i</span></td>' +
          '<td class="action-cell" role="gridcell"><div class="actions-wrap"><button type="button" class="actions-btn" data-actions>Actions &#9662;</button></div></td>' +
        '</tr>';
      }).join('');

      if (loadLab().autoExpand) { const first = tbody.querySelector('tr.k-master-row'); if (first) expandRow(first); }

      grid.querySelector('#sortArrow').textContent = state.sortDir === 'desc' ? '▼' : '▲';

      const pager = grid.querySelector('#vhPager');
      let btns = '';
      for (let n = 1; n <= pages; n++) btns += '<button type="button" data-pg="' + n + '"' + (n === state.page ? ' class="current"' : '') + '>' + n + '</button>';
      pager.innerHTML = btns + '<span>' + state.pageSize + ' items per page</span><span class="info">' +
        (sorted.length ? ((state.page - 1) * state.pageSize + 1) + ' - ' + Math.min(state.page * state.pageSize, sorted.length) : 0) + ' of ' + sorted.length + ' items</span>' +
        '<button type="button" data-refresh title="Refresh">&#8635;</button>';
    }

    function detailRow(tr) {
      const h = state.rows.find(r => r.uid === tr.dataset.uid); const p = byId[h.patientId];
      const d = document.createElement('tr');
      d.className = 'k-detail-row';
      d.innerHTML = '<td class="k-hierarchy-cell"></td><td style="display:none"></td><td style="display:none"></td><td style="display:none"></td>' +
        '<td class="k-detail-cell" colspan="9"><div class="detail-card"><span><b>MRN:</b> ' + esc(p.mrn) + '</span><span><b>Care Location:</b> ' + esc(p.careLocation) + '</span><span><b>Level of Care:</b> ' + esc(p.loc) + '</span></div>' +
        '<div class="k-widget k-grid holds-subgrid" data-role="grid"><table role="grid"><thead class="k-grid-header" role="rowgroup"><tr><th class="k-header" scope="col">Hold</th><th class="k-header" scope="col" style="width:120px">Hold Date</th></tr></thead>' +
        '<tbody role="rowgroup"><tr class="k-master-row" role="row"><td role="gridcell">' + esc(HOLD_TEXT) + '</td><td role="gridcell">' + fmt(h.eventDate) + '</td></tr></tbody></table></div></td>';
      return d;
    }

    function expandRow(tr) {
      const ex = tr.querySelector('[data-expand]');
      const next = tr.nextElementSibling;
      if (next && next.classList.contains('k-detail-row')) return;
      tr.after(detailRow(tr)); ex.innerHTML = '&#9660;';
    }

    function wireGrid(wrap) {
      // One delegated handler for the app's own UI (sorting, paging, expand, actions).
      wrap.addEventListener('click', e => {
        const t = e.target;
        if (t.closest('[data-sortable]')) { state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc'; renderBody(); return; }
        const pg = t.closest('[data-pg]'); if (pg) { state.page = +pg.dataset.pg; renderBody(); return; }
        if (t.closest('[data-refresh]')) { renderBody(); return; }
        const ex = t.closest('[data-expand]');
        if (ex) {
          e.preventDefault();
          const tr = ex.closest('tr');
          const next = tr.nextElementSibling;
          if (next && next.classList.contains('k-detail-row')) { next.remove(); ex.innerHTML = '&#9654;'; return; }
          const d = detailRow(tr);
          tr.after(d); ex.innerHTML = '&#9660;';
          return;
        }
        const act = t.closest('[data-actions]');
        if (act) {
          const open = act.parentElement.querySelector('.actions-menu');
          document.querySelectorAll('.actions-menu').forEach(m => m.remove());
          if (!open) { const m = document.createElement('div'); m.className = 'actions-menu'; m.innerHTML = '<button type="button">Research</button><button type="button">Release hold</button><button type="button">Add note</button>'; act.after(m); }
          return;
        }
        if (t.id === 'selectAll') wrap.querySelectorAll('.row-select').forEach(c => { c.checked = t.checked; });
      });
    }

    function search() {
      const q = document.getElementById('PatientFilter').value.trim().toLowerCase();
      const wrap = ensureGrid();
      wrap.style.display = '';
      const grid = document.getElementById('validationHoldKendoGrid');
      grid.classList.remove('loaded');
      grid.classList.add('loading');
      setTimeout(() => {
        state.rows = HOLDS.filter(h => !q || byId[h.patientId].name.toLowerCase().includes(q));
        state.page = 1;
        renderBody();
        grid.classList.remove('loading');
        grid.classList.add('loaded');
      }, lab.delay);
    }

    document.getElementById('validationHoldForm').addEventListener('submit', e => { e.preventDefault(); search(); });
    document.getElementById('btnClear').addEventListener('click', () => {
      document.getElementById('validationHoldForm').reset();
      if (lab.mount === 'hide') { const w = document.getElementById('vhGridWrap'); if (w) w.style.display = 'none'; }
      else host.innerHTML = '<p class="empty-note">Run a search to load holds.</p>';
    });
    document.addEventListener('click', e => { if (!e.target.closest('.actions-wrap')) document.querySelectorAll('.actions-menu').forEach(m => m.remove()); });
  }

  // ---------- Patient Record page ----------
  function initPatientRecord() {
    const qs = new URLSearchParams(location.search);
    const p = byId[qs.get('patient')] || PATIENTS[0];
    document.getElementById('patientName').textContent = p.name + ' (' + p.mrn + ')';
    document.getElementById('patientHeader').innerHTML = '<span><b>MRN:</b> ' + esc(p.mrn) + '</span><span><b>Payor:</b> ' + (esc(p.payor) || '&mdash;') + '</span><span><b>Plan:</b> ' + (esc(p.plan) || '&mdash;') + '</span>';
    document.getElementById('careLocation').textContent = p.careLocation;
    document.getElementById('levelOfCare').textContent = p.loc;
    document.getElementById('admissionId').textContent = qs.get('admission') || '—';
    document.getElementById('payor').textContent = p.payor || '—';
  }

  function boot() {
    const page = document.body.dataset.page;
    if (page === 'validation-hold') initValidationHold();
    if (page === 'patient-record') initPatientRecord();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
