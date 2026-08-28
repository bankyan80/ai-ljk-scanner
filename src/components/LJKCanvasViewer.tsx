import React, { useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Exam, QuestionResult, StudentInfo } from '../types';
import { drawAuthenticLJKSheet } from '../data/sampleLJKs';

interface LJKCanvasViewerProps {
  student: StudentInfo;
  exam: Exam;
  answers: QuestionResult[];
  activeScanningQIndex: number;
  laserYPercent: number; // 0 - 100%
  isScanning: boolean;
  onUploadClick: () => void;
  onCameraClick: () => void;
  onLoadPreset: (presetId: string) => void;
  onQuestionClick?: (qNum: number) => void;
  customImage?: string | null;
}

export const LJKCanvasViewer: React.FC<LJKCanvasViewerProps> = ({
  student,
  exam,
  answers,
  activeScanningQIndex,
  laserYPercent,
  isScanning,
  onUploadClick,
  onCameraClick,
  onLoadPreset,
  onQuestionClick,
  customImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Render LJK Sheet
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 580;
    const height = 760;

    canvas.width = width;
    canvas.height = height;

    if (customImage) {
      // Draw custom uploaded image if available
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = customImage;
    } else {
      // Draw authentic synthetic LJK sheet
      drawAuthenticLJKSheet(
        ctx,
        width,
        height,
        student,
        answers,
        activeScanningQIndex,
        true
      );
    }
  }, [student, answers, activeScanningQIndex, customImage, exam]);

  // Click on canvas to inspect question
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onQuestionClick) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Detect which question was clicked
    for (const ans of answers) {
      for (const opt of ans.options) {
        if (opt.x && opt.y && opt.radius) {
          const dist = Math.hypot(clickX - opt.x, clickY - opt.y);
          if (dist <= opt.radius + 6) {
            onQuestionClick(ans.questionNumber);
            return;
          }
        }
      }
    }
  };

  const activeQuestionNumber = activeScanningQIndex >= 0 ? activeScanningQIndex + 1 : (answers.length > 0 ? answers.length : 28);
  const totalQuestions = exam.totalQuestions || 50;

  return (
    <div className="flex flex-col gap-3.5 w-full min-h-0">
      {/* Viewer Frame Container */}
      <div 
        ref={containerRef}
        className="relative w-full min-h-0 rounded-2xl bg-slate-950/90 border border-slate-800/80 p-4 sm:p-6 flex flex-col items-center justify-center overflow-y-auto shadow-2xl shadow-cyan-950/30"
      >
        {/* Futuristic Corner Brackets */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg pointer-events-none" />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-24 bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Document Frame */}
        <div className="relative rounded-xl overflow-hidden border border-slate-700/60 shadow-2xl bg-white max-w-full">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full max-w-[540px] h-auto object-contain cursor-crosshair transition-transform"
            title="Klik bulatan jawaban untuk verifikasi/koreksi manual"
          />

          {/* Glowing Animated Laser Scanner Beam */}
          {isScanning && (
            <div
              className="absolute left-0 right-0 pointer-events-none transition-all duration-75 z-20"
              style={{
                top: `${laserYPercent}%`,
              }}
            >
              {/* Laser Core */}
              <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#00f0ff,0_0_30px_#00f0ff]" />
              
              {/* Laser Flare & Glow Cone */}
              <div className="h-12 w-full -mt-6 bg-gradient-to-b from-cyan-500/0 via-cyan-400/25 to-blue-600/0 blur-md pointer-events-none" />
              
              {/* Center Flare Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-6 bg-white/70 rounded-full blur-sm" />
            </div>
          )}
        </div>

        {/* Realtime Scan Status Sub-bar */}
        <div className="mt-4 flex items-center justify-between w-full max-w-[540px] px-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Memindai... melewati soal <strong className="text-white">{activeQuestionNumber}</strong> / {totalQuestions}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span>Model:</span>
            <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300 font-medium">
              {exam.optionCount === 4 ? 'A - D' : 'A - E'} ({totalQuestions} Soal)
            </span>
          </div>
        </div>
      </div>

      {/* Quick Toolbar Underneath Viewer */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        {/* Source Switchers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCameraClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition shadow-sm shadow-cyan-500/20"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Buka Kamera</span>
          </button>

          <button
            onClick={onUploadClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/70 rounded-lg text-xs font-semibold transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload LJK</span>
          </button>
        </div>

        {/* Preset Sample Switchers */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
          <span className="text-[11px] font-medium mr-1 text-slate-500">Contoh:</span>
          <button
            onClick={() => onLoadPreset('tpl-hybrid-25pg-5essay')}
            className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 rounded text-[11px] font-semibold transition hover:text-emerald-200 flex items-center gap-1"
          >
            <span>✨ Hybrid (25 PG + 5 Esai)</span>
          </button>
          <button
            onClick={() => onLoadPreset('tpl-smp-50-ae')}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded text-[11px] font-medium transition hover:text-cyan-400"
          >
            50 Soal A-E
          </button>
          <button
            onClick={() => onLoadPreset('tpl-sd-40-ad')}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded text-[11px] font-medium transition hover:text-cyan-400"
          >
            SD 40 Soal (Menyatu)
          </button>
          <button
            onClick={() => onLoadPreset('tpl-block-30-ad')}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded text-[11px] font-medium transition hover:text-cyan-400"
          >
            Model Blok
          </button>
        </div>
      </div>
    </div>
  );
};
