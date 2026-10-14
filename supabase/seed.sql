-- ====================================================================
-- BINUS ANTI-BULLYING CENTER (BAC) - SEED DATA
-- File: supabase/seed.sql
-- ====================================================================

-- 1. SEED COUNSELORS
INSERT INTO public.counselors (id, name, title, email, phone, is_active)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'Dr. Sarah Wijaya', 'Konselor Senior & Psikolog Klinis', 'sarah.wijaya@binus.ac.id', '0812-3456-7890', true),
    ('c0000000-0000-0000-0000-000000000002', 'M. Rizki Pratama, M.Psi', 'Spesialis Konseling Mahasiswa & Cyberbullying', 'rizki.pratama@binus.ac.id', '0813-9876-5432', true),
    ('c0000000-0000-0000-0000-000000000003', 'Dian Kusuma, M.Ed', 'Mediator Akademik & Advokasi Mahasiswa', 'dian.kusuma@binus.ac.id', '0811-2233-4455', true)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED SAMPLE REPORTS
-- Note: Default access code for demo seed cases is 'BAC2025!' (SHA-256 hash below)
-- SHA256 of 'BAC2025!' is 'a7ecf2e1a8cf822eb527dfa63fa6d27457cb1bbd9c792376cfd30a08e612f0e0'

-- Case 1: BAC-2025-0001 | Anonymous | Cyberbullying | 19/11/2024 | Diproses | Dr. Sarah Wijaya
INSERT INTO public.reports (
    id,
    report_code,
    access_code_hash,
    is_anonymous,
    reporter_name,
    reporter_nim,
    study_program,
    case_types,
    description,
    incident_location,
    incident_time,
    status,
    assigned_counselor_id,
    counselor_recommendation,
    created_at,
    updated_at
) VALUES (
    'r0000000-0000-0000-0000-000000000001',
    'BAC-2025-0001',
    'a7ecf2e1a8cf822eb527dfa63fa6d27457cb1bbd9c792376cfd30a08e612f0e0',
    true,
    NULL,
    NULL,
    'Sistem Informasi',
    ARRAY['Cyberbullying'],
    'Mendapatkan pesan pelecehan berulang dan pencemaran nama baik di grup media sosial angkatan yang disebarkan oleh akun samaran.',
    'Media Sosial / Grup Angkatan',
    '2024-11-19 14:30:00+07',
    'diproses',
    'c0000000-0000-0000-0000-000000000001',
    'Kami telah berkoordinasi dengan tim IT Security kampus untuk melacak jejak digital akun anonim dan mendampingi pelapor dengan sesi konseling psikologis berkala.',
    '2024-11-19 09:15:00+07',
    '2024-11-25 10:00:00+07'
) ON CONFLICT (report_code) DO NOTHING;

-- Case 2: BAC-2025-0002 | Andi Pratama | Bullying Verbal | 20/11/2024 | Diterima | -
INSERT INTO public.reports (
    id,
    report_code,
    access_code_hash,
    is_anonymous,
    reporter_name,
    reporter_nim,
    study_program,
    case_types,
    description,
    incident_location,
    incident_time,
    status,
    assigned_counselor_id,
    counselor_recommendation,
    created_at,
    updated_at
) VALUES (
    'r0000000-0000-0000-0000-000000000002',
    'BAC-2025-0002',
    'a7ecf2e1a8cf822eb527dfa63fa6d27457cb1bbd9c792376cfd30a08e612f0e0',
    false,
    'Andi Pratama',
    '2601987654',
    'Teknik Informatika',
    ARRAY['Bullying Verbal'],
    'Sering mendapat cemoohan verbal dan ejekan bernada merendahkan di area koridor kampus sebelum kelas perkuliahan dimulai.',
    'Kampus Anggrek, Lantai 3',
    '2024-11-20 10:00:00+07',
    'diterima',
    NULL,
    NULL,
    '2024-11-20 11:20:00+07',
    '2024-11-20 11:20:00+07'
) ON CONFLICT (report_code) DO NOTHING;

-- Case 3: BAC-2025-0003 | Siti Nurhaliza | Bullying Sosial | 21/11/2024 | Dalam Review | M. Rizki Pratama, M.Psi
INSERT INTO public.reports (
    id,
    report_code,
    access_code_hash,
    is_anonymous,
    reporter_name,
    reporter_nim,
    study_program,
    case_types,
    description,
    incident_location,
    incident_time,
    status,
    assigned_counselor_id,
    counselor_recommendation,
    created_at,
    updated_at
) VALUES (
    'r0000000-0000-0000-0000-000000000003',
    'BAC-2025-0003',
    'a7ecf2e1a8cf822eb527dfa63fa6d27457cb1bbd9c792376cfd30a08e612f0e0',
    false,
    'Siti Nurhaliza',
    '2501234569',
    'Desain Komunikasi Visual',
    ARRAY['Bullying Sosial'],
    'Dikucilkan dari kelompok tugas dan tidak diajak berbicara sama sekali sehingga menghambat pengerjaan tugas akhir semester.',
    'Kampus Syahdan, Ruang Kelas K2A',
    '2024-11-20 15:45:00+07',
    'dalam_review',
    'c0000000-0000-0000-0000-000000000002',
    'Sedang mengumpulkan informasi dari ketua kelas dan dosen pembimbing mata kuliah terkait untuk mengatur mediasi kelompok tanpa mengekspos pelapor.',
    '2024-11-21 08:40:00+07',
    '2024-11-21 14:00:00+07'
) ON CONFLICT (report_code) DO NOTHING;

