# Rencana Implementasi & Spesifikasi: Binus Anti-Bullying Center (BAC)

Sistem informasi dan layanan pelaporan bullying kampus yang aman, rahasia, terstruktur, dan profesional untuk sivitas akademika BINUS University.

***

## User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan yang Telah Dikonfirmasi Pengguna:**
> 1. **Koneksi Database & Backend**: Menggunakan simulasi Supabase lokal lengkap yang sepenuhnya fungsional di lingkungan pratinjau (mendukung pengujian RLS, RPC `submit_report` & `track_report`, autentikasi admin, upload file bukti, dan chat realtime), disertai file migrasi SQL produksi di `supabase/migrations/001_initial_schema.sql` dan `supabase/seed.sql` yang siap dideploy ke instansi Supabase sungguhan melalui `.env`.
> 2. **Identitas Visual & Figma**: Mengikuti layout, warna, spacing, dan komponen Figma BINUS Anti-Bullying Center secara presisi dengan nuansa resmi BINUS (Navy `#003B73`, Orange `#F58220`, latar bersih `#F8FAFC`, dan tipografi sans modern).
> 3. **Mekanisme Chat Konselor**: Balasan otomatis responsif berbasis aturan dengan indikator mengetik (typing indicator), opsi quick replies, tombol eskalasi kasus, dan sinkronisasi dua arah ke admin dashboard konselor.

***

## 1. Dokumen Kebutuhan (Requirements Specification)

### 1.1 Tujuan Sistem
Memberikan wadah aman bagi mahasiswa dan civitas akademika BINUS University untuk melaporkan tindakan perundungan (bullying), melakukan konsultasi langsung, memantau tindak lanjut laporan tanpa mengorbankan identitas (dukungan anonim penuh), serta memberikan panel kendali bagi petugas dan konselor BAC untuk menangani setiap kasus secara terstruktur.

### 1.2 Peran Pengguna & Hak Akses
1. **Pelapor Publik / Mahasiswa (Tanpa Akun)**:
   - Tidak perlu login atau mendaftar akun untuk menjaga kerahasiaan dan privasi pelapor.
   - Dapat memilih antara **Laporan Anonim** (Nama dan NIM tidak disimpan ke database) atau **Laporan Teridentifikasi**.
   - Menerima **ID Laporan** unik (`BAC-YYYY-NNNN`) dan **Kode Akses Acak** (disimpan dalam bentuk hash SHA-256).
   - Melacak perkembangan status laporan dan rekomendasi melalui portal Solusi & Tracking dengan ID Laporan dan Kode Akses.
   - Melakukan konsultasi interaktif melalui fitur Chat Konselor.
   - Mengajukan permohonan mediasi atau pendampingan konseling lanjutan.
2. **Admin / Konselor BAC (Wajib Login)**:
   - Login menggunakan email dan kata sandi petugas BAC melalui Supabase Auth.
   - Akses penuh terhadap seluruh data laporan, bukti terunggah, penugasan konselor, dan penjadwalan mediasi/pertemuan.
   - Mengubah status kasus (`diterima` $\to$ `dalam_review` $\to$ `diproses` $\to$ `selesai`) yang otomatis mencatat log timeline.
   - Memberikan rekomendasi resmi untuk pelapor dan membalas pesan dalam riwayat chat.

### 1.3 Matriks Fitur Fungsional
| Modul | Deskripsi Fungsional |
| :--- | :--- |
| **Beranda** | Hero pelindung (shield), banner privasi, alur 3 langkah "Cara Kerja BAC", 4 kartu akses cepat, dan FAQ accordion. |
| **Form Pelaporan** | Form multi-step/terstruktur dengan toggle anonim, pilihan prodi BINUS, checkbox kategori kasus (verbal, fisik, sosial, cyber, psikologis, akademik), textarea counter 2000 karakter, lokasi kampus, waktu kejadian, drag & drop bukti maksimal 5 file (gambar/video/audio/PDF), honeypot anti-spam, dan penyimpanan draft lokal (`localStorage`). Modal sukses menampilkan ID Laporan dan Kode Akses dengan tombol salin. |
| **Chat Konselor** | Konsultasi live dengan konselor BAC, indikator status online, quick replies cepat, auto-reply bot konselor responsif, tautan ke ID laporan, tombol eskalasi kasus darurat, dan persistensi sesi. |
| **Solusi & Tracking** | Form pencarian terlindungi (ID + Kode Akses) dengan pesan error netral tanpa membocorkan eksistensi ID; tab tracking progres (timeline aktif), tab saran otomatis sesuai jenis kasus, tab rekomendasi resmi konselor, dan tab form permintaan mediator. |
| **Admin Auth** | Halaman `/admin/login` dengan toggle visibilitas password, validasi email/password, proteksi rute (`ProtectedRoute`), dan sesi persisten. |
| **Admin Dashboard** | Kartu metrik (Total Laporan, Kasus Aktif), pencarian instan (ID/Nama/Deskripsi), filter status dan kategori kasus, tabel data dengan pagination dan baris yang dapat diklik ke detail. |
| **Detail Laporan Admin** | Ringkasan pelapor, pengubah status dengan auto-timeline, penugasan konselor (modal assign), penjadwalan meeting (modal jadwal), tab pratinjau bukti berkas, dan tab riwayat chat terintegrasi. |

