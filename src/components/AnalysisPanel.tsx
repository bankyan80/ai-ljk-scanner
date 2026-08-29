import React from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Loader2, 
  Check, 
  User, 
} from 'lucide-react';
import { AnalysisProgress, Exam, StudentInfo } from '../types';

interface AnalysisPanelProps {
  progress: AnalysisProgress;
  isScanning: boolean;
  student: StudentInfo;
  exam: Exam;
  onTriggerRescan?: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  progress,
  isScanning,
  student,
  exam,
  onTriggerRescan,
}) => {
  const currentQ = progress.currentQuestionIndex || 1;
  const totalQ = exam.totalQuestions || 50;
  const percent = progress.percentage || 0;
  const hasCompleted = !isScanning && percent > 0;

  return (
    <div className="flex flex-col gap-4 w-full min-h-0 overflow-y-auto">
      {/* Main Analysis Status Card */}
      <div className="w-full rounded-2xl bg-slate-950/90 border border-slate-800/80 p-5 shadow-xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-white uppercase font-mono">
                PROSES ANALISIS
              </h2>
              <p className="text-[11px] text-slate-400">
                Computer Vision & AI Layout Recognition
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-cyan-400 rounded-full border border-cyan-800/50">
            {isScanning ? 'LIVE CV' : 'READY'}
          </span>
        </div>

        {/* Stage Steps List matching Mockup */}
        <div className="flex flex-col gap-2.5">
          {/* Step 1 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">Mendeteksi LJK</span>
                <span className="text-[10px] text-slate-500">4 sudut orientasi ditemukan</span>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Selesai
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">Meluruskan & Memotong</span>
                <span className="text-[10px] text-slate-500">Perspective transform & deskew</span>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Selesai
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">Mendeteksi Area Jawaban</span>
                <span className="text-[10px] text-slate-500">Grid koordinat terpetakan</span>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Selesai
            </span>
          </div>

          {/* Step 4: Active Stage */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Loader2 className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-cyan-200">Menganalisis Jawaban</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {isScanning
                    ? `Memeriksa soal ${currentQ} / ${totalQ}`
                    : hasCompleted
                      ? `Pemeriksaan ${totalQ} Soal Selesai`
                      : `Menunggu pemindaian · 0 / ${totalQ}`}
                </span>
              </div>
            </div>
            {isScanning ? (
              <span className="text-[11px] font-bold font-mono text-cyan-300 animate-pulse">
                {percent}%
              </span>
            ) : hasCompleted ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <Check className="w-3.5 h-3.5" /> 100%
              </span>
            ) : (
              <span className="text-[11px] font-bold font-mono text-slate-500">0%</span>
            )}
          </div>
        </div>

        {/* Progress Bar with glowing fill */}
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-150 shadow-sm shadow-cyan-400"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>Progress Pindai</span>
            <span className="font-bold text-cyan-400">{percent}%</span>
          </div>
        </div>

        {/* Sub-process list with glowing bullets */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span>Mendeteksi tanda</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span>Mengukur kehitaman</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span>Membandingkan posisi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span>Validasi jawaban</span>
          </div>
        </div>
      </div>

      {/* Recognized Student Identity Card */}
      <div className="w-full rounded-xl bg-slate-950/90 border border-slate-800/80 p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Identitas Terdeteksi
          </span>
          <span className="px-1.5 py-0.2 bg-emerald-950/60 text-emerald-400 text-[10px] rounded border border-emerald-800/40">
            OCR Valid
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/70 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Nama Siswa</span>
            <span className="font-bold text-slate-200 truncate block">{student.name}</span>
          </div>
          <div className="bg-slate-900/70 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">No. Peserta / NISN</span>
            <span className="font-mono font-bold text-cyan-300 block">{student.nisn}</span>
          </div>
          <div className="bg-slate-900/70 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Kelas</span>
            <span className="font-bold text-slate-200 block">{student.className}</span>
          </div>
          <div className="bg-slate-900/70 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Mata Pelajaran</span>
            <span className="font-bold text-slate-200 block">{student.subject}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
