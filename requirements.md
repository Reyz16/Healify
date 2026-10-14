# Dokumen Kebutuhan (requirements.md)
## Binus Anti-Bullying Center (BAC)

Sistem informasi dan layanan pelaporan perundungan kampus yang aman, terpercaya, dan profesional untuk BINUS University.

---

### 1. Tujuan & Ruang Lingkup
- Menyediakan platform pelaporan daring yang menjamin kerahasiaan pelapor, mendukung pelaporan teridentifikasi maupun anonim penuh (nama dan NIM tidak disimpan).
- Menyediakan akses pelacakan laporan real-time melalui kombinasi ID Laporan unik (`BAC-YYYY-NNNN`) dan Kode Akses acak yang di-hash (SHA-256).
- Menyediakan saluran konsultasi interaktif daring ("Chat Konselor BAC") dengan auto-reply empati cerdas, quick reply, dan eskalasi kasus darurat.
- Memberikan dashboard manajemen kasus bagi petugas/konselor BAC untuk memproses laporan, menugaskan konselor, menjadwalkan mediasi/pertemuan, dan memberikan rekomendasi resmi.

---

### 2. Aktor & Peran
1. **Pelapor Publik (Mahasiswa / Civitas Akademika)**:
   - Akses tanpa login.
   - Mengisi form pelaporan (pilihan anonim atau dengan identitas).
   - Mengunggah berkas bukti (maksimal 5 berkas: gambar, video, audio, PDF).
   - Menyimpan draft laporan di `localStorage`.
   - Mengakses status tracking, saran pencegahan, rekomendasi konselor, serta permohonan mediasi.
   - Melakukan live chat dengan konselor BAC.
2. **Admin / Konselor BAC**:
   - Wajib login menggunakan kredensial email & password (Supabase Auth).
   - Memantau ringkasan statistik laporan (Total Laporan, Laporan Aktif).
   - Melakukan filter, pencarian, dan penanganan detail laporan.
   - Mengubah status kasus (`diterima`, `dalam_review`, `diproses`, `selesai`) yang otomatis mencatat log timeline.
   - Menugaskan konselor dari database ke kasus terkait.
   - Menjadwalkan pertemuan konseling/mediasi.
   - Membalas percakapan chat pelapor secara terpusat.

---

### 3. Persyaratan Fungsional
- **RF-01 (Pelaporan)**: Input data laporan dengan validasi ketat (lokasi kampus, waktu, pilihan kategori perundungan, deskripsi maks 2000 karakter, proteksi honeypot anti-spam).
- **RF-02 (Anonimitas)**: Jika toggle anonim aktif, kolom nama dan NIM dinonaktifkan/dibersihkan dan tidak pernah disimpan ke database.
- **RF-03 (Kode Akses)**: Sistem menghasilkan ID laporan format `BAC-YYYY-NNNN` dan kode akses unik 8 karakter acak. Kode disimpan dalam database dalam bentuk hash SHA-256. Kode asli hanya ditampilkan satu kali pada dialog sukses pasca-pengiriman.
- **RF-04 (Unggah Bukti)**: Maksimal 5 file, validasi tipe mime (gambar, audio, video, PDF) dan ukuran maksimal 10MB per file.
- **RF-05 (Konsultasi Chat)**: Sesi percakapan tersimpan, quick reply pertanyaan umum, balasan otomatis terstruktur dengan indikator sedang mengetik, tombol eskalasi darurat, dan penautan ke nomor laporan.
- **RF-06 (Tracking & Solusi)**: Form pelacakan aman yang tidak membocorkan keberadaan kode yang salah ("Laporan tidak ditemukan"), tab tracking timeline, rekomendasi solusi otomatis berdasarkan kategori kasus, catatan rekomendasi konselor, dan formulir permohonan mediator.
- **RF-07 (Autentikasi Admin)**: Rute admin terlindungi (`ProtectedRoute`), toggle lihat password, pesan error jelas, sesi persisten.
- **RF-08 (Dashboard Admin)**: Pencarian multi-kriteria, filter status dan jenis kasus, pagination, kartu KPI ringkasan kasus.
- **RF-09 (Detail Laporan Admin)**: Modal penugasan konselor, modal jadwal pertemuan, tab bukti terlampir, tab riwayat chat, dan logging timeline otomatis saat status diperbarui.

---

### 4. Persyaratan Non-Fungsional
- **RNF-01 (Keamanan & Privasi)**: Row Level Security (RLS) diaktifkan di semua tabel. Klien publik tidak dapat menjalankan `SELECT * FROM reports` langsung. Operasi publik hanya melalui RPC `submit_report()` dan `track_report()`.
- **RNF-02 (Responsif)**: Tampilan mobile-first yang optimal di ponsel (360px+), tablet, dan desktop (1440px+).
- **RNF-03 (Bahasa)**: Menggunakan Bahasa Indonesia untuk seluruh antarmuka pengguna.