***

## 2. Desain UI/UX & Panduan Figma (Design Specification)

### 2.1 Palet Warna & Token Visual BINUS
Mengacu langsung pada desain Figma BINUS Anti-Bullying Center:
- **Primary Navy**: `#003B73` (Brand Navbar, Button Utama, Judul Utama)
- **Primary Dark Navy**: `#00254A` (Hover button, Banner Hero Gradient)
- **Accent BINUS Orange**: `#F58220` (Aksen perhatian, Tombol CTA Lapor, Status Aktif)
- **Accent Dark Orange**: `#D96D12` (Hover Orange)
- **Neutral Canvas**: `#F8FAFC` (Slate 50 - Latar Belakang Aplikasi)
- **Card Surface**: `#FFFFFF` (Putih bersih dengan hairline border `rgba(0,0,0,0.06)` dan shadow lembut)
- **Text Primary**: `#0F172A` (Slate 900 - Keterbacaan tinggi)
- **Text Secondary / Muted**: `#475569` (Slate 600 - Keterangan & Instruksi)
- **Status Colors**:
  - `diterima`: Biru (`#0284C7` / Slate)
  - `dalam_review`: Kuning/Amber (`#D97706`)
  - `diproses`: Oranye (`#EA580C`)
  - `selesai`: Hijau Emerald (`#16A34A`)

### 2.2 Tipografi & Layout
- **Font Utama**: `Plus Jakarta Sans` / modern sans-serif dengan hierarki terukur.
- **Top Bar Contract**:
  - Zona 1: Logo & Teks Brand "BINUS Anti-Bullying Center" dengan lambang perisai/shield.
  - Zona 2: Menu Navigasi: *Beranda*, *Laporkan*, *Chat*, *Solusi & Tracking*.
  - Zona 3: Tombol Aksi: *"Login Admin"* (atau profil admin & tombol *"Keluar"* jika sudah masuk).
- **Footer Responsif**:
  - Kolom 1: Profil BAC ("Kampus Aman, Bebas Bullying" & deskripsi layanan).
  - Kolom 2: Menu Layanan (Pelaporan Online, Konsultasi Chat, Tracking Status).
  - Kolom 3: Informasi (Tentang BAC, FAQ, Kebijakan Privasi, Panduan Pelaporan).
  - Kolom 4: Kontak Darurat (Hotline 24/7 `0800-BAC-HELP` dan email `bac@binus.ac.id`).
  - Baris Bawah: Hak Cipta © 2025 Binus Anti-Bullying Center.

### 2.3 Komponen Antarmuka Reusable
- `StatusBadge`: Menampilkan status kasus dengan warna semantik yang kontras dan teks jelas.
- `Timeline`: Alur tahapan vertikal dan horizontal interaktif dengan stempel waktu dan catatan resmi.
- `ChatBubble`: Gelembung pesan user, konselor, dan system dengan jam, status terkirim, dan indikator mengetik.
- `FormField`: Komponen form dengan label eksplisit, indikator wajib (`*`), pesan panduan, dan pesan error validasi Zod.
- `FileUploadArea`: Kotak drag & drop dengan pratinjau tipe berkas, ukuran, progres unggah, dan tombol hapus.
- `Modal`: Dialog pop-up yang dapat diakses dengan keyboard (Escape, Focus trap) untuk penugasan konselor dan penjadwalan pertemuan.
- `Toast`: Notifikasi pop-up feedback ringan untuk aksi seperti simpan draft, kirim laporan, dan salin kode akses.

***

## 3. Arsitektur Basis Data & Keamanan (Database Architecture)

