/* Interview Tracker – vanilla JS PWA (Supabase optional, localStorage demo fallback) */
(() => {
'use strict';

const CFG = window.APP_CONFIG || {};
const P = CFG.PROFILE || {};

/* ============================ helpers ============================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + Math.random().toString(16).slice(2));
const pad = (n) => String(n).padStart(2, '0');

const ICONS = {
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22 6 12 13 2 6"/>',
  chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'
};
Object.assign(ICONS, {
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'
});
const MODE_IC = { Video: 'video', Phone: 'phone', Onsite: 'pin' };
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ---------- dates ---------- */
const todayStr = (off = 0) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fmtDT = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const o = { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };
  if (d.getFullYear() !== new Date().getFullYear()) o.year = 'numeric';
  return d.toLocaleString('en-IN', o);
};
const fmtD = (s) => (s ? new Date(s + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '');
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

/* ---------- contact links ---------- */
const digits = (p) => String(p || '').replace(/\D/g, '');
const intl = (p) => { let d = digits(p); if (d.startsWith('0')) d = d.slice(1); if (d.length === 10) d = '91' + d; return d; };
const telHref = (p) => 'tel:+' + intl(p);
const waHref = (p, t) => `https://wa.me/${p ? intl(p) : ''}?text=${encodeURIComponent(t || '')}`;
const mailHref = (to, s, b) => `mailto:${encodeURIComponent(to || '')}?subject=${encodeURIComponent(s || '')}&body=${encodeURIComponent(String(b || '').replace(/\n/g, '\r\n'))}`;
const resumeUrl = () => new URL(P.resume || 'resume.pdf', location.href).href;

/* ============================ constants ============================ */
const STATUS = {
  applied: 'Applied', scheduled: 'Scheduled', rescheduled: 'Rescheduled', completed: 'Completed',
  awaiting: 'Awaiting feedback', hold: 'On hold', selected: 'Selected', rejected: 'Rejected', cancelled: 'Cancelled'
};
const FINAL = ['selected', 'rejected', 'cancelled'];
const ROUNDS = ['Screening', 'HR', 'Technical L1', 'Technical L2', 'Managerial', 'Client', 'Final', 'Other'];
const MODES = ['Video', 'Phone', 'Onsite'];
const FILTERS = [
  ['all', 'All'], ['upcoming', 'Upcoming'], ['awaiting', 'Awaiting'], ['due', 'Follow-up due'], ['closed', 'Closed']
];

const sign = () =>
  `Regards,\n${P.name}\n${P.phone}\n${P.email}\nPortfolio: ${P.portfolio}\nLinkedIn: ${P.linkedin}`;

const TEMPLATES = [
  { id: 'confirm', label: 'Confirm interview',
    subject: 'Confirmation: {round} interview for {role} – {company}',
    body: 'Hi {hr},\n\nThank you for scheduling the {round} interview for the {role} position at {company} ({date}). I am confirming my availability and will be ready on time.\n\nPlease share the meeting link / venue details and any documents I should keep ready.' },
  { id: 'thanks', label: 'Thank you',
    subject: 'Thank you – {role} interview at {company}',
    body: 'Hi {hr},\n\nThank you for the opportunity to interview for the {role} role at {company}. I enjoyed the discussion and remain very interested in the position.\n\nPlease let me know if you need any additional information from my side. I look forward to the next steps.' },
  { id: 'status', label: 'Ask for update',
    subject: 'Follow-up: {role} interview status – {company}',
    body: 'Hi {hr},\n\nI hope you are doing well. I wanted to follow up on my {round} interview for the {role} position at {company} ({date}).\n\nCould you please share an update on the feedback or the next steps? I remain very interested in the opportunity.' },
  { id: 'nextround', label: 'Next round',
    subject: 'Next round scheduling – {role} at {company}',
    body: 'Hi {hr},\n\nThank you for the positive update on the {role} process at {company}. I am keen to proceed to the next round.\n\nCould you please share the schedule and format of the next round? I am flexible with timings and will adjust to the panel\'s availability.' },
  { id: 'reschedule', label: 'Reschedule',
    subject: 'Request to reschedule: {role} interview – {company}',
    body: 'Hi {hr},\n\nThank you for arranging the {round} interview for the {role} position at {company} ({date}). Unfortunately, I will not be able to attend at the scheduled time due to an unavoidable commitment.\n\nCould we please reschedule to another slot? I am available on [preferred dates / time]. I apologise for the inconvenience and appreciate your understanding.' },
  { id: 'cancel', label: 'Cancel / withdraw',
    subject: 'Withdrawing my application – {role}, {company}',
    body: 'Hi {hr},\n\nThank you for considering me for the {role} position at {company}. After careful thought, I would like to withdraw my application / cancel the interview process at this time.\n\nI sincerely appreciate your time and the opportunity, and I hope we can stay in touch for future roles.' },
  { id: 'resume', label: 'Share resume',
    subject: 'Resume – {role} application, {company}',
    body: 'Hi {hr},\n\nAs requested, please find my updated resume attached for the {role} position at {company}.\n\nA quick summary: 5+ years of experience in Python, Django, DRF, MySQL, Redis, Celery and real-time systems. My portfolio and LinkedIn links are below for reference.\n\nPlease let me know if you need anything else.' },
  { id: 'details', label: 'Ask for details',
    subject: 'Request for interview details – {role}, {company}',
    body: 'Hi {hr},\n\nI am looking forward to the {round} interview for the {role} position at {company} ({date}).\n\nCould you please share the meeting link / venue, the panel details, and the job description so I can prepare accordingly?' },
  { id: 'nudge', label: 'Gentle reminder',
    subject: 'Gentle reminder: {role} – {company}',
    body: 'Hi {hr},\n\nI am following up on my earlier message regarding the {role} position at {company}. I understand schedules can be busy, and I would appreciate a quick update whenever convenient.\n\nThank you for your time.' }
];
const SUGGEST = {
  applied: 'resume', scheduled: 'confirm', rescheduled: 'confirm', completed: 'thanks', awaiting: 'status',
  hold: 'nudge', selected: 'details', rejected: 'thanks', cancelled: 'cancel'
};

/* ============================ data layer ============================ */
let sb = null;
const useSB = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
const store = {
  get: (t) => { try { return JSON.parse(localStorage.getItem('it_' + t) || '[]'); } catch { return []; } },
  set: (t, v) => localStorage.setItem('it_' + t, JSON.stringify(v))
};
const api = {
  async list(t) {
    if (!useSB) return store.get(t);
    const { data, error } = await sb.from(t).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async save(t, row) {
    if (!useSB) {
      const rows = store.get(t);
      if (row.id) { const i = rows.findIndex((r) => r.id === row.id); rows[i] = { ...rows[i], ...row }; store.set(t, rows); return rows[i]; }
      const n = { ...row, id: uid(), created_at: new Date().toISOString() };
      rows.unshift(n); store.set(t, rows); return n;
    }
    const q = row.id ? sb.from(t).update(row).eq('id', row.id) : sb.from(t).insert(row);
    const { data, error } = await q.select().single();
    if (error) throw error;
    return data;
  },
  async del(t, id) {
    if (!useSB) {
      store.set(t, store.get(t).filter((r) => r.id !== id));
      if (t === 'companies') store.set('interviews', store.get('interviews').filter((r) => r.company_id !== id));
      return;
    }
    const { error } = await sb.from(t).delete().eq('id', id);
    if (error) throw error;
  }
};

/* ============================ state ============================ */
const S = {
  tab: 'interviews', filter: 'all', q: '',
  companies: [], interviews: [],
  fu: { id: null, tpl: null, subject: '', body: '' },
  share: { phone: true, email: true, portfolio: true, linkedin: true, resume: true, toPhone: '', toMail: '', text: null }
};
const companyOf = (i) => S.companies.find((c) => c.id === i.company_id);
const findI = (id) => S.interviews.find((i) => i.id === id);
const isDue = (i) => i.followup_on && i.followup_on <= todayStr() && !FINAL.includes(i.status);

async function loadAll() {
  try {
    [S.companies, S.interviews] = await Promise.all([api.list('companies'), api.list('interviews')]);
  } catch (e) { toast('Could not load data: ' + (e.message || e)); }
}

/* ============================ UI utilities ============================ */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch {} ta.remove();
  }
  toast('Copied to clipboard');
}
function openSheet(title, html) {
  $('#sheet').innerHTML = `<div class="sheet-wrap" data-act="closeSheet"><div class="sheet" role="dialog" aria-label="${esc(title)}">
    <div class="grab"></div><div class="sheet-head"><h2>${esc(title)}</h2><button class="icon-btn" data-act="closeSheet" aria-label="Close">${ic('x')}</button></div>${html}</div></div>`;
  document.body.style.overflow = 'hidden';
}
function closeSheet() { $('#sheet').innerHTML = ''; document.body.style.overflow = ''; }
const opts = (list, sel) => list.map((v) => `<option ${v === sel ? 'selected' : ''}>${esc(v)}</option>`).join('');

/* ============================ views ============================ */
const NAV = [['interviews', 'list', 'Interviews'], ['followup', 'send', 'Follow-up'], ['companies', 'building', 'Contacts'], ['profile', 'share', 'Share']];

function renderShell() {
  $('#nav').innerHTML = `<div class="brand"><img src="icons/icon-192.png" alt="">Interview Tracker</div>` +
    NAV.map(([k, i, l]) => `<button data-act="tab" data-id="${k}" data-tab="${k}">${ic(i)}<span>${l}</span></button>`).join('');
  $('#fab').innerHTML = ic('plus');
}

let enterT;
function render(keepScroll) {
  const v = { interviews: vInterviews, followup: vFollowup, companies: vCompanies, profile: vProfile }[S.tab];
  $('#view').innerHTML = v();
  $$('.nav button').forEach((b) => b.classList.toggle('on', b.dataset.tab === S.tab));
  $('#fab').hidden = !['interviews', 'companies'].includes(S.tab);
  $('#fab').setAttribute('aria-label', S.tab === 'companies' ? 'Add company' : 'Add interview');
  if (!keepScroll) {
    const vw = $('#view'); vw.classList.remove('enter'); void vw.offsetWidth; vw.classList.add('enter');
    clearTimeout(enterT); enterT = setTimeout(() => vw.classList.remove('enter'), 900);
    window.scrollTo(0, 0);
  }
}

/* ---------- interviews ---------- */
function filtered() {
  const q = S.q.trim().toLowerCase();
  let rows = S.interviews.filter((i) => {
    if (S.filter === 'upcoming' && !['scheduled', 'rescheduled'].includes(i.status)) return false;
    if (S.filter === 'awaiting' && !['completed', 'awaiting'].includes(i.status)) return false;
    if (S.filter === 'due' && !isDue(i)) return false;
    if (S.filter === 'closed' && !FINAL.includes(i.status)) return false;
    if (q) { const c = companyOf(i) || {}; return `${c.name} ${i.role} ${i.round}`.toLowerCase().includes(q); }
    return true;
  });
  const key = (i) => i.interview_at || i.created_at || '';
  rows.sort((a, b) => (S.filter === 'upcoming' ? key(a).localeCompare(key(b)) : key(b).localeCompare(key(a))));
  return rows;
}

function card(i, n) {
  const c = companyOf(i) || {};
  const due = isDue(i);
  return `<article class="card" style="--i:${Math.min(n || 0, 10)}" data-act="edit" data-id="${i.id}">
    <div class="card-top">
      <div class="row"><div class="avatar">${esc((c.name || '?').trim()[0]?.toUpperCase())}</div>
        <div><h3>${esc(c.name || 'Unknown company')}</h3><p class="role">${esc(i.role)}${i.round ? ' · ' + esc(i.round) : ''}</p></div></div>
      <span class="badge s-${i.status}">${STATUS[i.status] || i.status}</span>
    </div>
    <div class="meta">
      <span>${ic('calendar', 'sm')}${i.interview_at ? esc(fmtDT(i.interview_at)) : 'Date not set'}</span>
      ${i.mode ? `<span>${ic(MODE_IC[i.mode] || 'clock', 'sm')}${esc(i.mode)}</span>` : ''}
      ${i.followup_on ? `<span class="${due ? 'due' : ''}">${ic('send', 'sm')}Follow up ${esc(fmtD(i.followup_on))}${due ? ' · due' : ''}</span>` : ''}
    </div>
    <div class="actions">
      ${c.hr_phone ? `<a class="btn sm" href="${telHref(c.hr_phone)}">${ic('phone', 'sm')}Call</a>` : `<span class="btn sm off">${ic('phone', 'sm')}Call</span>`}
      ${c.hr_phone ? `<a class="btn sm" href="${waHref(c.hr_phone)}" target="_blank" rel="noopener">${ic('chat', 'sm')}WhatsApp</a>` : `<span class="btn sm off">${ic('chat', 'sm')}WhatsApp</span>`}
      <button class="btn sm pri" data-act="follow" data-id="${i.id}">${ic('send', 'sm')}Follow up</button>
    </div>
  </article>`;
}

function listHtml() {
  const rows = filtered();
  if (!rows.length) {
    return S.interviews.length
      ? `<div class="empty">${ic('search')}<h3>No matches</h3><p>Try another filter or search term.</p></div>`
      : `<div class="empty">${ic('briefcase')}<h3>No interviews yet</h3><p>Add your first interview to start tracking dates, HR contacts and follow-ups.</p><button class="btn pri" data-act="add">${ic('plus')}Add interview</button></div>`;
  }
  return rows.map(card).join('');
}

function vInterviews() {
  const up = S.interviews.filter((i) => ['scheduled', 'rescheduled'].includes(i.status)).length;
  const aw = S.interviews.filter((i) => ['completed', 'awaiting'].includes(i.status)).length;
  const due = S.interviews.filter(isDue).length;
  const st = (n, l, f, icon, tone) => `<button class="stat ${tone}" data-act="filter" data-id="${f}"><div class="stat-ic">${ic(icon)}</div><b>${n}</b><span>${l}</span></button>`;
  const initials = (P.name || '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return `<header class="top top-row"><div><p class="eyebrow">${greeting()}, ${esc((P.name || '').split(' ')[0])}</p><h1>Interviews</h1></div><div class="me" title="${esc(P.name)}">${esc(initials)}</div></header>
    <section class="stats">${st(up, 'Upcoming', 'upcoming', 'calendar', 't-indigo')}${st(aw, 'Awaiting', 'awaiting', 'clock', 't-amber')}${st(due, 'Follow-ups due', 'due', 'bell', due ? 't-red' : 't-green')}</section>
    <div class="search">${ic('search')}<input id="q" type="search" placeholder="Search company or role" value="${esc(S.q)}" autocomplete="off"></div>
    <div class="chips scroll">${FILTERS.map(([k, l]) => `<button class="chip ${S.filter === k ? 'on' : ''}" data-act="filter" data-id="${k}">${l}</button>`).join('')}</div>
    <section class="list" id="list">${listHtml()}</section>`;
}

/* ---------- companies ---------- */
function vCompanies() {
  const items = [...S.companies].sort((a, b) => a.name.localeCompare(b.name)).map((c) => {
    const n = S.interviews.filter((i) => i.company_id === c.id).length;
    return `<article class="card" data-act="editCompany" data-id="${c.id}">
      <div class="card-top"><div class="row"><div class="avatar">${esc(c.name[0]?.toUpperCase())}</div>
        <div><h3>${esc(c.name)}</h3><p class="role">${c.hr_name ? esc(c.hr_name) + ' · HR' : 'No HR contact saved'}</p></div></div>
        <span class="badge s-applied">${n} interview${n === 1 ? '' : 's'}</span></div>
      <div class="meta">${c.hr_phone ? `<span>${ic('phone', 'sm')}${esc(c.hr_phone)}</span>` : ''}${c.hr_email ? `<span>${ic('mail', 'sm')}${esc(c.hr_email)}</span>` : ''}</div>
      <div class="actions">
        ${c.hr_phone ? `<a class="btn sm" href="${telHref(c.hr_phone)}">${ic('phone', 'sm')}Call</a>` : `<span class="btn sm off">${ic('phone', 'sm')}Call</span>`}
        ${c.hr_email ? `<a class="btn sm" href="mailto:${esc(c.hr_email)}">${ic('mail', 'sm')}Mail</a>` : `<span class="btn sm off">${ic('mail', 'sm')}Mail</span>`}
        ${c.hr_phone ? `<a class="btn sm" href="${waHref(c.hr_phone)}" target="_blank" rel="noopener">${ic('chat', 'sm')}WhatsApp</a>` : `<span class="btn sm off">${ic('chat', 'sm')}WhatsApp</span>`}
      </div></article>`;
  }).join('');
  return `<header class="top"><p class="eyebrow">HR directory</p><h1>Contacts</h1><p class="sub">Companies and recruiter details. Tap a card to edit.</p></header>
    <section class="list">${items || `<div class="empty">${ic('building')}<h3>No companies yet</h3><p>Add a company with its HR contact for one-tap call, mail and WhatsApp.</p><button class="btn pri" data-act="add">${ic('plus')}Add company</button></div>`}</section>`;
}

/* ---------- follow-up ---------- */
function fillFu(tplId) {
  const i = findI(S.fu.id); if (!i) return;
  const c = companyOf(i) || {};
  const t = TEMPLATES.find((x) => x.id === tplId) || TEMPLATES[0];
  const map = { hr: c.hr_name || 'Team', company: c.name || 'your company', role: i.role || 'the', round: (i.round || '').trim() || 'scheduled', date: i.interview_at ? 'on ' + fmtDT(i.interview_at) : 'date to be confirmed' };
  const sub = (s) => s.replace(/\{(\w+)\}/g, (_, k) => map[k] ?? '');
  S.fu.tpl = t.id; S.fu.subject = sub(t.subject); S.fu.body = sub(t.body) + '\n\n' + sign();
}
function ensureFu() {
  if (!S.interviews.length) return;
  if (!findI(S.fu.id)) {
    const pick = S.interviews.find(isDue) || S.interviews[0];
    S.fu.id = pick.id; fillFu(SUGGEST[pick.status] || 'status');
  }
}
function vFollowup() {
  ensureFu();
  if (!S.interviews.length) {
    return `<header class="top"><p class="eyebrow">Smart templates</p><h1>Follow-up</h1></header><div class="empty">${ic('send')}<h3>Nothing to follow up yet</h3><p>Add an interview first, then pick a ready-made message here.</p></div>`;
  }
  const i = findI(S.fu.id), c = companyOf(i) || {};
  const sug = SUGGEST[i.status];
  return `<header class="top"><p class="eyebrow">Smart templates</p><h1>Follow-up</h1><p class="sub">Pick an interview and a situation. Edit the message, then send.</p></header>
    <div class="panel">
      <div class="field"><label for="fuInt">Interview</label><select id="fuInt">${[...S.interviews].map((x) => `<option value="${x.id}" ${x.id === S.fu.id ? 'selected' : ''}>${esc((companyOf(x) || {}).name || '?')} – ${esc(x.role)} (${STATUS[x.status]})</option>`).join('')}</select></div>
      <p class="lbl" style="margin-bottom:8px">Situation</p>
      <div class="chips wrap">${TEMPLATES.map((t) => `<button class="chip ${S.fu.tpl === t.id ? 'on' : ''}" data-act="tpl" data-id="${t.id}">${t.label}${t.id === sug ? '<span class="tag">Suggested</span>' : ''}</button>`).join('')}</div>
    </div>
    <div class="panel">
      <div class="recipient">
        <span>${ic('user', 'sm')}${esc(c.hr_name || 'No HR name')}</span>
        <span>${ic('mail', 'sm')}${esc(c.hr_email || 'No email saved')}</span>
        <span>${ic('phone', 'sm')}${esc(c.hr_phone || 'No phone saved')}</span>
        ${!c.hr_email || !c.hr_phone ? `<button class="chip" data-act="editCompany" data-id="${c.id}">Add contact</button>` : ''}
      </div>
      <div class="field"><label for="fuSub">Subject</label><input type="text" id="fuSub" value="${esc(S.fu.subject)}"></div>
      <div class="field"><label for="fuBody">Message</label><textarea id="fuBody" rows="13">${esc(S.fu.body)}</textarea></div>
      <div class="btn-row">
        <button class="btn pri" data-act="fuMail">${ic('mail')}Send mail</button>
        <button class="btn" data-act="fuWa">${ic('chat')}WhatsApp</button>
        <button class="btn" data-act="fuCopy">${ic('copy')}Copy</button>
        <button class="btn" data-act="fuResume">${ic('file')}Share resume PDF</button>
      </div>
      <p class="hint">Mail apps cannot attach files automatically. Use “Share resume PDF” to send the file itself, or the resume link is in Share.</p>
    </div>
    <div class="panel"><h2>After sending, schedule the next follow-up</h2>
      <div class="chips wrap" style="margin:0">
        <button class="chip" data-act="snooze" data-id="2">in 2 days</button><button class="chip" data-act="snooze" data-id="3">in 3 days</button>
        <button class="chip" data-act="snooze" data-id="7">in 1 week</button><button class="chip" data-act="snooze" data-id="0">Clear</button>
      </div>${i.followup_on ? `<p class="hint">Currently set for ${esc(fmtD(i.followup_on))}.</p>` : ''}</div>`;
}

/* ---------- share / profile ---------- */
const SHARE_ITEMS = [
  ['phone', 'Phone', () => P.phone], ['email', 'Email', () => P.email], ['portfolio', 'Portfolio', () => P.portfolio],
  ['linkedin', 'LinkedIn', () => P.linkedin], ['resume', 'Resume (PDF link)', () => resumeUrl()]
];
function profileText() {
  const s = S.share, L = [];
  L.push(`${P.name} – ${P.title}`);
  if (s.phone) L.push(`Phone: ${P.phone}`);
  if (s.email) L.push(`Email: ${P.email}`);
  if (s.portfolio) L.push(`Portfolio: ${P.portfolio}`);
  if (s.linkedin) L.push(`LinkedIn: ${P.linkedin}`);
  if (s.resume) L.push(`Resume: ${resumeUrl()}`);
  return L.join('\n');
}
function vProfile() {
  if (S.share.text === null) S.share.text = profileText();
  const withContact = S.companies.filter((c) => c.hr_phone || c.hr_email);
  return `<header class="top"><p class="eyebrow">Send to recruiters</p><h1>Share details</h1><p class="sub">Select what to include, then copy or send.</p></header>
    <div class="panel"><h2>Include</h2>
      ${SHARE_ITEMS.map(([k, l, v]) => `<label class="check"><input type="checkbox" data-share="${k}" ${S.share[k] ? 'checked' : ''}><div><b>${l}</b><small>${esc(v())}</small></div></label>`).join('')}
      <div class="chips" style="margin:10px 0 0"><button class="chip" data-act="shAll">Select all</button><button class="chip" data-act="shNone">Clear</button></div>
    </div>
    <div class="panel"><h2>Preview</h2>
      <textarea id="shText" rows="8">${esc(S.share.text)}</textarea>
      <div class="field" style="margin-top:12px"><label for="shCo">Send to (optional)</label>
        <select id="shCo"><option value="">Choose a saved HR contact…</option>${withContact.map((c) => `<option value="${c.id}">${esc(c.name)}${c.hr_name ? ' – ' + esc(c.hr_name) : ''}</option>`).join('')}</select></div>
      <div class="grid2"><div class="field"><label for="shPhone">WhatsApp number</label><input type="tel" id="shPhone" placeholder="+91…" value="${esc(S.share.toPhone)}"></div>
        <div class="field"><label for="shMail">Email address</label><input type="email" id="shMail" placeholder="hr@company.com" value="${esc(S.share.toMail)}"></div></div>
      <div class="btn-row">
        <button class="btn" data-act="shCopy">${ic('copy')}Copy</button>
        <button class="btn" data-act="shWa">${ic('chat')}WhatsApp</button>
        <button class="btn" data-act="shMail">${ic('mail')}Mail</button>
        <button class="btn" data-act="shNative">${ic('share')}Share…</button>
      </div>
    </div>
    <div class="panel"><h2>Resume file</h2>
      <p class="hint" style="margin:0 0 10px">${esc(P.resume)}</p>
      <div class="btn-row" style="margin-top:0"><button class="btn pri" data-act="shFile">${ic('file')}Share PDF</button>
        <a class="btn" href="${esc(P.resume)}" download>${ic('download')}Download</a></div></div>
    <div class="panel"><h2>Account</h2>
      <p class="hint" style="margin:0 0 10px">${useSB ? `Synced with Supabase${S.user ? ' as ' + esc(S.user.email) : ''}.` : 'Demo mode: data is stored only in this browser. Add your Supabase keys in config.js to sync across devices.'}</p>
      ${useSB ? `<button class="btn block" data-act="signout">${ic('logout')}Sign out</button>` : ''}</div>`;
}

/* ============================ forms ============================ */
function openInterview(id) {
  const i = id ? findI(id) : null;
  const d = i || { status: 'scheduled', round: 'Screening', mode: 'Video' };
  const noCo = !S.companies.length;
  openSheet(i ? 'Edit interview' : 'Add interview', `
  <form data-form="interview"><input type="hidden" name="id" value="${i ? i.id : ''}">
    <div class="field"><label>Company</label>
      <select name="company_id" id="coSel">${S.companies.map((c) => `<option value="${c.id}" ${d.company_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}<option value="__new" ${noCo ? 'selected' : ''}>+ New company…</option></select></div>
    <div class="inline-new" id="newCo" ${noCo ? '' : 'hidden'}>
      <div class="field"><label>Company name</label><input type="text" name="new_name" placeholder="e.g. Infosys"></div>
      <div class="field"><label>HR name</label><input type="text" name="new_hr_name"></div>
      <div class="grid2"><div class="field" style="margin:0"><label>HR phone</label><input type="tel" name="new_hr_phone" placeholder="+91…"></div>
        <div class="field" style="margin:0"><label>HR email</label><input type="email" name="new_hr_email"></div></div></div>
    <div class="field"><label>Role</label><input type="text" name="role" required value="${esc(d.role || '')}" placeholder="Python Backend Developer"></div>
    <div class="grid2"><div class="field"><label>Round</label><select name="round">${opts(ROUNDS, d.round)}</select></div>
      <div class="field"><label>Mode</label><select name="mode">${opts(MODES, d.mode)}</select></div></div>
    <div class="field"><label>Date &amp; time</label><input type="datetime-local" name="interview_at" value="${toLocalInput(d.interview_at)}"></div>
    <div class="grid2"><div class="field"><label>Status</label><select name="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === d.status ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
      <div class="field"><label>Follow up on</label><input type="date" name="followup_on" value="${esc(d.followup_on || '')}"></div></div>
    <div class="field"><label>Notes</label><textarea name="notes" rows="3" style="min-height:80px" placeholder="Panel, topics asked, salary discussion…">${esc(d.notes || '')}</textarea></div>
    <button class="btn pri block" type="submit">${ic('check')}Save</button>
    ${i ? `<button class="btn danger block" type="button" data-act="delInterview" data-id="${i.id}" style="margin-top:10px">Delete interview</button>` : ''}
  </form>`);
}

function openCompany(id) {
  const c = id ? S.companies.find((x) => x.id === id) : {};
  openSheet(id ? 'Edit company' : 'Add company', `
  <form data-form="company"><input type="hidden" name="id" value="${id || ''}">
    <div class="field"><label>Company name</label><input type="text" name="name" required value="${esc(c.name || '')}"></div>
    <div class="field"><label>HR name</label><input type="text" name="hr_name" value="${esc(c.hr_name || '')}"></div>
    <div class="grid2"><div class="field"><label>HR phone</label><input type="tel" name="hr_phone" value="${esc(c.hr_phone || '')}" placeholder="+91…"></div>
      <div class="field"><label>HR email</label><input type="email" name="hr_email" value="${esc(c.hr_email || '')}"></div></div>
    <div class="field"><label>Notes</label><textarea name="notes" rows="3" style="min-height:80px">${esc(c.notes || '')}</textarea></div>
    <button class="btn pri block" type="submit">${ic('check')}Save</button>
    ${id ? `<button class="btn danger block" type="button" data-act="delCompany" data-id="${id}" style="margin-top:10px">Delete company</button>` : ''}
  </form>`);
}

async function submitInterview(form) {
  const f = Object.fromEntries(new FormData(form));
  try {
    let company_id = f.company_id;
    if (company_id === '__new') {
      if (!f.new_name.trim()) return toast('Enter the company name');
      const c = await api.save('companies', { name: f.new_name.trim(), hr_name: f.new_hr_name.trim() || null, hr_phone: f.new_hr_phone.trim() || null, hr_email: f.new_hr_email.trim() || null });
      company_id = c.id;
    }
    const row = {
      company_id, role: f.role.trim(), round: f.round, mode: f.mode,
      interview_at: f.interview_at ? new Date(f.interview_at).toISOString() : null,
      status: f.status, followup_on: f.followup_on || null, notes: f.notes.trim() || null
    };
    if (f.id) row.id = f.id;
    await api.save('interviews', row);
    await loadAll(); closeSheet(); render(true); toast('Saved');
  } catch (e) { toast('Save failed: ' + (e.message || e)); }
}
async function submitCompany(form) {
  const f = Object.fromEntries(new FormData(form));
  try {
    const row = { name: f.name.trim(), hr_name: f.hr_name.trim() || null, hr_phone: f.hr_phone.trim() || null, hr_email: f.hr_email.trim() || null, notes: f.notes.trim() || null };
    if (f.id) row.id = f.id;
    await api.save('companies', row);
    await loadAll(); closeSheet(); render(true); toast('Saved');
  } catch (e) { toast('Save failed: ' + (e.message || e)); }
}

/* ============================ sharing ============================ */
async function shareFile(text) {
  try {
    const res = await fetch(P.resume); if (!res.ok) throw new Error('missing');
    const blob = await res.blob();
    const file = new File([blob], P.resume.split('/').pop(), { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: `${P.name} – Resume`, text: text || '' });
      return;
    }
  } catch (e) { if (e.name === 'AbortError') return; }
  toast('File sharing is not supported here. Sharing the link instead.');
  const msg = `${text ? text + '\n\n' : ''}Resume: ${resumeUrl()}`;
  if (navigator.share) { try { await navigator.share({ title: `${P.name} – Resume`, text: msg }); } catch {} } else copyText(msg);
}
async function nativeShare(text) {
  if (navigator.share) { try { await navigator.share({ title: `${P.name} – Profile`, text }); } catch {} } else copyText(text);
}

/* ============================ events ============================ */
document.addEventListener('click', async (e) => {
  if (e.target.closest('a[href]')) return;                         // let call / mail / WhatsApp links work
  const el = e.target.closest('[data-act]'); if (!el) return;
  if (el.classList.contains('sheet-wrap') && e.target !== el) return; // clicks inside the sheet
  const { act, id } = el.dataset;
  switch (act) {
    case 'tab': S.tab = id; render(); break;
    case 'filter': S.tab = 'interviews'; S.filter = id; render(true); break;
    case 'add': S.tab === 'companies' ? openCompany() : openInterview(); break;
    case 'edit': openInterview(id); break;
    case 'editCompany': openCompany(id); break;
    case 'closeSheet': closeSheet(); break;
    case 'follow': S.tab = 'followup'; S.fu.id = id; fillFu(SUGGEST[findI(id).status] || 'status'); render(); break;
    case 'tpl': fillFu(id); render(true); break;
    case 'snooze': {
      const i = findI(S.fu.id);
      try { await api.save('interviews', { id: i.id, followup_on: +id ? todayStr(+id) : null }); await loadAll(); render(true); toast(+id ? 'Follow-up scheduled' : 'Follow-up cleared'); }
      catch (err) { toast(err.message); }
      break;
    }
    case 'fuMail': { const c = companyOf(findI(S.fu.id)) || {}; if (!c.hr_email) toast('No HR email saved. Opening mail app anyway.'); location.href = mailHref(c.hr_email, S.fu.subject, S.fu.body); break; }
    case 'fuWa': { const c = companyOf(findI(S.fu.id)) || {}; window.open(waHref(c.hr_phone, S.fu.body), '_blank', 'noopener'); break; }
    case 'fuCopy': copyText(`Subject: ${S.fu.subject}\n\n${S.fu.body}`); break;
    case 'fuResume': shareFile(S.fu.body); break;
    case 'shAll': case 'shNone': SHARE_ITEMS.forEach(([k]) => (S.share[k] = act === 'shAll')); S.share.text = profileText(); render(true); break;
    case 'shCopy': copyText($('#shText').value); break;
    case 'shWa': window.open(waHref(S.share.toPhone, $('#shText').value), '_blank', 'noopener'); break;
    case 'shMail': location.href = mailHref(S.share.toMail, `${P.name} – Profile & Resume`, $('#shText').value); break;
    case 'shNative': nativeShare($('#shText').value); break;
    case 'shFile': shareFile($('#shText').value); break;
    case 'delInterview':
      if (confirm('Delete this interview?')) { try { await api.del('interviews', id); await loadAll(); closeSheet(); render(true); toast('Deleted'); } catch (err) { toast(err.message); } }
      break;
    case 'delCompany': {
      const n = S.interviews.filter((i) => i.company_id === id).length;
      if (confirm(n ? `Delete this company and its ${n} interview(s)?` : 'Delete this company?')) { try { await api.del('companies', id); await loadAll(); closeSheet(); render(true); toast('Deleted'); } catch (err) { toast(err.message); } }
      break;
    }
    case 'signout': await sb.auth.signOut(); location.reload(); break;
  }
});

document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-form]'); if (!f) return;
  e.preventDefault();
  ({ interview: submitInterview, company: submitCompany }[f.dataset.form])(f);
});

