# Rincian Tugas Implementasi (tasks.md)
## Binus Anti-Bullying Center (BAC)

Urutan pengerjaan task sesuai instruksi pengguna:

- [x] **Task 0: Spesifikasi Proyek**
  - [x] Buat requirements.md
  - [x] Buat design.md
  - [x] Buat tasks.md

- [x] **Task 1: Setup Proyek dan Supabase (Migration, RLS, Seed)**
  - [x] Buat berkas migrasi SQL lengkap: `supabase/migrations/001_initial_schema.sql` (tabel, enum, sequence, fungsi RPC `submit_report`, `track_report`, trigger updated_at, dan security policies RLS).
  - [x] Buat berkas seed data: `supabase/seed.sql` (data konselor, sample reports, timeline, dan demo admin).
  - [x] Buat modul database klien `src/lib/supabase.ts` dengan dukungan penyimpanan persisten terisolasi, enkripsi SHA-256 kode akses, dan enforcement RLS.

- [x] **Task 2: Layout dan Komponen Global**
  - [x] Buat Navbar responsif (Logo BAC, menu navigasi, tombol Login Admin / profil keluar).
  - [x] Buat Footer lengkap (Brand, Layanan, Informasi, Hotline 24/7, Hak Cipta).
  - [x] Buat komponen atomik dan molekul: `StatusBadge`, `Timeline`, `ChatBubble`, `FormField`, `Toast`, `Modal`, `ProtectedRoute`.

- [x] **Task 3: Halaman Beranda**
  - [x] Hero section (ikon perisai, judul, tombol Laporkan Sekarang & Chat Darurat).
  - [x] Banner Privasi Terjamin.
  - [x] Bagian 3 langkah "Cara Kerja BAC".
  - [x] 4 Kartu Akses Cepat (Form Pelaporan, Chat Konselor, Solusi & Tracking, FAQ & Resources).
  - [x] FAQ Accordion interaktif.

- [x] **Task 4: Halaman Form Pelaporan + Upload Bukti**
  - [x] Formulir dengan validasi komprehensif.
  - [x] Checkbox Laporan Anonim (toggle visibility nama & NIM).
  - [x] Pilihan Program Studi BINUS, checkbox kategori kasus, textarea deskripsi (counter 0/2000), tempat & waktu kejadian.
  - [x] Dropzone upload berkas bukti (maks 5 file: gambar, video, audio, PDF) dengan daftar berkas dan tombol hapus.
  - [x] Simpan draft ke `localStorage` dan pulihkan draft.
  - [x] Honeypot field anti-spam.
  - [x] Dialog/Halaman Sukses dengan ID Laporan dan KODE AKSES, tombol salin, peringatan tegas, dan tombol Lacak Laporan.

- [x] **Task 5: Halaman Chat Konselor**
  - [x] Header konselor BAC (avatar, nama, status online, tombol Eskalasi Kasus).
  - [x] Pesan pembuka ramah dan 3 tombol quick reply.
  - [x] Percakapan interaktif dengan auto-reply empati cerdas dan typing indicator.
  - [x] Penautan sesi chat ke ID Laporan tertentu.
  - [x] Tombol eskalasi kasus darurat.

- [x] **Task 6: Halaman Solusi & Tracking**
  - [x] Formulir pelacakan (ID Laporan + Kode Akses) dengan pesan error netral.
  - [x] Tab Tracking Status dengan riwayat timeline lengkap dan badge status.
  - [x] Tab Saran Otomatis berbasis kategori perundungan.
  - [x] Tab Rekomendasi Konselor resmi.
  - [x] Tab Minta Mediator / formulir pengajuan layanan mediasi (`mediation_requests`).

- [x] **Task 7: Autentikasi Admin & ProtectedRoute**
  - [x] Halaman login `/admin/login` dengan toggle visibilitas kata sandi dan umpan balik kesalahan.
  - [x] Integrasi sesi admin dengan status persisten.
  - [x] Pembungkus `ProtectedRoute` untuk mencegah akses unauthorized.

- [x] **Task 8: Halaman Admin Dashboard**
  - [x] Statistik kartu metrik (Total Laporan dan Laporan Aktif).
  - [x] Fitur pencarian multi-field dan filter status serta jenis perundungan.
  - [x] Tabel data laporan lengkap dengan pagination dan klik baris ke halaman detail.

- [x] **Task 9: Halaman Detail Laporan (Admin)**
  - [x] Header detail (ID laporan, status badge, tanggal).
  - [x] Aksi admin: Modal "Assign Konselor" dan modal "Jadwalkan Meeting".
  - [x] Pengubah status dengan pencatatan otomatis ke `report_timeline`.
  - [x] Tab Detail Laporan (3 kartu: Informasi Pelapor, Manajemen, Detail Kejadian).
  - [x] Tab Bukti dengan pratinjau berkas terlampir.
  - [x] Tab Percakapan (riwayat chat kasus dan form balasan konselor).
  - [x] Tab Timeline riwayat tahapan.

- [x] **Task 10: Dokumentasi & Pengujian RLS**
  - [x] Buat file `README.md` (panduan Supabase, migration & seed, .env, akun demo).
  - [x] Buat berkas `database-architecture.md` (arsitektur basis data lengkap).
  - [x] Buat skrip dan instruksi verifikasi pengujian RLS.
  - [x] Pengujian build proyek (`compile_applet`).
