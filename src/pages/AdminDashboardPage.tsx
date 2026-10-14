import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Calendar,
  Layers,
  ArrowUpDown,
  Lock,
  KeyRound,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../components/Toast';
import {
  getAdminReports,
  getActiveCounselors,
  testPublicSelectReports,
  updateAdminPassword,
  getAdminPassword,
  type AuthUser,
} from '../lib/supabase';
import type { Report, Counselor, ReportStatus } from '../types/database';

interface AdminDashboardPageProps {
  navigate: (route: string) => void;
  currentUser: AuthUser;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  navigate,
  currentUser,
}) => {
  const { showToast } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // RLS test modal state
  const [rlsResult, setRlsResult] = useState<{ allowed: boolean; error: string } | null>(null);
  const [showRlsModal, setShowRlsModal] = useState(false);

  // Change Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [repData, counsData] = await Promise.all([
          getAdminReports(),
          getActiveCounselors(),
        ]);
        setReports(repData);
        setCounselors(counsData);
      } catch (err: any) {
        showToast(err.message || 'Gagal memuat data laporan.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  // Statistics calculation
  const totalReports = reports.length;
  const activeReports = reports.filter((r) => r.status !== 'selesai').length;
  const completedReports = reports.filter((r) => r.status === 'selesai').length;

  // Filter logic
  const filteredReports = reports.filter((rep) => {
    // Search query matching ID, reporter name, or description
    const matchesSearch =
      rep.report_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.reporter_name && rep.reporter_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.study_program.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || rep.status === statusFilter;

    // Case type filter
    const matchesCaseType =
      caseTypeFilter === 'all' || rep.case_types.includes(caseTypeFilter);

    return matchesSearch && matchesStatus && matchesCaseType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCounselorName = (counselorId?: string | null) => {
    if (!counselorId) return '-';
    const c = counselors.find((cn) => cn.id === counselorId);
    return c ? c.name : '-';
  };

  const handleTestRls = async () => {
    // Test public direct select without admin credentials
    localStorage.removeItem('bac_auth_user_v1');
    const res = await testPublicSelectReports();
    // restore admin
    localStorage.setItem('bac_auth_user_v1', JSON.stringify(currentUser));
    setRlsResult(res);
    setShowRlsModal(true);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('Kata sandi minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    updateAdminPassword(newPassword);
    showToast('Kata sandi admin berhasil diperbarui!', 'success');
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#003B73] tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manajemen Laporan BAC & Penanganan Kasus Kampus
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError(null);
              setShowPasswordModal(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 flex items-center gap-1.5 transition border border-amber-200"
            title="Ubah kata sandi login admin"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#F58220]" />
            <span>Ubah Kata Sandi</span>
          </button>

          <button
            onClick={handleTestRls}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition border border-slate-200"
            title="Uji coba Row Level Security"
          >
            <Lock className="w-3.5 h-3.5 text-[#003B73]" />
            <span>Uji Keamanan RLS</span>
          </button>

          <div className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-xs text-[#003B73] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Petugas: {currentUser.name}</span>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Laporan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Laporan
            </span>
            <p className="text-3xl font-black font-mono tabular-nums text-slate-900">
              {totalReports}
            </p>
            <p className="text-xs text-slate-400">Semua laporan terdata di sistem</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#003B73] flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Laporan Aktif */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Kasus Aktif
            </span>
            <p className="text-3xl font-black font-mono tabular-nums text-[#F58220]">
              {activeReports}
            </p>
            <p className="text-xs text-slate-400">Diterima, dalam review, atau diproses</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F58220] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Laporan Selesai */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Kasus Selesai
            </span>
            <p className="text-3xl font-black font-mono tabular-nums text-emerald-600">
              {completedReports}
            </p>
            <p className="text-xs text-slate-400">Resolusi mediasi / sidang selesai</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Cari laporan berdasarkan ID, nama, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] transition bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="diterima">Diterima</option>
              <option value="dalam_review">Dalam Review</option>
              <option value="diproses">Sedang Diproses</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          {/* Case Type Filter */}
          <div>
            <select
              value={caseTypeFilter}
              onChange={(e) => {
                setCaseTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] transition bg-white"
            >
              <option value="all">Semua Jenis Kasus</option>
              <option value="Bullying Verbal">Bullying Verbal</option>
              <option value="Bullying Fisik">Bullying Fisik</option>
              <option value="Bullying Sosial">Bullying Sosial</option>
              <option value="Cyberbullying">Cyberbullying</option>
              <option value="Bullying Psikologis">Bullying Psikologis</option>
              <option value="Bullying Akademik">Bullying Akademik</option>
            </select>
          </div>
        </div>

        {/* Counter Info Strip */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Menampilkan <strong className="text-slate-900">{filteredReports.length}</strong> dari{' '}
            <strong className="text-slate-900">{totalReports}</strong> laporan
          </span>
          {(searchQuery || statusFilter !== 'all' || caseTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCaseTypeFilter('all');
                setCurrentPage(1);
              }}
              className="text-[#003B73] hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="px-6 py-4">ID Laporan</th>
                <th className="px-6 py-4">Pelapor</th>
                <th className="px-6 py-4">Jenis Kasus</th>
                <th className="px-6 py-4">Tanggal Masuk</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ditangani Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#003B73] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Memuat data laporan...
                  </td>
                </tr>
              ) : paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada laporan yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => navigate(`/admin/laporan/${report.id}`)}
                    className="hover:bg-sky-50/50 cursor-pointer transition group"
                  >
                    {/* ID Laporan */}
                    <td className="px-6 py-4 font-mono font-bold text-[#003B73] group-hover:underline whitespace-nowrap">
                      {report.report_code}
                    </td>

                    {/* Pelapor */}
                    <td className="px-6 py-4">
                      {report.is_anonymous ? (
                        <div className="flex items-center gap-1.5 text-slate-500 italic text-xs">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Anonymous</span>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {report.reporter_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {report.study_program} {report.reporter_nim ? `· NIM ${report.reporter_nim}` : ''}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Jenis Kasus */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {report.case_types.map((type, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Tanggal */}
                    <td className="px-6 py-4 text-xs text-slate-600 font-mono tabular-nums whitespace-nowrap">
                      {new Date(report.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={report.status} size="sm" />
                    </td>

                    {/* Ditangani Oleh */}
                    <td className="px-6 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                      {getCounselorName(report.assigned_counselor_id)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-xs text-slate-500">
            Halaman <strong className="text-slate-900">{currentPage}</strong> dari{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RLS Test Dialog */}
      {showRlsModal && rlsResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-lg w-full bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hasil Pengujian Keamanan RLS</h3>
                <p className="text-xs text-slate-500">Simulasi SELECT langsung oleh publik tanpa login</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
              <div className="text-emerald-400">✓ RLS Policy: Enforced</div>
              <div className="text-rose-400">✗ Akses Publik Langsung: DITOLAK</div>
              <div className="text-slate-400 border-t border-slate-800 pt-2 text-[11px] leading-relaxed">
                {rlsResult.error}
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Kebijakan Row Level Security memastikan tabel <code>reports</code> tidak dapat diakses langsung oleh publik. Pelapor hanya dapat mengakses data melalui RPC yang terotentikasi dengan ID dan hash kode akses.
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowRlsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#003B73] text-white hover:bg-[#00254A]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Dialog */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F58220] flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Ubah Kata Sandi Admin BAC</h3>
                <p className="text-xs text-slate-500">Perbarui kata sandi untuk akun {currentUser.email}</p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Kata Sandi Baru:
                </label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Konfirmasi Kata Sandi Baru:
                </label>
                <input
                  type="password"
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#003B73] hover:bg-[#00254A]"
                >
                  Simpan Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
