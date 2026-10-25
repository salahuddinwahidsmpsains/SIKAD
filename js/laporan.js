/* Laporan & Rekap (admin): tabel dengan cari + filter tanggal/kelas, unduh Excel/PDF, grafik nilai, arsip bulanan ke Drive */
let LAP = { tab: 'absensi', cari: '', dari: '', sampai: '', kelas: '' };
const awalBulan = () => hariIni().slice(0, 8) + '01';
async function laporan(v) {
  if (!LAP.dari) { LAP.dari = awalBulan(); LAP.sampai = hariIni(); }
  v.innerHTML = head('Laporan & Rekap', 'Absensi, jurnal mengajar, nilai ujian — unduh Excel/PDF dan arsip bulanan') + '<div class="panel"><div class="pb"><div class="fgrid"><label>Dari<input type="date" id="ld" value="' + LAP.dari + '"></label><label>Sampai<input type="date" id="ls" value="' + LAP.sampai + '"></label><label>Kelas<select id="lk"><option value="">Semua kelas</option></select></label><label>Cari<input id="lc" placeholder="Nama / topik / guru…" value="' + esc(LAP.cari) + '"></label></div></div></div>' +
    '<div class="tabs">' + [['absensi', 'Rekap Absensi'], ['jurnal', 'Jurnal Mengajar'], ['nilai', 'Nilai Ujian']].map(t => '<button data-t="' + t[0] + '" class="' + (LAP.tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>').join('') + '</div><div id="lb">' + sk + '</div>' +
    '<div class="panel"><div class="pt"><h3>🗄️ Arsip Rekap Bulanan</h3><small style="color:var(--mute)">Excel + PDF disimpan ke folder Drive “Rekap” &amp; dikirim ke email Kepala Sekolah. Otomatis tiap tanggal 1.</small></div><div class="pb"><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end"><label>Bulan<input type="month" id="bl" value="' + hariIni().slice(0, 7) + '"></label><button class="btn btn-amber btn-glow" id="ar">Buat &amp; Arsipkan</button></div><div id="al" style="margin-top:14px"></div></div></div>';
  api('ref').then(r => { if (r.success) { $('#lk').innerHTML += r.data.kelas.map(k => '<option' + (k === LAP.kelas ? ' selected' : '') + '>' + esc(k) + '</option>').join(''); } });
  const muat = async () => { LAP.dari = $('#ld').value; LAP.sampai = $('#ls').value; LAP.kelas = $('#lk').value; LAP.cari = $('#lc').value; const lb = $('#lb'); lb.innerHTML = sk; await isi(lb); };
  ['ld', 'ls', 'lk'].forEach(i => $('#' + i).onchange = muat); let tm; $('#lc').oninput = () => { clearTimeout(tm); tm = setTimeout(muat, 300); };
  v.onclick = e => { const t = e.target.closest('[data-t]'); if (t) { LAP.tab = t.dataset.t; laporan(v); } };
  $('#ar').onclick = async e => { const b = e.target; b.disabled = true; b.textContent = 'Menyusun rekap…'; const r = await api('rekap.arsip', { bulan: $('#bl').value }); b.disabled = false; b.textContent = 'Buat & Arsipkan'; toast(r.message, !r.success); if (r.success) daftarArsip(); };
  daftarArsip(); await muat();
}
async function isi(lb) {
  const q = LAP.cari.toLowerCase(), cocok = a => !q || a.join(' ').toLowerCase().indexOf(q) > -1; let kol, bar, sub = LAP.dari + ' s/d ' + LAP.sampai + (LAP.kelas ? ' · ' + LAP.kelas : ''), judul, extra = '';
  if (LAP.tab === 'nilai') {
    const [r, g] = await Promise.all([api('ujian.list'), api('ujian.ringkasan')]); if (!r.success) return lb.innerHTML = '<div class="panel"><div class="empty">' + esc(r.message) + '</div></div>';
    judul = 'Nilai Ujian'; kol = ['Ujian', 'Jenis', 'Mapel', 'Kelas', 'Guru', 'Peserta', 'Rata-rata', 'Status']; bar = r.data.filter(u => !LAP.kelas || u.kelas === LAP.kelas).map(u => [u.judul, u.jenis, u.mapel, u.kelas, u.guru, u.peserta, u.rata === null ? '' : u.rata, u.status]).filter(cocok); sub = 'Semua ujian';
    if (g.success) extra = grafikNilai(g.data);
  } else {
    const r = await api('laporan', { dari: LAP.dari, sampai: LAP.sampai, kelas: LAP.kelas }); if (!r.success) return lb.innerHTML = '<div class="panel"><div class="empty">' + esc(r.message) + '</div></div>';
    if (LAP.tab === 'absensi') { judul = 'Rekap Absensi'; kol = ['Kelas', 'NIS', 'Nama', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Total', '% Hadir']; bar = r.data.absensi.map(a => [a.kelas, a.nis, a.nama, a.H, a.S, a.I, a.A, a.total, a.persen]).filter(cocok); }
    else { judul = 'Jurnal Mengajar'; kol = ['Tanggal', 'Jam', 'Guru', 'Kelas', 'Mapel', 'Topik', 'Kendala']; bar = r.data.jurnal.map(j => [j.tanggal, j.jamKe, j.guru, j.kelas, j.mapel, j.topik, j.kendala]).filter(cocok); }
  }
  lb.innerHTML = extra + '<div class="panel"><div class="pt"><h3>' + judul + ' <small style="color:var(--mute);font-weight:400">· ' + bar.length + ' baris</small></h3><div style="display:flex;gap:8px"><button class="btn btn-teal btn-sm" id="ex">⬇ Excel</button><button class="btn btn-ghost btn-sm" id="pd">⬇ PDF</button></div></div><div class="tw" style="max-height:60vh"><table><tr>' + kol.map(k => '<th>' + k + '</th>').join('') + '</tr>' +
    (bar.length ? bar.map(r => '<tr>' + r.map((x, i) => '<td' + (typeof x === 'number' ? ' class="num"' : '') + '>' + (judul === 'Rekap Absensi' && i === 8 ? '<b style="color:' + (x >= 90 ? 'var(--teal)' : '#B91C1C') + '">' + x + '%</b>' : esc(x)) + '</td>').join('') + '</tr>').join('') : '<tr><td colspan="' + kol.length + '" class="empty">Tidak ada data pada filter ini.</td></tr>') + '</table></div></div>';
  $('#ex').onclick = () => eksporExcel(judul.replace(/\s+/g, '-') + '_' + LAP.dari, [{ nama: judul, kolom: kol, baris: bar }]); $('#pd').onclick = () => eksporPdf(judul, sub, kol, bar);
}
/* Grafik batang rata-rata nilai per mapel & per kelas (dipakai juga di Monitoring) */
function grafikNilai(d) {
  const b = (L, warna) => L.length ? L.map(x => '<div class="bar"><b title="' + esc(x.nama) + '" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(x.nama) + '</b><div class="tr"><i style="width:' + x.rata + '%;background:' + warna + '"></i></div><span>' + x.rata + '</span></div>').join('') : '<div class="empty">Belum ada nilai ujian.</div>';
  return '<div class="two" style="grid-template-columns:1fr 1fr"><div class="panel"><div class="pt"><h3>Rata-rata Nilai per Mapel</h3></div><div class="pb"><div class="bars">' + b(d.perMapel, 'var(--teal)') + '</div></div></div><div class="panel"><div class="pt"><h3>Rata-rata Nilai per Kelas</h3></div><div class="pb"><div class="bars">' + b(d.perKelas, 'var(--amber)') + '</div></div></div></div>';
}
async function daftarArsip() {
  const r = await api('rekap.daftar'), el = $('#al'); if (!el) return;
  el.innerHTML = r.success && r.data.length ? '<table><tr><th>Bulan</th><th>Excel</th><th>PDF</th><th>Email</th></tr>' + r.data.map(a => '<tr><td><b>' + esc(a.bulan) + '</b></td><td><a href="' + esc(a.xlsx) + '" target="_blank" rel="noopener" style="color:var(--teal);font-weight:600">Buka .xlsx</a></td><td><a href="' + esc(a.pdf) + '" target="_blank" rel="noopener" style="color:var(--teal);font-weight:600">Buka .pdf</a></td><td>' + (a.dikirim ? bdg('ok', 'Terkirim') : bdg('wa', 'Tidak dikirim')) + '</td></tr>').join('') + '</table>' : '<div class="empty" style="padding:10px">Belum ada arsip.</div>';
}
