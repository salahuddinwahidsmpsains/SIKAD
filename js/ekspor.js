/* Ekspor Excel (SheetJS dimuat saat dibutuhkan) & PDF (dialog cetak → Simpan sebagai PDF) */
function muatXlsx() {
  return window.XLSX ? Promise.resolve() : new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}
function unduhBlob(nama, blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nama; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
/** sheets: [{nama, kolom:[...], baris:[[...]]}] */
async function eksporExcel(nama, sheets) {
  try {
    await muatXlsx(); const wb = XLSX.utils.book_new();
    sheets.forEach(s => { const ws = XLSX.utils.aoa_to_sheet([s.kolom].concat(s.baris)); ws['!cols'] = s.kolom.map((k, i) => ({ wch: Math.min(42, Math.max(String(k).length, ...s.baris.slice(0, 60).map(r => String(r[i] == null ? '' : r[i]).length)) + 2) })); XLSX.utils.book_append_sheet(wb, ws, String(s.nama).replace(/[\\/?*[\]:]/g, '').slice(0, 31) || 'Data'); });
    XLSX.writeFile(wb, nama + '.xlsx'); toast('Excel diunduh ✅');
  } catch (e) {                                       // cadangan: CSV bila pustaka gagal dimuat
    const s = sheets[0], q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    unduhBlob(nama + '.csv', new Blob(['\ufeff' + [s.kolom].concat(s.baris).map(r => r.map(q).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })); toast('Pustaka Excel tak termuat — diunduh sebagai CSV.', true);
  }
}
function eksporPdf(judul, sub, kolom, baris) {
  const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0'; document.body.appendChild(f);
  const nama = (document.getElementById('brandName') || {}).textContent || 'SMP Sains Salahuddin Wahid';
  f.contentDocument.open(); f.contentDocument.write('<!doctype html><meta charset="utf-8"><title>' + esc(judul) + '</title><style>@page{size:A4 landscape;margin:14mm}body{font:12px Inter,Arial,sans-serif;color:#1F2937}h1{font:700 18px Arial;margin:0;color:#1E2B4F}p{margin:2px 0 12px;color:#64748B}table{width:100%;border-collapse:collapse}th{background:#1E2B4F;color:#fff;text-align:left;padding:6px 8px;font-size:11px}td{padding:5px 8px;border-bottom:1px solid #e2e8f0}tr:nth-child(even) td{background:#f8fafc}.f{margin-top:14px;font-size:10px;color:#94a3b8}</style><h1>' + esc(nama) + '</h1><p><b>' + esc(judul) + '</b> · ' + esc(sub) + '</p><table><thead><tr>' + kolom.map(k => '<th>' + esc(k) + '</th>').join('') + '</tr></thead><tbody>' + baris.map(r => '<tr>' + r.map(x => '<td>' + esc(x) + '</td>').join('') + '</tr>').join('') + '</tbody></table><div class="f">Dicetak dari SIKAD · ' + new Date().toLocaleString('id-ID') + '</div>');
  f.contentDocument.close(); setTimeout(() => { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(() => f.remove(), 2000); }, 350);
  toast('Pilih “Simpan sebagai PDF” pada dialog cetak.');
}
