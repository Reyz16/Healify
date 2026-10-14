# Dokumen Desain & UI/UX (design.md)
## Binus Anti-Bullying Center (BAC)

Dokumen ini mendefinisikan desain visual, hierarki layout, token warna, dan spesifikasi komponen berdasarkan desain Figma BINUS Anti-Bullying Center.

---

### 1. Palet Warna & Token Visual
- **Primary Navy (`#003B73` / `#002B54`)**: Warna identitas utama BINUS University. Digunakan pada navbar, tombol primer, header hero, dan kartu sorotan.
- **Accent Orange (`#F58220` / `#E65100`)**: Warna sekunder BINUS untuk call-to-action (CTA), tombol laporkan, badge aktif, dan aksen penting.
- **Canvas Background (`#F8FAFC`)**: Latar belakang bersih Slate 50 untuk kenyamanan mata dan kontras tinggi.
- **Card Surface (`#FFFFFF`)**: Permukaan kartu bersih dengan border halus `border-slate-200` atau `border-slate-100` dan soft shadow.
- **Text Primary (`#0F172A`)**: Slate 900 untuk judul dan teks utama (WCAG AA compliant).
- **Text Muted (`#475569` / `#64748B`)**: Slate 600 untuk deskripsi pendukung, placeholder, dan metadata.
- **Status Badges**:
  - `diterima`: Biru lembut (`bg-sky-50 text-sky-700 border-sky-200`)
  - `dalam_review`: Kuning/Amber (`bg-amber-50 text-amber-700 border-amber-200`)
  - `diproses`: Oranye hangat (`bg-orange-50 text-orange-700 border-orange-200`)
  - `selesai`: Hijau Emerald (`bg-emerald-50 text-emerald-700 border-emerald-200`)

---

### 2. Tipografi
- **Font Display & Body**: `Plus Jakarta Sans`, sans-serif modern dengan bobot 400 (Regular), 500 (Medium), 600 (SemiBold), dan 700 (Bold).
- **Tabular Figures**: Menggunakan `tabular-nums` dan `JetBrains Mono` untuk kode laporan, tanggal, dan metrik angka.

---

### 3. Komponen Antarmuka Utama
1. **Header / Navbar**:
   - Logo Binus Anti-Bullying Center dengan lambang perisai.
   - Menu: Beranda, Laporkan, Chat, Solusi.
   - Tombol "Login Admin" (atau profil admin & tombol "Keluar" jika sudah login).
   - Tampilan drawer responsif pada perangkat mobile.
2. **Footer**:
   - Kolom Profil Lembaga: "Kampus Aman, Bebas Bullying" & penjelasan misi.
   - Kolom Layanan & Informasi.
   - Hotline Darurat 24/7 (`0800-BAC-HELP`) dan email resmi.
   - Baris hak cipta © 2025 Binus Anti-Bullying Center.
3. **Komponen Reusable**:
   - `StatusBadge`: Tag status berlabel jelas tanpa visual berlebihan.
   - `Timeline`: Alur vertikal tahapan laporan dengan penanda aktif dan tanggal historis.
   - `ChatBubble`: Desain percakapan khas dengan jam dan pembedaan jelas antara pesan pelapor, konselor, dan notifikasi sistem.
   - `FormField`: Komponen input konsisten lengkap dengan label, tooltip, dan pesan error validasi.
   - `Modal`: Pop-up dialog accessible dengan backdrop blur dan focus trap.
   - `Toast`: Notifikasi pop-up non-intrusif.

---

### 4. Detail Halaman Sesuai Figma
- **Beranda**: Hero dengan perisai, banner privasi, 3 langkah "Cara Kerja BAC", 4 kartu akses cepat, dan FAQ accordion.
- **Form Pelaporan**: Checkbox laporan anonim, pemilihan jenis perundungan, textarea counter 2000 karakter, dropzone upload bukti, draft localStorage, dan modal sukses kode akses.
- **Chat Konselor**: Status online, pesan selamat datang, 3 tombol quick reply, auto-reply ramah, penautan ID laporan, dan eskalasi kasus darurat.
- **Solusi & Tracking**: Pencarian dengan report code + access code, 4 tab (Tracking Status, Saran Otomatis, Rekomendasi Konselor, Minta Mediator).
- **Admin Dashboard & Detail**: Statistik metrik, tabel filterable, modal assign konselor, modal jadwalkan meeting, pratinjau bukti, dan tab chat terpadu.
