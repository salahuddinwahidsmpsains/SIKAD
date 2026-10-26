# Panduan Instalasi — SIKAD SMP Sains Salahuddin Wahid

Arsitektur: **frontend statis di GitHub Pages** + **Google Apps Script sebagai REST API** + Google Sheets/Drive/Gmail.
Kerjakan berurutan: **A. Backend → B. Frontend → C. Notifikasi WA → D. Migrasi (opsional)**.

## A. Backend (Google Apps Script)
1. Buka https://script.google.com → **Proyek baru**.
2. Ganti nama `Code.gs` menjadi `Kode`, lalu tempel seluruh isi **Kode.gs**.
3. ⚙️ **Setelan Proyek** → centang *Show "appsscript.json" manifest file* → buka `appsscript.json`, tempel isi berkas **appsscript.json** → Simpan.
4. Pilih fungsi **setupAppEnvironment** → ▶ Run → izinkan akses (Drive, Sheets, Gmail, UrlFetch).
5. Buka **Execution log** dan **catat sekarang** (hanya tampil sekali):
   - `LOGIN ADMIN AWAL → NIP: admin | Sandi: …`
   - `AKSES DARURAT → darurat / …`
6. Cek Google Drive: folder 📁 *SIKAD SMP Sains Salahuddin Wahid* berisi spreadsheet 🗃️ *Database — SIKAD*.
7. **Deploy → New deployment → Web app** · Execute as: **Me** · Who has access: **Anyone** → Deploy → **salin URL `/exec`**.
8. ⚠️ Jalankan `setupAppEnvironment` **cukup sekali** (aman diulang: rahasia & ID tidak ditimpa). Setiap kali kode diubah: **Deploy → Manage deployments → ✏️ → New version** (jangan New deployment).

**Keamanan:** semua rahasia (SESSION_SECRET, hash sandi darurat, token Fonnte, ID spreadsheet/folder) ada di **Script Properties**, bukan di kode/Sheets/frontend. Batasi editor proyek Apps Script; jangan bagikan spreadsheet database. Rotasi sesi: jalankan `rotasiSecretSesi()`; sandi darurat hilang: `resetAksesDarurat()`.

**Cara manual (bila pembuatan spreadsheet otomatis tidak diizinkan):** buat Google Sheet kosong sendiri di Drive → salin ID-nya (bagian antara `/d/` dan `/edit` pada URL) → di Apps Script buka ⚙️ **Setelan Proyek → Properti skrip → Tambah properti** → nama `SPREADSHEET_ID`, nilai = ID tadi → Simpan → jalankan `setupAppEnvironment`. Alternatif lain: buat skrip **dari dalam Google Sheet** (menu *Ekstensi → Apps Script*), tempel kode di sana; spreadsheet itu otomatis dipakai.

## B. Frontend (GitHub Pages) — lewat terminal
Isi ZIP `sikad-frontend.zip` **adalah** isi repository. Setelah ekstrak, folder hasil ekstraksi (yang langsung berisi `index.html`) adalah folder tempat `git init`.
1. Ekstrak ZIP. Buka `js/config.js`, ganti `GANTI_DENGAN_ID_DEPLOYMENT` dengan URL `/exec` dari langkah A7.
2. Buat repository **Public** di github.com (jangan centang README/.gitignore/license).
3. Buka PowerShell/Terminal, masuk ke folder hasil ekstraksi, lalu **cek dulu** `dir` (Windows) / `ls` (Mac/Linux) — harus terlihat `index.html` di baris atas.
4. Jalankan:
```
git init
git add .
git commit -m "SIKAD pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```
(Saat diminta password, pakai **Personal Access Token** — layar tidak menampilkan karakter, itu normal.)
5. Repo → **Settings → Pages → Deploy from branch → main / (root)**. Tunggu 1–2 menit; situs di `https://USERNAME.github.io/NAMA-REPO/`. Update berikutnya: `git add . && git commit -m "update" && git push`, lalu **Ctrl+Shift+R**.
> Jangan upload lewat tombol "Upload files" di web GitHub — struktur folder `css/` dan `js/` akan rusak.