### 3.1 Diagram Skema Relasional
```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│           counselors            │       │             reports             │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ id: uuid (PK)                   │◄──┐   │ id: uuid (PK)                   │
│ name: text                      │   └───┤ assigned_counselor_id: uuid(FK) │
│ title: text                     │       │ report_code: text (UNIQUE)      │
│ is_active: boolean              │       │ access_code_hash: text          │
└─────────────────────────────────┘       │ is_anonymous: boolean           │
                                          │ reporter_name: text (nullable)  │
┌─────────────────────────────────┐       │ reporter_nim: text (nullable)   │
│       report_attachments        │       │ study_program: text             │
├─────────────────────────────────┤       │ case_types: text[]              │
│ id: uuid (PK)                   │       │ description: text (max 2000)    │
│ report_id: uuid (FK) ───────────┼──┐    │ incident_location: text         │
│ storage_path: text              │  │    │ incident_time: timestamptz      │
│ file_name: text                 │  │    │ status: text                    │
│ mime_type: text                 │  │    │ created_at: timestamptz         │
│ size_bytes: bigint              │  │    │ updated_at: timestamptz         │
└─────────────────────────────────┘  │    └──────────────┬──────────────────┘
                                     │                   │
┌─────────────────────────────────┐  │                   │
│         report_timeline         │  │                   │
├─────────────────────────────────┤  │                   │
│ id: uuid (PK)                   │  │                   │
│ report_id: uuid (FK) ───────────┼──┼───────────────────┤
│ status: text                    │  │                   │
│ note: text                      │  │                   │
│ created_at: timestamptz         │  │                   │
│ created_by: text (nullable)     │  │                   │
└─────────────────────────────────┘  │                   │
                                     │                   │
┌─────────────────────────────────┐  │                   │
│            meetings             │  │                   │
├─────────────────────────────────┤  │                   │
│ id: uuid (PK)                   │  │                   │
│ report_id: uuid (FK) ───────────┼──┼───────────────────┤
│ scheduled_at: timestamptz       │  │                   │
│ notes: text                     │  │                   │
│ created_by: uuid (nullable)     │  │                   │
└─────────────────────────────────┘  │                   │
                                     │                   │
┌─────────────────────────────────┐  │                   │
│       mediation_requests        │  │                   │
├─────────────────────────────────┤  │                   │
│ id: uuid (PK)                   │  │                   │
│ report_id: uuid (FK) ───────────┼──┼───────────────────┤
│ service_type: text              │  │                   │
│ message: text                   │  │                   │
│ status: text                    │  │                   │
│ created_at: timestamptz         │  │                   │
└─────────────────────────────────┘  │                   │
                                     │                   │
┌─────────────────────────────────┐  │                   │
│          chat_sessions          │  │                   │
├─────────────────────────────────┤  │                   │
│ id: uuid (PK)                   │  │                   │
│ report_id: uuid (FK, nullable) ─┼──┴───────────────────┘
│ created_at: timestamptz         │
└────────────────┬────────────────┘
                 │
┌────────────────┴────────────────┐
│          chat_messages          │
├─────────────────────────────────┤
│ id: uuid (PK)                   │
│ session_id: uuid (FK)           │
│ sender: text (user/konselor/sys)│
│ body: text                      │
│ created_at: timestamptz         │
└─────────────────────────────────┘
```

### 3.2 Keamanan & Row Level Security (RLS)
1. **Fungsi Pemeriksaan Admin (`is_admin()`)**:
   - Memeriksa apakah user terautentikasi melalui Supabase Auth memiliki role admin atau email terdaftar dalam staf BAC.
2. **Aturan Tabel `reports`**:
   - `SELECT`: Khusus Admin. Publik **TIDAK BISA** melakukan `SELECT * FROM reports` secara langsung.
   - `INSERT`: Melalui fungsi RPC `submit_report(...)` dengan security definer, atau RLS insert khusus yang memvalidasi sanitasi input.
   - `UPDATE/DELETE`: Khusus Admin.
3. **RPC `submit_report`**:
   - Mengenerate kode laporan terurut `BAC-YYYY-NNNN` menggunakan sequence database.
   - Menghitung hash SHA-256 dari kode akses acak 8 karakter.
   - Mengabaikan nama dan NIM jika `is_anonymous = true`.
   - Mengembalikan `{ report_id, report_code, access_code }`.
4. **RPC `track_report(p_report_code, p_access_code)`**:
   - Memverifikasi hash kode akses dengan `access_code_hash`.
   - Hanya mengembalikan atribut esensial yang aman untuk publik: `report_code`, `status`, `is_anonymous`, `case_types`, `created_at`, daftar `report_timeline`, dan catatan konselor publik.
