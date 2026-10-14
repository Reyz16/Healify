import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Clock,
  Shield,
  FileText,
  MessageSquare,
  Users,
  Send,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  CalendarPlus,
  Save,
  Download,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import {
  getAdminReportDetail,
  getActiveCounselors,
  updateReportStatus,
  assignCounselorToReport,
  updateCounselorRecommendation,
  scheduleMeeting,
  sendChatMessage,
  type AuthUser,
} from '../lib/supabase';
import type {
  Report,
  Counselor,
  ReportAttachment,
  ReportTimeline,
  Meeting,
  ChatMessage,
  ReportStatus,
} from '../types/database';

interface AdminReportDetailPageProps {
  reportId: string;
  navigate: (route: string) => void;
  currentUser: AuthUser;
}

export const AdminReportDetailPage: React.FC<AdminReportDetailPageProps> = ({
  reportId,
  navigate,
  currentUser,
}) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [attachments, setAttachments] = useState<ReportAttachment[]>([]);
  const [timeline, setTimeline] = useState<ReportTimeline[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [allCounselors, setAllCounselors] = useState<Counselor[]>([]);

  // Active Tab: 'detail' | 'bukti' | 'chat' | 'timeline'
  const [activeTab, setActiveTab] = useState<'detail' | 'bukti' | 'chat' | 'timeline'>('detail');

  // Edit State
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('diterima');
  const [counselorRecInput, setCounselorRecInput] = useState('');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCounselorId, setSelectedCounselorId] = useState('');

  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingDatetime, setMeetingDatetime] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  // Admin reply chat
  const [adminChatReply, setAdminChatReply] = useState('');

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [detail, counselorsList] = await Promise.all([
        getAdminReportDetail(reportId),
        getActiveCounselors(),
      ]);

      if (!detail) {
        showToast('Laporan tidak ditemukan.', 'error');
        navigate('/admin/dashboard');
        return;
      }

      setReport(detail.report);
      setCounselor(detail.counselor);
      setAttachments(detail.attachments);
      setTimeline(detail.timeline);
      setMeetings(detail.meetings);
      setChatMessages(detail.chatMessages);
      setAllCounselors(counselorsList);

      setSelectedStatus(detail.report.status);
      setCounselorRecInput(detail.report.counselor_recommendation || '');
      setSelectedCounselorId(detail.report.assigned_counselor_id || '');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengambil detail laporan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportId]);

  // Handle Save Status & Recommendation Changes
  const handleSaveChanges = async () => {
    if (!report) return;
    setIsSavingChanges(true);
    try {
      // 1. Status update if changed
      if (selectedStatus !== report.status) {
        await updateReportStatus(
          report.id,
          selectedStatus,
          statusUpdateNote || `Status diperbarui menjadi ${selectedStatus}`
        );
      }

      // 2. Recommendation update if changed
      if (counselorRecInput !== (report.counselor_recommendation || '')) {
        await updateCounselorRecommendation(report.id, counselorRecInput.trim());
      }

      showToast('Perubahan laporan berhasil disimpan!', 'success');
      await fetchReportData();
      setStatusUpdateNote('');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan perubahan.', 'error');
    } finally {
      setIsSavingChanges(false);
    }
  };

  // Handle Assign Counselor Modal Submit
  const handleAssignCounselor = async () => {
    if (!report || !selectedCounselorId) return;
    try {
      await assignCounselorToReport(report.id, selectedCounselorId);
      showToast('Konselor berhasil ditugaskan!', 'success');
      setShowAssignModal(false);
      await fetchReportData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menugaskan konselor.', 'error');
    }
  };

  // Handle Schedule Meeting Modal Submit
  const handleScheduleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !meetingDatetime) {
      showToast('Mohon tentukan jadwal tanggal dan jam.', 'error');
      return;
    }

    try {
      await scheduleMeeting(report.id, meetingDatetime, meetingNotes, report.assigned_counselor_id || undefined);
      showToast('Jadwal meeting berhasil dibuat!', 'success');
      setShowMeetingModal(false);
      setMeetingDatetime('');
      setMeetingNotes('');
      await fetchReportData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menjadwalkan meeting.', 'error');
    }
  };

  // Handle Admin Chat Reply
  const handleSendAdminChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatReply.trim() || !report) return;

    // Use current session or create session
    const sessionId = chatMessages.length > 0 ? chatMessages[0].session_id : 'sess-admin-' + report.id;
    try {
      const newMsg = await sendChatMessage(sessionId, 'konselor', adminChatReply.trim());
      setChatMessages((prev) => [...prev, newMsg]);
      setAdminChatReply('');
      showToast('Pesan balasan konselor terkirim!', 'success');
    } catch {
      showToast('Gagal mengirim balasan.', 'error');
    }
  };

  if (loading || !report) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#003B73] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Memuat detail laporan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation & Header Bar */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#003B73] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Laporan</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black font-mono text-[#003B73]">
                {report.report_code}
              </h1>
              <StatusBadge status={report.status} size="md" />
            </div>
            <p className="text-xs text-slate-500">
              Dibuat pada:{' '}
              <strong className="text-slate-700">
                {new Date(report.created_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#003B73] bg-sky-50 hover:bg-sky-100 border border-sky-200 transition flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-[#003B73]" />
              <span>{counselor ? 'Ganti Konselor' : 'Assign Konselor'}</span>
            </button>

            <button
              onClick={() => setShowMeetingModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition flex items-center gap-1.5"
            >
              <CalendarPlus className="w-4 h-4 text-[#F58220]" />
              <span>Jadwalkan Meeting</span>
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={isSavingChanges}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#003B73] hover:bg-[#00254A] transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingChanges ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('detail')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'detail'
              ? 'bg-[#003B73] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Detail Laporan
        </button>

        <button
          onClick={() => setActiveTab('bukti')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'bukti'
              ? 'bg-[#003B73] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>Bukti</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-800">
            {attachments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'chat'
              ? 'bg-[#003B73] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>Percakapan</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-800">
            {chatMessages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'bg-[#003B73] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Timeline ({timeline.length})
        </button>
      </div>

      {/* TAB 1: DETAIL LAPORAN (3 CARDS) */}
      {activeTab === 'detail' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Informasi Pelapor */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#003B73] uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" />
                Informasi Pelapor
              </h3>

              {report.is_anonymous ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">Laporan Anonim Penuh</p>
                  <p>
                    Nama dan NIM tidak disimpan dalam sistem untuk melindungi privasi mahasiswa.
                  </p>
                  <p className="pt-2">
                    Program Studi Terkait: <strong className="text-slate-800">{report.study_program}</strong>
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Nama Lengkap:</span>
                    <span className="font-bold text-slate-900 text-sm">{report.reporter_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">NIM:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {report.reporter_nim || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Program Studi:</span>
                    <span className="font-semibold text-slate-800">{report.study_program}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Manajemen Kasus */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#003B73] uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Manajemen Kasus
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1.5">
                    Ubah Status Laporan:
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                  >
                    <option value="diterima">Diterima</option>
                    <option value="dalam_review">Dalam Review</option>
                    <option value="diproses">Sedang Diproses</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>

                {selectedStatus !== report.status && (
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Catatan Perubahan Status (muncul di timeline pelapor):
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Berkas telah diperiksa dan diteruskan ke konselor"
                      value={statusUpdateNote}
                      onChange={(e) => setStatusUpdateNote(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block mb-1">Ditangani Oleh:</span>
                  {counselor ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#003B73] text-white flex items-center justify-center font-bold text-xs">
                        {counselor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{counselor.name}</p>
                        <p className="text-[11px] text-slate-500">{counselor.title}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">Belum ditugaskan ke konselor spesifik.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Detail Kejadian */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#003B73] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Detail Kejadian Bullying
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pb-4 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block mb-1">Jenis Kasus:</span>
                <div className="flex flex-wrap gap-1.5">
                  {report.case_types.map((type, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-sky-50 text-[#003B73] border border-sky-100 font-semibold"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Tempat & Waktu Kejadian:</span>
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {report.incident_location}
                </p>
                <p className="text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(report.incident_time).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-xs mb-1">Deskripsi Lengkap Kejadian:</span>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                {report.description}
              </div>
            </div>

            {/* Official Counselor Recommendation Textbox */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Rekomendasi Resmi Konselor (Dapat Dilihat Pelapor di Tab Tracking):
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan rekomendasi tindakan, langkah preventif, atau hasil asesmen psikologis..."
                value={counselorRecInput}
                onChange={(e) => setCounselorRecInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] transition leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUKTI LAMPIRAN */}
      {activeTab === 'bukti' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Berkas Bukti Terlampir ({attachments.length})
            </h3>
            <span className="text-xs text-slate-500">
              Akses file terlindungi protokol keamanan BAC
            </span>
          </div>

          {attachments.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400">
              Tidak ada lampiran berkas bukti pada laporan ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50/40 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-5 h-5 text-[#003B73] shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs truncate">{att.file_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {(att.size_bytes / 1024).toFixed(0)} KB · {att.mime_type}
                        </p>
                      </div>
                    </div>
                  </div>

                  {att.mime_type.startsWith('image/') && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 max-h-48 bg-white flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=600&q=80"
                        alt={att.file_name}
                        className="object-cover w-full h-40"
                      />
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Path: {att.storage_path}
                    </span>
                    <button
                      type="button"
                      onClick={() => showToast('Mengunduh berkas dengan signed URL...', 'info')}
                      className="text-[#003B73] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERCAKAPAN CHAT KASUS */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Riwayat Chat Tertaut Laporan
              </h3>
              <p className="text-xs text-slate-500">
                Konselor dapat membalas pesan pelapor secara langsung di sini.
              </p>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {chatMessages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Belum ada sesi percakapan yang ditautkan ke laporan ini.
              </p>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.sender === 'konselor' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-xl text-xs leading-relaxed ${
                      msg.sender === 'konselor'
                        ? 'bg-[#003B73] text-white'
                        : msg.sender === 'system'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-white border border-slate-200 text-slate-800'
                    }`}
                  >
                    <p className="font-bold mb-1 opacity-80 text-[10px] uppercase">
                      {msg.sender === 'konselor' ? 'Konselor BAC' : 'Pelapor'}
                    </p>
                    <p>{msg.body}</p>
                    <p className="text-[10px] text-right mt-1 opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Admin Reply Form */}
          <form onSubmit={handleSendAdminChat} className="flex gap-3">
            <input
              type="text"
              placeholder="Tulis balasan pesan untuk pelapor..."
              value={adminChatReply}
              onChange={(e) => setAdminChatReply(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
            <button
              type="submit"
              disabled={!adminChatReply.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#003B73] hover:bg-[#00254A] disabled:opacity-40 transition text-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <Timeline currentStatus={report.status} timelineItems={timeline} />
        </div>
      )}

      {/* ASSIGN COUNSELOR MODAL */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Tugaskan Konselor Kasus"
        description="Pilih konselor atau psikolog klinis yang bertanggung jawab menangani kasus ini"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {allCounselors.map((c) => (
              <label
                key={c.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedCounselorId === c.id
                    ? 'border-[#003B73] bg-sky-50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="counselor"
                  checked={selectedCounselorId === c.id}
                  onChange={() => setSelectedCounselorId(c.id)}
                  className="w-4 h-4 text-[#003B73]"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">{c.name}</p>
                  <p className="text-[11px] text-slate-500">{c.title}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleAssignCounselor}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#003B73] hover:bg-[#00254A]"
            >
              Simpan Penugasan
            </button>
          </div>
        </div>
      </Modal>

      {/* SCHEDULE MEETING MODAL */}
      <Modal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        title="Jadwalkan Pertemuan / Mediasi"
        description="Tentukan waktu dan catatan tempat pertemuan konseling tertutup"
      >
        <form onSubmit={handleScheduleMeetingSubmit} className="space-y-4">
          <FormField label="Waktu dan Tanggal Pertemuan" required>
            <input
              type="datetime-local"
              value={meetingDatetime}
              onChange={(e) => setMeetingDatetime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
          </FormField>

          <FormField label="Lokasi & Catatan Pertemuan" required>
            <textarea
              rows={3}
              placeholder="Contoh: Ruang Konseling Gedung Anggrek Lantai 2, mediasi tertutup bersama terlapor."
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
          </FormField>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowMeetingModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#003B73] hover:bg-[#00254A]"
            >
              Simpan Jadwal Pertemuan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