-- Case 4: BAC-2025-0004 | Budi Santoso | Bullying Fisik | 10/11/2024 | Selesai | Dian Kusuma, M.Ed
INSERT INTO public.reports (
    id,
    report_code,
    access_code_hash,
    is_anonymous,
    reporter_name,
    reporter_nim,
    study_program,
    case_types,
    description,
    incident_location,
    incident_time,
    status,
    assigned_counselor_id,
    counselor_recommendation,
    created_at,
    updated_at
) VALUES (
    'r0000000-0000-0000-0000-000000000004',
    'BAC-2025-0004',
    'a7ecf2e1a8cf822eb527dfa63fa6d27457cb1bbd9c792376cfd30a08e612f0e0',
    false,
    'Budi Santoso',
    '2401876543',
    'Manajemen Bisnis',
    ARRAY['Bullying Fisik'],
    'Terjadi dorongan fisik dan perusakan perlengkapan kuliah di area parkiran motor belakang kampus.',
    'Kampus Kijang, Parkir Motor',
    '2024-11-10 16:30:00+07',
    'selesai',
    'c0000000-0000-0000-0000-000000000003',
    'Mediasi formal bersama Komite Disiplin BINUS telah selesai. Pelaku telah diberikan sanksi akademik surat peringatan dan surat pernyataan damai telah ditandatangani.',
    '2024-11-10 17:15:00+07',
    '2024-11-18 16:00:00+07'
) ON CONFLICT (report_code) DO NOTHING;

-- 3. SEED REPORT TIMELINE
INSERT INTO public.report_timeline (report_id, status, note, created_at, created_by)
VALUES
    ('r0000000-0000-0000-0000-000000000001', 'diterima', 'Laporan berhasil diterima dalam sistem BAC.', '2024-11-19 09:15:00+07', 'Sistem'),
    ('r0000000-0000-0000-0000-000000000001', 'dalam_review', 'Laporan diverifikasi oleh Admin BAC dan diteruskan ke tim konseling.', '2024-11-20 10:00:00+07', 'Admin BAC'),
    ('r0000000-0000-0000-0000-000000000001', 'diproses', 'Kasus ditangani oleh Dr. Sarah Wijaya untuk pendampingan digital forensics & psikologis.', '2024-11-25 14:00:00+07', 'Dr. Sarah Wijaya'),

    ('r0000000-0000-0000-0000-000000000002', 'diterima', 'Laporan berhasil diterima dalam sistem BAC.', '2024-11-20 11:20:00+07', 'Sistem'),

    ('r0000000-0000-0000-0000-000000000003', 'diterima', 'Laporan berhasil diterima dalam sistem BAC.', '2024-11-21 08:40:00+07', 'Sistem'),
    ('r0000000-0000-0000-0000-000000000003', 'dalam_review', 'Kasus ditelaah oleh M. Rizki Pratama, M.Psi untuk opsi mediasi kelas.', '2024-11-21 14:00:00+07', 'M. Rizki Pratama, M.Psi'),

    ('r0000000-0000-0000-0000-000000000004', 'diterima', 'Laporan masuk dari mahasiswa.', '2024-11-10 17:15:00+07', 'Sistem'),
    ('r0000000-0000-0000-0000-000000000004', 'dalam_review', 'Review CCTV area parkir dan verifikasi saksi.', '2024-11-11 09:00:00+07', 'Admin BAC'),
    ('r0000000-0000-0000-0000-000000000004', 'diproses', 'Sidang disiplin internal bersama Kepala Jurusan.', '2024-11-13 13:30:00+07', 'Dian Kusuma, M.Ed'),
    ('r0000000-0000-0000-0000-000000000004', 'selesai', 'Kasus selesai. Surat damai disepakati dan sanksi berlaku.', '2024-11-18 16:00:00+07', 'Komite Disiplin');

-- 4. SEED MEETINGS
INSERT INTO public.meetings (report_id, counselor_id, scheduled_at, notes)
VALUES
    ('r0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', '2024-11-24 10:00:00+07', 'Sesi mediasi tertutup di Ruang Konseling Kampus Anggrek Lantai 2');
