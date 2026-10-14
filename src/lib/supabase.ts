import { createClient } from '@supabase/supabase-js';
import type {
  Counselor,
  Report,
  ReportAttachment,
  ReportTimeline,
  Meeting,
  ChatSession,
  ChatMessage,
  MediationRequest,
  SubmitReportInput,
  SubmitReportOutput,
  TrackReportResult,
  ReportStatus,
} from '../types/database';

// -------------------------------------------------------------
// ENVIRONMENT VARIABLES & INITIAL SETUP
// -------------------------------------------------------------
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isLiveSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id'));

export const supabase = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const DEMO_ADMIN = {
  email: import.meta.env.VITE_ADMIN_DEFAULT_EMAIL || 'reyhanz895@gmail.com',
  secondaryEmail: 'muhammad.laksono002@binus.ac.id',
  get password() {
    return localStorage.getItem('bac_admin_custom_password') || import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD || 'AdminPassword2025!';
  },
  set password(val: string) {
    localStorage.setItem('bac_admin_custom_password', val);
  },
  name: 'Muhammad Laksono (Admin BAC)',
  role: 'admin',
};

export function updateAdminPassword(newPassword: string): void {
  localStorage.setItem('bac_admin_custom_password', newPassword);
}

export function getAdminPassword(): string {
  return DEMO_ADMIN.password;
}

// -------------------------------------------------------------
// CRYPTO HELPERS (SHA-256 for Access Code Hash)
// -------------------------------------------------------------
export async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateAccessCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

// -------------------------------------------------------------
// INITIAL SEED DATA
// -------------------------------------------------------------
// Default demo access code hash for 'BAC2025!' (sha256 of BAC2025!)
const DEMO_ACCESS_HASH = 'a7ecf2e1a8cf822eb527dfa63fa6d27457cb1bbd9c792376cfd30a08e612f0e0';

const INITIAL_COUNSELORS: Counselor[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Dr. Sarah Wijaya',
    title: 'Konselor Senior & Psikolog Klinis',
    email: 'sarah.wijaya@binus.ac.id',
    phone: '0812-3456-7890',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    is_active: true,
    created_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'M. Rizki Pratama, M.Psi',
    title: 'Spesialis Konseling Mahasiswa & Cyberbullying',
    email: 'rizki.pratama@binus.ac.id',
    phone: '0813-9876-5432',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    is_active: true,
    created_at: '2024-01-15T09:30:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Dian Kusuma, M.Ed',
    title: 'Mediator Akademik & Advokasi Mahasiswa',
    email: 'dian.kusuma@binus.ac.id',
    phone: '0811-2233-4455',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    is_active: true,
    created_at: '2024-02-01T10:00:00Z',
  },
];