document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'q') { S.q = t.value; $('#list').innerHTML = listHtml(); }
  else if (t.id === 'fuSub') S.fu.subject = t.value;
  else if (t.id === 'fuBody') S.fu.body = t.value;
  else if (t.id === 'shPhone') S.share.toPhone = t.value;
  else if (t.id === 'shMail') S.share.toMail = t.value;
  else if (t.id === 'shText') S.share.text = t.value;
});

document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'fuInt') { S.fu.id = t.value; fillFu(SUGGEST[findI(t.value).status] || 'status'); render(true); }
  else if (t.dataset.share) { S.share[t.dataset.share] = t.checked; S.share.text = profileText(); $('#shText').value = S.share.text; }
  else if (t.id === 'shCo') {
    const c = S.companies.find((x) => x.id === t.value); if (!c) return;
    S.share.toPhone = c.hr_phone || ''; S.share.toMail = c.hr_email || ''; $('#shPhone').value = S.share.toPhone; $('#shMail').value = S.share.toMail;
  } else if (t.id === 'coSel') { $('#newCo').hidden = t.value !== '__new'; }
  else if (t.name === 'status' && t.closest('form[data-form=interview]')) {
    const fo = t.closest('form').elements.followup_on;
    if (!fo.value) { const days = { completed: 3, awaiting: 3, hold: 7 }[t.value]; if (days) fo.value = todayStr(days); }
  }
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

