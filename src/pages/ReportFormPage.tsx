import React, { useState, useEffect } from 'react';
import {
  Shield,
  Upload,
  FileCheck,
  Trash2,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  Save,
  ArrowRight,
  Info,
  Calendar,
  MapPin,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FormField } from '../components/FormField';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { submitReport } from '../lib/supabase';
import type { SubmitReportOutput } from '../types/database';

interface ReportFormPageProps {
  navigate: (route: string) => void;
  onSetTrackCodes?: (reportCode: string, accessCode: string) => void;
}

const CASE_TYPES_OPTIONS = [
  'Bullying Verbal',
  'Bullying Fisik',
  'Bullying Sosial',
  'Cyberbullying',
  'Bullying Psikologis',
  'Bullying Akademik',
];

const STUDY_PROGRAMS = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Desain Komunikasi Visual',
  'Desain Interior',
  'Manajemen Bisnis',
  'Akuntansi & Keuangan',
  'Ilmu Komunikasi',
  'Hubungan Internasional',
  'Psikologi',
  'Sastra Jepang',
  'Sastra Inggris',
  'Teknik Industri',
  'Teknik Sipil',
  'Arsitektur',
  'Cyber Security',
  'Data Science',
  'Game Application and Technology',
  'Lainnya / Umum',
];

interface AttachmentFile {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

const DRAFT_STORAGE_KEY = 'bac_report_form_draft_v1';

export const ReportFormPage: React.FC<ReportFormPageProps> = ({
  navigate,
  onSetTrackCodes,
}) => {
  const { showToast } = useToast();

  // Form State
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [reporterNim, setReporterNim] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [selectedCaseTypes, setSelectedCaseTypes] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [agreementChecked, setAgreementChecked] = useState(false);

  // Honeypot anti-spam
  const [honeypot, setHoneypot] = useState('');

  // UI & Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<SubmitReportOutput | null>(null);
  const [copiedAccessCode, setCopiedAccessCode] = useState(false);
  const [copiedReportCode, setCopiedReportCode] = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.isAnonymous !== undefined) setIsAnonymous(draft.isAnonymous);
        if (draft.reporterName) setReporterName(draft.reporterName);
        if (draft.reporterNim) setReporterNim(draft.reporterNim);
        if (draft.studyProgram) setStudyProgram(draft.studyProgram);
        if (draft.selectedCaseTypes) setSelectedCaseTypes(draft.selectedCaseTypes);
        if (draft.description) setDescription(draft.description);
        if (draft.incidentLocation) setIncidentLocation(draft.incidentLocation);
        if (draft.incidentTime) setIncidentTime(draft.incidentTime);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save draft
  const handleSaveDraft = () => {
    const draft = {
      isAnonymous,
      reporterName,
      reporterNim,
      studyProgram,
      selectedCaseTypes,
      description,
      incidentLocation,
      incidentTime,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      showToast('Draft laporan berhasil disimpan di perangkat Anda.', 'success');
    } catch {
      showToast('Gagal menyimpan draft.', 'error');
    }
  };

  // Toggle Case Types
  const handleToggleCaseType = (type: string) => {
    if (selectedCaseTypes.includes(type)) {
      setSelectedCaseTypes(selectedCaseTypes.filter((t) => t !== type));
    } else {
      setSelectedCaseTypes([...selectedCaseTypes, type]);
    }
    if (errors.caseTypes) {
      setErrors((prev) => ({ ...prev, caseTypes: '' }));
    }
  };

