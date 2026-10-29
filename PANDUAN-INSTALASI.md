# Panduan Instalasi — SIKAD SMP Sains Salahuddin Wahid

Arsitektur: **frontend statis di GitHub Pages** + **Google Apps Script sebagai REST API** + Google Sheets/Drive/Gmail.
**Instalasi baru:** kerjakan berurutan **A. Backend → B. Frontend → C. Notifikasi WA → D. Migrasi (opsional)**.
**Sudah pernah memasang?** Langsung ke bagian **⭐ Perbarui ke v1.3 — langkah demi langkah** di bawah.

## ⭐ Sudah pernah memasang? Perbarui ke v1.3 — langkah demi langkah
Kerjakan **berurutan dan jangan melompat**: **Bagian 1 (backend/Google)** → **Bagian 2 (tampilan/GitHub)** → **Bagian 3 (pengecekan)**. Bila hasil suatu langkah berbeda dari yang tertulis, **berhenti di langkah itu** dan periksa tabel *Bila ada yang tidak sesuai* di akhir bagian ini.
File yang dibutuhkan: `Kode.gs` dan `sikad-frontend-update.zip`.

### Bagian 1 — Perbarui backend (Apps Script)
**Langkah 1. Salin kode baru**
1. Klik kanan `Kode.gs` → **Open with → Notepad**.
2. Tekan **Ctrl+A** (pilih semua) → **Ctrl+C** (salin).

**Langkah 2. Tempel ke Apps Script**
1. Buka https://script.google.com dan masuk dengan akun yang sama seperti sebelumnya.
2. Klik proyek Anda → di kiri klik file **Kode.gs**.
3. Klik di dalam kotak kode → **Ctrl+A** → **Ctrl+V** (menimpa seluruh isi lama) → **Ctrl+S** (simpan).
4. Pengecekan: **Ctrl+F**, ketik `1.3.0`. Bila ditemukan pada baris `APP_VERSION = '1.3.0'`, kode baru sudah masuk.

**Langkah 3. Jalankan setup (menambah kolom baru)**
1. Pada dropdown di bar atas editor pilih fungsi **setupAppEnvironment**.
2. Klik **▶ Jalankan** (Run). Bila muncul layar izin, klik **Izinkan** (centang semua kotak).
3. Tunggu sampai *Log eksekusi* menampilkan **“Eksekusi selesai”**.
4. Normal: sandi baru **tidak** ditampilkan (akun Anda sudah ada). Pastikan **tidak ada baris merah (Error)**. Bila ada, **berhenti di sini** dan periksa tabel di akhir bagian ini.

**Langkah 4. Deploy versi baru**
1. Klik **Deploy** (kanan atas) → **Manage deployments**.
2. Klik ikon **✏️ (pensil)** pada deployment yang aktif.
3. Pada *Version* pilih **New version** → **Deploy** → **Done**.
4. ⚠️ Jangan pilih *New deployment* — itu membuat URL baru dan tampilan Anda tak terhubung lagi.

**Langkah 5. Pastikan backend sudah v1.3**
1. Salin URL Web App (berakhiran `/exec`), tempel di tab browser baru.
2. Harus muncul teks seperti `{"success":true,"app":"SIKAD API","v":"1.3.0"}`.
3. Bila tertulis `"v":"1.2.0"` atau lebih lama, ulangi Langkah 4.

### Bagian 2 — Perbarui tampilan (GitHub)
**Langkah 6. Ekstrak ZIP pembaruan**
1. Klik kanan `sikad-frontend-update.zip` → **Extract All…** → **Extract**.
2. Hasilnya folder berisi `index.html`, folder `css`, dan folder `js`.

**Langkah 7. Salin ke folder proyek**
1. Di folder hasil ekstrak: **Ctrl+A** → **Ctrl+C**.
2. Buka folder proyek Anda (folder `sikad-frontend` yang berisi `index.html`).
3. **Ctrl+V** → bila Windows bertanya, pilih **Replace the files in the destination**.
4. Folder `js` kini bertambah file baru seperti `akun.js` dan `ekspor.js`.

**Langkah 8. Pastikan `config.js` masih berisi URL Anda**
1. Buka folder `js`. **Jangan klik dua kali** `config.js`.
2. Klik kanan `config.js` → **Open with → Notepad**.
3. Isinya harus URL Web App Anda (berakhiran `/exec`), **bukan** tulisan `GANTI_DENGAN_ID_DEPLOYMENT`.
4. Bila masih `GANTI_…`, tempel URL `/exec` Anda di antara tanda petik `'…'` (tanda petik jangan dihapus) → **Ctrl+S**.

**Langkah 9. Buka PowerShell di folder yang benar**
1. Buka **PowerShell**, lalu ketik (sesuaikan lokasi folder Anda) dan tekan Enter:
   ```
   cd "D:\Claude\00\01 Website SMP Sains Salahuddin Wahid\02 Kode\sikad-frontend"
   ```