/* ============================ auth (Supabase) ============================ */
function friendlyAuthError(err) {
  const raw = (err && err.message) || String(err);
  const m = raw.toLowerCase();
  if (m.includes('invalid login')) return 'Incorrect email or password. New here? Choose “Create account”.';
  if (m.includes('not confirmed')) return 'Please confirm your email first. Check your inbox and spam folder.';
  if (m.includes('already registered')) return 'This email is already registered. Please sign in.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many emails were sent. Wait a few minutes, or turn off “Confirm email” in Supabase (Authentication → Providers → Email) and try again.';
  if (m.includes('signups not allowed') || m.includes('signup is disabled') || m.includes('signups are disabled')) return 'Sign-ups are disabled in your Supabase project (Authentication → Sign In / Providers).';
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed')) return 'Cannot reach Supabase. Check your internet connection and the URL in config.js.';
  if (m.includes('api key') || m.includes('apikey')) return 'Supabase rejected the key. Re-copy the publishable / anon key into config.js.';
  if (m.includes('password')) return raw;
  return raw;
}

function showLogin() {
  document.body.classList.add('locked'); $('#fab').hidden = true;
  const feat = (i, t, d) => `<li><span class="f-ic">${ic(i)}</span><div><b>${t}</b><small>${d}</small></div></li>`;
  const pw = (id, label, name, ph, ac, extra = '') => `<div class="field" ${extra}><label for="${id}">${label}</label><div class="input">${ic('lock', 'lead')}<input id="${id}" type="password" name="${name}" placeholder="${ph}" autocomplete="${ac}"><button type="button" class="eye" data-eye="${id}" aria-label="Show password" aria-pressed="false">${ic('eye')}</button></div></div>`;
  $('#view').innerHTML = `<div class="auth">
    <section class="auth-hero"><div class="blob b1"></div><div class="blob b2"></div>
      <div class="hero-in"><img class="logo" src="icons/icon-192.png" alt=""><p class="kicker">Interview Tracker</p>
        <h1>Every interview.<br>One calm place.</h1>
        <p class="lead">Dates, recruiter contacts and follow-ups, organised so you never miss a reply.</p>
        <ul class="feats">${feat('calendar', 'Track every round', 'Dates, status and next follow-up')}${feat('send', 'Smart follow-ups', 'Ready messages for any situation')}${feat('phone', 'One-tap contact', 'Call, mail or WhatsApp the recruiter')}</ul></div></section>
    <section class="auth-main"><div class="auth-card">
      <div class="seg" id="seg" data-mode="in"><span class="thumb"></span><button type="button" data-m="in" class="on">Sign in</button><button type="button" data-m="up">Create account</button></div>
      <h2 id="authTitle">Welcome back</h2><p class="sub" id="authSub">Sign in to continue tracking your interviews.</p>
      <div class="alert" id="authMsg" role="alert" hidden></div>
      <form id="loginForm" novalidate>
        <div class="field"><label for="aEmail">Email</label><div class="input">${ic('mail', 'lead')}<input id="aEmail" type="email" name="email" placeholder="you@example.com" autocomplete="email" inputmode="email"></div></div>
        ${pw('aPass', 'Password', 'password', 'At least 6 characters', 'current-password')}
        ${pw('aPass2', 'Confirm password', 'confirm', 'Re-enter password', 'new-password', 'id="confirmField" hidden')}
        <button class="btn pri block lg" type="submit" id="authBtn"><span class="btn-lbl">Sign in</span><span class="spin"></span></button>
      </form>
      <p class="fine">${ic('shield', 'sm')}Your data is private to your account.</p>
    </div></section></div>`;

  const root = $('.auth'), form = $('#loginForm'), card = $('.auth-card'), seg = $('#seg'), msg = $('#authMsg'), btn = $('#authBtn');
  let mode = 'in';

  const showMsg = (text, type, resend) => {
    if (!text) { msg.hidden = true; msg.innerHTML = ''; return; }
    msg.className = 'alert ' + type; msg.hidden = false;
    msg.innerHTML = `${ic(type === 'error' ? 'alert' : 'checkCircle')}<span>${esc(text)}${resend ? ' <button type="button" class="link" data-resend>Resend email</button>' : ''}</span>`;
  };
  const fail = (text) => {
    showMsg(text, 'error');
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
  };
  const setMode = (m) => {
    mode = m; seg.dataset.mode = m;
    $$('#seg button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
    const up = m === 'up';
    $('#authTitle').textContent = up ? 'Create your account' : 'Welcome back';
    $('#authSub').textContent = up ? 'Start tracking interviews in under a minute.' : 'Sign in to continue tracking your interviews.';
    $('#confirmField').hidden = !up;
    $('#aPass').autocomplete = up ? 'new-password' : 'current-password';
    $('.btn-lbl', btn).textContent = up ? 'Create account' : 'Sign in';
    showMsg('');
  };

  root.addEventListener('click', async (e) => {
    const sm = e.target.closest('[data-m]');
    if (sm) return setMode(sm.dataset.m);
    const eye = e.target.closest('[data-eye]');
    if (eye) {
      const inp = $('#' + eye.dataset.eye), show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      eye.innerHTML = ic(show ? 'eyeOff' : 'eye');
      eye.setAttribute('aria-pressed', String(show));
      eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      inp.focus(); return;
    }
    if (e.target.closest('[data-resend]')) {
      try {
        const { error } = await sb.auth.resend({ type: 'signup', email: form.elements.email.value.trim() });
        if (error) throw error;
        showMsg('Confirmation email sent again. Check your inbox and spam folder.', 'ok', true);
      } catch (err) { fail(friendlyAuthError(err)); }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.elements.email.value.trim(), password = form.elements.password.value;
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail('Enter a valid email address.');
    if (password.length < 6) return fail('Password must be at least 6 characters.');
    if (mode === 'up' && password !== form.elements.confirm.value) return fail('Passwords do not match.');
    btn.classList.add('busy'); showMsg('');
    try {
      if (mode === 'up') {
        const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } });
        if (error) throw error;
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setMode('in'); form.elements.email.value = email;
          return fail('This email is already registered. Please sign in.');
        }
        if (!data.session) {
          setMode('in'); form.elements.email.value = email;
          return showMsg('Account created. Check your inbox to confirm your email, then sign in.', 'ok', true);
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      location.reload();
    } catch (err) {
      fail(friendlyAuthError(err));
    } finally { btn.classList.remove('busy'); }
  });
  setMode('in');
}

/* ============================ boot ============================ */
const skeleton = () => `<header class="top"><div class="skel" style="height:56px;width:55%"></div></header>
  <div class="stats"><div class="skel" style="height:104px"></div><div class="skel" style="height:104px"></div><div class="skel" style="height:104px"></div></div>
  <div class="skel"></div><div class="skel"></div><div class="skel"></div>`;

async function init() {
  renderShell();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (useSB) {
    if (!window.supabase) {
      $('#view').innerHTML = `<div class="banner" style="margin-top:20px">Cannot reach Supabase library. Check your connection and reload.</div>`; return;
    }
    sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    const { data } = await sb.auth.getSession();
    if (!data.session) return showLogin();
    S.user = data.session.user;
  }
  $('#view').innerHTML = skeleton();
  await loadAll();
  render();
  if (new URLSearchParams(location.search).get('action') === 'add') openInterview();
}
init();
})();