  // Handle File Uploads (max 5)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 5) {
      showToast('Maksimal lampiran adalah 5 file.', 'error');
      return;
    }

    const newAttachments: AttachmentFile[] = [...attachments];

    Array.from(files).forEach((file) => {
      // Validate file type
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'video/mp4',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'audio/mp4',
      ];
      if (!validTypes.some((t) => file.type.startsWith('image/') || file.type.startsWith('audio/') || file.type.startsWith('video/') || file.type === 'application/pdf')) {
        showToast(`Format file "${file.name}" tidak didukung.`, 'error');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showToast(`File "${file.name}" melebihi ukuran maksimal 10MB.`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        newAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
        });
        setAttachments([...newAttachments]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isAnonymous) {
      if (!reporterName.trim()) {
        newErrors.reporterName = 'Nama lengkap wajib diisi jika bukan laporan anonim.';
      }
      if (!reporterNim.trim()) {
        newErrors.reporterNim = 'NIM wajib diisi jika bukan laporan anonim.';
      } else if (!/^\d{8,12}$/.test(reporterNim.trim())) {
        newErrors.reporterNim = 'Format NIM harus berupa 8-12 angka.';
      }
    }

    if (!studyProgram) {
      newErrors.studyProgram = 'Silakan pilih Program Studi.';
    }

    if (selectedCaseTypes.length === 0) {
      newErrors.caseTypes = 'Pilih minimal satu jenis kasus bullying.';
    }

    if (!description.trim()) {
      newErrors.description = 'Deskripsi kejadian wajib diisi.';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Mohon ceritakan kejadian lebih detail (minimal 15 karakter).';
    } else if (description.length > 2000) {
      newErrors.description = 'Deskripsi maksimal 2000 karakter.';
    }

    if (!incidentLocation.trim()) {
      newErrors.incidentLocation = 'Tempat kejadian wajib diisi.';
    }

    if (!incidentTime) {
      newErrors.incidentTime = 'Waktu kejadian wajib diisi.';
    }

    if (!agreementChecked) {
      newErrors.agreement = 'Anda harus menyetujui pernyataan kebijakan privasi sebelum mengirim laporan.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (honeypot) {
      console.warn('Bot detected via honeypot.');
      return;
    }

    if (!validateForm()) {
      showToast('Mohon periksa kembali kolom formulir yang belum lengkap.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitReport({
        is_anonymous: isAnonymous,
        reporter_name: isAnonymous ? undefined : reporterName.trim(),
        reporter_nim: isAnonymous ? undefined : reporterNim.trim(),
        study_program: studyProgram,
        case_types: selectedCaseTypes,
        description: description.trim(),
        incident_location: incidentLocation.trim(),
        incident_time: incidentTime,
        attachments: attachments.map((a) => ({
          file_name: a.name,
          mime_type: a.type,
          size_bytes: a.size,
          data_url: a.dataUrl,
        })),
      });

      // Clear draft
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      setSuccessResult(res);
      showToast('Laporan berhasil dikirim ke Binus Anti-Bullying Center!', 'success');

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan saat mengirim laporan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'code' | 'access') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'access') {
        setCopiedAccessCode(true);
        setTimeout(() => setCopiedAccessCode(false), 2000);
      } else {
        setCopiedReportCode(true);
        setTimeout(() => setCopiedReportCode(false), 2000);
      }
      showToast('Kode berhasil disalin ke clipboard!', 'info');
    } catch {
      showToast('Gagal menyalin teks.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-[#003B73] tracking-tight">
          Form Pelaporan
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Laporkan kejadian bullying melalui formulir di bawah. Informasi Anda akan tetap rahasia.
        </p>
      </div>

      {/* Privacy Banner */}
      <div className="rounded-2xl bg-sky-50 border border-sky-200 p-5 flex items-start gap-3.5 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-[#003B73] text-white flex items-center justify-center shrink-0 mt-0.5">
          <Lock className="w-5 h-5 text-[#F58220]" />
        </div>
        <div className="text-xs sm:text-sm text-sky-950 space-y-1">
          <p className="font-bold text-[#003B73]">Jaminan Kerahasiaan Penuh</p>
          <p className="text-slate-600 leading-relaxed">
            Anda dapat memilih untuk melaporkan secara anonim. Jika Anda memilih anonim, identitas seperti Nama dan NIM tidak akan disimpan dalam sistem kami.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Hidden Honeypot */}
        <input
          type="text"
          name="website_hp"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {/* 1. ANONYMOUS CHECKBOX TOGGLE */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-slate-900 block">Laporan Anonim</span>
            <span className="text-xs text-slate-500 block">
              Centang jika Anda ingin melaporkan tanpa mencantumkan identitas
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => {
                setIsAnonymous(e.target.checked);
                if (e.target.checked) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.reporterName;
                    delete next.reporterNim;
                    return next;
                  });
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003B73]"></div>
          </label>
        </div>

        {/* 2. REPORTER IDENTITY (Only if not anonymous) */}
        {!isAnonymous ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-xl border border-sky-100 bg-sky-50/30 animate-in fade-in duration-200">
            <FormField
              label="Nama Lengkap"
              required={!isAnonymous}
              error={errors.reporterName}
              helperText="Nama asli mahasiswa yang melaporkan"
            >
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={reporterName}
                onChange={(e) => {
                  setReporterName(e.target.value);
                  if (errors.reporterName) setErrors((prev) => ({ ...prev, reporterName: '' }));
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent transition"
              />
            </FormField>

            <FormField
              label="NIM"
              required={!isAnonymous}
              error={errors.reporterNim}
              helperText="Nomor Induk Mahasiswa BINUS (8-12 angka)"
            >
              <input
                type="text"
                placeholder="Masukkan NIM"
                value={reporterNim}
                onChange={(e) => {
                  setReporterNim(e.target.value);
                  if (errors.reporterNim) setErrors((prev) => ({ ...prev, reporterNim: '' }));
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent transition"
              />
            </FormField>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mode Anonim aktif: Nama dan NIM Anda tidak akan diminta maupun disimpan ke database.</span>
          </div>
        )}

        {/* 3. PROGRAM STUDI */}
        <FormField
          label="Program Studi"
          required
          error={errors.studyProgram}
          helperText="Pilih jurusan perkuliahan terkait kejadian"
        >
          <select
            value={studyProgram}
            onChange={(e) => {
              setStudyProgram(e.target.value);
              if (errors.studyProgram) setErrors((prev) => ({ ...prev, studyProgram: '' }));
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent transition"
          >
            <option value="">-- Pilih Program Studi --</option>
            {STUDY_PROGRAMS.map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
        </FormField>

        {/* 4. JENIS KASUS BULLYING (CHECKBOX MULTI-SELECT) */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">
            Jenis Kasus Bullying <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500">Anda dapat memilih lebih dari satu kategori yang relevan</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {CASE_TYPES_OPTIONS.map((type) => {
              const isChecked = selectedCaseTypes.includes(type);
              return (
                <label
                  key={type}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition select-none ${
                    isChecked
                      ? 'bg-sky-50 border-[#003B73] text-[#003B73] shadow-xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleCaseType(type)}
                    className="w-4 h-4 text-[#003B73] rounded border-slate-300 focus:ring-[#003B73]"
                  />
                  <span className="text-xs sm:text-sm">{type}</span>
                </label>
              );
            })}
          </div>
          {errors.caseTypes && (
            <p className="text-xs font-medium text-rose-600 mt-1">{errors.caseTypes}</p>
          )}
        </div>

        {/* 5. DESKRIPSI KEJADIAN WITH CHARACTER COUNTER */}
        <FormField
          label="Deskripsi Kejadian"
          required
          error={errors.description}
        >
          <div className="relative">
            <textarea
              rows={5}
              maxLength={2000}
              placeholder="Ceritakan kejadian bullying yang Anda alami dengan detail..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent transition leading-relaxed resize-y"
            />
            <div className="text-right text-xs text-slate-400 mt-1 tabular-nums font-mono">
              {description.length}/2000 karakter
            </div>
          </div>
        </FormField>

        {/* 6. TEMPAT & WAKTU KEJADIAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            label="Tempat Kejadian"
            required
            error={errors.incidentLocation}
            helperText="Contoh: Kampus Anggrek, Lantai 3 atau Grup WhatsApp"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Contoh: Kampus Anggrek, Lantai 3"
                value={incidentLocation}
                onChange={(e) => {
                  setIncidentLocation(e.target.value);
                  if (errors.incidentLocation)
                    setErrors((prev) => ({ ...prev, incidentLocation: '' }));
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent transition"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </FormField>

          <FormField
            label="Waktu Kejadian"
            required
            error={errors.incidentTime}
            helperText="Pilih tanggal dan jam perkiraan kejadian"
          >
            <div className="relative">
              <input
                type="datetime-local"
                value={incidentTime}
                onChange={(e) => {
                  setIncidentTime(e.target.value);
                  if (errors.incidentTime)
                    setErrors((prev) => ({ ...prev, incidentTime: '' }));
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent transition"
              />
            </div>
          </FormField>
        </div>

        {/* 7. UPLOAD BUKTI (OPSIONAL) */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-800">
            Upload Bukti <span className="text-xs font-normal text-slate-400">(Opsional)</span>
          </label>
          <p className="text-xs text-slate-500">
            Maksimal 5 file (gambar, video, audio, atau PDF). Maks 10MB per file.
          </p>

          {/* Dropzone */}
          <label className="border-2 border-dashed border-slate-300 hover:border-[#003B73] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-sky-50/30 transition group">
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#003B73] mb-2 transition-colors" />
            <p className="text-sm font-semibold text-slate-700 group-hover:text-[#003B73]">
              Klik untuk upload atau drag & drop
            </p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF, MP4, atau MP3</p>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,audio/*,application/pdf"
            />
          </label>

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-slate-700">
                File terlampir ({attachments.length}/5):
              </p>
              <div className="space-y-2">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file.name}</span>
                      <span className="text-slate-400 shrink-0">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      aria-label="Hapus file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 8. PRIVACY NOTIFICATION & AGREEMENT */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <p className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
            <Lock className="w-4 h-4 text-[#003B73] shrink-0 mt-0.5" />
            <span>
              <strong>Kerahasiaan Dijamin:</strong> Semua laporan dijaga kerahasiaannya. Kami memastikan bahwa identitas dan informasi pribadi Anda tidak akan dibagikan kepada pihak mana pun tanpa izin.
            </span>
          </p>

          <label className="flex items-start gap-3 pt-2 border-t border-slate-200/60 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreementChecked}
              onChange={(e) => {
                setAgreementChecked(e.target.checked);
                if (e.target.checked && errors.agreement) {
                  setErrors((prev) => ({ ...prev, agreement: '' }));
                }
              }}
              className="w-4 h-4 mt-0.5 text-[#003B73] rounded border-slate-300 focus:ring-[#003B73]"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Dengan mengirimkan laporan ini, Anda menyetujui bahwa informasi yang diberikan akan diproses oleh tim Binus Anti-Bullying Center sesuai dengan kebijakan privasi kami.
            </span>
          </label>
          {errors.agreement && (
            <p className="text-xs font-medium text-rose-600 pl-7">{errors.agreement}</p>
          )}
        </div>

        {/* 9. SUBMIT & DRAFT BUTTONS */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition text-sm"
          >
            <Save className="w-4 h-4 text-slate-500" />
            Simpan Draft
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-white bg-[#003B73] hover:bg-[#00254A] transition shadow-md shadow-sky-950/10 text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mengirim Laporan...</span>
              </>
            ) : (
              <>
                <span>Kirim Laporan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* 10. SUCCESS MODAL WITH REPORT CODE & ACCESS CODE */}
      <Modal
        isOpen={Boolean(successResult)}
        onClose={() => setSuccessResult(null)}
        title="Laporan Berhasil Terkirim"
        maxWidth="lg"
      >
        {successResult && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Laporan Anda telah berhasil dicatat dalam sistem.</p>
                <p className="text-emerald-800 mt-0.5">
                  Simpan ID Laporan dan Kode Akses di bawah untuk melacak proses penanganan.
                </p>
              </div>
            </div>

            {/* Display Report Code */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                ID Laporan
              </span>
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-mono text-base font-bold text-[#003B73]">
                  {successResult.report_code}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(successResult.report_code, 'code')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  {copiedReportCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Display Access Code (Warning: Only shown once!) */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                  KODE AKSES RAHASIA
                </span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Hanya Ditampilkan Sekali
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-amber-300">
                <span className="font-mono text-lg font-black text-amber-900 tracking-wider">
                  {successResult.access_code}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(successResult.access_code, 'access')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 transition"
                >
                  {copiedAccessCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-amber-800 flex items-start gap-1.5 pt-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>PENTING:</strong> Catat atau salin kode akses ini sekarang. Demi privasi, kode akses ini dienkripsi di sistem dan <strong>tidak dapat ditampilkan kembali</strong> jika hilang.
                </span>
              </p>
            </div>

            {/* CTA to Track Report */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onSetTrackCodes) {
                    onSetTrackCodes(successResult.report_code, successResult.access_code);
                  }
                  setSuccessResult(null);
                  navigate('/solusi');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-[#003B73] hover:bg-[#00254A] transition shadow-md"
              >
                <span>Lacak Laporan Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
