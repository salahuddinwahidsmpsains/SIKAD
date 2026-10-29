/* Klien REST ke Google Apps Script — edisi PRO (gas-instant-ux-pro)
   · POST text/plain (tanpa preflight CORS) · timeout + retry baca · reqId idempoten untuk tulis
   · SWR: tampil dari cache perangkat seketika, segarkan di latar, render ulang hanya bila data berubah
   · prefetch lewat endpoint batch · cache per-pengguna (aman di perangkat bersama) */
const FRONT_VER = '1.3.0';
const Sesi = {
  get token() { try { return localStorage.getItem('sikad_t') || ''; } catch (e) { return ''; } },
  get me() { try { return JSON.parse(localStorage.getItem('sikad_m') || 'null'); } catch (e) { return null; } },
  set(t, m) { try { localStorage.setItem('sikad_t', t); localStorage.setItem('sikad_m', JSON.stringify(m)); } catch (e) {} },
  clear() { try { localStorage.removeItem('sikad_t'); localStorage.removeItem('sikad_m'); } catch (e) {} }
};
const API_SIAP = () => !/GANTI|XXXX/.test(window.APP_CONFIG.GAS_URL || '');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toast(m, err) { const t = document.getElementById('toast'); t.textContent = m; t.className = 'toast show' + (err ? ' err' : ''); clearTimeout(toast._t); toast._t = setTimeout(() => t.className = 'toast', 3400); }

/* ---------- Ukur (Prinsip 0): ketik Perf.table() di console ---------- */
const Perf = { rows: [], add(action, total, server) { this.rows.push({ action, total, server: server == null ? null : server, net: server == null ? null : total - server }); if (this.rows.length > 200) this.rows.shift(); }, table() { console.table(this.rows.slice(-30)); } };

/* ---------- Jaringan: timeout, retry, reqId ---------- */
const BACA = /^(konten\.publik|me|jadwal\.|siswa\.kelas|absensi\.get|jurnal\.list|monitor$|master\.list|konten\.list|crm\.(list|stats)|notif\.get|ujian\.(list|tersedia|ringkasan|hasil|detail|soalGet|mulai)|ref$|profil\.get|laporan$|rekap\.daftar|batch$)/;
const TANPA_ULANG_TULIS = /^(master\.(save|resetSandi|resetMassal)|rahasia\.|auth\.ubahSandi|auth\.login)/;   // pembawa rahasia: jangan diulang otomatis
const _inflight = {}; let _epoch = 0;
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
async function apiOnce(action, data, timeout, reqId) {
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), timeout), t0 = performance.now();
  try {
    const res = await fetch(window.APP_CONFIG.GAS_URL, { method: 'POST', redirect: 'follow', cache: 'no-store', signal: ctrl.signal, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: Sesi.token, reqId, data: data || {} }) });
    const text = await res.text();
    try { const j = JSON.parse(text); Perf.add(action, Math.round(performance.now() - t0), j.ms); if (j.v) cekVersi(j.v); return j; }
    catch (e) { return { success: false, network: true, retryable: res.status >= 500 || res.status === 429, message: 'Server membalas HTTP ' + res.status + ' (bukan JSON).' }; }
  } catch (err) { return { success: false, network: true, retryable: true, message: err.name === 'AbortError' ? 'Server terlalu lama merespons.' : 'Koneksi terputus. Periksa internet Anda.' }; }
  finally { clearTimeout(timer); }
}
const tungguOnline = ms => new Promise(r => { if (navigator.onLine !== false) return r(); const t = setTimeout(done, ms); function done() { clearTimeout(t); removeEventListener('online', done); r(); } addEventListener('online', done); });
async function apiRun(action, data) {
  if (!API_SIAP()) return { success: false, message: 'Konfigurasi belum lengkap: isi GAS_URL di js/config.js.', code: 'CONFIG' };
  const baca = BACA.test(action), reqId = baca ? '' : uuid(), maks = baca ? 3 : (TANPA_ULANG_TULIS.test(action) ? 1 : 2); let res;
  for (let i = 0; i < maks; i++) {
    if (i) { await new Promise(r => setTimeout(r, 1200 * i)); if (navigator.onLine === false) await tungguOnline(15000); }
    res = await apiOnce(action, data, baca ? (i ? 40000 : 25000) : 90000, reqId);
    if (res.success || !res.retryable) break;
  }
  if (res.code === 'AUTH') sesiBerakhir();
  if (res.code === 'GANTI_SANDI') { const m = Sesi.me; if (m) { m.gantiSandi = true; Sesi.set(Sesi.token, m); } if (location.hash === '#/portal/profil') { if (typeof route === 'function') route(); } else location.hash = '#/portal/profil'; }
  return res;
}
function sesiBerakhir() { Sesi.clear(); SWR.clear(); if (location.hash.indexOf('portal') > -1) location.hash = '#/login'; }
function api(action, data) {
  if (!BACA.test(action)) {
    _epoch++;
    return apiRun(action, data).then(r => { if (r.success) SWR.clear(); return r; });       // setelah tulis: cache pengguna dibuang agar tak basi
  }
  const k = _epoch + '|' + action + '|' + JSON.stringify(data || {});
  if (_inflight[k]) return _inflight[k];
  const p = apiRun(action, data); _inflight[k] = p; const done = () => delete _inflight[k]; p.then(done, done); return p;
}

