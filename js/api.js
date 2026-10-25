/* Klien REST ke Google Apps Script — POST text/plain (tanpa preflight CORS) */
const Sesi = {
  get token() { try { return localStorage.getItem('sikad_t') || ''; } catch (e) { return ''; } },
  get me() { try { return JSON.parse(localStorage.getItem('sikad_m') || 'null'); } catch (e) { return null; } },
  set(t, m) { try { localStorage.setItem('sikad_t', t); localStorage.setItem('sikad_m', JSON.stringify(m)); } catch (e) {} },
  clear() { try { localStorage.removeItem('sikad_t'); localStorage.removeItem('sikad_m'); } catch (e) {} }
};
const API_SIAP = () => !/GANTI|XXXX/.test(window.APP_CONFIG.GAS_URL || '');
const _inflight = {}; let _epoch = 0;
const BACA = /^(konten\.publik|me|jadwal\.|siswa\.kelas|absensi\.get|jurnal\.list|monitor$|master\.list|konten\.list|crm\.(list|stats)|notif\.get)/;
async function apiRun(action, data) {
  if (!API_SIAP()) return { success: false, message: 'Konfigurasi belum lengkap: isi GAS_URL di js/config.js.', code: 'CONFIG' };
  try {
    const res = await fetch(window.APP_CONFIG.GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: Sesi.token, data: data || {} }) });
    const j = await res.json();
    if (j.code === 'AUTH') { Sesi.clear(); if (location.hash.indexOf('portal') > -1) location.hash = '#/login'; }
    return j;
  } catch (e) { return { success: false, message: 'Gagal terhubung ke server. Periksa koneksi internet.' }; }
}
function api(action, data) {
  if (!BACA.test(action)) { _epoch++; return apiRun(action, data); }
  const k = _epoch + '|' + action + '|' + JSON.stringify(data || {});
  if (_inflight[k]) return _inflight[k];
  const p = apiRun(action, data); _inflight[k] = p;
  const done = () => delete _inflight[k]; p.then(done, done); return p;
}
/* Warmup server (no-cors, maks 1×/4 menit) */
function warmUp() { try { if (!API_SIAP()) return; const t = +sessionStorage.getItem('sikad_w') || 0; if (Date.now() - t < 240000) return; sessionStorage.setItem('sikad_w', Date.now()); fetch(window.APP_CONFIG.GAS_URL + '?w=pub', { mode: 'no-cors' }); } catch (e) {} }
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toast(m, err) { const t = document.getElementById('toast'); t.textContent = m; t.className = 'toast show' + (err ? ' err' : ''); clearTimeout(toast._t); toast._t = setTimeout(() => t.className = 'toast', 3200); }
