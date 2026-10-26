/* Landing publik: konten dari GAS (SWR localStorage) + fallback demo + efek interaktif */
const DEMO = { pengaturan: { nama_sekolah: 'SMP Sains Salahuddin Wahid', sambutan: 'Selamat datang di SMP Sains Salahuddin Wahid — sekolah yang memadukan sains, akhlak, dan teknologi untuk mencetak generasi unggul.', stat_siswa: '0', stat_guru: '0', stat_program: '4', stat_prestasi: '0', info_pendaftaran: 'Isi formulir minat di bawah dan panitia akan menghubungi Anda.', alamat: '', email_publik: '', wa_publik: '' },
  konten: [
    { jenis: 'slide', judul: 'Mulai Masa Depan Cemerlang Bersama Sains', isi: 'Belajar berbasis eksperimen, akhlak mulia, dan teknologi.', gambar: [], meta: { kata: 'Cemerlang' } },
    { jenis: 'slide', judul: 'Laboratorium Sains yang Hidup', isi: 'Praktikum rutin membangun rasa ingin tahu.', gambar: [], meta: { kata: 'Hidup' } },
    { jenis: 'program', judul: 'Kelas Sains Terapan', isi: 'Eksperimen mingguan di laboratorium.', gambar: [], meta: { ikon: '🔬' } },
    { jenis: 'program', judul: 'Tahfiz & Karakter', isi: 'Pembiasaan ibadah, adab, dan hafalan.', gambar: [], meta: { ikon: '📖' } },
    { jenis: 'testimoni', judul: 'Wali murid', isi: 'Anak saya jadi lebih percaya diri dan senang bereksperimen.', gambar: [], meta: { nama: 'Ibu Rina', peran: 'Wali murid', bintang: 5 } }
  ] };
const GRAD = [['#1E2B4F', '#1F7A7A'], ['#14595a', '#1E2B4F'], ['#F5A524', '#B45309'], ['#2b3b6b', '#F5A524'], ['#1F7A7A', '#071639']];
const IKON = ['🔬', '📖', '🤖', '🏆', '🧪', '🌍'];
let DATA = DEMO;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const by = j => (DATA.konten || []).filter(k => k.jenis === j);
const bintang = n => '★'.repeat(Math.max(1, Math.min(5, +n || 5)));

/* ---------- Muat konten ---------- */
async function muatKonten() {
  try { const c = JSON.parse(localStorage.getItem('sikad_pub') || 'null'); if (c) { DATA = c; render(); } } catch (e) {}
  if (!API_SIAP()) { if (DATA === DEMO) render(); return; }
  const r = await api('konten.publik');
  if (r.success) { const h = JSON.stringify(r.data); if (h !== localStorage.getItem('sikad_pub')) { localStorage.setItem('sikad_pub', h); DATA = r.data; render(); } }
  else if (DATA === DEMO) render();
}
function render() {
  const p = DATA.pengaturan || {};
  $('#brandName').textContent = $('#footName').textContent = p.nama_sekolah || 'SMP Sains Salahuddin Wahid';
  $('#sambutan').textContent = p.sambutan || ''; $('#infoDaftar').textContent = p.info_pendaftaran || '';
  $('#yr').textContent = new Date().getFullYear();
  const wa = String(p.wa_publik || '').replace(/\D/g, '').replace(/^0/, '62'), a = $('#waFloat');
  a.href = wa ? 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Assalamualaikum, saya ingin bertanya tentang ' + (p.nama_sekolah || 'sekolah')) : '#kontak'; if (!wa) a.removeAttribute('target');
  $('#kontakInfo').innerHTML = [p.alamat && '📍 ' + esc(p.alamat), p.email_publik && '✉️ ' + esc(p.email_publik), wa && '💬 WhatsApp +' + esc(wa)].filter(Boolean).map(x => '<li>' + x + '</li>').join('');
  const st = [['stat_siswa', 'Siswa Aktif', '🎒'], ['stat_guru', 'Guru & Tendik', '👩‍🏫'], ['stat_program', 'Program Unggulan', '🧪'], ['stat_prestasi', 'Prestasi', '🏅']];
  $('#stats').innerHTML = st.map(s => '<div><div style="font-size:1.8rem">' + s[2] + '</div><div class="n" data-n="' + (+p[s[0]] || 0) + '">0</div><div class="l">' + s[1] + '</div></div>').join('');
  renderHero(); renderProgram(); renderBerita(); renderTesti(); efekKartu(); hitungAngka();
}