2. Ketik `git status` → Enter. Harus tampil daftar file merah (*modified*/*untracked*). Itu normal.

**Langkah 10. Kirim ke GitHub — satu per satu, Enter setiap baris**
```
git add .
git commit -m "v1.3"
git push
```
- `warning: LF will be replaced by CRLF` itu normal.
- Setelah `git push` harus tampil baris seperti `main -> main`. Bila diminta kata sandi, tempel **Personal Access Token** (layar tidak menampilkan karakter — normal).

**Langkah 11. Pastikan sudah sampai di GitHub**
1. Buka repository SIKAD di github.com → folder `js` → file **`akun.js`** harus ada.
2. Tab **Actions**: tunggu proses terbaru bercentang hijau ✅ (±1–2 menit).

### Bagian 3 — Pengecekan hasil
**Langkah 12. Buka situs dengan cache bersih**
1. Buka situs Anda (`https://USERNAME.github.io/NAMA-REPO/`) → tekan **Ctrl+Shift+R**.

**Langkah 13. Login admin dan cek tampilan baru**
1. **Login Portal** → masuk sebagai `admin`.
2. Pastikan: kiri-bawah menu tertulis **SIKAD v1.3**; bar atas ada tombol **⚙️ Pengaturan**; sidebar paling bawah ada grup **AKUN → Profil & Sandi**.

**Langkah 14. Perbaiki akun Kepala Sekolah / pejabat lain**
1. **Master Data → tab Guru** → pada baris orangnya klik **Ubah**.
2. Isi **Jabatan** (mis. `Kepala Sekolah`). Pilih **Hak akses = Admin** bila perlu akses penuh (Kepala Sekolah & Kurikulum); pilih **Guru** untuk guru biasa.
3. **Status akun = Aktif** → **Simpan**.

**Langkah 15. Uji akun siswa di jendela TERPISAH**
1. Di jendela admin: **Master Data → tab Siswa** → **Reset sandi** pada siswa yang diuji → catat sandi barunya.
2. Buka **Incognito** (Ctrl+Shift+N) atau browser lain — jangan di jendela yang sama, karena satu browser berbagi satu sesi.
3. Login memakai NIS dan sandi tadi → portal otomatis membuka halaman **Profil**.
4. Isi sandi lama, sandi baru, konfirmasi → simpan. Menu lain terbuka setelahnya.

**Langkah 16. Rasakan kecepatannya**
Klik bergantian: Dashboard, Jurnal Mengajar, Monitoring KBM, Absensi. Setelah login, perpindahan menu seharusnya hampir langsung terbuka.

### Bila ada yang tidak sesuai
| Gejala | Yang dilakukan |
|---|---|
| Footer masih “v1.1/v1.2”, tidak ada ⚙️ Pengaturan / menu Profil | Ulangi Langkah 11. Bila `akun.js` tidak ada di GitHub, `git push` belum berhasil. Coba buka situs di Incognito |
| `git push` ditolak / minta identitas | Jalankan `git config --global user.name "Nama"` dan `git config --global user.email "email"`, lalu ulangi Langkah 10 |
| Tampil “Konfigurasi belum lengkap” | Ulangi Langkah 8 |
| Bar di atas halaman: “Tampilan v1.3.0 belum cocok dengan backend…” | Ulangi Langkah 4 (pilih **New version**) |
| Error merah di Apps Script | Jalankan fungsi `diagnosaIzin`, lihat baris ❌ di log, dan lihat bagian Troubleshooting di bawah |
| “Anda tidak berhak mengakses fitur ini” | Ada akun lain yang login di tab/jendela lain pada browser yang sama. Tutup tab lain atau pakai Incognito |

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

## G. Pembaruan v1.3 — kecepatan, peran & jabatan, sesi antar tab

### Urutan memperbarui
Lihat bagian **⭐ Perbarui ke v1.3 — langkah demi langkah** di awal panduan ini (Langkah 1–16, urut dan terperinci).

### Yang berubah
- **Terasa instan:** menu yang sering dibuka dimuat lebih dulu (prefetch), ditampilkan dari cache perangkat, lalu disegarkan di latar; login membawa data layar pertama; simpan absensi tampil “tersimpan” seketika dan dikirim di latar (gagal → dikembalikan dengan pesan jelas).
- **Hak akses vs jabatan:** form guru kini punya kolom **Jabatan** (teks bebas, mis. *Kepala Sekolah*) dan **Hak akses** berupa pilihan *Guru* / *Admin*. Kepala Sekolah & Kurikulum diberi hak akses **Admin**. Admin tidak bisa menurunkan/menonaktifkan akunnya sendiri.
- **Sesi antar tab:** bila akun diganti/keluar di tab lain, tab ini menyesuaikan otomatis. Untuk menguji dua akun sekaligus, gunakan **dua browser berbeda** atau jendela **Incognito** (satu browser berbagi satu sesi).
- Log aktivitas non-kritis ditulis berkelompok tiap 5 menit (tidak memperlambat login/simpan).

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
| Footer masih “SIKAD v1.1/v1.2”, tombol ⚙️ & menu Profil tidak ada | Tampilan di GitHub belum terbarui. Pastikan `git push` sukses (cek di github.com bahwa berkas `js/akun.js` ada), tunggu 1–2 menit, lalu **Ctrl+Shift+R**. Backend baru + tampilan lama membuat siswa terkunci di pesan “harus mengganti sandi” sampai tampilan diperbarui |
| “Anda tidak berhak mengakses fitur ini” saat menambah pengguna | Biasanya akun lain login di tab/jendela lain pada browser yang sama (sesi dipakai bersama). Perbarui ke v1.3 (tab otomatis menyesuaikan), dan gunakan browser/Incognito terpisah saat menguji akun siswa |
| Lupa sandi admin | `resetAksesDarurat()` lalu login `darurat`, reset sandi di Master Data |