## C. WhatsApp (Fonnte) & Email
1. Daftar di fonnte.com → Device → scan QR nomor WA sekolah → salin token.
2. Login admin → **WhatsApp & Notifikasi** → tempel token → *Simpan token* → *Kirim tes*.
3. Nyalakan saklar WhatsApp/Email, atur matriks event, isi **Email admin/Kepala Sekolah** dan **WhatsApp publik** (untuk tombol chat mengambang) → *Simpan Pengaturan*.
4. Blast: mulai batch **10**, nomor "hangat", jangan kirim link sama ke ratusan orang sekaligus. Kontak **opt-out** otomatis dilewati.
5. Trigger terpasang otomatis: antrean notifikasi (1 menit) + pengingat jurnal harian 16:00 → email Kepala Sekolah. Kuota trigger akun gratis ±90 menit/hari; email harian ±100 (Gmail biasa).

## D. Konten & data
- **Kelola Konten**: jenis `slide` (hero), `program` (kartu produk), `berita`, `pengumuman`, `testimoni`. Kolom *gambar* boleh diisi **beberapa URL dipisah koma** (termasuk link Google Drive) → otomatis jadi slideshow. Gunakan foto milik sekolah.
- **Master Data**: tambah guru/siswa (sandi awal tampil sekali), jadwal, kelas. Tombol **Import** membaca spreadsheet app lama (dry-run dulu; sandi lama tidak ikut pindah).
- **CRM**: *Sinkron Sekarang* menarik kontak guru, siswa, wali; pesan dari formulir landing masuk otomatis.

## E. Modul Ujian, Laporan & Arsip (v1.1)
**Guru/admin → Kelola Ujian:** Buat Ujian (jenis formatif/sumatif/PTS/PAS, kelas, durasi, jam buka–tutup, acak soal) → **Soal** (tambah satu per satu atau *Tempel massal*: `1. Pertanyaan` / `A. …` / `B. …` / `Kunci: B`, pisahkan antar soal dengan baris kosong) → **Aktifkan**. Soal terkunci begitu ada siswa mengerjakan. **Hasil** menampilkan rata-rata, sebaran nilai, pemeriksaan jawaban per siswa, dan unduh Excel/PDF.
**Siswa → Ujian Saya:** timer berjalan sejak *Mulai*, jawaban tersimpan otomatis di perangkat, dikirim **sekali** saat *Kirim* atau saat waktu habis (kunci jawaban tidak pernah dikirim ke browser; nilai dihitung di server). Siswa yang tertutup koneksinya bisa *Lanjutkan* selama waktu masih ada.
**Admin → Laporan & Rekap:** tabel Absensi / Jurnal / Nilai Ujian dengan cari + filter tanggal & kelas, unduh **Excel** dan **PDF** (PDF: pilih *Simpan sebagai PDF* di dialog cetak). **Arsip Rekap Bulanan** membuat Excel + PDF di folder Drive “📂 Rekap” dan mengirimnya ke email Kepala Sekolah; berjalan otomatis tiap tanggal 1 pukul 05:00 (bulan sebelumnya). Grafik rata-rata nilai per mapel/kelas ada di Laporan dan Monitoring KBM.

### Upgrade dari v1.0 (data aman, tidak ada yang dihapus)
1. Apps Script: cadangkan kode lama → tempel **Kode.gs** baru + **appsscript.json** (scope tidak berubah) → Simpan.
2. Jalankan **setupAppEnvironment** lagi — aman diulang: menambah sheet `Ujian`, kolom baru `Hasil_Ujian` (Jawaban, Benar, Status), memasang trigger arsip bulanan, dan membuat 1 ujian contoh berstatus Draf. Rahasia & sandi tidak berubah.
3. **Deploy → Manage deployments → ✏️ → New version** (jangan New deployment; URL `/exec` tetap).
4. Frontend: timpa file dengan ZIP baru (jangan timpa `js/config.js` yang sudah berisi URL Anda), lalu `git add .` → `git commit -m "v1.1"` → `git push` → Ctrl+Shift+R.
> Catatan kuota: tiap siswa memakai 2 panggilan server per ujian (mulai & kirim). Untuk 30–50 siswa serentak ini aman; ujian besar sebaiknya dibuka bertahap per kelas.

## F. Sandi pengguna, profil & cara memperbarui (v1.2)

### Sandi apa yang dipakai guru/siswa setelah admin menginput data?
1. Saat admin menambah akun di **Master Data → Tambah**, sistem membuat **sandi awal** — otomatis (acak 10 karakter) atau yang Anda ketik sendiri (kolom *Sandi awal* + *Konfirmasi*).
2. Sandi awal **tampil sekali** di jendela hasil, dengan tombol **Salin** dan **Cetak kartu akun (PDF)**. Berikan ke orangnya bersama alamat portal.
3. Pengguna login dengan **NIP/NIS + sandi awal itu**. Portal langsung membuka halaman **Profil** dan mewajibkan mereka **mengganti sandi** (menu lain terkunci sampai selesai).
4. Akun yang dibuat lewat **Import**, atau diketik langsung di Google Sheet, belum punya sandi (status *Belum ada sandi*) → gunakan **Reset sandi** atau **Reset sandi massal**.
5. Untuk banyak akun sekaligus: **Master Data → tab Siswa/Guru → 🔑 Reset sandi massal** (siswa per kelas, maks. 60 akun/proses). Hasilnya daftar sandi yang bisa diunduh Excel atau dicetak PDF — tampil sekali.

