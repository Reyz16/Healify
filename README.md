# Binus Anti-Bullying Center (BAC)

Sistem Informasi, Pelaporan, Konsultasi, dan Penanganan Bullying Kampus Resmi BINUS University.

Antarmuka menggunakan **Bahasa Indonesia**, dirancang mengikuti panduan desain Figma BINUS Anti-Bullying Center dengan nuansa warna resmi BINUS (Navy `#003B73`, Orange `#F58220`, dan latar Slate 50 `#F8FAFC`).

---

## 🚀 Fitur Utama

1. **Pelaporan Anonim & Teridentifikasi**:
   - Pelapor dapat memilih apakah ingin melaporkan secara anonim (Nama dan NIM tidak disimpan ke database) atau teridentifikasi.
   - Menggunakan kode laporan berurutan: `BAC-YYYY-NNNN` (misal: `BAC-2025-0001`).
   - Kode akses acak 8 karakter di-hash dengan SHA-256 dan hanya ditampilkan sekali saat submit.
   - Upload bukti hingga 5 file (gambar, video, audio, atau PDF) maksimal 10MB per berkas.
   - Penyimpanan draft lokal di `localStorage`.

2. **Konsultasi & Chat Konselor BAC**:
   - Status konselor online real-time.
   - Quick reply untuk pertanyaan instan.
   - Auto-reply empati cerdas dengan typing indicator.
   - Penautan sesi chat ke ID laporan kasus.
   - Tombol "Eskalasi Kasus" darurat prioritas tinggi.

3. **Solusi & Tracking**:
   - Lacak status laporan aman dengan ID Laporan + Kode Akses (pesan netral "Laporan tidak ditemukan" jika salah).
   - 4 Tab:
     1. **Tracking Status**: Timeline tahapan kasus (Diterima, Dalam Review, Diproses, Selesai) dan riwayat log.
     2. **Saran Otomatis**: Rekomendasi tindakan spesifik berdasarkan jenis perundungan.
     3. **Rekomendasi Konselor**: Catatan resmi penanganan yang dibagikan oleh konselor/admin.
     4. **Minta Mediator**: Formulir permohonan mediasi atau pendampingan akademik (`mediation_requests`).

4. **Panel Admin & Manajemen Kasus**:
   - Autentikasi Admin BAC via Supabase Auth dengan proteksi rute (`ProtectedRoute`).
   - Dashboard statistik (Total Laporan, Kasus Aktif, Kasus Selesai).
   - Pencarian multi-kriteria dan filter status serta kategori perundungan.
   - Detail laporan lengkap dengan 3 kartu: Informasi Pelapor, Manajemen Status Kasus, dan Detail Kejadian.
   - Modal penugasan konselor (`counselors`).
   - Modal penjadwalan pertemuan/mediasi (`meetings`).
   - Tab bukti terlampir dan tab percakapan chat kasus.
   - Otomatis mencatat riwayat ke `report_timeline` setiap kali status diperbarui.

---

## 🛠 Panduan Konfigurasi Supabase

### 1. Membuat Project Supabase
1. Buka [https://supabase.com](https://supabase.com) dan masuk ke dashboard.
2. Buat project baru, beri nama misalnya `binus-anti-bullying-center`.
3. Tentukan Database Password yang kuat dan pilih region terdekat (misal: Singapore).

### 2. Menjalankan Migration & RLS
1. Buka menu **SQL Editor** di dashboard Supabase Anda.
2. Salin seluruh isi file `supabase/migrations/001_initial_schema.sql`.
3. Tempelkan ke SQL Editor lalu klik **Run**.
4. Skema tabel, fungsi `submit_report`, fungsi `track_report`, trigger otomatis timeline, dan kebijakan Row Level Security (RLS) akan aktif secara instan.

### 3. Menjalankan Seed Data
1. Buka kembali **SQL Editor**.
2. Salin isi file `supabase/seed.sql`.
3. Tempelkan ke SQL Editor lalu klik **Run**.
4. Data konselor (Dr. Sarah Wijaya, M. Rizki Pratama M.Psi, Dian Kusuma M.Ed) dan 4 kasus sampel (BAC-2025-0001 s.d. BAC-2025-0004) akan terisi ke database.

### 4. Membuat Akun Admin BAC di Supabase Auth
1. Masuk ke menu **Authentication > Users** di dashboard Supabase.
2. Klik **Add User** -> **Create User**.
3. Masukkan:
   - Email: `admin.bac@binus.ac.id` (atau email staf Anda)
   - Password: `AdminPassword2025!`
   - Centang **Auto Confirm User?** -> True.
4. Klik **Create User**.

### 5. Mengisi Variabel Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isikan kredensial Supabase Anda:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"

# Akun Admin Demo untuk akses login
VITE_ADMIN_DEFAULT_EMAIL="admin.bac@binus.ac.id"
VITE_ADMIN_DEFAULT_PASSWORD="AdminPassword2025!"
```
> *Catatan:* Jika `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` belum diisi, aplikasi secara otomatis menggunakan simulasi Supabase lokal lengkap berbasis in-browser storage yang persisten dan sudah terisi seed data.

---

## 🔒 Uji Coba Keamanan Row Level Security (RLS)

Aplikasi telah mengaktifkan Row Level Security (RLS) pada tabel `reports`.
Untuk membuktikan bahwa publik tidak dapat melakukan query langsung:

```sql
-- Coba jalankan query ini menggunakan Anon / Public Role tanpa token admin:
SELECT * FROM public.reports;
-- Hasil: 0 baris dikembalikan (atau permission denied), karena policy hanya mengizinkan authenticated admin.
```

Pada UI Dashboard Admin, Anda juga dapat menguji dengan mengklik tombol **"Uji Keamanan RLS"** di pojok kanan atas untuk memverifikasi proteksi akses publik secara langsung.

---

## 💻 Akun Demo Admin Siap Pakai

- **Email**: `admin.bac@binus.ac.id`
- **Password**: `AdminPassword2025!`
- Tombol **"Gunakan Akun Ini"** tersedia di halaman `/admin/login` untuk pengisian instan.

### Contoh Data Sampel Laporan untuk Dilacak:
- **ID Laporan**: `BAC-2025-0001` (Kasus Cyberbullying Anonim) | **Kode Akses**: `BAC2025!`
- **ID Laporan**: `BAC-2025-0003` (Kasus Bullying Sosial Siti Nurhaliza) | **Kode Akses**: `BAC2025!`
