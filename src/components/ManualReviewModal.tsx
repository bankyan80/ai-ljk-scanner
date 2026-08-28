import React, { useState } from 'react';
import { X, Check, AlertTriangle, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { OptionLetter, QuestionResult } from '../types';

interface ManualReviewModalProps {
  question: QuestionResult | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAnswer: (questionNumber: number, newAnswer: string) => void;
  optionCount?: number;
}

export const ManualReviewModal: React.FC<ManualReviewModalProps> = ({
  question,
  isOpen,
  onClose,
  onUpdateAnswer,
  optionCount = 5,
}) => {
  if (!isOpen || !question) return null;

  const [selectedAns, setSelectedAns] = useState<string>(question.studentAnswer);
  const options = (['A', 'B', 'C', 'D', 'E'] as OptionLetter[]).slice(0, optionCount);

  const handleSave = () => {
    onUpdateAnswer(question.questionNumber, selectedAns);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Verifikasi Jawaban Soal #{question.questionNumber}
              </h3>
              <p className="text-xs text-slate-400">
                Kunci Jawaban: <strong className="text-emerald-400 font-mono text-sm">{question.correctAnswer}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert if multiple / low confidence */}

        {question.status === 'EMPTY' && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Tidak ada bulatan dengan kehitaman yang memenuhi ambang batas (Jawaban Kosong).</span>
          </div>
        )}

        {(question.status === 'REVIEW' || question.flaggedForReview) && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-600/40 text-indigo-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>
              AI kurang yakin dengan jawaban ini (confidence {question.confidence}%). Perlu verifikasi manual oleh guru.
              {question.aiNote && <span className="block mt-1 text-indigo-300/80 italic">Catatan AI: {question.aiNote}</span>}
            </span>
          </div>
        )}

        {question.studentAnswer === 'X' && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-600/40 text-slate-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>AI mendeteksi tanda silang / coretan pada pilihan soal ini.</span>
          </div>
        )}

        {question.status === 'MULTIPLE' && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Jawaban ganda terdeteksi: <strong className="font-mono">{question.studentAnswer}</strong>. Mohon tentukan jawaban final.</span>
          </div>
        )}

        {/* Confidence Meter */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Keyakinan AI:</span>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                question.confidence >= 80 ? 'bg-emerald-400' : question.confidence >= 60 ? 'bg-amber-400' : 'bg-rose-400'
              }`}
              style={{ width: `${question.confidence}%` }}
            />
          </div>
          <span className="font-mono font-bold text-slate-200 w-10 text-right">{question.confidence}%</span>
        </div>

        {/* Density Breakdown per Option */}
        <div className="flex flex-col gap-2.5 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
            Analisis Tingkat Kehitaman & Kepadatan Piksel:
          </span>

          <div className="flex flex-col gap-2">
            {question.options.map((opt) => {
              const isSelected = selectedAns.includes(opt.option);
              const isKey = question.correctAnswer === opt.option;

              return (
                <div
                  key={opt.option}
                  onClick={() => setSelectedAns(opt.option)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                    isSelected
                      ? 'bg-cyan-950/50 border border-cyan-500/50 text-white'
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual Bubble */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono transition ${
                      opt.isFilled
                        ? 'bg-slate-900 text-white border-2 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {opt.option}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-semibold flex items-center gap-1.5">
                        Pilihan {opt.option}
                        {isKey && (
                          <span className="text-[10px] text-emerald-400 font-normal">
                            (Kunci)
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Kehitaman: {opt.density}% {opt.isFilled ? '• Terisi Pekat' : '• Bersih/Kosong'}
                      </span>
                    </div>
                  </div>

                  {/* Density Meter Bar */}
                  <div className="flex items-center gap-2 w-32">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          opt.density > 60
                            ? 'bg-cyan-400'
                            : opt.density > 25
                            ? 'bg-amber-400'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${opt.density}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-300 w-9 text-right">
                      {opt.density}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Correction Buttons */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
            Pilih Koreksi Manual:
          </span>
          <div className="grid grid-cols-6 gap-2">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedAns(opt)}
                className={`py-2 rounded-lg text-xs font-bold font-mono transition ${
                  selectedAns === opt
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
            <button
              onClick={() => setSelectedAns('-')}
              className={`py-2 rounded-lg text-xs font-bold transition ${
                selectedAns === '-'
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-slate-900 text-amber-400 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              Kosong
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/30"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Koreksi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
