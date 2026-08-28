import React from 'react';
import { Check, X, AlertTriangle, ScanLine, CircleDot, Loader2, CircleCheck } from 'lucide-react';
import { QuestionResult } from '../types';
import { DeepScanState } from '../hooks/useDeepScanAnimation';
import { getScanModeLabel } from '../hooks/useDeepScanAnimation';

interface DeepScanHudProps {
  state: DeepScanState;
  question?: QuestionResult;
  mode: 'normal' | 'detail' | 'demo';
}

const CANVAS_W = 580;
const CANVAS_H = 760;

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function pctX(x: number): string {
  return `${(x / CANVAS_W) * 100}%`;
}
function pctY(y: number): string {
  return `${(y / CANVAS_H) * 100}%`;
}

export const DeepScanHud: React.FC<DeepScanHudProps> = ({ state, question, mode }) => {
  const opts = question?.options ?? [];
  const studentAnswer = question?.studentAnswer ?? '';
  const correctAnswer = question?.correctAnswer ?? '';
  const filledLetters = studentAnswer.split('+').filter(Boolean);
  const isCross = studentAnswer === 'X';

  // Row bounding box from the current question's option bubble centers.
  let rowBox: { left: string; top: string; width: string; height: string } | null = null;
  if (opts.length > 0) {
    const xs = opts.map((o) => o.x ?? 0);
    const ys = opts.map((o) => o.y ?? 0);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const radius = Math.max(0, ...opts.map((o) => o.radius ?? 0));
    const pad = 7;
    rowBox = {
      left: pctX(minX - pad),
      top: pctY(minY - pad),
      width: `${((maxX - minX + pad * 2) / CANVAS_W) * 100}%`,
      height: `${((maxY - minY + pad * 2) / CANVAS_H) * 100}%`,
    };
  }

  const stage = state.stage;
  const qNumber = state.qIndex + 1;
  const progressPct = state.totalQuestions > 0 ? Math.min(100, Math.round((state.qIndex / state.totalQuestions) * 100)) : 0;
  const modeLabel = getScanModeLabel(mode);

  // Which option is highlighted during OPTIONS stage.
  const activeOptIndex = stage === 'OPTIONS' ? state.optIndex : -1;
  // Filled option index (used for glow during ANALYSIS / check during VALIDATE).
  const filledIndex = filledLetters.length > 0 ? Math.min(LETTERS.indexOf(filledLetters[0]), opts.length - 1) : -1;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Row highlight box over the current question */}
      {rowBox && stage !== 'DONE' && (
        <div
          className="absolute rounded-lg border-2 border-cyan-400/80 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all duration-200"
          style={{ left: rowBox.left, top: rowBox.top, width: rowBox.width, height: rowBox.height }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-cyan-500 text-white text-[9px] font-mono font-bold whitespace-nowrap">
            Soal {qNumber}
          </div>
        </div>
      )}

      {/* Per-option scan ring during OPTIONS stage */}
      {opts.map((opt, i) => {
        if (i !== activeOptIndex || opt.x === undefined || opt.y === undefined) return null;
        return (
          <div
            key={i}
            className="absolute rounded-full border-2 border-cyan-300 animate-ping"
            style={{
              left: pctX(opt.x),
              top: pctY(opt.y),
              width: 16,
              height: 16,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}

      {/* Filled bubble glow + check during ANALYSIS / VALIDATE */}
      {filledIndex >= 0 && opts[filledIndex]?.x !== undefined && (stage === 'ANALYSIS' || stage === 'VALIDATE') && (
        <div
          className={`absolute rounded-full ${stage === 'VALIDATE' ? 'border-[3px] border-emerald-400 shadow-[0_0_26px_rgba(16,185,129,0.9)]' : 'border-[3px] border-cyan-300 animate-pulse shadow-[0_0_26px_rgba(34,211,238,0.9)]'}`}
          style={{
            left: pctX(opts[filledIndex].x ?? 0),
            top: pctY(opts[filledIndex].y ?? 0),
            width: 22,
            height: 22,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* Bottom HUD scan card */}
      <div className="absolute left-2 right-2 bottom-2 rounded-xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-md p-3 shadow-2xl shadow-cyan-950/40 flex flex-col gap-2">
        {/* Header row: question + stage + mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {stage === 'QUESTION' && <ScanLine className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
            {stage === 'OPTIONS' && <CircleDot className="w-4 h-4 text-cyan-300 flex-shrink-0" />}
            {stage === 'ANALYSIS' && <Loader2 className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />}
            {stage === 'VALIDATE' && <CircleCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            <span className="text-base font-extrabold text-white font-mono leading-none">
              Soal {qNumber}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              / {state.totalQuestions}
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-cyan-300">
            {modeLabel}
          </span>
        </div>

        {/* Stage description */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
          {stage === 'QUESTION' && <span>🔍 Membaca pertanyaan {qNumber}...</span>}
          {stage === 'OPTIONS' && (
            <span>
              🔍 Menganalisis pilihan{' '}
              <strong className="text-cyan-300">
                {LETTERS[activeOptIndex] ?? '...'}
              </strong>{' '}
              {activeOptIndex + 1}/{opts.length || 5}
            </span>
          )}
          {stage === 'ANALYSIS' && <span>📊 Menakar tingkat kehitaman tiap bulatan...</span>}
          {stage === 'VALIDATE' && (
            <span>
              ✓ Jawaban siswa:{' '}
              <strong className="text-white">{studentAnswer || '—'}</strong>{' '}
              • Kunci:{' '}
              <strong className="text-emerald-300">{correctAnswer || '—'}</strong>
            </span>
          )}
          {stage === 'DONE' && <span>Scans selesai.</span>}
        </div>

        {/* Option densities / result */}
        {stage === 'ANALYSIS' || stage === 'VALIDATE' ? (
          <div className="flex flex-col gap-1">
            {opts.map((opt, i) => {
              const isFilled = filledLetters.includes(LETTERS[i]);
              const density = opt.density ?? 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-4 text-[10px] font-mono font-bold ${isFilled ? 'text-cyan-300' : 'text-slate-400'}`}>
                    {LETTERS[i]}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isFilled ? 'bg-cyan-400' : density > 25 ? 'bg-amber-500/70' : 'bg-slate-600'}`}
                      style={{ width: `${density}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[10px] font-mono text-slate-400">{density}%</span>
                  {isFilled && stage === 'VALIDATE' && (
                    <span className="text-emerald-400"><Check className="w-3.5 h-3.5" /></span>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Validasi result badge */}
        {stage === 'VALIDATE' && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            {isCross ? (
              <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <AlertTriangle className="w-4 h-4 text-slate-400" />
                <span>Tanda silang / coretan terdeteksi — perlu review.</span>
              </div>
            ) : question?.status === 'CORRECT' ? (
              <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-bold">
                <Check className="w-4 h-4" /> BENAR
              </div>
            ) : question?.status === 'WRONG' ? (
              <div className="flex items-center gap-1.5 text-rose-300 text-[11px] font-bold">
                <X className="w-4 h-4" /> SALAH
              </div>
            ) : question?.status === 'EMPTY' ? (
              <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold">
                <AlertTriangle className="w-4 h-4" /> KOSONG
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-indigo-300 text-[11px] font-bold">
                <AlertTriangle className="w-4 h-4" /> REVIEW
              </div>
            )}
            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
              Confidence
              <span className="text-cyan-300 font-bold">{question?.confidence ?? 0}%</span>
              <span className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <span
                  className="block h-full bg-cyan-400"
                  style={{ width: `${question?.confidence ?? 0}%` }}
                />
              </span>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-[10px] font-mono text-cyan-300">{progressPct}%</span>
        </div>
      </div>
    </div>
  );
};