5. **Storage Bucket `evidence`**:
   - Akses upload publik hanya diizinkan untuk lampiran laporan yang baru dibuat.
   - Pembacaan berkas hanya bisa diakses admin melalui short-lived signed URL.

***

## 4. Rincian Rencana Tugas (Task Breakdown)

- [ ] **1. Setup Fondasi & Konfigurasi Supabase**:
  - Install dependensi frontend (`clsx`, `tailwind-merge`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@supabase/supabase-js`, `canvas-confetti`).
  - Buat berkas migrasi SQL lengkap di `supabase/migrations/001_initial_schema.sql` dan `supabase/seed.sql`.
  - Buat modul klien Supabase (`src/lib/supabase.ts`) dengan mock data simulation & RLS enforcement, serta opsi koneksi langsung ke Supabase URL via `.env`.
- [ ] **2. Komponen Global & Layout Navigasi**:
  - Buat `Navbar` (brand, menu links, tombol login/profil admin).
  - Buat `Footer` lengkap dengan kontak darurat, informasi layanan, dan copyright.
  - Buat komponen reusable: `StatusBadge`, `Timeline`, `ChatBubble`, `Modal`, `Toast`, dan `ProtectedRoute`.
- [ ] **3. Halaman Beranda (Landing Page)**:
  - Implementasikan Hero Section dengan ikon perisai dan tombol aksi utama.
  - Implementasikan Privacy Assurance Banner.
  - Implementasikan alur 3 langkah "Cara Kerja BAC".
  - Implementasikan 4 Kartu Akses Cepat dan Accordion FAQ interaktif.
- [ ] **4. Halaman Form Pelaporan & Upload Bukti**:
  - Implementasikan form multi-step dengan validasi Zod.
  - Toggle anonimitas dinamis (sembunyikan & hapus validasi Nama dan NIM).
  - Checkbox jenis perundungan dan textarea deskripsi dengan karakter counter (0/2000).
  - Drag & drop file upload bukti dengan validasi mime type & ukuran berkas.
  - Honeypot anti-spam dan penyimpanan draft di `localStorage`.
  - Tampilan modal sukses dengan ID Laporan `BAC-YYYY-NNNN` dan Kode Akses unik sekali tampil beserta tombol salin dan lacak.
- [ ] **5. Halaman Chat Konselor**:
  - Antarmuka pesan chat interaktif dengan avatar konselor dan status online.
  - Quick replies cepat dan auto-reply rule-based dengan typing indicator.
  - Fitur penautan ke ID laporan kasus.
  - Tombol "Eskalasi Kasus" darurat yang menambahkan pesan sistem ke sesi chat.
- [ ] **6. Halaman Solusi & Tracking**:
  - Form verifikasi ID Laporan + Kode Akses dengan pesan error generik yang aman.
  - Tab Tracking Status & Timeline tahapan penanganan kasus.
  - Tab Saran Otomatis berbasis kategori perundungan.
  - Tab Rekomendasi Konselor resmi.
  - Tab Permintaan Mediator (`mediation_requests`).
- [ ] **7. Autentikasi Admin & Proteksi Rute**:
  - Halaman login `/admin/login` dengan toggle visibilitas kata sandi dan penanganan error.
  - Pengelolaan state sesi autentikasi petugas BAC.
  - Proteksi seluruh rute admin `/admin/*` via `ProtectedRoute`.
- [ ] **8. Halaman Admin Dashboard**:
  - Metrik statistik (Total Laporan, Kasus Aktif).
  - Fitur pencarian multi-field dan filter status serta jenis perundungan.
  - Tabel kasus terurut dengan status badge dan navigasi detail.
- [ ] **9. Halaman Detail Laporan (Admin)**:
  - Tiga kartu detail: Informasi Pelapor, Manajemen Status Kasus, dan Detail Kejadian.
  - Modal assign konselor terintegrasi ke tabel `counselors`.
  - Modal jadwalkan pertemuan terintegrasi ke tabel `meetings`.
  - Tab berkas bukti terunggah dan tab percakapan chat konselor.
  - Sinkronisasi otomatis perubahan status ke tabel `report_timeline`.
- [ ] **10. Dokumentasi & Uji RLS**:
  - Buat berkas `README.md` berisikan panduan setup, migrasi database Supabase, dan kredensial admin demo.
  - Buat berkas pengujian skrip simulasi RLS untuk memastikan pelapor publik tidak bisa membaca tabel `reports`.
  - Verifikasi build proyek melalui `compile_applet`.
