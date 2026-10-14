# Arsitektur Basis Data (database-architecture.md)
## Binus Anti-Bullying Center (BAC) - PostgreSQL / Supabase

Dokumen ini menjelaskan struktur relasional, integritas data, kebijakan keamanan tingkat baris (Row Level Security), dan fungsi Remote Procedure Call (RPC) pada sistem BAC.

---

### 1. Diagram Relasi Entitas (ERD)

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│           counselors            │       │             reports             │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ id: UUID (PK)                   │◄──┐   │ id: UUID (PK)                   │
│ name: TEXT                      │   └───┤ assigned_counselor_id: UUID(FK) │
│ title: TEXT                     │       │ report_code: TEXT (UQ)          │
│ email: TEXT                     │       │ access_code_hash: TEXT          │
│ phone: TEXT                     │       │ is_anonymous: BOOLEAN           │
│ avatar_url: TEXT                │       │ reporter_name: TEXT (nullable)  │
│ is_active: BOOLEAN              │       │ reporter_nim: TEXT (nullable)   │
│ created_at: TIMESTAMPTZ         │       │ study_program: TEXT             │
└─────────────────────────────────┘       │ case_types: TEXT[]              │
                                          │ description: TEXT (<=2000 chars)│
┌─────────────────────────────────┐       │ incident_location: TEXT         │
│       report_attachments        │       │ incident_time: TIMESTAMPTZ      │
├─────────────────────────────────┤       │ status: report_status_enum      │
│ id: UUID (PK)                   │       │ counselor_recommendation: TEXT  │
│ report_id: UUID (FK) ───────────┼──┐    │ created_at: TIMESTAMPTZ         │
│ storage_path: TEXT              │  │    │ updated_at: TIMESTAMPTZ         │
│ file_name: TEXT                 │  │    └──────────────┬──────────────────┘
│ mime_type: TEXT                 │  │                   │
│ size_bytes: BIGINT              │  │                   │
│ created_at: TIMESTAMPTZ         │  │                   │
└─────────────────────────────────┘  │                   │
                                     │                   │
┌─────────────────────────────────┐  │                   │
│         report_timeline         │  │                   │
├─────────────────────────────────┤  │                   │
│ id: UUID (PK)                   │  │                   │
│ report_id: UUID (FK) ───────────┼──┼───────────────────┤
│ status: report_status_enum      │  │                   │
│ note: TEXT                      │  │                   │
│ created_at: TIMESTAMPTZ         │  │                   │
│ created_by: TEXT (nullable)     │  │                   │
└─────────────────────────────────┘  │                   │
                                     │                   │
┌─────────────────────────────────┐  │                   │
│            meetings             │  │                   │
├─────────────────────────────────┤  │                   │
│ id: UUID (PK)                   │  │                   │
│ report_id: UUID (FK) ───────────┼──┼───────────────────┤
│ counselor_id: UUID (FK)         │  │                   │
│ scheduled_at: TIMESTAMPTZ       │  │                   │
│ notes: TEXT                     │  │                   │
│ created_by: UUID (nullable)     │  │                   │
│ created_at: TIMESTAMPTZ         │  │                   │
└─────────────────────────────────┘  │                   │
                                     │                   │
┌─────────────────────────────────┐  │                   │
│       mediation_requests        │  │                   │
├─────────────────────────────────┤  │                   │
│ id: UUID (PK)                   │  │                   │
│ report_id: UUID (FK, nullable) ─┼──┼───────────────────┤
│ service_type: TEXT              │  │                   │
│ message: TEXT                   │  │                   │
│ status: TEXT                    │  │                   │
│ created_at: TIMESTAMPTZ         │  │                   │
└─────────────────────────────────┘  │                   │
                                     │                   │
┌─────────────────────────────────┐  │                   │
│          chat_sessions          │  │                   │
├─────────────────────────────────┤  │                   │
│ id: UUID (PK)                   │  │                   │
│ report_id: UUID (FK, nullable) ─┼──┴───────────────────┘
│ is_escalated: BOOLEAN           │
│ created_at: TIMESTAMPTZ         │
└────────────────┬────────────────┘
                 │