/* ---------- SWR: cache perangkat per-pengguna + versi skema ---------- */
const LS_PREFIX = 'sikad:v3:', FRESH = { 'absensi.get': 10000, 'crm.list': 30000, 'jadwal.hariIni': 20000, 'ujian.tersedia': 15000, monitor: 30000, laporan: 30000, 'profil.get': 120000, ref: 300000 };
const CACHEABLE = /^(jadwal\.|absensi\.get|crm\.list|jurnal\.list|monitor$|master\.list|konten\.list|crm\.stats|notif\.get|ujian\.(list|tersedia|ringkasan)|ref$|profil\.get|laporan$|rekap\.daftar)/;   // kunci jawaban & hasil per siswa TIDAK di-cache
const hashStr = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h + ':' + s.length; };
const uidAktif = () => { const m = Sesi.me; return m ? m.id : 'anon'; };
const swrKey = (action, data) => 'u:' + uidAktif() + ':' + action + ':' + JSON.stringify(data || {});
const SWR = {
  mem: {},
  get(k) { if (this.mem[k]) return this.mem[k]; try { const v = localStorage.getItem(LS_PREFIX + k); if (v) return (this.mem[k] = JSON.parse(v)); } catch (e) {} return null; },
  set(k, data) {
    const e = { t: Date.now(), h: hashStr(JSON.stringify(data)), data }; this.mem[k] = e;
    try { localStorage.setItem(LS_PREFIX + k, JSON.stringify(e)); }
    catch (x) { try { Object.keys(localStorage).filter(z => z.indexOf(LS_PREFIX) === 0 && z.indexOf(LS_PREFIX + 'u:' + uidAktif() + ':') !== 0).forEach(z => localStorage.removeItem(z)); localStorage.setItem(LS_PREFIX + k, JSON.stringify(e)); } catch (y) {} }   // kuota penuh → buang cache pengguna lain
    return e;
  },
  clear() { this.mem = {}; try { Object.keys(localStorage).filter(z => z.indexOf(LS_PREFIX) === 0).forEach(z => localStorage.removeItem(z)); } catch (e) {} }
};
const _rev = {};
/** apiC: bila ada cache → kembalikan SEKETIKA (tanpa menunggu server); bila sudah lewat batas kesegaran → segarkan di latar dan panggil rerender() HANYA jika data berubah. */
async function apiC(action, data, rerender, opt) {
  opt = opt || {}; const key = swrKey(action, data), c = SWR.get(key), ttl = opt.fresh != null ? opt.fresh : (FRESH[action] || 45000), kirim = Object.assign({}, data || {}, opt.extra || {});
  if (c && !opt.force) {
    if (Date.now() - c.t >= ttl && !_rev[key]) { _rev[key] = 1; api(action, kirim).then(r => { delete _rev[key]; if (r.success) { const e = SWR.set(key, r.data); if (e.h !== c.h && rerender) rerender(); } }, () => { delete _rev[key]; }); }
    return { success: true, data: c.data, cached: true };
  }
  const r = await api(action, kirim);
  if (r.success && CACHEABLE.test(action)) SWR.set(key, r.data);
  return r;
}
const rr = (nama, v, fn) => () => { if (typeof VIEW !== 'undefined' && VIEW === nama && v.isConnected) fn(); };   // render ulang hanya bila pengguna masih di halaman itu
function primeSWR(boot) { try { if (boot && boot.calls) boot.calls.forEach((c, i) => { const r = boot.results[i]; if (r && r.success && CACHEABLE.test(c.action)) SWR.set(swrKey(c.action, c.data), r.data); }); } catch (e) {} }
/** prefetch: beberapa aksi baca dalam 1 panggilan batch, hanya yang belum ada / sudah basi */
function prefetch(calls) {
  const perlu = calls.filter(c => { const e = SWR.get(swrKey(c.action, c.data)); return !e || Date.now() - e.t > (FRESH[c.action] || 45000); }).slice(0, 12);
  if (!perlu.length || !Sesi.token) return;
  api('batch', { calls: perlu }).then(r => { if (r.success) perlu.forEach((c, i) => { const x = r.data[i]; if (x && x.success && CACHEABLE.test(c.action)) SWR.set(swrKey(c.action, c.data), x.data); }); });
}
const idle = fn => (window.requestIdleCallback || (f => setTimeout(f, 1200)))(fn);