const INITIAL_REPORTS: Report[] = [
  {
    id: 'r0000000-0000-0000-0000-000000000001',
    report_code: 'BAC-2025-0001',
    access_code_hash: DEMO_ACCESS_HASH,
    is_anonymous: true,
    reporter_name: null,
    reporter_nim: null,
    study_program: 'Sistem Informasi',
    case_types: ['Cyberbullying'],
    description: 'Mendapatkan pesan pelecehan berulang dan pencemaran nama baik di grup media sosial angkatan oleh akun anonim.',
    incident_location: 'Media Sosial / Grup Angkatan',
    incident_time: '2024-11-19T14:30:00+07:00',
    status: 'diproses',
    assigned_counselor_id: 'c0000000-0000-0000-0000-000000000001',
    counselor_recommendation: 'Kami telah berkoordinasi dengan tim IT Security kampus untuk melacak jejak digital akun anonim dan mendampingi pelapor dengan sesi konseling psikologis berkala.',
    created_at: '2024-11-19T09:15:00+07:00',
    updated_at: '2024-11-25T10:00:00+07:00',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000002',
    report_code: 'BAC-2025-0002',
    access_code_hash: DEMO_ACCESS_HASH,
    is_anonymous: false,
    reporter_name: 'Andi Pratama',
    reporter_nim: '2601987654',
    study_program: 'Teknik Informatika',
    case_types: ['Bullying Verbal'],
    description: 'Sering mendapat cemoohan verbal dan ejekan bernada merendahkan di area koridor kampus sebelum kelas perkuliahan dimulai.',
    incident_location: 'Kampus Anggrek, Lantai 3',
    incident_time: '2024-11-20T10:00:00+07:00',
    status: 'diterima',
    assigned_counselor_id: null,
    counselor_recommendation: null,
    created_at: '2024-11-20T11:20:00+07:00',
    updated_at: '2024-11-20T11:20:00+07:00',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000003',
    report_code: 'BAC-2025-0003',
    access_code_hash: DEMO_ACCESS_HASH,
    is_anonymous: false,
    reporter_name: 'Siti Nurhaliza',
    reporter_nim: '2501234569',
    study_program: 'Desain Komunikasi Visual',
    case_types: ['Bullying Sosial'],
    description: 'Dikucilkan dari kelompok tugas dan tidak diajak berbicara sama sekali sehingga menghambat pengerjaan tugas akhir semester.',
    incident_location: 'Kampus Syahdan, Ruang Kelas K2A',
    incident_time: '2024-11-20T15:45:00+07:00',
    status: 'dalam_review',
    assigned_counselor_id: 'c0000000-0000-0000-0000-000000000002',
    counselor_recommendation: 'Sedang mengumpulkan informasi dari ketua kelas dan dosen pembimbing mata kuliah terkait untuk mengatur mediasi kelompok tanpa mengekspos pelapor.',
    created_at: '2024-11-21T08:40:00+07:00',
    updated_at: '2024-11-21T14:00:00+07:00',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000004',
    report_code: 'BAC-2025-0004',
    access_code_hash: DEMO_ACCESS_HASH,
    is_anonymous: false,
    reporter_name: 'Budi Santoso',
    reporter_nim: '2401876543',
    study_program: 'Manajemen Bisnis',
    case_types: ['Bullying Fisik'],
    description: 'Terjadi dorongan fisik dan perusakan perlengkapan kuliah di area parkiran motor belakang kampus.',
    incident_location: 'Kampus Kijang, Parkir Motor',
    incident_time: '2024-11-10T16:30:00+07:00',
    status: 'selesai',
    assigned_counselor_id: 'c0000000-0000-0000-0000-000000000003',
    counselor_recommendation: 'Mediasi formal bersama Komite Disiplin BINUS telah selesai. Pelaku telah diberikan sanksi akademik surat peringatan dan surat pernyataan damai telah ditandatangani.',
    created_at: '2024-11-10T17:15:00+07:00',
    updated_at: '2024-11-18T16:00:00+07:00',
  },
];

const INITIAL_TIMELINE: ReportTimeline[] = [
  {
    id: 't-1-1',
    report_id: 'r0000000-0000-0000-0000-000000000001',
    status: 'diterima',
    note: 'Laporan berhasil diterima oleh sistem BAC.',
    created_at: '2024-11-19T09:15:00+07:00',
    created_by: 'Sistem BAC',
  },
  {
    id: 't-1-2',
    report_id: 'r0000000-0000-0000-0000-000000000001',
    status: 'dalam_review',
    note: 'Laporan diverifikasi oleh Admin BAC dan diteruskan ke tim konseling.',
    created_at: '2024-11-20T10:00:00+07:00',
    created_by: 'Admin BAC',
  },
  {
    id: 't-1-3',
    report_id: 'r0000000-0000-0000-0000-000000000001',
    status: 'diproses',
    note: 'Kasus ditangani oleh Dr. Sarah Wijaya untuk pendampingan digital forensics & psikologis.',
    created_at: '2024-11-25T14:00:00+07:00',
    created_by: 'Dr. Sarah Wijaya',
  },
  {
    id: 't-2-1',
    report_id: 'r0000000-0000-0000-0000-000000000002',
    status: 'diterima',
    note: 'Laporan berhasil diterima dalam sistem BAC.',
    created_at: '2024-11-20T11:20:00+07:00',
    created_by: 'Sistem BAC',
  },
  {
    id: 't-3-1',
    report_id: 'r0000000-0000-0000-0000-000000000003',
    status: 'diterima',
    note: 'Laporan berhasil diterima oleh sistem BAC.',
    created_at: '2024-11-21T08:40:00+07:00',
    created_by: 'Sistem BAC',
  },
  {
    id: 't-3-2',
    report_id: 'r0000000-0000-0000-0000-000000000003',
    status: 'dalam_review',
    note: 'Kasus ditelaah oleh M. Rizki Pratama, M.Psi untuk opsi mediasi kelas.',
    created_at: '2024-11-21T14:00:00+07:00',
    created_by: 'M. Rizki Pratama, M.Psi',
  },
  {
    id: 't-4-1',
    report_id: 'r0000000-0000-0000-0000-000000000004',
    status: 'diterima',
    note: 'Laporan masuk dari mahasiswa.',
    created_at: '2024-11-10T17:15:00+07:00',
    created_by: 'Sistem BAC',
  },
  {
    id: 't-4-2',
    report_id: 'r0000000-0000-0000-0000-000000000004',
    status: 'dalam_review',
    note: 'Review rekaman CCTV area parkir dan verifikasi saksi.',
    created_at: '2024-11-11T09:00:00+07:00',
    created_by: 'Admin BAC',
  },
  {
    id: 't-4-3',
    report_id: 'r0000000-0000-0000-0000-000000000004',
    status: 'diproses',
    note: 'Sidang disiplin internal bersama Kepala Jurusan.',
    created_at: '2024-11-13T13:30:00+07:00',
    created_by: 'Dian Kusuma, M.Ed',
  },
  {
    id: 't-4-4',
    report_id: 'r0000000-0000-0000-0000-000000000004',
    status: 'selesai',
    note: 'Kasus selesai. Surat damai disepakati dan sanksi berlaku.',
    created_at: '2024-11-18T16:00:00+07:00',
    created_by: 'Komite Disiplin BINUS',
  },
];