┌────────────────┴────────────────┐
│          chat_messages          │
├─────────────────────────────────┤
│ id: UUID (PK)                   │
│ session_id: UUID (FK)           │
│ sender: TEXT (user/konselor/sys)│
│ body: TEXT                      │
│ created_at: TIMESTAMPTZ         │
└─────────────────────────────────┘
```

---

### 2. Kamus Data & Definisi Kolom

#### A. Tabel `counselors`
Menyimpan profil konselor kampus, psikolog klinis, dan mediator BAC.
- `id` (UUID, Primary Key): Pengenal unik konselor.
- `name` (TEXT, NOT NULL): Nama lengkap dan gelar konselor.
- `title` (TEXT, NOT NULL): Jabatan/spesialisasi (misal: "Konselor Senior & Psikolog Klinis").
- `email` (TEXT): Email resmi BINUS untuk notifikasi penugasan.
- `phone` (TEXT): Nomor telepon operasional.
- `avatar_url` (TEXT): URL foto profil.
- `is_active` (BOOLEAN, DEFAULT true): Status keaktifan konselor.

#### B. Tabel `reports`
Menyimpan laporan insiden perundungan dari pelapor publik.
- `id` (UUID, Primary Key): ID unik record laporan.
- `report_code` (TEXT, UNIQUE): Kode publik berformat `BAC-YYYY-NNNN`.
- `access_code_hash` (TEXT, NOT NULL): Hash SHA-256 dari kode akses 8 karakter acak.
- `is_anonymous` (BOOLEAN, DEFAULT false): Penanda status anonimitas. Jika `true`, kolom `reporter_name` dan `reporter_nim` wajib `NULL`.
- `reporter_name` (TEXT, NULLABLE): Nama pelapor jika tidak anonim.
- `reporter_nim` (TEXT, NULLABLE): NIM pelapor jika tidak anonim.
- `study_program` (TEXT, NOT NULL): Program studi pelapor/kasus.
- `case_types` (TEXT[], NOT NULL): Kategori kasus (Verbal, Fisik, Sosial, Cyberbullying, dll.).
- `description` (TEXT, NOT NULL, CHECK length <= 2000): Kronologi kejadian.
- `incident_location` (TEXT, NOT NULL): Lokasi kampus/area kejadian.
- `incident_time` (TIMESTAMPTZ, NOT NULL): Tanggal dan jam peristiwa.
- `status` (report_status_enum): Nilai status (`diterima`, `dalam_review`, `diproses`, `selesai`).
- `assigned_counselor_id` (UUID, FK -> `counselors.id`): Konselor penanggung jawab.
- `counselor_recommendation` (TEXT): Catatan resmi konselor yang dibagikan untuk pelapor.
- `created_at`, `updated_at` (TIMESTAMPTZ).

#### C. Tabel `report_timeline`
Log tahapan penanganan kasus yang disinkronisasikan ke pelapor.
- `id` (UUID, Primary Key)
- `report_id` (UUID, FK -> `reports.id`, ON DELETE CASCADE)
- `status` (report_status_enum): Status pada tahapan tersebut.
- `note` (TEXT): Catatan penjelasan perkembangan.
- `created_at` (TIMESTAMPTZ): Waktu pencatatan.
- `created_by` (TEXT): Nama admin atau penanda sistem.

#### D. Tabel `report_attachments`
Daftar berkas bukti yang disimpan dalam Supabase Storage private bucket `evidence`.
- `id` (UUID, Primary Key)
- `report_id` (UUID, FK -> `reports.id`, ON DELETE CASCADE)
- `storage_path` (TEXT): Path penyimpanan dalam bucket (format: `evidence/<report_id>/<file_name>`).
- `file_name` (TEXT)
- `mime_type` (TEXT): Validasi tipe file (`image/*`, `video/*`, `audio/*`, `application/pdf`).
- `size_bytes` (BIGINT): Ukuran berkas (maksimal 10MB per berkas).

#### E. Tabel `meetings`
Jadwal mediasi atau konseling tatap muka tertutup.
- `id` (UUID, Primary Key)
- `report_id` (UUID, FK -> `reports.id`)
- `counselor_id` (UUID, FK -> `counselors.id`)
- `scheduled_at` (TIMESTAMPTZ): Jadwal pertemuan.
- `notes` (TEXT): Ruangan dan instruksi khusus.
- `created_by` (UUID)

#### F. Tabel `chat_sessions` & `chat_messages`
Kanal komunikasi live antara pelapor dan tim konselor BAC.
- `chat_sessions`: `id`, `report_id` (FK nullable), `is_escalated`, `created_at`.
- `chat_messages`: `id`, `session_id` (FK), `sender` ('user' | 'konselor' | 'system'), `body`, `created_at`.

#### G. Tabel `mediation_requests`
Permohonan intervensi mediasi formal dari pelapor.
- `id` (UUID, Primary Key)
- `report_id` (UUID, FK nullable)
- `service_type` (TEXT)
- `message` (TEXT)
- `status` (TEXT, DEFAULT 'diajukan')
- `created_at` (TIMESTAMPTZ)

---

### 3. Matriks Kebijakan Row Level Security (RLS)

| Tabel | Role Publik (Anon) | Role Authenticated (Admin BAC) |
| :--- | :--- | :--- |
| `reports` | **DITOLAK** (SELECT/UPDATE/DELETE). Hanya via RPC `submit_report()` & `track_report()`. | **FULL ACCESS** (SELECT, INSERT, UPDATE, DELETE). |
| `counselors` | SELECT (hanya record dengan `is_active = true`). | **FULL ACCESS**. |
| `report_attachments` | **DITOLAK**. Download via short-lived signed URL admin. | **FULL ACCESS**. |
| `report_timeline` | **DITOLAK** langsung. Dibaca melalui RPC `track_report()`. | **FULL ACCESS**. |
| `meetings` | **DITOLAK**. | **FULL ACCESS**. |
| `chat_sessions` | INSERT & SELECT sesi terkait. | **FULL ACCESS**. |
| `chat_messages` | INSERT & SELECT pesan dalam sesi. | **FULL ACCESS**. |
| `mediation_requests` | INSERT permohonan. | **FULL ACCESS**. |

---

### 4. Definisi Fungsi RPC Terproteksi (Security Definer)

1. **`submit_report(...)`**:
   - Menerima parameter form pelaporan.
   - Mengambil angka urut berikutnya dari `report_code_seq` dan menghasilkan `BAC-YYYY-NNNN`.
   - Meng-hash kode akses mentah menggunakan `digest(p_raw_access_code, 'sha256')`.
   - Memastikan `reporter_name` dan `reporter_nim` dipaksa bernilai `NULL` apabila `p_is_anonymous = true`.
   - Mengembalikan `{ report_id, report_code, status, created_at }`.

2. **`track_report(p_report_code, p_raw_access_code)`**:
   - Membandingkan hash kode akses masukan dengan `access_code_hash`.
   - Mengembalikan pesan kesalahan seragam `"Laporan tidak ditemukan"` jika ID atau kode akses tidak cocok (tanpa membocorkan keberadaan kode).
   - Mengembalikan data aman dan daftar riwayat `report_timeline` jika verifikasi berhasil.
