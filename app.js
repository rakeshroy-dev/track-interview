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
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  back: '<polyline points="15 18 9 12 15 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
});
const MODE_IC = { Video: 'video', Phone: 'phone', Onsite: 'pin' };
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ---------- theme (system / light / dark) ---------- */
const THEME_KEY = 'it_theme';
const getPref = () => { try { const t = localStorage.getItem(THEME_KEY); return t === 'light' || t === 'dark' ? t : 'system'; } catch { return 'system'; } };
const isDark = () => { const p = getPref(); return p === 'dark' || (p === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); };
const themeInner = (labeled) => ic(isDark() ? 'sun' : 'moon') + (labeled ? `<span>${isDark() ? 'Light theme' : 'Dark theme'}</span>` : '');
const themeBtn = (cls = '', labeled = false) =>
  `<button type="button" class="theme-btn ${cls}" data-act="theme" data-labeled="${labeled ? 1 : ''}" aria-label="Switch to ${isDark() ? 'light' : 'dark'} theme" title="Switch to ${isDark() ? 'light' : 'dark'} theme">${themeInner(labeled)}</button>`;
function applyTheme() {
  const r = document.documentElement, p = getPref();
  if (p === 'system') delete r.dataset.theme; else r.dataset.theme = p;
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = isDark() ? '#0b1020' : '#4f46e5';
  $$('.theme-btn').forEach((b) => {
    b.innerHTML = themeInner(!!b.dataset.labeled);
    const to = isDark() ? 'light' : 'dark'; b.setAttribute('aria-label', `Switch to ${to} theme`); b.title = `Switch to ${to} theme`;
  });
}
function setPref(p) { try { p === 'system' ? localStorage.removeItem(THEME_KEY) : localStorage.setItem(THEME_KEY, p); } catch {} applyTheme(); }
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme); } catch {}

/* ---------- loader: show a spinner on the control until an async action finishes ---------- */
async function withBusy(el, fn) {
  if (!el || el.classList.contains('busy')) return;
  const added = !el.querySelector(':scope > .spin');
  let sp = null;
  if (added) { sp = document.createElement('span'); sp.className = 'spin'; sp.setAttribute('aria-hidden', 'true'); el.appendChild(sp); }
  el.classList.add('busy'); el.setAttribute('aria-busy', 'true');
  try { return await fn(); }
  finally { el.classList.remove('busy'); el.removeAttribute('aria-busy'); if (sp) sp.remove(); }
}

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
const HELD = ['completed', 'awaiting', 'hold', 'selected', 'rejected'];   // interviews that have taken place -> Q&A applies
const LANGS = ['Python', 'SQL', 'JavaScript', 'Java', 'Bash', 'Other'];
const ROUNDS = ['Screening', 'HR', 'Technical L1', 'Technical L2', 'Managerial', 'Client', 'Final', 'Other'];
const MODES = ['Video', 'Phone', 'Onsite'];
const FILTERS = [
  ['all', 'All'], ['upcoming', 'Upcoming'], ['awaiting', 'Awaiting'], ['due', 'Follow-up due'], ['closed', 'Closed']
];

/* job opportunities + call log */
const OPP_STATUS = { lead: 'Lead', active: 'In process', hold: 'On hold', offer: 'Offer', closed: 'Closed' };
const SOURCES = ['Recruiter call', 'Naukri', 'LinkedIn', 'Referral', 'Company site', 'Other'];
const CALL_DIR = ['Incoming', 'Outgoing'];
const CALL_OUTCOMES = ['Interested', 'Details shared', 'Call back later', 'Interview scheduled', 'No answer', 'Not interested', 'Other'];
const OFILTERS = [['all', 'All'], ['active', 'Active'], ['callback', 'Callback due'], ['offer', 'Offer'], ['closed', 'Closed']];
const POSITIVE_CALL = ['Interested', 'Details shared', 'Interview scheduled'];

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

/* ============================ code display helpers ============================ */
const KW = {
  Python: 'def class return if elif else for while in not and or is None True False import from as with try except finally raise lambda yield pass break continue async await global nonlocal assert del print self',
  SQL: 'select from where group by order having join left right inner outer full on as and or not in is null insert into values update set delete create table alter drop index limit offset union all distinct case when then else end like between exists count sum avg min max over partition with desc asc',
  JavaScript: 'const let var function return if else for while of in new class extends import from export default async await try catch finally throw switch case break continue null undefined true false this typeof',
  Java: 'public private protected static final class interface extends implements new return if else for while try catch finally throw throws switch case break continue null true false this void int long double boolean String import package',
  Bash: 'if then else elif fi for while do done in case esac function echo cd ls grep sed awk export return exit'
};
const COMMENT = { Python: '#', Bash: '#', SQL: '--', JavaScript: '//', Java: '//' };
function highlight(code, lang) {
  const cm = COMMENT[lang], kws = new Set((KW[lang] || '').split(' ')), ci = lang === 'SQL';
  const cmRe = cm ? cm.replace(/[.*+?^${}()|[\]\\\/-]/g, '\\$&') + '.*' : '(?!)';
  const re = new RegExp(`(${cmRe})|("""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'|\`[^\`]*\`)|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_]\\w*)`, 'g');
  const lines = [''];
  const add = (cls, text) => text.split('\n').forEach((part, k) => {
    if (k) lines.push('');
    if (part) lines[lines.length - 1] += cls ? `<span class="tk-${cls}">${esc(part)}</span>` : esc(part);
  });
  let last = 0, m;
  while ((m = re.exec(code))) {
    if (m.index > last) add('', code.slice(last, m.index));
    if (m[1] !== undefined) add('com', m[0]);
    else if (m[2] !== undefined) add('str', m[0]);
    else if (m[3] !== undefined) add('num', m[0]);
    else add(kws.has(ci ? m[4].toLowerCase() : m[4]) ? 'kw' : '', m[0]);
    last = re.lastIndex;
    if (m[0] === '') re.lastIndex++;
  }
  if (last < code.length) add('', code.slice(last));
  return lines.map((l) => `<span class="ln">${l || ' '}</span>`).join('');
}
const codeBlock = (q) => `<div class="code-wrap"><div class="code-bar"><span>${esc(q.language || 'code')}</span><button type="button" class="ed-btn" data-act="copyCode" data-id="${q.id}">${ic('copy', 'sm')}Copy</button></div><pre class="code"><code>${highlight(q.code, q.language)}</code></pre></div>`;

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
      if (t === 'interviews') store.set('interview_questions', store.get('interview_questions').filter((q) => q.interview_id !== id));
      if (t === 'companies') {
        const gone = store.get('interviews').filter((r) => r.company_id === id).map((r) => r.id);
        store.set('interview_questions', store.get('interview_questions').filter((q) => !gone.includes(q.interview_id)));
        const oppIds = store.get('opportunities').filter((o) => o.company_id === id).map((o) => o.id);
        store.set('interviews', store.get('interviews').filter((r) => r.company_id !== id));
        store.set('opportunities', store.get('opportunities').filter((o) => o.company_id !== id));
        store.set('calls', store.get('calls').filter((c) => !oppIds.includes(c.opportunity_id)));
      }
      if (t === 'opportunities') {   // mirrors the DB: calls are deleted, interviews are kept but unlinked
        store.set('calls', store.get('calls').filter((c) => c.opportunity_id !== id));
        store.set('interviews', store.get('interviews').map((i) => (i.opportunity_id === id ? { ...i, opportunity_id: null } : i)));
      }
      return;
    }
    const { error } = await sb.from(t).delete().eq('id', id);
    if (error) throw error;
  }
};

