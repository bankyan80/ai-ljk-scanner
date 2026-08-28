import { useEffect, useState } from 'react';
import { QuestionResult, ScanMode } from '../types';

export type DeepScanStage = 'QUESTION' | 'OPTIONS' | 'ANALYSIS' | 'VALIDATE' | 'DONE';

export interface DeepScanState {
  qIndex: number; // 0-based question being visualized
  stage: DeepScanStage;
  optIndex: number; // current option being scanned (0-based, -1 when not scanning options)
  totalQuestions: number;
}

interface StageTiming {
  question: number;
  option: number;
  analysis: number;
  validate: number;
  transition: number;
}

// Timing per mode (ms). Pure visualization pacing — never affects real scan.
const TIMING: Record<ScanMode, StageTiming> = {
  normal: { question: 320, option: 120, analysis: 420, validate: 260, transition: 220 },
  detail: { question: 900, option: 240, analysis: 1100, validate: 700, transition: 420 },
  demo: { question: 1200, option: 340, analysis: 1500, validate: 800, transition: 500 },
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function optionCount(q?: QuestionResult): number {
  if (q && q.options && q.options.length > 0) return q.options.length;
  // Estimate from the student's answer letters if available.
  const letters = (q?.studentAnswer || '').split('+').filter(Boolean).length;
  return letters > 0 ? letters : 5;
}

// Drives a per-question, per-stage visualization clock. Purely cosmetic.
// It replays the real `answers` data slowly so teachers can watch the AI
// process each question: pertanyaan -> pilihan -> analisis arsiran -> validasi.
export function useDeepScanAnimation(options: {
  isScanning: boolean;
  mode: ScanMode;
  totalQuestions: number;
  questions: QuestionResult[];
}): DeepScanState {
  const { isScanning, mode, totalQuestions, questions } = options;
  const availableCount = questions.length;
  const [state, setState] = useState<DeepScanState>({
    qIndex: 0,
    stage: 'QUESTION',
    optIndex: 0,
    totalQuestions,
  });

  useEffect(() => {
    if (!isScanning || availableCount === 0) {
      setState((s) => ({ ...s, qIndex: 0, stage: 'QUESTION', optIndex: 0 }));
      return;
    }

    let cancelled = false;
    const t = TIMING[mode];
    const maxQ = Math.max(0, availableCount - 1);
    const count = Math.max(0, totalQuestions);

    (async () => {
      for (let qi = 0; qi <= maxQ && !cancelled; qi++) {
        const realQ = Math.min(qi, availableCount - 1);
        setState({ qIndex: realQ, stage: 'QUESTION', optIndex: 0, totalQuestions: count });
        await sleep(t.question);
        if (cancelled) return;

        const opts = optionCount(questions[realQ]);
        for (let oi = 0; oi < opts && !cancelled; oi++) {
          setState({ qIndex: realQ, stage: 'OPTIONS', optIndex: oi, totalQuestions: count });
          await sleep(t.option);
          if (cancelled) return;
        }

        setState({ qIndex: realQ, stage: 'ANALYSIS', optIndex: -1, totalQuestions: count });
        await sleep(t.analysis);
        if (cancelled) return;

        setState({ qIndex: realQ, stage: 'VALIDATE', optIndex: -1, totalQuestions: count });
        await sleep(t.validate);
        if (cancelled) return;

        await sleep(t.transition);
        if (cancelled) return;
      }

      // Cycle finished for all available questions. Loop back while the real
      // scan is still running (more data may arrive), then show DONE.
      if (!cancelled) {
        setState((s) => ({ ...s, stage: 'DONE' }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isScanning, mode, totalQuestions, questions]);

  return state;
}

export function getScanModeLabel(mode: ScanMode): string {
  switch (mode) {
    case 'normal':
      return 'Normal';
    case 'detail':
      return 'Detail';
    default:
      return 'Demo';
  }
}
