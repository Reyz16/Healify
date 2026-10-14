import React from 'react';
import { CheckCircle2, Clock, CircleDot, AlertCircle } from 'lucide-react';
import type { ReportStatus, ReportTimeline } from '../types/database';

interface TimelineProps {
  currentStatus: ReportStatus;
  timelineItems: ReportTimeline[];
}

const STAGES: { key: ReportStatus; label: string; desc: string }[] = [
  { key: 'diterima', label: 'Diterima', desc: 'Laporan berhasil dicatat ke sistem BAC' },
  { key: 'dalam_review', label: 'Dalam Review', desc: 'Verifikasi bukti & telaah awal oleh petugas' },
  { key: 'diproses', label: 'Sedang Diproses', desc: 'Konseling & tindakan penanganan kasus' },
  { key: 'selesai', label: 'Selesai', desc: 'Resolusi kasus & penutupan pendampingan' },
];

export const Timeline: React.FC<TimelineProps> = ({ currentStatus, timelineItems }) => {
  const statusRank: Record<ReportStatus, number> = {
    diterima: 1,
    dalam_review: 2,
    diproses: 3,
    selesai: 4,
  };

  const currentRank = statusRank[currentStatus] || 1;

  // Find timeline dates for each stage
  const getStageDate = (stageKey: ReportStatus) => {
    const item = timelineItems.find((t) => t.status === stageKey);
    if (item) {
      return new Date(item.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 4-Step Visual Progress Bar */}
      <div className="relative">
        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
        <div
          className="hidden sm:block absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#003B73] to-[#F58220] -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${((currentRank - 1) / 3) * 100}%` }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
          {STAGES.map((stage, idx) => {
            const stepRank = idx + 1;
            const isCompleted = stepRank < currentRank || (stepRank === 4 && currentRank === 4);
            const isCurrent = stepRank === currentRank && currentRank !== 4;
            const stageDate = getStageDate(stage.key);

            return (
              <div
                key={stage.key}
                className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-3 sm:p-2 rounded-xl bg-white sm:bg-transparent border sm:border-0 border-slate-200/80"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : isCurrent
                      ? 'bg-[#003B73] text-white ring-4 ring-sky-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : isCurrent ? (
                    <CircleDot className="w-5 h-5 text-white" />
                  ) : (
                    <span>{stepRank}</span>
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`font-semibold text-sm ${
                      isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-1 sm:line-clamp-2">
                    {stageDate ? stageDate : isCurrent ? 'Tahap saat ini' : 'Menunggu proses'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Chronological History */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#003B73]" />
          Riwayat Perkembangan Kasus
        </h4>

        {timelineItems.length === 0 ? (
          <p className="text-xs text-slate-500">Belum ada riwayat tercatat.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timelineItems.map((item) => (
              <div key={item.id} className="relative group">
                <div className="absolute -left-[1.65rem] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#003B73] shadow-sm" />
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 transition hover:shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#003B73]">
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{item.note}</p>
                  {item.created_by && (
                    <p className="text-xs text-slate-400 mt-1">Dicatat oleh: {item.created_by}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