const INITIAL_ATTACHMENTS: ReportAttachment[] = [
  {
    id: 'att-3-1',
    report_id: 'r0000000-0000-0000-0000-000000000003',
    storage_path: 'evidence/r0000000-0000-0000-0000-000000000003/tangkapan_chat_kelompok.jpg',
    file_name: 'tangkapan_chat_kelompok.jpg',
    mime_type: 'image/jpeg',
    size_bytes: 450200,
    created_at: '2024-11-21T08:40:00+07:00',
  },
];

const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'm-3-1',
    report_id: 'r0000000-0000-0000-0000-000000000003',
    counselor_id: 'c0000000-0000-0000-0000-000000000002',
    scheduled_at: '2024-11-24T10:00:00+07:00',
    notes: 'Sesi mediasi tertutup di Ruang Konseling Kampus Anggrek Lantai 2',
    created_by: 'admin-1',
    created_at: '2024-11-21T14:10:00+07:00',
  },
];

// -------------------------------------------------------------
// LOCAL REPOSITORY (Persistent in browser localStorage)
// -------------------------------------------------------------
const STORAGE_KEYS = {
  REPORTS: 'bac_reports_v1',
  COUNSELORS: 'bac_counselors_v1',
  TIMELINE: 'bac_timeline_v1',
  ATTACHMENTS: 'bac_attachments_v1',
  MEETINGS: 'bac_meetings_v1',
  CHAT_SESSIONS: 'bac_chat_sessions_v1',
  CHAT_MESSAGES: 'bac_chat_messages_v1',
  MEDIATION: 'bac_mediation_v1',
  AUTH_USER: 'bac_auth_user_v1',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

// Initialize tables if empty
export function initLocalDatabase() {
  if (!localStorage.getItem(STORAGE_KEYS.COUNSELORS)) {
    setItem(STORAGE_KEYS.COUNSELORS, INITIAL_COUNSELORS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    setItem(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TIMELINE)) {
    setItem(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTACHMENTS)) {
    setItem(STORAGE_KEYS.ATTACHMENTS, INITIAL_ATTACHMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEETINGS)) {
    setItem(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS)) {
    setItem(STORAGE_KEYS.CHAT_SESSIONS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)) {
    setItem(STORAGE_KEYS.CHAT_MESSAGES, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEDIATION)) {
    setItem(STORAGE_KEYS.MEDIATION, []);
  }
}

// -------------------------------------------------------------
// AUTHENTICATION ENGINE
// -------------------------------------------------------------
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export function getCurrentAdmin(): AuthUser | null {
  return getItem<AuthUser | null>(STORAGE_KEYS.AUTH_USER, null);
}

export async function loginAdmin(email: string, pass: string): Promise<{ user: AuthUser | null; error: string | null }> {
  // If live supabase configured, try that first
  if (isLiveSupabaseConfigured && supabase) {
    const res = await supabase.auth.signInWithPassword({ email, password: pass });
    if (res.error) {
      return { user: null, error: res.error.message };
    }
    const user: AuthUser = {
      id: res.data.user.id,
      email: res.data.user.email || email,
      name: res.data.user.user_metadata?.full_name || 'Petugas BAC',
      role: 'admin',
    };
    setItem(STORAGE_KEYS.AUTH_USER, user);
    return { user, error: null };
  }

  // Local Admin Verification
  const cleanEmail = email.trim().toLowerCase();
  const currentPassword = DEMO_ADMIN.password;

  const isUserEmail =
    cleanEmail === 'reyhanz895@gmail.com' ||
    cleanEmail.includes('laksono') ||
    cleanEmail === 'admin.bac@binus.ac.id' ||
    cleanEmail === DEMO_ADMIN.email.toLowerCase();

  const isBinusEmail = cleanEmail.includes('binus.ac.id') || cleanEmail.includes('binus.edu');

  // Match if password matches currentPassword OR if user entered any password >= 4 chars for their own email
  const isPasswordValid = pass === currentPassword || ((isUserEmail || isBinusEmail) && pass.length >= 4);

  if ((isUserEmail || isBinusEmail) && isPasswordValid) {
    const displayName = cleanEmail.includes('laksono') || cleanEmail === 'reyhanz895@gmail.com'
      ? 'Muhammad Laksono'
      : cleanEmail === 'admin.bac@binus.ac.id'
      ? 'Petugas Admin BAC'
      : cleanEmail.split('@')[0].replace('.', ' ').toUpperCase();

    const normalizedEmail = cleanEmail.includes('@')
      ? cleanEmail
      : cleanEmail.replace('.binus', '@binus');

    const user: AuthUser = {
      id: 'admin-' + Math.random().toString(36).substring(2, 9),
      email: normalizedEmail,
      name: displayName,
      role: 'admin',
    };
    setItem(STORAGE_KEYS.AUTH_USER, user);
    return { user, error: null };
  }

  return { user: null, error: 'Email atau kata sandi tidak valid. Silakan gunakan tombol "Gunakan Akun Ini" atau periksa kembali format email.' };
}

export async function loginWithGoogle(accountEmail?: string): Promise<{ user: AuthUser | null; error: string | null }> {
  // If live Supabase configured, initiate OAuth redirect
  if (isLiveSupabaseConfigured && supabase) {
    const res = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/admin/dashboard',
      },
    });
    if (res.error) {
      return { user: null, error: res.error.message };
    }
  }

  // Preview environment simulation
  const selectedEmail = accountEmail || 'reyhanz895@gmail.com';
  const displayName = selectedEmail.includes('laksono') || selectedEmail === 'reyhanz895@gmail.com'
    ? 'Muhammad Laksono'
    : selectedEmail.split('@')[0].replace('.', ' ').toUpperCase();

  const user: AuthUser = {
    id: 'admin-google-' + Math.random().toString(36).substring(2, 9),
    email: selectedEmail,
    name: displayName,
    role: 'admin',
  };
  setItem(STORAGE_KEYS.AUTH_USER, user);
  return { user, error: null };
}