/* ---------- Hero slideshow otomatis ---------- */
let heroI = 0, heroT = null;
function bg(g, i) { const c = GRAD[i % GRAD.length]; return g && g[0] ? 'background-image:url(' + esc(g[0]) + ')' : 'background:linear-gradient(135deg,' + c[0] + ',' + c[1] + ')'; }
function renderHero() {
  const L = by('slide').length ? by('slide') : DEMO.konten.filter(k => k.jenis === 'slide');
  $('#heroSlides').innerHTML = L.map((s, i) => {
    const kata = (s.meta && s.meta.kata) || '', t = esc(s.judul), h = kata && t.indexOf(esc(kata)) > -1 ? t.replace(esc(kata), '<em>' + esc(kata) + '</em>') : t;
    return '<div class="slide' + (i ? '' : ' on') + '"><div class="bg" style="' + bg(s.gambar, i) + '"></div><div class="ov"></div>' +
      '<span class="deco" style="width:120px;height:120px;right:12%;top:18%;background:radial-gradient(circle,#F5A524,transparent 70%)"></span><span class="deco" style="width:70px;height:70px;right:26%;bottom:22%;animation-delay:-3s;background:radial-gradient(circle,#9ff1f0,transparent 70%)"></span>' +
      '<div class="txt"><span class="eyebrow" style="color:#9ff1f0">Selamat datang</span><h1>' + h + '</h1><p>' + esc(s.isi) + '</p><div class="cta"><a class="btn btn-amber btn-glow" href="#kontak">Daftar Sekarang →</a><a class="btn btn-ghost" href="#program">Lihat Program</a></div></div></div>';
  }).join('');
  $('#heroDots').innerHTML = L.map((_, i) => '<b class="' + (i ? '' : 'on') + '" data-i="' + i + '"></b>').join('');
  heroI = 0; heroAuto(); $('#heroDots').onclick = e => { if (e.target.dataset.i) { heroGo(+e.target.dataset.i); heroAuto(); } };
}
function heroGo(i) { const S = $$('#heroSlides .slide'), D = $$('#heroDots b'); if (!S.length) return; heroI = (i + S.length) % S.length; S.forEach((s, k) => s.classList.toggle('on', k === heroI)); D.forEach((d, k) => d.classList.toggle('on', k === heroI)); }
function heroAuto() { clearInterval(heroT); heroT = setInterval(() => heroGo(heroI + 1), 6000); }

/* ---------- Kartu program: slideshow per kartu ---------- */
function renderProgram() {
  const L = by('program'); $('#programGrid').innerHTML = L.length ? L.map((p, i) => {
    const imgs = p.gambar.length ? p.gambar : [0, 1, 2], ik = (p.meta && p.meta.ikon) || IKON[i % IKON.length];
    const sl = imgs.map((g, k) => '<div class="ps' + (k ? '' : ' on') + '" style="' + (p.gambar.length ? 'background-image:url(' + esc(g) + ')' : 'background:linear-gradient(135deg,' + GRAD[(i + k) % 5][0] + ',' + GRAD[(i + k) % 5][1] + ')') + '">' + (p.gambar.length ? '' : '<span>' + ik + '</span>') + '</div>').join('');
    return '<article class="glow-card pcard" data-k="p' + i + '"><div class="pslide" data-n="' + imgs.length + '">' + sl + '<div class="pdots">' + imgs.map((_, k) => '<b class="' + (k ? '' : 'on') + '"></b>').join('') + '</div></div><div class="pbody"><h3>' + esc(p.judul) + '</h3><p>' + esc(p.isi) + '</p><a class="more" href="#kontak">Tanya program ini →</a></div></article>';
  }).join('') : '<div class="empty">Program akan segera ditampilkan.</div>';
  $$('.pslide').forEach((el, i) => { let k = 0; const n = +el.dataset.n; if (n < 2) return; setInterval(() => { if (el.matches(':hover') || document.hidden) return; k = (k + 1) % n; $$('.ps', el).forEach((s, x) => s.classList.toggle('on', x === k)); $$('.pdots b', el).forEach((s, x) => s.classList.toggle('on', x === k)); }, 2800 + i * 450); });
}
function renderBerita() {
  const L = by('berita').concat(by('pengumuman')).slice(0, 6); $('#beritaGrid').innerHTML = L.length ? L.map((b, i) =>
    '<article class="glow-card ncard" data-b="' + i + '" style="cursor:pointer"><div class="nimg" style="' + (b.gambar[0] ? 'background-image:url(' + esc(b.gambar[0]) + ')' : '') + '">' + (b.gambar[0] ? '' : (b.jenis === 'berita' ? '📰' : '📣')) + '</div><div class="nb"><span class="tag ' + (b.jenis === 'berita' ? '' : 'p') + '">' + esc(b.jenis) + '</span><h3>' + esc(b.judul) + '</h3><p>' + esc(b.isi) + '</p><small>' + esc(b.tanggal) + '</small></div></article>').join('') : '<div class="empty">Belum ada berita.</div>';
  $('#beritaGrid').onclick = e => { const c = e.target.closest('[data-b]'); if (!c) return; const b = L[+c.dataset.b]; modal('<span class="tag">' + esc(b.jenis) + '</span><h3>' + esc(b.judul) + '</h3>' + (b.gambar[0] ? '<img src="' + esc(b.gambar[0]) + '" alt="" style="width:100%;border-radius:10px;margin-bottom:10px">' : '') + '<p style="white-space:pre-line">' + esc(b.isi) + '</p><small>' + esc(b.tanggal) + '</small>'); };
}

