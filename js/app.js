/**
 * UPI Global Tracker — app.js
 *
 * Loads all data from /data/*.json at startup, then renders
 * every section. To update content, edit the JSON files only —
 * never touch this file or index.html for data changes.
 */

'use strict';

// ─── State ────────────────────────────────────────────────────────────────────

const DATA = {
  config: null,
  countries: [],
  banks: [],
  networks: [],
  merchants: [],
  timeline: [],
  insights: [],
};

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function loadAllData() {
  const [config, countries, banks, networks, merchants, timeline, insights] =
    await Promise.all([
      fetchJSON('data/config.json'),
      fetchJSON('data/countries.json'),
      fetchJSON('data/banks.json'),
      fetchJSON('data/networks.json'),
      fetchJSON('data/merchants.json'),
      fetchJSON('data/timeline.json'),
      fetchJSON('data/insights.json'),
    ]);

  DATA.config    = config;
  DATA.countries = countries;
  DATA.banks     = banks;
  DATA.networks  = networks;
  DATA.merchants = merchants;
  DATA.timeline  = timeline;
  DATA.insights  = insights;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function go(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const nb = document.getElementById('nav-' + id);
  if (nb) nb.classList.add('active');
  window.scrollTo(0, 0);
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function toast(icon, title, sub) {
  document.getElementById('t-icon').textContent  = icon;
  document.getElementById('t-title').textContent = title;
  document.getElementById('t-sub').textContent   = sub;
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3400);
}

// ─── Web3Forms helper ─────────────────────────────────────────────────────────

function w3f(payload, ok, fail) {
  payload.access_key = DATA.config.web3formsKey;
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(r => r.json())
    .then(d => (d.success ? ok() : fail(d.message || 'Error')))
    .catch(e => fail(e.message || 'Network error'));
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function statusHTML(s) {
  const labels = { live: 'Live', pilot: 'Pilot', mou: 'MoU Signed', planned: 'Planned' };
  return `<span class="status ${s}"><span class="sdot"></span>${labels[s] || s}</span>`;
}

function tagHTML(text, type) {
  return `<span class="tt ${type}">${text}</span>`;
}

// ─── Render: Config (stats bar + latest news) ─────────────────────────────────

function renderConfig() {
  const cfg = DATA.config;

  // Badge date
  document.querySelectorAll('.js-last-updated').forEach(el => {
    el.textContent = 'Live Tracker · Updated ' + cfg.lastUpdated;
  });

  // Latest news bar
  const hbar = document.getElementById('latest-news');
  if (hbar) hbar.innerHTML = '<strong>Latest:</strong> ' + cfg.latestNews;

  // Stats bar
  const statsBar = document.getElementById('stats-bar');
  if (statsBar) {
    statsBar.innerHTML = cfg.stats
      .map(s => `<div class="stat-item">
        <span class="stat-num">${s.value}</span>
        <div class="stat-label">${s.label}</div>
      </div>`)
      .join('');
  }

  // UPI ID in contribute section
  document.querySelectorAll('.js-upi-id').forEach(el => {
    el.textContent = cfg.upiId;
  });
}

// ─── Render: Countries ────────────────────────────────────────────────────────

function renderCountries(filter) {
  const list = DATA.countries.filter(c =>
    filter === 'all' || c.s === filter || c.r === filter
  );

  const regionLabel = r =>
    r === 'middleeast' ? 'Middle East' : r.charAt(0).toUpperCase() + r.slice(1);

  document.getElementById('cgrid').innerHTML = list.map(c => `
    <div class="ccard ${c.s}">
      <div class="ctop">
        <div>
          <div class="cflag">${c.f}</div>
          <div class="cname">${c.n}</div>
          <div class="creg">${regionLabel(c.r)}</div>
        </div>
        ${statusHTML(c.s)}
      </div>
      <div class="cnote">${c.note}</div>
      <div class="cstats">
        <div><div class="csn">${c.m}</div><div class="csl">Merchants</div></div>
        <div><div class="csn">${c.y}</div><div class="csl">Since</div></div>
      </div>
      <div class="cnets">
        ${c.nets.map(n => `<span class="ntag">${n}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// ─── Render: Table (banks or networks) ───────────────────────────────────────

function renderTable(data, tbodyId) {
  document.getElementById(tbodyId).innerHTML = data.map(b => `
    <div class="trow">
      <div class="einfo">
        <div class="eflag">🏦</div>
        <div>
          <div class="ename">${b.n}</div>
          <div class="esub">${b.p}</div>
        </div>
      </div>
      <div class="cell hl">${b.c}</div>
      <div class="cell">${b.p}</div>
      <div>${tagHTML(b.t, b.t)}</div>
      <div class="cell" style="font-family:monospace">${b.y}</div>
      <div>${statusHTML(b.s)}</div>
    </div>
  `).join('');
}

// ─── Render: Merchants ────────────────────────────────────────────────────────

function renderMerchants() {
  document.getElementById('mgrid').innerHTML = DATA.merchants.map(m => `
    <div class="mcard">
      <div class="mname">${m.n}</div>
      <div class="mloc">${m.l}</div>
      <div class="mmeta">
        ${m.tags.map(t => tagHTML(t, 'merchant')).join('')}
      </div>
    </div>
  `).join('');
}

// ─── Render: Timeline ────────────────────────────────────────────────────────

function renderTimeline() {
  const L = DATA.timeline.filter((_, i) => i % 2 === 0);
  const R = DATA.timeline.filter((_, i) => i % 2 !== 0);

  const mkItems = arr => arr.map(t => `
    <div class="titem">
      <div class="tdot"></div>
      <div class="tdate">${t.d}</div>
      <div class="ttl">${t.t}</div>
      <div class="tdesc">${t.x}</div>
    </div>
  `).join('');

  document.getElementById('tleft').innerHTML  = mkItems(L);
  document.getElementById('tright').innerHTML = mkItems(R);
}

// ─── Render: Insights ────────────────────────────────────────────────────────

function renderInsights() {
  document.getElementById('igrid').innerHTML = DATA.insights.map(ins => `
    <div class="icard">
      <div class="iico">${ins.i}</div>
      <div class="ititle">${ins.t}</div>
      <div class="itext">${ins.x}</div>
    </div>
  `).join('');
}

// ─── Event wiring ─────────────────────────────────────────────────────────────

function wireEvents() {
  // Navigation
  document.getElementById('js-logo').addEventListener('click', () => go('tracker'));
  ['tracker', 'about', 'api', 'submit', 'contact'].forEach(id => {
    document.getElementById('nav-' + id).addEventListener('click', () => go(id));
  });
  document.getElementById('nav-cta').addEventListener('click', () => go('submit'));
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => go(el.getAttribute('data-goto')));
  });

  // Country filters
  document.querySelectorAll('.fbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCountries(btn.getAttribute('data-filter'));
    });
  });

  // Banks search
  document.getElementById('bsearch').addEventListener('input', function () {
    const q = this.value.toLowerCase();
    renderTable(
      DATA.banks.filter(b =>
        !q ||
        b.n.toLowerCase().includes(q) ||
        b.c.toLowerCase().includes(q) ||
        b.p.toLowerCase().includes(q)
      ),
      'btbody'
    );
  });

  // Banks / Networks tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tid = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tc').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tid).classList.add('active');
      if (tid === 'ntab') renderTable(DATA.networks, 'ntbody');
    });
  });

  // UPI copy buttons
  function copyUPI(btn) {
    try { navigator.clipboard.writeText(DATA.config.upiId); } catch (e) { /* */ }
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = '#00b070';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2000);
    toast('Copied', 'UPI ID Copied!', 'Paste it in any UPI app to contribute.');
  }
  document.getElementById('copy1').addEventListener('click', function () { copyUPI(this); });
  document.getElementById('copy2').addEventListener('click', function () { copyUPI(this); });

  // API notify form
  document.getElementById('notify-btn').addEventListener('click', function () {
    const e = document.getElementById('nemail').value;
    if (!e) { toast('!', 'Enter your email', 'We need your email to notify you.'); return; }
    const btn = this;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    w3f(
      { subject: 'API Notification Signup', email: e, message: 'API launch notification request\n\nEmail: ' + e },
      () => {
        document.querySelector('.nform').style.display = 'none';
        document.getElementById('notify-ok').style.display = 'block';
        toast('Done', 'On the list!', 'We will email you when the API launches.');
      },
      err => { btn.textContent = 'Notify Me'; btn.disabled = false; toast('Error', 'Failed', 'Try again: ' + err); }
    );
  });

  document.getElementById('uc-contact-link').addEventListener('click', () => go('contact'));

  // Submit page — type selector
  document.querySelectorAll('.utype').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.utype').forEach(e => e.classList.remove('sel'));
      el.classList.add('sel');
    });
  });

  // Submit form
  document.getElementById('btn-sub').addEventListener('click', function () {
    const n = document.getElementById('s-name').value;
    const e = document.getElementById('s-email').value;
    if (!n || !e) { toast('!', 'Name & email required', 'Please fill in your name and email.'); return; }
    const sel  = document.querySelector('.utype.sel');
    const type = sel ? sel.querySelector('.utlabel').textContent : 'Not specified';
    const btn  = this;
    btn.textContent = 'Submitting...';
    btn.disabled = true;
    w3f(
      {
        subject: `Tracker Submission: ${type} (${document.getElementById('s-country').value})`,
        email: e,
        message: [
          'TYPE: '        + type,
          'COUNTRY: '     + document.getElementById('s-country').value,
          'STATUS: '      + document.getElementById('s-status').value,
          'ENTITY: '      + document.getElementById('s-entity').value,
          'DESCRIPTION: ' + document.getElementById('s-desc').value,
          'SOURCE: '      + document.getElementById('s-source').value,
          'FROM: '        + n + ' (' + e + ')',
        ].join('\n'),
      },
      () => {
        btn.textContent = 'Submit Update for Review';
        btn.disabled = false;
        document.getElementById('ucard2').style.display = 'none';
        document.getElementById('smsg').classList.add('visible');
        toast('Sent', 'Submitted!', 'Sent to support@upitracker.in');
      },
      err => { btn.textContent = 'Submit Update for Review'; btn.disabled = false; toast('Error', 'Failed', 'Try again: ' + err); }
    );
  });

  document.getElementById('reset-submit').addEventListener('click', () => {
    document.getElementById('ucard2').style.display = 'block';
    document.getElementById('smsg').classList.remove('visible');
    ['s-name', 's-email', 's-country', 's-entity', 's-desc', 's-source'].forEach(id => {
      document.getElementById(id).value = '';
    });
  });

  // Contact form
  document.getElementById('cmsg').addEventListener('input', function () {
    document.getElementById('ccount').textContent = this.value.length + ' / 2000';
  });

  document.getElementById('btn-send').addEventListener('click', function () {
    const n = document.getElementById('cname').value;
    const e = document.getElementById('cemail').value;
    const m = document.getElementById('cmsg').value;
    if (!n || !e || !m) { toast('!', 'Fill all fields', 'Name, email and message are required.'); return; }
    const btn = this;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    w3f(
      {
        subject: '[' + (document.getElementById('ccat').value || 'General') + '] ' + document.getElementById('csub').value,
        name: n, email: e,
        message: 'FROM: ' + n + ' (' + e + ')\n\n' + m,
      },
      () => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
        document.getElementById('cform-body').style.display = 'none';
        document.getElementById('sent-ok').classList.add('visible');
        toast('Sent', 'Message Sent!', 'Delivered to support@upitracker.in');
      },
      err => { btn.textContent = 'Send Message'; btn.disabled = false; toast('Error', 'Failed to send', 'Try again: ' + err); }
    );
  });

  document.getElementById('reset-contact').addEventListener('click', () => {
    document.getElementById('cform-body').style.display = 'block';
    document.getElementById('sent-ok').classList.remove('visible');
    ['cname', 'cemail', 'csub', 'cmsg'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('ccount').textContent = '0 / 2000';
    document.getElementById('ccat').value = '';
  });

  // Contact quick-links
  const QDATA = [
    ['Data Correction',     'Correction needed',      'I noticed an error in the tracker regarding...'],
    ['Partnership / Media', 'Partnership Inquiry',     'We would like to explore a partnership...'],
    ['API / Developer',     'API Access Query',        'I need API access for...'],
    ['Partnership / Media', 'Media Inquiry',           'We are reporting on UPI expansion and...'],
    ['Enterprise Licensing','Enterprise Licensing',    'We are interested in licensing UPI tracker data for...'],
  ];
  document.querySelectorAll('.qlink').forEach(link => {
    link.addEventListener('click', () => {
      const d = QDATA[parseInt(link.getAttribute('data-q'))];
      document.getElementById('ccat').value  = d[0];
      document.getElementById('csub').value  = d[1];
      document.getElementById('cmsg').value  = d[2];
      document.getElementById('ccount').textContent = d[2].length + ' / 2000';
    });
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  try {
    await loadAllData();

    renderConfig();
    renderCountries('all');
    renderTable(DATA.banks, 'btbody');
    renderMerchants();
    renderTimeline();
    renderInsights();

    wireEvents();
  } catch (err) {
    console.error('UPI Tracker failed to load data:', err);
    // Show a user-friendly error in the stats bar area
    const statsBar = document.getElementById('stats-bar');
    if (statsBar) {
      statsBar.innerHTML = `<div style="padding:20px;color:#FF6B35;font-size:13px;">
        ⚠️ Could not load tracker data. If running locally, use a local server (e.g. <code>npx serve .</code>).
      </div>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