### Kenapa sandi lama tidak bisa ditampilkan di Master Data?
Sandi disimpan sebagai *hash* (diacak satu arah), jadi tidak bisa dibaca balik — bahkan oleh admin atau pemilik spreadsheet. Ini standar keamanan: bila spreadsheet bocor, sandi pengguna tetap aman. Yang tampil di Master Data adalah **Status sandi** (Sandi awal / Sudah diganti / Belum ada sandi). Lupa sandi → **Reset sandi** (otomatis atau tentukan sendiri + konfirmasi).

### Profil & pengaturan
Semua peran punya menu **Profil & Sandi** (atau tombol ⚙️ Pengaturan di bar atas): melihat data akun, mengubah WhatsApp/email, dan **mengganti sandi sendiri** (sandi saat ini → sandi baru → konfirmasi, dengan indikator kekuatan). Setelah sandi diganti, perangkat lain otomatis keluar.

### Apakah cukup mengubah Kode.gs lalu deploy ulang?
**Tidak otomatis ke GitHub** — backend dan frontend adalah dua tempat berbeda:
| Yang diubah | Cara menerapkan |
|---|---|
| **Kode.gs** (logika server) | Tempel kode baru → jalankan `setupAppEnvironment` sekali (menambah kolom baru, aman) → **Deploy → Manage deployments → ✏️ → New version → Deploy**. URL `/exec` tidak berubah, `config.js` tidak perlu diubah. |
| **Tampilan** (`index.html`, `css/`, `js/`) | Timpa file di folder `sikad-frontend` dengan ZIP pembaruan → `git add .` → `git commit -m "v1.2"` → `git push` → tunggu 1–2 menit → **Ctrl+Shift+R**. |
Fitur baru yang punya tampilan (seperti Profil & reset sandi) butuh **keduanya**. Gunakan `sikad-frontend-update.zip`: berkas ini sengaja **tidak memuat `js/config.js`**, jadi URL backend Anda tidak tertimpa.

## Troubleshooting
| Gejala | Solusi |
|---|---|
| "Konfigurasi belum lengkap" | `js/config.js` belum diisi URL `/exec` |
| Landing tampil tanpa gaya (CSS 404) | Struktur folder rusak → pastikan `css/` & `js/` ada di root repo |
| 404 di GitHub Pages | `index.html` tidak di root repo / folder salah saat `git init` |
| Perubahan backend tidak terasa | Deploy **New version**, bukan New deployment |
| Notifikasi menumpuk "Menunggu" | Jalankan `pasangTrigger()`; cek token & perangkat Fonnte |
| Ujian tidak muncul di siswa | Ujian harus **Aktif**, kelasnya sama persis dengan kelas siswa, dan dalam rentang buka–tutup |
| Arsip rekap gagal | Jalankan `setupAppEnvironment` ulang & izinkan izin Drive; pastikan email admin terisi di menu Notifikasi |
| Setup error “Anda tidak memiliki izin untuk mengakses dokumen yang diminta” | Gunakan Kode.gs terbaru (v1.1.1), jalankan `setupAppEnvironment` lagi. Pada layar izin, **centang semua kotak** akses (Drive, Spreadsheet, Gmail, UrlFetch) |
| Setup gagal pada `SpreadsheetApp.create` / “tidak memiliki izin…” | Jalankan `diagnosaIzin` dan lihat baris ❌. Lalu: (1) cabut akses di https://myaccount.google.com/permissions → pilih proyek ini → *Hapus akses*, jalankan ulang & **centang semua kotak**; (2) akun sekolah (Workspace) bisa dibatasi admin domain → coba akun Gmail pribadi; (3) **cara manual** di bawah |
| Pengguna terkunci di halaman Profil | Itu normal pada login pertama/setelah reset: ganti sandi dulu, menu lain terbuka sesudahnya |
| Lupa sandi admin | `resetAksesDarurat()` lalu login `darurat`, reset sandi di Master Data |