/* ============================ state ============================ */
const S = {
  tab: 'interviews', filter: 'all', q: '',
  companies: [], interviews: [], opportunities: [], calls: [], oppReady: true,
  oppId: null, ofilter: 'all', oq: '',
  questions: [], qaReady: true, qaId: null,
  fu: { id: null, tpl: null, subject: '', body: '' },
  share: { phone: true, email: true, portfolio: true, linkedin: true, resume: true, toPhone: '', toMail: '', text: null }
};
const companyOf = (i) => S.companies.find((c) => c.id === i.company_id);
const findI = (id) => S.interviews.find((i) => i.id === id);
const isDue = (i) => i.followup_on && i.followup_on <= todayStr() && !FINAL.includes(i.status);
const oppOf = (id) => S.opportunities.find((o) => o.id === id);
const oppCalls = (id) => S.calls.filter((c) => c.opportunity_id === id).sort((a, b) => (b.call_at || '').localeCompare(a.call_at || ''));
const oppInts = (id) => S.interviews.filter((i) => i.opportunity_id === id)
  .sort((a, b) => (a.interview_at || a.created_at || '').localeCompare(b.interview_at || b.created_at || ''));
const callbackDue = (o) => { const l = oppCalls(o.id)[0]; return !!(l && l.next_action_on && l.next_action_on <= todayStr() && o.status !== 'closed'); };
const lastActivity = (o) => [o.created_at, ...oppCalls(o.id).map((c) => c.call_at), ...oppInts(o.id).map((i) => i.interview_at)].filter(Boolean).sort().pop() || '';
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