/* ---------- Testimoni: flip otomatis bergiliran + pop-up ---------- */
let testiT = null;
function renderTesti() {
  const L = by('testimoni'); const g = $('#testiGrid');
  g.innerHTML = L.length ? L.map((t, i) => { const m = t.meta || {}, nm = m.nama || t.judul || 'Anonim';
    return '<div class="flip" data-t="' + i + '"><div class="flip-in"><div class="face"><div class="qm">“</div><div class="q">' + esc(t.isi) + '</div><div class="who"><span class="av">' + esc(nm.charAt(0)) + '</span><div><b>' + esc(nm) + '</b><small>' + esc(m.peran || t.judul) + '</small></div></div></div>' +
      '<div class="face back"><div class="stars">' + bintang(m.bintang) + '</div><b>' + esc(nm) + '</b><small style="color:#cdeeee">' + esc(m.peran || t.judul) + '</small><button class="btn btn-amber btn-sm btn-glow">Baca lengkap</button></div></div></div>'; }).join('') : '<div class="empty" style="color:#cbd5e1">Belum ada testimoni.</div>';
  let n = 0; clearInterval(testiT); const F = $$('.flip', g);
  testiT = setInterval(() => { if (!F.length || g.matches(':hover') || document.hidden) return; F.forEach(f => f.classList.remove('on')); F[n % F.length].classList.add('on'); n++; }, 3500);
  g.onclick = e => { const f = e.target.closest('.flip'); if (!f) return; const t = L[+f.dataset.t], m = t.meta || {}, nm = m.nama || t.judul;
    modal('<div class="stars" style="font-size:1.4rem">' + bintang(m.bintang) + '</div><h3>' + esc(nm) + '</h3><small style="color:var(--mute)">' + esc(m.peran || '') + '</small><p style="font-size:1.05rem;white-space:pre-line;margin-top:14px">“' + esc(t.isi) + '”</p>'); };
}

/* ---------- Efek: spotlight kursor + tilt kartu, hitung angka ---------- */
function efekKartu() {
  const sel = '.glow-card,.flip'; $$(sel).forEach(el => { if (el._fx) return; el._fx = 1;
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; el.style.setProperty('--mx', x + 'px'); el.style.setProperty('--my', y + 'px');
      if (el.classList.contains('glow-card') && !el.classList.contains('form') && e.pointerType === 'mouse') el.style.transform = 'perspective(800px) rotateX(' + ((y / r.height - .5) * -6) + 'deg) rotateY(' + ((x / r.width - .5) * 6) + 'deg) translateY(-4px)'; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; }); });
}
function hitungAngka() {
  const io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; io.unobserve(en.target); const to = +en.target.dataset.n, t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / 1400); en.target.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString('id-ID') + (to ? '+' : ''); if (k < 1) requestAnimationFrame(f); })(t0); }), { threshold: .4 });
  $$('.n[data-n]').forEach(n => io.observe(n));
}