export async function logoutAdmin(): Promise<void> {
  if (isLiveSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
}

// -------------------------------------------------------------
// SECURE RPC: submit_report
// -------------------------------------------------------------
export async function submitReport(input: SubmitReportInput): Promise<SubmitReportOutput> {
  initLocalDatabase();
  const rawAccessCode = generateAccessCode(8);
  const accessHash = await sha256(rawAccessCode);

  const reports = getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  const currentYear = new Date().getFullYear();
  const nextNum = reports.length + 1;
  const reportCode = `BAC-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  const reportId = 'r-' + Math.random().toString(36).substring(2, 10);
  const now = new Date().toISOString();

  const newReport: Report = {
    id: reportId,
    report_code: reportCode,
    access_code_hash: accessHash,
    is_anonymous: input.is_anonymous,
    reporter_name: input.is_anonymous ? null : input.reporter_name || null,
    reporter_nim: input.is_anonymous ? null : input.reporter_nim || null,
    study_program: input.study_program,
    case_types: input.case_types,
    description: input.description,
    incident_location: input.incident_location,
    incident_time: input.incident_time,
    status: 'diterima',
    assigned_counselor_id: null,
    counselor_recommendation: null,
    created_at: now,
    updated_at: now,
  };

  reports.unshift(newReport);
  setItem(STORAGE_KEYS.REPORTS, reports);

  // Auto timeline
  const timelines = getItem<ReportTimeline[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
  timelines.unshift({
    id: 't-' + Math.random().toString(36).substring(2, 9),
    report_id: reportId,
    status: 'diterima',
    note: 'Laporan berhasil diterima oleh sistem BAC',
    created_at: now,
    created_by: 'Sistem BAC',
  });
  setItem(STORAGE_KEYS.TIMELINE, timelines);

  // Attachments
  if (input.attachments && input.attachments.length > 0) {
    const attachments = getItem<ReportAttachment[]>(STORAGE_KEYS.ATTACHMENTS, INITIAL_ATTACHMENTS);
    for (const att of input.attachments) {
      attachments.push({
        id: 'att-' + Math.random().toString(36).substring(2, 9),
        report_id: reportId,
        storage_path: `evidence/${reportId}/${att.file_name}`,
        file_name: att.file_name,
        mime_type: att.mime_type,
        size_bytes: att.size_bytes,
        created_at: now,
      });
    }
    setItem(STORAGE_KEYS.ATTACHMENTS, attachments);
  }

  return {
    report_id: reportId,
    report_code: reportCode,
    access_code: rawAccessCode,
    status: 'diterima',
    created_at: now,
  };
}

// -------------------------------------------------------------
// SECURE RPC: track_report
// -------------------------------------------------------------
export async function trackReport(
  reportCode: string,
  rawAccessCode: string
): Promise<{ success: boolean; data?: TrackReportResult; message?: string }> {
  initLocalDatabase();
  const inputHash = await sha256(rawAccessCode);
  const reports = getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  const counselors = getItem<Counselor[]>(STORAGE_KEYS.COUNSELORS, INITIAL_COUNSELORS);
  const timelines = getItem<ReportTimeline[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);

  const cleanCode = reportCode.trim().toUpperCase();
  const found = reports.find(
    (r) => r.report_code.toUpperCase() === cleanCode && r.access_code_hash === inputHash
  );

  if (!found) {
    // Neutral message to avoid leaking ID or code validity
    return { success: false, message: 'Laporan tidak ditemukan' };
  }

  const counselor = found.assigned_counselor_id
    ? counselors.find((c) => c.id === found.assigned_counselor_id)
    : null;

  const caseTimelines = timelines
    .filter((t) => t.report_id === found.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return {
    success: true,
    data: {
      id: found.id,
      report_code: found.report_code,
      status: found.status,
      is_anonymous: found.is_anonymous,
      study_program: found.study_program,
      case_types: found.case_types,
      incident_location: found.incident_location,
      incident_time: found.incident_time,
      counselor_recommendation: found.counselor_recommendation,
      counselor_name: counselor?.name || null,
      counselor_title: counselor?.title || null,
      created_at: found.created_at,
      timeline: caseTimelines,
    },
  };
}

// -------------------------------------------------------------
// RLS ENFORCEMENT & ADMIN OPERATIONS
// -------------------------------------------------------------
// Simulates direct SELECT against reports table from public (should FAIL)
export async function testPublicSelectReports(): Promise<{ allowed: boolean; error: string }> {
  const admin = getCurrentAdmin();
  if (!admin) {
    // RLS policy prevents public SELECT
    return {
      allowed: false,
      error: 'RLS VIOLATION: new row violates row-level security policy for table "reports" (public anon SELECT is disallowed)',
    };
  }
  return { allowed: true, error: '' };
}

// Admin get reports list (requires auth)
export async function getAdminReports(): Promise<Report[]> {
  const admin = getCurrentAdmin();
  if (!admin) {
    throw new Error('Akses ditolak: Anda harus login sebagai admin BAC.');
  }
  initLocalDatabase();
  return getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
}

// Admin get single report detail with relations
export async function getAdminReportDetail(idOrCode: string): Promise<{
  report: Report;
  counselor: Counselor | null;
  attachments: ReportAttachment[];
  timeline: ReportTimeline[];
  meetings: Meeting[];
  chatMessages: ChatMessage[];
} | null> {
  const admin = getCurrentAdmin();
  if (!admin) {
    throw new Error('Akses ditolak: Anda harus login sebagai admin BAC.');
  }
  initLocalDatabase();
  const reports = getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  const report = reports.find((r) => r.id === idOrCode || r.report_code === idOrCode);
  if (!report) return null;

  const counselors = getItem<Counselor[]>(STORAGE_KEYS.COUNSELORS, INITIAL_COUNSELORS);
  const counselor = report.assigned_counselor_id
    ? counselors.find((c) => c.id === report.assigned_counselor_id) || null
    : null;

  const attachments = getItem<ReportAttachment[]>(STORAGE_KEYS.ATTACHMENTS, INITIAL_ATTACHMENTS).filter(
    (a) => a.report_id === report.id
  );

  const timeline = getItem<ReportTimeline[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE)
    .filter((t) => t.report_id === report.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const meetings = getItem<Meeting[]>(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS).filter(
    (m) => m.report_id === report.id
  );

  // Link chat messages for this report
  const sessions = getItem<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
  const linkedSessions = sessions.filter((s) => s.report_id === report.id);
  const sessionIds = new Set(linkedSessions.map((s) => s.id));
  const chatMessages = getItem<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []).filter((m) =>
    sessionIds.has(m.session_id)
  );

  return {
    report,
    counselor,
    attachments,
    timeline,
    meetings,
    chatMessages,
  };
}

// Admin update report status & add timeline entry
export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  note?: string
): Promise<void> {
  const admin = getCurrentAdmin();
  if (!admin) throw new Error('Akses ditolak');

  initLocalDatabase();
  const reports = getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  const index = reports.findIndex((r) => r.id === reportId);
  if (index === -1) throw new Error('Laporan tidak ditemukan');

  const oldStatus = reports[index].status;
  if (oldStatus !== newStatus) {
    reports[index].status = newStatus;
    reports[index].updated_at = new Date().toISOString();
    setItem(STORAGE_KEYS.REPORTS, reports);

    // Auto add timeline entry
    const timelines = getItem<ReportTimeline[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
    timelines.push({
      id: 't-' + Math.random().toString(36).substring(2, 9),
      report_id: reportId,
      status: newStatus,
      note: note || `Status diperbarui menjadi: ${newStatus}`,
      created_at: new Date().toISOString(),
      created_by: admin.name,
    });
    setItem(STORAGE_KEYS.TIMELINE, timelines);
  }
}

// Admin assign counselor
export async function assignCounselorToReport(reportId: string, counselorId: string): Promise<void> {
  const admin = getCurrentAdmin();
  if (!admin) throw new Error('Akses ditolak');

  initLocalDatabase();
  const reports = getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  const counselors = getItem<Counselor[]>(STORAGE_KEYS.COUNSELORS, INITIAL_COUNSELORS);

  const rep = reports.find((r) => r.id === reportId);
  const c = counselors.find((cn) => cn.id === counselorId);
  if (!rep || !c) throw new Error('Data tidak valid');

  rep.assigned_counselor_id = counselorId;
  rep.updated_at = new Date().toISOString();
  setItem(STORAGE_KEYS.REPORTS, reports);

  // Timeline note
  const timelines = getItem<ReportTimeline[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
  timelines.push({
    id: 't-' + Math.random().toString(36).substring(2, 9),
    report_id: reportId,
    status: rep.status,
    note: `Kasus ditugaskan kepada konselor: ${c.name} (${c.title})`,
    created_at: new Date().toISOString(),
    created_by: admin.name,
  });
  setItem(STORAGE_KEYS.TIMELINE, timelines);
}

// Admin update counselor recommendation
export async function updateCounselorRecommendation(reportId: string, recommendation: string): Promise<void> {
  const admin = getCurrentAdmin();
  if (!admin) throw new Error('Akses ditolak');

  initLocalDatabase();
  const reports = getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  const rep = reports.find((r) => r.id === reportId);
  if (!rep) throw new Error('Laporan tidak ditemukan');

  rep.counselor_recommendation = recommendation;
  rep.updated_at = new Date().toISOString();
  setItem(STORAGE_KEYS.REPORTS, reports);
}

// Admin schedule meeting
export async function scheduleMeeting(
  reportId: string,
  scheduledAt: string,
  notes: string,
  counselorId?: string
): Promise<Meeting> {
  const admin = getCurrentAdmin();
  if (!admin) throw new Error('Akses ditolak');

  initLocalDatabase();
  const meetings = getItem<Meeting[]>(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
  const newMeeting: Meeting = {
    id: 'm-' + Math.random().toString(36).substring(2, 9),
    report_id: reportId,
    counselor_id: counselorId || null,
    scheduled_at: scheduledAt,
    notes,
    created_by: admin.id,
    created_at: new Date().toISOString(),
  };

  meetings.push(newMeeting);
  setItem(STORAGE_KEYS.MEETINGS, meetings);

  // Timeline note
  const timelines = getItem<ReportTimeline[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
  timelines.push({
    id: 't-' + Math.random().toString(36).substring(2, 9),
    report_id: reportId,
    status: 'diproses',
    note: `Jadwal sesi mediasi/konseling dibuat untuk: ${new Date(scheduledAt).toLocaleString('id-ID')}`,
    created_at: new Date().toISOString(),
    created_by: admin.name,
  });
  setItem(STORAGE_KEYS.TIMELINE, timelines);

  return newMeeting;
}

// Get Counselors
export async function getActiveCounselors(): Promise<Counselor[]> {
  initLocalDatabase();
  const counselors = getItem<Counselor[]>(STORAGE_KEYS.COUNSELORS, INITIAL_COUNSELORS);
  return counselors.filter((c) => c.is_active);
}

// -------------------------------------------------------------
// CHAT SESSION & MESSAGING
// -------------------------------------------------------------
export async function getOrCreateChatSession(reportId?: string): Promise<ChatSession> {
  initLocalDatabase();
  const localSessionId = localStorage.getItem('bac_active_chat_session_id');
  const sessions = getItem<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);

  if (localSessionId) {
    const existing = sessions.find((s) => s.id === localSessionId);
    if (existing) {
      if (reportId && !existing.report_id) {
        existing.report_id = reportId;
        setItem(STORAGE_KEYS.CHAT_SESSIONS, sessions);
      }
      return existing;
    }
  }

  const newSession: ChatSession = {
    id: 'sess-' + Math.random().toString(36).substring(2, 9),
    report_id: reportId || null,
    is_escalated: false,
    created_at: new Date().toISOString(),
  };

  sessions.push(newSession);
  setItem(STORAGE_KEYS.CHAT_SESSIONS, sessions);
  localStorage.setItem('bac_active_chat_session_id', newSession.id);
  return newSession;
}

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  initLocalDatabase();
  const messages = getItem<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
  return messages.filter((m) => m.session_id === sessionId);
}

export async function sendChatMessage(
  sessionId: string,
  sender: 'user' | 'konselor' | 'system',
  body: string
): Promise<ChatMessage> {
  initLocalDatabase();
  const messages = getItem<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
  const newMsg: ChatMessage = {
    id: 'msg-' + Math.random().toString(36).substring(2, 9),
    session_id: sessionId,
    sender,
    body,
    created_at: new Date().toISOString(),
  };

  messages.push(newMsg);
  setItem(STORAGE_KEYS.CHAT_MESSAGES, messages);
  return newMsg;
}

export async function escalateChatSession(sessionId: string): Promise<void> {
  initLocalDatabase();
  const sessions = getItem<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
  const sess = sessions.find((s) => s.id === sessionId);
  if (sess) {
    sess.is_escalated = true;
    setItem(STORAGE_KEYS.CHAT_SESSIONS, sessions);

    // Send system message
    await sendChatMessage(
      sessionId,
      'system',
      '🚨 Kasus telah dieskalasi dengan prioritas TINGGI. Petugas piket BAC telah diberi notifikasi untuk segera merespons.'
    );
  }
}

// -------------------------------------------------------------
// MEDIATION REQUESTS
// -------------------------------------------------------------
export async function submitMediationRequest(
  reportId: string | null,
  serviceType: string,
  message: string
): Promise<MediationRequest> {
  initLocalDatabase();
  const requests = getItem<MediationRequest[]>(STORAGE_KEYS.MEDIATION, []);
  const newReq: MediationRequest = {
    id: 'med-' + Math.random().toString(36).substring(2, 9),
    report_id: reportId,
    service_type: serviceType,
    message,
    status: 'diajukan',
    created_at: new Date().toISOString(),
  };
  requests.push(newReq);
  setItem(STORAGE_KEYS.MEDIATION, requests);
  return newReq;
}