async function loadAll() {
  try {
    [S.companies, S.interviews] = await Promise.all([api.list('companies'), api.list('interviews')]);
  } catch (e) { toast('Could not load data: ' + (e.message || e)); }
  // opportunities + calls: tolerate a database that has not been migrated yet
  try {
    [S.opportunities, S.calls] = await Promise.all([api.list('opportunities'), api.list('calls')]);
    S.oppReady = true;
  } catch (e) { S.opportunities = []; S.calls = []; S.oppReady = false; }
  try { S.questions = await api.list('interview_questions'); S.qaReady = true; }
  catch (e) { S.questions = []; S.qaReady = false; }
}
const qCount = (id) => S.questions.filter((q) => q.interview_id === id).length;
const qaChip = (i) => (S.qaReady && HELD.includes(i.status)
  ? `<button type="button" class="chip-s qa-link" data-act="openQA" data-id="${i.id}">${ic('file', 'sm')}${qCount(i.id) ? 'Q&amp;A · ' + qCount(i.id) : 'Add Q&amp;A'}</button>` : '');

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
    <div class="sheet-top"><div class="grab"></div><div class="sheet-head"><h2>${esc(title)}</h2><button class="icon-btn" data-act="closeSheet" aria-label="Close">${ic('x')}</button></div></div>
    <div class="sheet-body">${html}</div></div></div>`;
  document.body.style.overflow = 'hidden';
}
function closeSheet() { $('#sheet').innerHTML = ''; document.body.style.overflow = ''; }
const opts = (list, sel) => list.map((v) => `<option ${v === sel ? 'selected' : ''}>${esc(v)}</option>`).join('');

/* ============================ views ============================ */
const NAV = [['interviews', 'list', 'Interviews'], ['opportunities', 'briefcase', 'Jobs'], ['followup', 'send', 'Follow-up'], ['companies', 'building', 'Contacts'], ['profile', 'share', 'Share']];

function renderShell() {
  $('#nav').innerHTML = `<div class="brand"><img src="icons/icon-192.png" alt="">Interview Tracker</div>` +
    NAV.map(([k, i, l]) => `<button data-act="tab" data-id="${k}" data-tab="${k}">${ic(i)}<span>${l}</span></button>`).join('');
  $('#fab').innerHTML = ic('plus');
  renderTopbar();
}

/* ---------- fixed top bar (all pages) ---------- */
function renderTopbar() {
  const initials = (P.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  $('#topbar').innerHTML = `
    <div class="tb-left"><span class="tb-brand"><img src="icons/icon-192.png" alt="">Interview Tracker</span><span class="tb-title" id="tbTitle"></span></div>
    <div class="tb-right">
      ${themeBtn()}
      ${useSB ? `<button type="button" class="tb-btn" data-act="signout" aria-label="Sign out" title="Sign out">${ic('logout')}</button>` : ''}
      <div class="me" title="${esc(P.name || '')}${S.user && S.user.email ? ' · ' + esc(S.user.email) : ''}">${esc(initials)}</div>
    </div>`;
}

let enterT;
function render(keepScroll) {
  const v = S.qaId ? vQA : { interviews: vInterviews, opportunities: vOpportunities, followup: vFollowup, companies: vCompanies, profile: vProfile }[S.tab];
  $('#view').innerHTML = v();
  $$('.nav button').forEach((b) => b.classList.toggle('on', b.dataset.tab === S.tab));
  const tt = $('#tbTitle'); if (tt) tt.textContent = (NAV.find((n) => n[0] === S.tab) || [])[2] || '';
  $('#fab').hidden = !!S.qaId || !(['interviews', 'companies'].includes(S.tab) || (S.tab === 'opportunities' && !S.oppId));
  $('#fab').setAttribute('aria-label', { companies: 'Add company', opportunities: 'Add job opportunity' }[S.tab] || 'Add interview');
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
      ${qaChip(i)}
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
  return `<header class="top top-row"><div><p class="eyebrow">${greeting()}, ${esc((P.name || '').split(' ')[0])}</p><h1>Interviews</h1></div></header>
    <section class="stats">${st(up, 'Upcoming', 'upcoming', 'calendar', 't-indigo')}${st(aw, 'Awaiting', 'awaiting', 'clock', 't-amber')}${st(due, 'Follow-ups due', 'due', 'bell', due ? 't-red' : 't-green')}</section>
    <div class="search">${ic('search')}<input id="q" type="search" placeholder="Search company or role" value="${esc(S.q)}" autocomplete="off"></div>
    <div class="chips scroll">${FILTERS.map(([k, l]) => `<button class="chip ${S.filter === k ? 'on' : ''}" data-act="filter" data-id="${k}">${l}</button>`).join('')}</div>
    <section class="list" id="list">${listHtml()}</section>`;
}

/* ---------- job opportunities (calls + interview history) ---------- */
const OPP_ACTIVE = ['lead', 'active', 'hold'];
function filteredOpps() {
  const q = S.oq.trim().toLowerCase();
  return S.opportunities.filter((o) => {
    if (S.ofilter === 'active' && !OPP_ACTIVE.includes(o.status)) return false;
    if (S.ofilter === 'callback' && !callbackDue(o)) return false;
    if (S.ofilter === 'offer' && o.status !== 'offer') return false;
    if (S.ofilter === 'closed' && o.status !== 'closed') return false;
    if (q) { const c = companyOf(o) || {}; return `${c.name} ${o.role} ${o.source}`.toLowerCase().includes(q); }
    return true;
  }).sort((a, b) => lastActivity(b).localeCompare(lastActivity(a)));
}

function oppCard(o, n) {
  const c = companyOf(o) || {};
  const calls = oppCalls(o.id), ints = oppInts(o.id), last = calls[0], cb = callbackDue(o);
  return `<article class="card" style="--i:${Math.min(n || 0, 10)}" data-act="openOpp" data-id="${o.id}">
    <div class="card-top">
      <div class="row"><div class="avatar">${esc((c.name || '?').trim()[0]?.toUpperCase())}</div>
        <div><h3>${esc(c.name || 'Unknown company')}</h3><p class="role">${esc(o.role)}${o.source ? ' · ' + esc(o.source) : ''}</p></div></div>
      <span class="badge o-${o.status}">${OPP_STATUS[o.status] || esc(o.status)}</span>
    </div>
    <div class="meta">
      <span>${ic('phone', 'sm')}${plural(calls.length, 'call')}</span>
      <span>${ic('calendar', 'sm')}${plural(ints.length, 'interview')}</span>
      ${last ? `<span>${ic('clock', 'sm')}Last call ${esc(fmtDT(last.call_at))}</span>` : ''}
      ${cb ? `<span class="due">${ic('bell', 'sm')}Callback ${esc(fmtD(last.next_action_on))} · due</span>` : ''}
    </div>
    <div class="actions">
      ${c.hr_phone ? `<a class="btn sm" href="${telHref(c.hr_phone)}">${ic('phone', 'sm')}Call</a>` : `<span class="btn sm off">${ic('phone', 'sm')}Call</span>`}
      <button class="btn sm pri" data-act="newCall" data-id="${o.id}">${ic('plus', 'sm')}Log call</button>
    </div>
  </article>`;
}

function oppListHtml() {
  const rows = filteredOpps();
  if (!rows.length) {
    return S.opportunities.length
      ? `<div class="empty">${ic('search')}<h3>No matches</h3><p>Try another filter or search term.</p></div>`
      : `<div class="empty">${ic('briefcase')}<h3>No job opportunities yet</h3><p>Add an opportunity, log recruiter calls against it, then build the interview history round by round.</p><button class="btn pri" data-act="add">${ic('plus')}Add opportunity</button></div>`;
  }
  return rows.map(oppCard).join('');
}

function vOpportunities() {
  if (S.oppId) return vOppDetail();
  if (!S.oppReady) {
    return `<header class="top"><p class="eyebrow">Calls &amp; interview history</p><h1>Job opportunities</h1></header>
      <div class="panel"><h2>One-time database update needed</h2>
        <p class="hint" style="margin:0">Open Supabase → SQL Editor, paste the latest <b>supabase_schema.sql</b> and run it. It is safe to re-run and keeps your existing data. Then reload this app.</p></div>`;
  }
  const active = S.opportunities.filter((o) => OPP_ACTIVE.includes(o.status)).length;
  const wk = Date.now() - 7 * 864e5;
  const weekCalls = S.calls.filter((c) => c.call_at && new Date(c.call_at).getTime() >= wk).length;
  const cb = S.opportunities.filter(callbackDue).length;
  const orphan = S.interviews.filter((i) => !i.opportunity_id).length;
  return `<header class="top"><p class="eyebrow">Calls &amp; interview history</p><h1>Job opportunities</h1></header>
    <section class="stats">
      <button class="stat t-indigo" data-act="ofilter" data-id="active"><div class="stat-ic">${ic('briefcase')}</div><b>${active}</b><span>Active</span></button>
      <div class="stat t-amber"><div class="stat-ic">${ic('phone')}</div><b>${weekCalls}</b><span>Calls · 7 days</span></div>
      <button class="stat ${cb ? 't-red' : 't-green'}" data-act="ofilter" data-id="callback"><div class="stat-ic">${ic('bell')}</div><b>${cb}</b><span>Callbacks due</span></button>
    </section>
    ${orphan ? `<div class="panel link-banner"><div>${ic('link')}<span><b>${plural(orphan, 'interview')}</b> not linked to an opportunity yet.</span></div><button class="btn sm pri" data-act="linkLegacy">Link automatically</button></div>` : ''}
    <div class="search">${ic('search')}<input id="oq" type="search" placeholder="Search company, role or source" value="${esc(S.oq)}" autocomplete="off"></div>
    <div class="chips scroll">${OFILTERS.map(([k, l]) => `<button class="chip ${S.ofilter === k ? 'on' : ''}" data-act="ofilter" data-id="${k}">${l}</button>`).join('')}</div>
    <section class="list" id="olist">${oppListHtml()}</section>`;
}

function vOppDetail() {
  const o = oppOf(S.oppId);
  if (!o) { S.oppId = null; return vOpportunities(); }
  const c = companyOf(o) || {}, calls = oppCalls(o.id), ints = oppInts(o.id);
  const callItem = (x) => `<div class="tl-item" data-act="editCall" data-id="${x.id}">
      <span class="dot ${x.direction === 'Outgoing' ? 'out' : 'in'}"></span>
      <div class="tl-body">
        <div class="tl-top"><b>${esc(x.outcome || 'Call')}</b>${x.next_action_on ? `<span class="chip-s ${x.next_action_on <= todayStr() && o.status !== 'closed' ? 'due' : ''}">${ic('bell', 'sm')}${esc(fmtD(x.next_action_on))}</span>` : ''}</div>
        <small>${esc(x.direction || '')}${x.contact_name ? ' · ' + esc(x.contact_name) : ''}${x.duration_min ? ' · ' + x.duration_min + ' min' : ''} · ${esc(fmtDT(x.call_at))}</small>
        ${x.notes ? `<p>${esc(x.notes)}</p>` : ''}
      </div></div>`;
  const intItem = (x, n) => `<div class="tl-item" data-act="edit" data-id="${x.id}">
      <span class="dot step">${n + 1}</span>
      <div class="tl-body">
        <div class="tl-top"><b>${esc(x.round || 'Interview')}</b><span class="badge s-${x.status}">${STATUS[x.status] || esc(x.status)}</span></div>
        <small>${x.interview_at ? esc(fmtDT(x.interview_at)) : 'Date not set'}${x.mode ? ' · ' + esc(x.mode) : ''}</small>
        ${x.notes ? `<p>${esc(x.notes)}</p>` : ''}
        ${HELD.includes(x.status) ? `<div class="tl-chip">${qaChip(x)}</div>` : ''}
      </div></div>`;
  return `<button class="back" data-act="oppBack">${ic('back')}Job opportunities</button>
    <header class="top top-row"><div class="row"><div class="avatar lg">${esc((c.name || '?').trim()[0]?.toUpperCase())}</div>
      <div><h1 class="h-sm">${esc(c.name || 'Unknown company')}</h1><p class="sub">${esc(o.role)}${o.source ? ' · via ' + esc(o.source) : ''}</p></div></div>
      <button class="icon-btn" data-act="editOpp" data-id="${o.id}" aria-label="Edit opportunity">${ic('edit')}</button></header>
    <div class="opp-meta"><span class="badge o-${o.status}">${OPP_STATUS[o.status] || esc(o.status)}</span>
      ${c.hr_name ? `<span>${ic('user', 'sm')}${esc(c.hr_name)}</span>` : ''}${c.hr_phone ? `<span>${ic('phone', 'sm')}${esc(c.hr_phone)}</span>` : ''}</div>
    <div class="btn-row opp-actions">
      ${c.hr_phone ? `<a class="btn" href="${telHref(c.hr_phone)}">${ic('phone', 'sm')}Call HR</a>` : ''}
      <button class="btn pri" data-act="newCall" data-id="${o.id}">${ic('plus', 'sm')}Log call</button>
      <button class="btn" data-act="newInt" data-id="${o.id}">${ic('calendar', 'sm')}Interview</button>
    </div>
    <div class="split two"><div class="panel"><h2>Interview history <span class="count">${ints.length}</span></h2>
      ${ints.length ? `<div class="tl">${ints.map(intItem).join('')}</div>` : `<p class="hint" style="margin:0">No rounds yet. Tap “Add interview” once a round is scheduled.</p>`}</div>
    <div class="panel"><h2>Call log <span class="count">${calls.length}</span></h2>
      ${calls.length ? `<div class="tl">${calls.map(callItem).join('')}</div>` : `<p class="hint" style="margin:0">No calls logged yet. Tap “Log call” after speaking with the recruiter.</p>`}</div></div>
    ${o.notes ? `<div class="panel"><h2>Notes</h2><p class="note-text">${esc(o.notes)}</p></div>` : ''}`;
}

/* ---------- interview questions & answers ---------- */
function qaCard(q, n) {
  const coding = q.kind === 'coding';
  return `<article class="card qa-card">
    <div class="qa-head"><span class="qa-n">Q${n + 1}</span><span class="chip-s">${coding ? 'Coding' + (q.language ? ' · ' + esc(q.language) : '') : 'Concept'}</span><span class="grow"></span>
      <button class="icon-btn" data-act="editQA" data-id="${q.id}" aria-label="Edit question">${ic('edit')}</button>
      <button class="icon-btn" data-act="delQA" data-id="${q.id}" aria-label="Delete question">${ic('trash')}</button></div>
    <p class="qa-q">${esc(q.question)}</p>
    ${q.answer ? `<div class="qa-lbl">Answer</div><p class="qa-a">${esc(q.answer)}</p>` : ''}
    ${coding && q.code ? codeBlock(q) : ''}
  </article>`;
}
function vQA() {
  const i = findI(S.qaId);
  if (!i) { S.qaId = null; return vInterviews(); }
  const c = companyOf(i) || {};
  const qs = S.questions.filter((q) => q.interview_id === i.id).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  const nCode = qs.filter((q) => q.kind === 'coding').length;
  const body = !S.qaReady
    ? `<div class="panel"><h2>One-time database update needed</h2><p class="hint" style="margin:0">Open Supabase → SQL Editor, paste the latest <b>supabase_schema.sql</b> and run it (safe to re-run), then reload this app.</p></div>`
    : qs.length ? qs.map(qaCard).join('')
      : `<div class="empty">${ic('file')}<h3>No questions yet</h3><p>Note what was asked in this round and how you answered. Add code for coding questions.</p><button class="btn pri" data-act="newQA" data-id="${i.id}">${ic('plus')}Add question</button></div>`;
  return `<button class="back" data-act="qaBack">${ic('back')}Back</button>
    <header class="top"><p class="eyebrow">${esc(c.name || 'Unknown company')} · ${esc(i.role)}</p><h1>Interview Q&amp;A</h1></header>
    <div class="opp-meta"><span class="badge s-${i.status}">${STATUS[i.status] || esc(i.status)}</span>
      <span>${ic('calendar', 'sm')}${esc(i.round || 'Round')}${i.interview_at ? ' · ' + esc(fmtDT(i.interview_at)) : ''}</span>
      <span>${ic('file', 'sm')}${plural(qs.length, 'question')}${nCode ? ` (${nCode} coding)` : ''}</span></div>
    ${S.qaReady && qs.length ? `<div class="btn-row opp-actions"><button class="btn pri" data-act="newQA" data-id="${i.id}">${ic('plus', 'sm')}Add question</button></div>` : ''}
    <section class="list qa-list">${body}</section>`;
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
    <div class="split fu"><div class="panel">
      <div class="field"><label for="fuInt">Interview</label><select id="fuInt">${[...S.interviews].map((x) => `<option value="${x.id}" ${x.id === S.fu.id ? 'selected' : ''}>${esc((companyOf(x) || {}).name || '?')} – ${esc(x.role)} (${STATUS[x.status]})</option>`).join('')}</select></div>
      <p class="lbl" style="margin-bottom:8px">Situation</p>
      <div class="chips wrap">${TEMPLATES.map((t) => `<button class="chip ${S.fu.tpl === t.id ? 'on' : ''}" data-act="tpl" data-id="${t.id}">${t.label}${t.id === sug ? '<span class="tag">Suggested</span>' : ''}</button>`).join('')}</div>
    </div>
    <div class="panel">
      <div class="recipient">
        <span>${ic('user', 'sm')}${esc(c.hr_name || 'No HR name')}</span>
        <span>${ic('mail', 'sm')}${esc(c.hr_email || 'No email saved')}</span>
        <span>${ic('phone', 'sm')}${esc(c.hr_phone || 'No phone saved')}</span>
        ${!c.hr_email || !c.hr_phone ? `<button class="chip" data-act="editCompany" data-id="${c.id}">${ic('plus', 'sm')} Add contact</button>` : ''}
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
      </div>${i.followup_on ? `<p class="hint">Currently set for ${esc(fmtD(i.followup_on))}.</p>` : ''}</div></div>`;
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
    <div class="split sh"><div class="panel"><h2>Include</h2>
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
    <div class="panel"><h2>Appearance</h2>
      <div class="seg3">${[['system', 'monitor', 'System'], ['light', 'sun', 'Light'], ['dark', 'moon', 'Dark']].map(([k, i, l]) => `<button class="chip ${getPref() === k ? 'on' : ''}" data-act="themeSet" data-id="${k}">${ic(i, 'sm')}${l}</button>`).join('')}</div></div>
    <div class="panel"><h2>Account</h2>
      <p class="hint" style="margin:0 0 10px">${useSB ? `Synced with Supabase${S.user ? ' as ' + esc(S.user.email) : ''}.` : 'Demo mode: data is stored only in this browser. Add your Supabase keys in config.js to sync across devices.'}</p>
      ${useSB ? `<button class="btn block" data-act="signout">${ic('logout')}Sign out</button>` : ''}</div></div>`;
}

/* ============================ forms ============================ */
const companySelect = (selected, noCo) => `
    <div class="field"><label>Company</label>
      <select name="company_id" id="coSel">${S.companies.map((c) => `<option value="${c.id}" ${selected === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}<option value="__new" ${noCo ? 'selected' : ''}>+ New company…</option></select></div>
    <div class="inline-new" id="newCo" ${noCo ? '' : 'hidden'}>
      <div class="field"><label>Company name</label><input type="text" name="new_name" placeholder="e.g. Infosys"></div>
      <div class="field"><label>HR name</label><input type="text" name="new_hr_name"></div>
      <div class="grid2"><div class="field" style="margin:0"><label>HR phone</label><input type="tel" name="new_hr_phone" placeholder="+91…"></div>
        <div class="field" style="margin:0"><label>HR email</label><input type="email" name="new_hr_email"></div></div></div>`;

function openInterview(id, preset = {}) {
  const i = id ? findI(id) : null;
  const d = i || { status: 'scheduled', round: 'Screening', mode: 'Video', ...preset };
  const noCo = !S.companies.length;
  const oppField = S.oppReady ? `
    <div class="field"><label>Job opportunity <span class="opt">(optional)</span></label>
      <select name="opportunity_id" id="oppSel"><option value="">Not linked</option>${S.opportunities.map((o) => `<option value="${o.id}" ${d.opportunity_id === o.id ? 'selected' : ''}>${esc((companyOf(o) || {}).name || '?')} – ${esc(o.role)}</option>`).join('')}</select></div>` : '';
  openSheet(i ? 'Edit interview' : 'Add interview', `
  <form data-form="interview"><input type="hidden" name="id" value="${i ? i.id : ''}">
    ${i && S.qaReady && HELD.includes(i.status) ? `<button type="button" class="btn block" data-act="openQA" data-id="${i.id}" style="margin-bottom:14px">${ic('file')}Interview questions &amp; answers${qCount(i.id) ? ' (' + qCount(i.id) + ')' : ''}</button>` : ''}
    ${oppField}
    ${companySelect(d.company_id, noCo)}
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

function openOpportunity(id) {
  const o = id ? oppOf(id) : null;
  const d = o || { status: 'lead', source: 'Recruiter call' };
  const noCo = !S.companies.length;
  openSheet(o ? 'Edit opportunity' : 'Add job opportunity', `
  <form data-form="opportunity"><input type="hidden" name="id" value="${o ? o.id : ''}">
    ${companySelect(d.company_id, noCo)}
    <div class="field"><label>Role</label><input type="text" name="role" required value="${esc(d.role || '')}" placeholder="Python Backend Developer"></div>
    <div class="grid2"><div class="field"><label>Source</label><select name="source">${opts(SOURCES, d.source)}</select></div>
      <div class="field"><label>Status</label><select name="status">${Object.entries(OPP_STATUS).map(([k, v]) => `<option value="${k}" ${k === d.status ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
    <div class="field"><label>Notes</label><textarea name="notes" rows="3" style="min-height:80px" placeholder="Job link, CTC range, location, notice period…">${esc(d.notes || '')}</textarea></div>
    <button class="btn pri block" type="submit">${ic('check')}Save</button>
    ${o ? `<button class="btn danger block" type="button" data-act="delOpp" data-id="${o.id}" style="margin-top:10px">Delete opportunity</button>` : ''}
  </form>`);
}

function openCall(oppId, callId) {
  const x = callId ? S.calls.find((c) => c.id === callId) : null;
  const o = oppOf(x ? x.opportunity_id : oppId); if (!o) return;
  const c = companyOf(o) || {};
  const d = x || { direction: 'Incoming', outcome: 'Interested', call_at: new Date().toISOString(), contact_name: c.hr_name || '' };
  openSheet(x ? 'Edit call' : 'Log call', `
  <form data-form="call"><input type="hidden" name="id" value="${x ? x.id : ''}"><input type="hidden" name="opportunity_id" value="${o.id}">
    <p class="sub" style="margin:-6px 0 14px">${esc(c.name || '')} · ${esc(o.role)}</p>
    <div class="grid2"><div class="field"><label>Direction</label><select name="direction">${opts(CALL_DIR, d.direction)}</select></div>
      <div class="field"><label>Duration (min)</label><input type="number" name="duration_min" min="0" inputmode="numeric" value="${esc(d.duration_min ?? '')}" placeholder="10"></div></div>
    <div class="field"><label>Date &amp; time</label><input type="datetime-local" name="call_at" required value="${toLocalInput(d.call_at)}"></div>
    <div class="field"><label>Spoke with</label><input type="text" name="contact_name" value="${esc(d.contact_name || '')}" placeholder="Recruiter / HR name"></div>
    <div class="grid2"><div class="field"><label>Outcome</label><select name="outcome">${opts(CALL_OUTCOMES, d.outcome)}</select></div>
      <div class="field"><label>Call back / follow up</label><input type="date" name="next_action_on" value="${esc(d.next_action_on || '')}"></div></div>
    <div class="field"><label>Notes</label><textarea name="notes" rows="4" style="min-height:90px" placeholder="What was discussed: JD, CTC, notice period, next steps…">${esc(d.notes || '')}</textarea></div>
    <button class="btn pri block" type="submit">${ic('check')}Save</button>
    ${x ? `<button class="btn danger block" type="button" data-act="delCall" data-id="${x.id}" style="margin-top:10px">Delete call</button>` : ''}
  </form>`);
}

function openQuestion(interviewId, qid) {
  const q = qid ? S.questions.find((x) => x.id === qid) : null;
  const d = q || { kind: 'concept', language: 'Python' };
  const kindBtn = (k, icon, label) => `<button type="button" class="chip ${d.kind === k ? 'on' : ''}" data-act="qaKind" data-id="${k}">${ic(icon, 'sm')}${label}</button>`;
  openSheet(q ? 'Edit question' : 'Add question', `
  <form data-form="qa"><input type="hidden" name="id" value="${q ? q.id : ''}"><input type="hidden" name="interview_id" value="${q ? q.interview_id : interviewId}"><input type="hidden" name="kind" value="${d.kind}">
    <div class="field"><label>Type</label><div class="seg3 seg2">${kindBtn('concept', 'chat', 'Concept')}${kindBtn('coding', 'file', 'Coding')}</div></div>
    <div class="field"><label>Question</label><textarea name="question" rows="3" style="min-height:80px" required placeholder="e.g. Difference between select_related and prefetch_related?">${esc(d.question || '')}</textarea></div>
    <div class="field"><label>Your answer / approach</label><textarea name="answer" rows="4" style="min-height:90px" placeholder="What you said, or the correct answer to remember">${esc(d.answer || '')}</textarea></div>
    <div class="field" id="codeBox" ${d.kind === 'coding' ? '' : 'hidden'}><label>Code</label>
      <div class="editor"><div class="editor-bar"><span class="dots"><i></i><i></i><i></i></span>
        <select name="language" aria-label="Language">${opts(LANGS, d.language || 'Python')}</select>
        <button type="button" class="ed-btn" data-act="edTab" aria-label="Insert tab">Tab ⇥</button></div>
        <textarea name="code" id="qaCode" class="code-input" rows="10" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" placeholder="# write the solution here">${esc(d.code || '')}</textarea></div></div>
    <button class="btn pri block" type="submit">${ic('check')}Save</button>
  </form>`);
}
async function submitQuestion(form) {
  const f = Object.fromEntries(new FormData(form));
  try {
    const coding = f.kind === 'coding';
    const row = {
      interview_id: f.interview_id, kind: f.kind, question: f.question.trim(), answer: f.answer.trim() || null,
      language: coding ? f.language : null, code: coding ? (f.code || '').replace(/\s+$/, '') || null : null
    };
    if (!row.question) throw Object.assign(new Error('Enter the question'), { soft: true });
    if (f.id) row.id = f.id;
    await api.save('interview_questions', row);
    await loadAll(); closeSheet(); render(true); toast('Saved');
  } catch (e) { saveErr(e); }
}

async function resolveCompany(f) {
  if (f.company_id !== '__new') return f.company_id;
  if (!(f.new_name || '').trim()) throw Object.assign(new Error('Enter the company name'), { soft: true });
  const c = await api.save('companies', { name: f.new_name.trim(), hr_name: f.new_hr_name.trim() || null, hr_phone: f.new_hr_phone.trim() || null, hr_email: f.new_hr_email.trim() || null });
  return c.id;
}
const saveErr = (e) => toast(e.soft ? e.message : 'Save failed: ' + (e.message || e));
// a first real conversation / interview moves a "Lead" to "In process"
async function bumpOpp(o) { if (o && o.status === 'lead') await api.save('opportunities', { id: o.id, status: 'active' }); }

async function submitInterview(form) {
  const f = Object.fromEntries(new FormData(form));
  try {
    const opp = f.company_id !== '__new' && f.opportunity_id ? oppOf(f.opportunity_id) : null;
    const company_id = opp ? opp.company_id : await resolveCompany(f);
    const row = {
      company_id, role: f.role.trim(), round: f.round, mode: f.mode,
      interview_at: f.interview_at ? new Date(f.interview_at).toISOString() : null,
      status: f.status, followup_on: f.followup_on || null, notes: f.notes.trim() || null
    };
    if (S.oppReady) row.opportunity_id = opp ? opp.id : null;
    if (f.id) row.id = f.id;
    await api.save('interviews', row);
    await bumpOpp(opp);
    await loadAll(); closeSheet(); render(true); toast('Saved');
  } catch (e) { saveErr(e); }
}
async function submitOpportunity(form) {
  const f = Object.fromEntries(new FormData(form));
  try {
    const row = { company_id: await resolveCompany(f), role: f.role.trim(), source: f.source, status: f.status, notes: f.notes.trim() || null };
    if (f.id) row.id = f.id;
    const saved = await api.save('opportunities', row);
    await loadAll(); closeSheet();
    if (!f.id) { S.oppId = saved.id; render(); } else render(true);   // new opportunity opens straight into its detail page
    toast('Saved');
  } catch (e) { saveErr(e); }
}
async function submitCall(form) {
  const f = Object.fromEntries(new FormData(form));
  try {
    const row = {
      opportunity_id: f.opportunity_id, call_at: new Date(f.call_at).toISOString(), direction: f.direction,
      contact_name: f.contact_name.trim() || null, duration_min: f.duration_min === '' ? null : Math.max(0, parseInt(f.duration_min, 10) || 0),
      outcome: f.outcome, notes: f.notes.trim() || null, next_action_on: f.next_action_on || null
    };
    if (f.id) row.id = f.id;
    const o = oppOf(f.opportunity_id);
    await api.save('calls', row);
    if (POSITIVE_CALL.includes(f.outcome)) await bumpOpp(o);
    await loadAll(); closeSheet(); render(true); toast('Call saved');
    if (!f.id && f.outcome === 'Interview scheduled' && o) openInterview(null, { opportunity_id: o.id, company_id: o.company_id, role: o.role });   // natural next step
  } catch (e) { saveErr(e); }
}
// Group interviews that pre-date opportunities by company + role, and link them
async function linkLegacy() {
  try {
    const orphans = S.interviews.filter((i) => !i.opportunity_id);
    const groups = new Map();
    orphans.forEach((i) => { const k = i.company_id + '|' + (i.role || '').trim().toLowerCase(); (groups.get(k) || groups.set(k, []).get(k)).push(i); });
    for (const list of groups.values()) {
      const first = list[0];
      let opp = S.opportunities.find((o) => o.company_id === first.company_id && o.role.trim().toLowerCase() === (first.role || '').trim().toLowerCase());
      if (!opp) {
        const status = list.some((i) => i.status === 'selected') ? 'offer' : list.every((i) => FINAL.includes(i.status)) ? 'closed' : 'active';
        opp = await api.save('opportunities', { company_id: first.company_id, role: first.role, source: 'Other', status });
        S.opportunities.push(opp);
      }
      for (const i of list) await api.save('interviews', { id: i.id, opportunity_id: opp.id });
    }
    await loadAll(); render(true); toast(`Linked ${orphans.length} interview${orphans.length === 1 ? '' : 's'}`);
  } catch (e) { toast('Could not link: ' + (e.message || e)); }
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
  if (['tab', 'filter', 'ofilter', 'openOpp', 'follow', 'add'].includes(act)) S.qaId = null;
  switch (act) {
    case 'theme': setPref(isDark() ? 'light' : 'dark'); if (S.tab === 'profile') render(true); break;
    case 'themeSet': setPref(id); render(true); break;
    case 'openQA': closeSheet(); S.qaId = id; render(); break;
    case 'qaBack': S.qaId = null; render(); break;
    case 'newQA': openQuestion(id); break;
    case 'editQA': openQuestion(null, id); break;
    case 'copyCode': { const q = S.questions.find((x) => x.id === id); if (q) copyText(q.code); break; }
    case 'qaKind': {
      const fo = el.closest('form'); fo.elements.kind.value = id;
      $$('[data-act=qaKind]', fo).forEach((b) => b.classList.toggle('on', b.dataset.id === id));
      $('#codeBox').hidden = id !== 'coding'; break;
    }
    case 'edTab': { const ta = $('#qaCode'); ta.focus(); ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end'); break; }
    case 'delQA':
      if (confirm('Delete this question?')) await withBusy(el, async () => { try { await api.del('interview_questions', id); await loadAll(); render(true); toast('Deleted'); } catch (err) { toast(err.message); } });
      break;
    case 'tab': if (id === S.tab && id === 'opportunities') S.oppId = null; S.tab = id; render(); break;
    case 'filter': S.tab = 'interviews'; S.filter = id; render(true); break;
    case 'add': S.tab === 'companies' ? openCompany() : S.tab === 'opportunities' ? openOpportunity() : openInterview(); break;
    case 'openOpp': S.oppId = id; render(); break;
    case 'oppBack': S.oppId = null; render(); break;
    case 'editOpp': openOpportunity(id); break;
    case 'newCall': openCall(id); break;
    case 'editCall': openCall(null, id); break;
    case 'newInt': { const o = oppOf(id); openInterview(null, { opportunity_id: o.id, company_id: o.company_id, role: o.role }); break; }
    case 'ofilter': S.tab = 'opportunities'; S.oppId = null; S.ofilter = id; render(true); break;
    case 'linkLegacy': await withBusy(el, linkLegacy); break;
    case 'edit': openInterview(id); break;
    case 'editCompany': openCompany(id); break;
    case 'closeSheet': closeSheet(); break;
    case 'follow': S.tab = 'followup'; S.fu.id = id; fillFu(SUGGEST[findI(id).status] || 'status'); render(); break;
    case 'tpl': fillFu(id); render(true); break;
    case 'snooze': {
      const i = findI(S.fu.id);
      await withBusy(el, async () => {
        try { await api.save('interviews', { id: i.id, followup_on: +id ? todayStr(+id) : null }); await loadAll(); render(true); toast(+id ? 'Follow-up scheduled' : 'Follow-up cleared'); }
        catch (err) { toast(err.message); }
      });
      break;
    }
    case 'fuMail': { const c = companyOf(findI(S.fu.id)) || {}; if (!c.hr_email) toast('No HR email saved. Opening mail app anyway.'); location.href = mailHref(c.hr_email, S.fu.subject, S.fu.body); break; }
    case 'fuWa': { const c = companyOf(findI(S.fu.id)) || {}; window.open(waHref(c.hr_phone, S.fu.body), '_blank', 'noopener'); break; }
    case 'fuCopy': copyText(`Subject: ${S.fu.subject}\n\n${S.fu.body}`); break;
    case 'fuResume': await withBusy(el, () => shareFile(S.fu.body)); break;
    case 'shAll': case 'shNone': SHARE_ITEMS.forEach(([k]) => (S.share[k] = act === 'shAll')); S.share.text = profileText(); render(true); break;
    case 'shCopy': copyText($('#shText').value); break;
    case 'shWa': window.open(waHref(S.share.toPhone, $('#shText').value), '_blank', 'noopener'); break;
    case 'shMail': location.href = mailHref(S.share.toMail, `${P.name} – Profile & Resume`, $('#shText').value); break;
    case 'shNative': nativeShare($('#shText').value); break;
    case 'shFile': await withBusy(el, () => shareFile($('#shText').value)); break;
    case 'delInterview':
      if (confirm('Delete this interview?')) await withBusy(el, async () => { try { await api.del('interviews', id); await loadAll(); closeSheet(); render(true); toast('Deleted'); } catch (err) { toast(err.message); } });
      break;
    case 'delCompany': {
      const n = S.interviews.filter((i) => i.company_id === id).length, k = S.opportunities.filter((o) => o.company_id === id).length;
      if (confirm(n || k ? `Delete this company, its ${plural(k, 'opportunity').replace('opportunitys', 'opportunities')} (with call logs) and ${plural(n, 'interview')}?` : 'Delete this company?')) await withBusy(el, async () => { try { await api.del('companies', id); await loadAll(); closeSheet(); render(true); toast('Deleted'); } catch (err) { toast(err.message); } });
      break;
    }
    case 'delOpp': {
      const n = oppCalls(id).length, m = oppInts(id).length;
      if (confirm(`Delete this opportunity${n ? ` and its ${plural(n, 'call')}` : ''}?${m ? ` Its ${plural(m, 'interview')} will be kept but unlinked.` : ''}`)) {
        await withBusy(el, async () => { try { await api.del('opportunities', id); S.oppId = null; await loadAll(); closeSheet(); render(true); toast('Deleted'); } catch (err) { toast(err.message); } });
      }
      break;
    }
    case 'delCall':
      if (confirm('Delete this call?')) await withBusy(el, async () => { try { await api.del('calls', id); await loadAll(); closeSheet(); render(true); toast('Deleted'); } catch (err) { toast(err.message); } });
      break;
    case 'signout': if (!confirm('Sign out of Interview Tracker?')) break; await withBusy(el, async () => { await sb.auth.signOut(); location.reload(); await new Promise(() => {}); }); break;
  }
});

document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-form]'); if (!f) return;
  e.preventDefault();
  if (f.classList.contains('saving')) return;
  const run = { interview: submitInterview, company: submitCompany, opportunity: submitOpportunity, call: submitCall, qa: submitQuestion }[f.dataset.form];
  f.classList.add('saving');
  withBusy(f.querySelector('[type=submit]'), () => run(f)).finally(() => f.classList.remove('saving'));
});

document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'q') { S.q = t.value; $('#list').innerHTML = listHtml(); }
  else if (t.id === 'oq') { S.oq = t.value; $('#olist').innerHTML = oppListHtml(); }
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
  } else if (t.id === 'coSel') {
    $('#newCo').hidden = t.value !== '__new';
    const os = $('#oppSel');   // keep the opportunity link consistent with the company
    if (os && os.value && (oppOf(os.value) || {}).company_id !== t.value) os.value = '';
  } else if (t.id === 'oppSel') {
    const o = oppOf(t.value), fo = t.closest('form'); if (!o) return;
    fo.elements.company_id.value = o.company_id; $('#newCo').hidden = true;
    if (!fo.elements.role.value.trim()) fo.elements.role.value = o.role;
  }
  else if (t.name === 'status' && t.closest('form[data-form=interview]')) {
    const fo = t.closest('form').elements.followup_on;
    if (!fo.value) { const days = { completed: 3, awaiting: 3, hold: 7 }[t.value]; if (days) fo.value = todayStr(days); }
  }
});