/* ---------- Warm-up server & deteksi versi ---------- */
function warmUp(paksa) { try { if (!API_SIAP()) return; const t = +sessionStorage.getItem('sikad_w') || 0; if (!paksa && Date.now() - t < 240000) return; sessionStorage.setItem('sikad_w', Date.now()); fetch(window.APP_CONFIG.GAS_URL + '?w=pub', { mode: 'no-cors', cache: 'no-store' }).catch(() => {}); } catch (e) {} }
let _hidAt = 0; document.addEventListener('visibilitychange', () => { if (document.hidden) _hidAt = Date.now(); else if (_hidAt && Date.now() - _hidAt > 120000) warmUp(true); });
const vNum = v => String(v).split('.').map(Number).reduce((a, n, i) => a + (n || 0) / Math.pow(1000, i), 0);
function cekVersi(sv) {
  try {
    if (sessionStorage.getItem('sikad_vbar') === sv) return; const m = Sesi.me, d = vNum(sv) - vNum(FRONT_VER); if (!d) return;
    if (d < 0 && !(m && m.role === 'admin')) return;
    sessionStorage.setItem('sikad_vbar', sv); const b = document.createElement('div'); b.className = 'verbar';
    b.innerHTML = d > 0 ? 'Versi aplikasi lebih baru tersedia (' + esc(sv) + '). <button class="btn btn-amber btn-sm" id="vr">Muat ulang</button>' : 'Tampilan v' + FRONT_VER + ' belum cocok dengan backend v' + esc(sv) + ' — admin: Apps Script → Deploy → Manage deployments → ✏️ → <b>New version</b>. <button class="btn btn-ghost btn-sm" id="vx">Tutup</button>';
    document.body.appendChild(b); const r = b.querySelector('#vr'); if (r) r.onclick = () => { SWR.clear(); location.reload(); }; const x = b.querySelector('#vx'); if (x) x.onclick = () => b.remove();
  } catch (e) {}
}