/* ---------- Modal ---------- */
function modal(html, wide) { $('#modalBody').onclick = null; $('#modalBody').innerHTML = html; $('.modal-box').classList.toggle('wide', !!wide); $('#modal').hidden = false; document.body.style.overflow = 'hidden'; }
function tutupModal() { $('#modal').hidden = true; document.body.style.overflow = ''; }
$('#modalX').onclick = tutupModal; $('#modal').onclick = e => { if (e.target.id === 'modal') tutupModal(); }; addEventListener('keydown', e => { if (e.key === 'Escape') tutupModal(); });

/* ---------- Form kontak → CRM ---------- */
$('#kontakForm').addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target, b = f.querySelector('button'), m = $('#formMsg'), v = Object.fromEntries(new FormData(f));
  if (!v.nama.trim()) { m.className = 'formmsg err'; m.textContent = 'Nama wajib diisi.'; return; }
  if (!v.wa.trim() && !v.email.trim()) { m.className = 'formmsg err'; m.textContent = 'Isi WhatsApp atau email.'; return; }
  b.disabled = true; b.textContent = 'Mengirim…';
  const r = await api('kontak.kirim', { nama: v.nama, wa: v.wa, email: v.email, pesan: v.pesan, web: v.web, jenis: f.ppdb.checked ? 'pendaftaran' : 'kontak' });
  b.disabled = false; b.textContent = 'Kirim Pesan'; m.className = 'formmsg ' + (r.success ? 'ok' : 'err'); m.textContent = r.message || (r.success ? 'Terkirim.' : 'Gagal.');
  if (r.success) { f.reset(); f.ppdb.checked = true; toast('Terima kasih! Pesan terkirim ✅'); mascotWow(); }
});

/* ---------- Navigasi ---------- */
$('#burger').onclick = () => $('#menu').classList.toggle('open'); $('#menu').onclick = () => $('#menu').classList.remove('open');
$('#hPrev').onclick = () => { heroGo(heroI - 1); heroAuto(); }; $('#hNext').onclick = () => { heroGo(heroI + 1); heroAuto(); };
$('#heroSlides').addEventListener('mouseenter', () => clearInterval(heroT)); $('#heroSlides').addEventListener('mouseleave', heroAuto);
setTimeout(() => { const w = $('#waFloat'); w.classList.add('hint'); setTimeout(() => w.classList.remove('hint'), 4000); }, 3500);

/* ---------- MASKOT BUKU: mengikuti kursor, buka-tutup, bola mata, balik halaman ---------- */
const mk = $('#mascot'), pL = $('#pL'), pR = $('#pR'); let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, lastMove = 0, lastX = 0, lastFlip = 0, rot = 0, vxS = 0;
addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; lastMove = performance.now(); mk.classList.remove('closed'); }, { passive: true });
addEventListener('touchmove', e => { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; lastMove = performance.now(); mk.classList.remove('closed'); }, { passive: true });
addEventListener('scroll', () => { lastMove = performance.now(); mk.classList.remove('closed'); }, { passive: true });
addEventListener('pointerdown', () => { mascotFlip(); });
function mascotFlip() { const n = performance.now(); if (n - lastFlip < 600) return; lastFlip = n; mk.classList.remove('flipping'); void mk.getBoundingClientRect(); mk.classList.add('flipping'); setTimeout(() => mk.classList.remove('flipping'), 580); }
function mascotWow() { mk.classList.remove('wow'); void mk.getBoundingClientRect(); mk.classList.add('wow'); }
(function loop(t) {
  const px = tx + 26, py = ty + 22; cx += (px - cx) * .12; cy += (py - cy) * .12; const vx = px - cx; vxS += (vx - vxS) * .2; rot += ((Math.max(-22, Math.min(22, vxS * .5))) - rot) * .2;
  mk.style.transform = 'translate(' + (cx - 42) + 'px,' + (cy - 35) + 'px) rotate(' + rot.toFixed(1) + 'deg)';
  const dx = tx - cx, dy = ty - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(3.4, d / 40), ox = dx / d * k, oy = dy / d * k;
  pL.setAttribute('cx', 42 + ox); pL.setAttribute('cy', 46 + oy); pR.setAttribute('cx', 78 + ox); pR.setAttribute('cy', 46 + oy);
  if (Math.abs(vxS) > 14 && t - lastFlip > 900) mascotFlip();
  if (t - lastMove > 2200) mk.classList.add('closed');                      // diam → buku menutup
  requestAnimationFrame(loop);
})(0);
$$('a,button').forEach(el => el.addEventListener('pointerenter', () => { mk.classList.remove('closed'); }));

muatKonten(); warmUp();
