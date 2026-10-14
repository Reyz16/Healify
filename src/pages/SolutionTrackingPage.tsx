import React, { useState, useEffect } from 'react';
import {
  Search,
  Lock,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  Lightbulb,
  FileText,
  Users,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import { trackReport, submitMediationRequest } from '../lib/supabase';
import type { TrackReportResult } from '../types/database';

interface SolutionTrackingPageProps {
  navigate: (route: string) => void;
  defaultReportCode?: string;
  defaultAccessCode?: string;
}

export const SolutionTrackingPage: React.FC<SolutionTrackingPageProps> = ({
  navigate,
  defaultReportCode = '',
  defaultAccessCode = '',
}) => {
  const { showToast } = useToast();

  const [reportCodeInput, setReportCodeInput] = useState(defaultReportCode);
  const [accessCodeInput, setAccessCodeInput] = useState(defaultAccessCode);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [reportData, setReportData] = useState<TrackReportResult | null>(null);
  const [activeTab, setActiveTab] = useState<'tracking' | 'saran' | 'rekomendasi' | 'mediator'>('tracking');

  // Mediation Request Form State
  const [mediationServiceType, setMediationServiceType] = useState('Mediasi dengan Terlapor & Saksi');
  const [mediationMessage, setMediationMessage] = useState('');
  const [isSubmittingMediation, setIsSubmittingMediation] = useState(false);
  const [mediationSuccess, setMediationSuccess] = useState(false);

  // Auto-search if defaults provided from form submission
  useEffect(() => {
    if (defaultReportCode && defaultAccessCode) {
      handleSearch(defaultReportCode, defaultAccessCode);
    }
  }, [defaultReportCode, defaultAccessCode]);

  const handleSearch = async (codeToSearch?: string, accessToSearch?: string) => {
    const code = codeToSearch || reportCodeInput;
    const access = accessToSearch || accessCodeInput;

    if (!code.trim() || !access.trim()) {
      setSearchError('Mohon masukkan ID Laporan dan Kode Akses dengan lengkap.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await trackReport(code.trim(), access.trim());
      if (!res.success || !res.data) {
        // Neutral error message to prevent leaking which one was invalid
        setSearchError('Laporan tidak ditemukan. Silakan periksa kembali ID Laporan dan Kode Akses Anda.');
        setReportData(null);
      } else {
        setReportData(res.data);
        setSearchError(null);
        showToast('Data laporan berhasil ditemukan!', 'success');
      }
    } catch {
      setSearchError('Terjadi kesalahan pada sistem saat mencari laporan.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMediationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediationMessage.trim()) {
      showToast('Mohon tuliskan penjelasan kebutuhan mediasi Anda.', 'error');
      return;
    }

    setIsSubmittingMediation(true);
    try {
      await submitMediationRequest(
        reportData?.id || null,
        mediationServiceType,
        mediationMessage.trim()
      );
      setMediationSuccess(true);
      setMediationMessage('');
      showToast('Permohonan mediasi berhasil diajukan ke tim BAC.', 'success');
    } catch {
      showToast('Gagal mengajukan mediasi.', 'error');
    } finally {
      setIsSubmittingMediation(false);
    }
  };

  // Automated guidance based on reported case types
  const getAutomatedAdvice = (caseTypes: string[]) => {
    const advices = [];

    if (caseTypes.includes('Cyberbullying')) {
      advices.push({
        title: 'Penanganan Bukti Digital & Cyberbullying',
        points: [
          'Ambil tangkapan layar (screenshot) lengkap beserta URL, waktu, dan nama akun pelaku sebelum pesan dihapus.',
          'Jangan membalas atau memprovokasi pelaku di media sosial agar eskalasi konflik tidak meluas.',
          'Manfaatkan fitur privasi, blokir akun penyerang, dan laporkan postingan melanggar hukum ke platform bersangkutan.',
          'Tim IT Security BAC siap membantu pelacakan IP jika akun penyerang merupakan samaran di lingkungan kampus.',
        ],
      });
    }

    if (caseTypes.includes('Bullying Verbal') || caseTypes.includes('Bullying Sosial')) {
      advices.push({
        title: 'Penanganan Bullying Sosial & Verbal',
        points: [
          'Catat kronologi kejadian: siapa saja saksi yang hadir di lokasi saat ejekan atau pengucilan terjadi.',
          'Beri batasan tegas (assertive boundary) secara tenang bahwa Anda tidak menerima perlakuan tersebut.',
          'Hindari berada sendirian di area terisolasi; upayakan bersama teman yang mendukung (peer supporter).',
          'Konselor BAC dapat memfasilitasi komunikasi kelompok tanpa memperlihatkan bahwa Anda yang meminta mediasi.',
        ],
      });
    }

    if (caseTypes.includes('Bullying Fisik')) {
      advices.push({
        title: 'Tindakan Darurat Bullying Fisik',
        points: [
          'Prioritaskan keselamatan fisik Anda. Segera menuju pos keamanan kampus (Binus Square, Anggrek, Kijang, Syahdan, atau Alam Sutera) jika merasa terancam.',
          'Lakukan dokumentasi visum atau foto memar/cedera fisik sesegera mungkin di fasilitas klinik kampus/dokter terdekat.',
          'Hubungi Hotline Darurat BAC 24/7 di 0800-BAC-HELP untuk pendampingan darurat komite disiplin.',
        ],
      });
    }

    if (caseTypes.includes('Bullying Akademik')) {
      advices.push({
        title: 'Dukungan Hak Akademik & Perkuliahan',
        points: [
          'Pastikan seluruh bukti pembagian tugas kelompok, email perkuliahan, dan log chat LMS tersimpan rapi.',
          'Konselor BAC dapat mendampingi konsultasi bersama Dosen Pembimbing Akademik atau Ketua Program Studi untuk reposisi kelompok.',
          'Anda berhak mendapatkan evaluasi tugas mandiri yang objektif jika terdapat diskriminasi kelompok.',
        ],
      });
    }

    // Default fallback
    if (advices.length === 0) {
      advices.push({
        title: 'Panduan Pendampingan Umum',
        points: [
          'Jaga kesehatan mental Anda dan jangan ragu memanfaatkan layanan konseling tatap muka kami.',
          'Kerahasiaan Anda dilindungi penuh oleh Surat Keputusan Rektor BINUS tentang Pencegahan dan Penanganan Kekerasan di Lingkungan Kampus.',
          'Anda dapat menggunakan menu "Minta Mediator" untuk mengatur sesi pertemuan terfasilitasi.',
        ],
      });
    }

    return advices;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-[#003B73] tracking-tight">
          Fitur Solusi & Tracking
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Pantau status laporan Anda dan dapatkan rekomendasi solusi
        </p>
      </div>

      {/* TRACKING SEARCH FORM */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="ID Laporan" required helperText="Contoh: BAC-2025-0001">
            <div className="relative">
              <input
                type="text"
                placeholder="BAC-2025-0001"
                value={reportCodeInput}
                onChange={(e) => setReportCodeInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#003B73] transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </FormField>

          <FormField label="Kode Akses Rahasia" required helperText="Kode 8 karakter acak">
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan Kode Akses"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#003B73] transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </FormField>
        </div>

        {searchError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-white bg-[#003B73] hover:bg-[#00254A] transition shadow-md shadow-sky-950/10 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mencari Laporan...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Lacak Laporan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* TRACKING RESULTS & TABS */}
      {reportData && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Card Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">ID Laporan:</span>
                <h2 className="text-xl sm:text-2xl font-black font-mono text-[#003B73]">
                  {reportData.report_code}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={reportData.status} size="lg" />
                {reportData.is_anonymous ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Laporan Anonim
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-[#003B73] border border-sky-200">
                    Teridentifikasi
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block mb-0.5">Laporan Dibuat:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(reportData.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Program Studi:</span>
                <span className="font-semibold text-slate-800">{reportData.study_program}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Konselor Penanggung Jawab:</span>
                <span className="font-semibold text-slate-800">
                  {reportData.counselor_name || 'Menunggu penugasan konselor'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'tracking'
                  ? 'bg-[#003B73] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Tracking Status
            </button>
            <button
              onClick={() => setActiveTab('saran')}
              className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'saran'
                  ? 'bg-[#003B73] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Saran Otomatis
            </button>
            <button
              onClick={() => setActiveTab('rekomendasi')}
              className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'rekomendasi'
                  ? 'bg-[#003B73] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Rekomendasi Konselor
            </button>
            <button
              onClick={() => setActiveTab('mediator')}
              className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'mediator'
                  ? 'bg-[#003B73] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Minta Mediator
            </button>
          </div>

          {/* Tab Content 1: Tracking Status & Timeline */}
          {activeTab === 'tracking' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <Timeline
                currentStatus={reportData.status}
                timelineItems={reportData.timeline}
              />
            </div>
          )}

          {/* Tab Content 2: Saran Otomatis */}
          {activeTab === 'saran' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Lightbulb className="w-5 h-5 text-[#F58220]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Rekomendasi Penanganan Berdasarkan Kategori Kasus
                </h3>
              </div>

              <div className="space-y-5">
                {getAutomatedAdvice(reportData.case_types).map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
                  >
                    <h4 className="font-bold text-sm text-[#003B73]">{sec.title}</h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {sec.points.map((pt, pidx) => (
                        <li key={pidx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 3: Rekomendasi Konselor */}
          {activeTab === 'rekomendasi' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <FileText className="w-5 h-5 text-[#003B73]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Catatan Resmi & Rekomendasi Konselor BAC
                </h3>
              </div>

              {reportData.counselor_recommendation ? (
                <div className="p-6 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#003B73]">
                      {reportData.counselor_name} ({reportData.counselor_title})
                    </span>
                    <span className="text-[11px] text-slate-500">Terverifikasi Resmi</span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {reportData.counselor_recommendation}
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-semibold text-slate-800 text-sm">
                    Belum Ada Catatan Rekomendasi
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Konselor sedang menelaah berkas laporan dan bukti yang Anda berikan. Catatan rekomendasi akan muncul di sini setelah sesi review selesai.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab Content 4: Minta Mediator */}
          {activeTab === 'mediator' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Permohonan Mediator & Pendampingan Khusus
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Pilih layanan yang Anda butuhkan untuk mediasi damai atau konsultasi intensif bersama tim BAC.
                </p>
              </div>

              {mediationSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm">Permohonan Berhasil Dikirim</h4>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Petugas konselor BAC akan menghubungi Anda dalam waktu 1x24 jam untuk mengatur jadwal pertemuan atau sesi mediasi tertutup.
                  </p>
                  <button
                    onClick={() => setMediationSuccess(false)}
                    className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 text-white"
                  >
                    Ajukan Permohonan Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMediationSubmit} className="space-y-4">
                  <FormField label="Pilih Layanan yang Anda Butuhkan" required>
                    <select
                      value={mediationServiceType}
                      onChange={(e) => setMediationServiceType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] transition"
                    >
                      <option value="Mediasi dengan Terlapor & Saksi">
                        Mediasi Damai Tertutup (bersama Terlapor & Mediator BAC)
                      </option>
                      <option value="Konseling Lanjutan Tatap Muka">
                        Sesi Konseling Psikologis Lanjutan (Tatap Muka di Kampus)
                      </option>
                      <option value="Pendampingan Akademik & Pindah Kelompok">
                        Pendampingan Akademik (Koordinasi dengan Jurusan / Pindah Kelompok)
                      </option>
                      <option value="Advokasi Komite Disiplin Kampus">
                        Advokasi Penegakan Sanksi Komite Disiplin BINUS
                      </option>
                    </select>
                  </FormField>

                  <FormField
                    label="Pesan & Keterangan Tambahan"
                    required
                    helperText="Jelaskan kebutuhan khusus atau preferensi jadwal pertemuan Anda"
                  >
                    <textarea
                      rows={4}
                      placeholder="Tuliskan keterangan mengenai permintaan mediasi Anda..."
                      value={mediationMessage}
                      onChange={(e) => setMediationMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] transition leading-relaxed resize-y"
                    />
                  </FormField>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingMediation}
                      className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#003B73] hover:bg-[#00254A] transition text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmittingMediation ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Mengirim Permohonan...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim Permohonan Mediator</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