document.addEventListener('keydown', (e) => {
  const t = e.target;
  if (t.classList && t.classList.contains('code-input')) {
    const fire = () => t.dispatchEvent(new Event('input', { bubbles: true }));
    const start = t.selectionStart, v = t.value, ls = v.lastIndexOf('\n', start - 1) + 1;
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) { const m = /^( {1,4}|\t)/.exec(v.slice(ls)); if (m) { t.setRangeText('', ls, ls + m[0].length, 'preserve'); t.selectionStart = t.selectionEnd = Math.max(ls, start - m[0].length); } }
      else t.setRangeText('    ', start, t.selectionEnd, 'end');
      fire();
    } else if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      const line = v.slice(ls, start), indent = /^[ \t]*/.exec(line)[0] + (/[:{(\[]\s*$/.test(line) ? '    ' : '');
      t.setRangeText('\n' + indent, start, t.selectionEnd, 'end'); fire();
    }
    return;
  }
  if (e.key === 'Escape') closeSheet();
});

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
    <section class="auth-hero">${themeBtn('auth-theme')}<div class="blob b1"></div><div class="blob b2"></div>
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
  applyTheme();
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
  $('#topbar').hidden = false; renderTopbar();
  $('#view').innerHTML = skeleton();
  await loadAll();
  render();
  if (new URLSearchParams(location.search).get('action') === 'add') openInterview();
}
init();
})();
