import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  Save, 
  RotateCcw, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertTriangle,
  Camera,
  FileText,
  Filter,
  PenTool,
  Sparkles,
  Edit3
} from 'lucide-react';
import { EssayQuestionResult, QuestionResult, ScanMetrics, ScanResultRecord, StudentInfo } from '../types';

interface ResultsSectionProps {
  metrics: ScanMetrics;
  answers: QuestionResult[];
  essayAnswers?: EssayQuestionResult[];
  student: StudentInfo;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onSaveResult: () => void;
  onScanNew: () => void;
  onQuestionClick: (qNum: number) => void;
  onUpdateEssayScore?: (qNum: number, newScore: number, feedback?: string) => void;
  isSaved?: boolean;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  metrics,
  answers,
  essayAnswers,
  student,
  onExportPDF,
  onExportExcel,
  onSaveResult,
  onScanNew,
  onQuestionClick,
  onUpdateEssayScore,
  isSaved = false,
}) => {
  // Section Navigation Tab: Multiple Choice vs Handwritten Essay
  const [activeSectionTab, setActiveSectionTab] = useState<'PG' | 'ESSAY'>('PG');
  // Interactive Filter Tab for PG
  const [filterMode, setFilterMode] = useState<'ALL' | 'WRONG' | 'EMPTY' | 'MULTIPLE'>('ALL');

  const hasEssay = !!(essayAnswers && essayAnswers.length > 0);

  // Filter questions based on selection
  const filteredAnswers = answers.filter((ans) => {
    if (filterMode === 'WRONG') return ans.status === 'WRONG';
    if (filterMode === 'EMPTY') return ans.status === 'EMPTY';
    if (filterMode === 'MULTIPLE') return ans.status === 'MULTIPLE';
    return true;
  });

  // Split into 4 columns matching the mockup
  const total = filteredAnswers.length;
  const colSize = Math.max(1, Math.ceil(total / 4));
  const col1 = filteredAnswers.slice(0, colSize);
  const col2 = filteredAnswers.slice(colSize, colSize * 2);
  const col3 = filteredAnswers.slice(colSize * 2, colSize * 3);
  const col4 = filteredAnswers.slice(colSize * 3, total);

  const answerColumns = [col1, col2, col3, col4];

  return (
    <div className="w-full h-full min-h-0 rounded-2xl bg-slate-950/90 border border-slate-800/80 p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 shrink-0">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase font-mono flex items-center gap-2">
            HASIL SCAN {hasEssay && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">OMR + HTR Esai</span>}
          </h2>
          <p className="text-xs text-slate-400">
            Penilaian untuk <span className="font-semibold text-slate-200">{student.name}</span> ({student.nisn}) • {student.subject} ({student.className})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={onSaveResult}
            disabled={isSaved}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md ${
              isSaved
                ? 'bg-emerald-700/30 text-emerald-300 border border-emerald-600/40'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 ring-1 ring-indigo-400/50'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Tersimpan ✓' : 'Simpan Hasil'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards matching Mockup */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 shrink-0">
        {/* Card 1: Nilai Akhir */}
        <div className="relative col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col items-center justify-center text-center overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            {hasEssay ? 'NILAI GABUNGAN' : 'NILAI AKHIR'}
          </span>
          <div className="relative my-0.5 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="text-2xl font-extrabold text-white font-mono tracking-tighter">
                {metrics.score}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 mt-0.5">
            {metrics.qualitativeGrade}
          </span>
          {hasEssay && (
            <div className="flex gap-2 mt-0.5 text-[9px] text-slate-400 font-mono">
              <span>PG: <strong className="text-cyan-300">{metrics.pgScore ?? metrics.score}</strong></span>
              <span>•</span>
              <span>Esai: <strong className="text-emerald-300">{metrics.essayScore ?? 0}</strong></span>
            </div>
          )}
        </div>

        {/* Card 2: Jumlah Soal */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-md">
          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            JUMLAH BUTIR
          </span>
          <div className="my-0.5 p-1.5 rounded-xl bg-blue-500/10 text-blue-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-white font-mono">
            {metrics.totalQuestions} {hasEssay ? `+ ${essayAnswers?.length} Esai` : ''}
          </span>
        </div>

        {/* Card 3: Jawaban Benar */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-md">
          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            JAWABAN BENAR (PG)
          </span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono my-0.5">
            {metrics.correct}
          </span>
          <span className="text-[11px] font-semibold text-emerald-400/90">
            {metrics.accuracyPercent}%
          </span>
        </div>

        {/* Card 4: Jawaban Salah */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-md">
          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            JAWABAN SALAH (PG)
          </span>
          <span className="text-xl font-extrabold text-rose-500 font-mono my-0.5">
            {metrics.wrong}
          </span>
          <span className="text-[11px] font-semibold text-rose-400/90">
            {Math.round((metrics.wrong / (metrics.totalQuestions || 1)) * 100)}%
          </span>
        </div>

        {/* Card 5: Jawaban Kosong */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-md">
          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            JAWABAN KOSONG
          </span>
          <span className="text-xl font-extrabold text-amber-400 font-mono my-0.5">
            {metrics.empty}
          </span>
          <span className="text-[11px] font-semibold text-amber-400/90">
            {Math.round((metrics.empty / (metrics.totalQuestions || 1)) * 100)}%
          </span>
        </div>

        {/* Card 6: Waktu Proses */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-md">
          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            WAKTU PROSES
          </span>
          <span className="text-lg font-extrabold text-indigo-300 font-mono my-0.5">
            00:0{metrics.processTimeSeconds}
          </span>
          <span className="text-[11px] font-semibold text-indigo-400">
            {metrics.processTimeSeconds} detik
          </span>
        </div>
      </div>

      {/* Scrollable Detail Area (keeps summary pinned, details scroll internally) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-4">

      {/* Main Mode Tabs (Bagian A: Pilihan Ganda vs Bagian B: Tulisan Tangan) */}
      {hasEssay && (
        <div className="shrink-0 flex items-center gap-3 border-b border-slate-800/80 pb-2">
          <button
            onClick={() => setActiveSectionTab('PG')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition ${
              activeSectionTab === 'PG'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bagian A: Pilihan Ganda ({answers.length} Butir)</span>
          </button>

          <button
            onClick={() => setActiveSectionTab('ESSAY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition ${
              activeSectionTab === 'ESSAY'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <PenTool className="w-4 h-4 text-emerald-300" />
            <span>Bagian B: Isian & Uraian Tulisan Tangan ({essayAnswers?.length} Soal)</span>
            <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded text-[9px] border border-emerald-700/50">
              AI HTR OCR
            </span>
          </button>
        </div>
      )}

      {/* VIEW 1: Multiple Choice Grid View */}
      {activeSectionTab === 'PG' && (
        <div className="flex flex-col gap-4">
          {/* Table Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <span className="text-slate-400 font-mono text-[11px] mr-1 hidden sm:inline">Filter Tabel:</span>
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold transition text-xs ${
                  filterMode === 'ALL'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Semua ({answers.length})
              </button>
              <button
                onClick={() => setFilterMode('WRONG')}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold transition text-xs ${
                  filterMode === 'WRONG'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-900 text-rose-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Salah ({metrics.wrong})
              </button>
              <button
                onClick={() => setFilterMode('EMPTY')}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold transition text-xs ${
                  filterMode === 'EMPTY'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-slate-900 text-amber-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Kosong ({metrics.empty})
              </button>
              <button
                onClick={() => setFilterMode('MULTIPLE')}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold transition text-xs ${
                  filterMode === 'MULTIPLE'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-slate-900 text-red-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Ganda ({metrics.multiple})
              </button>
            </div>
          </div>

          {/* Answer Detail Grid Table (4 Columns matching Mockup) */}
          <div className="w-full bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 overflow-x-auto">
            {filteredAnswers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                Tidak ada butir soal dengan status filter ini.
              </div>
            ) : (
              <div className="min-w-[720px] grid grid-cols-4 gap-4">
                {answerColumns.map((colAnswers, colIdx) => (
                  <div key={colIdx} className="flex flex-col border border-slate-800 rounded-xl overflow-hidden">
                    {/* Column Header */}
                    <div className="grid grid-cols-4 bg-slate-950 px-2.5 py-2 text-[11px] font-bold text-slate-400 uppercase font-mono border-b border-slate-800 text-center">
                      <span className="text-left">No</span>
                      <span>Jawaban</span>
                      <span>Kunci</span>
                      <span>Hasil</span>
                    </div>

                    {/* Column Rows */}
                    <div className="flex flex-col divide-y divide-slate-800/50 text-xs">
                      {colAnswers.map((ans) => {
                        const isCorrect = ans.status === 'CORRECT';
                        const isWrong = ans.status === 'WRONG';
                        const isEmpty = ans.status === 'EMPTY';
                        const isMultiple = ans.status === 'MULTIPLE';

                        return (
                          <div
                            key={ans.questionNumber}
                            onClick={() => onQuestionClick(ans.questionNumber)}
                            className="grid grid-cols-4 items-center px-2.5 py-1.5 hover:bg-slate-800/70 cursor-pointer transition text-center"
                            title="Klik untuk lihat analisa kehitaman / ubah manual"
                          >
                            {/* Number */}
                            <span className="text-left font-mono font-medium text-slate-400">
                              {ans.questionNumber}
                            </span>

                            {/* Student Answer */}
                            <span className={`font-mono font-bold ${
                              isCorrect
                                ? 'text-slate-200'
                                : isWrong
                                ? 'text-rose-400'
                                : isEmpty
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}>
                              {ans.studentAnswer}
                            </span>

                            {/* Correct Key */}
                            <span className="font-mono text-slate-300">
                              {ans.correctAnswer}
                            </span>

                            {/* Status Icon */}
                            <div className="flex items-center justify-center">
                              {isCorrect && (
                                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </span>
                              )}
                              {isWrong && (
                                <span className="p-0.5 rounded-full bg-rose-500/20 text-rose-400">
                                  <X className="w-3.5 h-3.5 stroke-[3]" />
                                </span>
                              )}
                              {isEmpty && (
                                <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400" />
                              )}
                              {isMultiple && (
                                <span className="px-1 py-0.2 bg-rose-950 text-rose-400 rounded text-[9px] font-bold border border-rose-800/50">
                                  (Ganda)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Handwritten Essay Review Cards (AI HTR OCR) */}
      {activeSectionTab === 'ESSAY' && hasEssay && essayAnswers && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Deteksi Otomatis Tulisan Tangan (ICR / HTR & Pencocokan Kata Kunci)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
              Rata-rata Akurasi HTR: 95%
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {essayAnswers.map((essay) => (
              <div
                key={essay.questionNumber}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3 shadow-lg"
              >
                {/* Essay Item Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-mono font-bold text-xs">
                      #{essay.questionNumber}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {essay.prompt}
                    </h4>
                  </div>

                  {/* Score Badge */}
                  <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Skor:</span>
                    <input
                      type="number"
                      min="0"
                      max={essay.maxScore}
                      value={essay.earnedScore}
                      onChange={(e) => onUpdateEssayScore && onUpdateEssayScore(essay.questionNumber, Number(e.target.value))}
                      className="w-12 bg-slate-900 text-center text-xs font-bold text-emerald-400 font-mono rounded border border-slate-700 focus:outline-none focus:border-cyan-500 py-0.5"
                    />
                    <span className="text-xs font-mono text-slate-500">/ {essay.maxScore}</span>
                  </div>
                </div>

                {/* Handwritten Detected Text Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1">
                      <PenTool className="w-3 h-3 text-cyan-400" />
                      Hasil Transkripsi Tulisan Tangan Siswa (AI HTR OCR):
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30">
                      Keyakinan: {essay.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-cyan-200 font-medium italic bg-cyan-950/20 p-2.5 rounded-lg border border-cyan-900/30 font-serif">
                    "{essay.detectedHandwritingText}"
                  </p>
                </div>

                {/* Rubrik Kunci & Keyword Matching */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                      Rubrik Kunci Guru:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {essay.keyRubric}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                      Kata Kunci Terdeteksi ({essay.matchedKeywords.length} / {essay.rubricKeywords.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {essay.rubricKeywords.map((kw) => {
                        const isMatched = essay.matchedKeywords.some((m) => m.toLowerCase().includes(kw.toLowerCase()));
                        return (
                          <span
                            key={kw}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium flex items-center gap-1 ${
                              isMatched
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                : 'bg-slate-800 text-slate-500 border border-slate-700/40'
                            }`}
                          >
                            {isMatched ? '✓' : '○'} {kw}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Feedback / Catatan Guru */}
                {essay.teacherFeedback && (
                  <div className="text-[11px] text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/60 font-mono">
                    <span className="font-semibold text-slate-300">Catatan Koreksi:</span> {essay.teacherFeedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      </div>{/* end scrollable detail area */}

      {/* Bottom Scan New Button matching Mockup */}
      <div className="shrink-0 flex justify-center pt-2">
        <button
          onClick={onScanNew}
          className="flex items-center justify-center gap-2.5 w-full max-w-md py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 ring-1 ring-cyan-400/40 transition transform active:scale-98"
        >
          <Camera className="w-4 h-4" />
          <span>Scan LJK Baru</span>
        </button>
      </div>
    </div>
  );
};
