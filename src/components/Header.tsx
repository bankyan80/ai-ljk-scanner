import React from 'react';
import { 
  Scan, 
  Moon, 
  Sun, 
  History, 
  KeyRound, 
  FileText, 
  Layers, 
  Sparkles,
  Printer,
  Database,
  Download
} from 'lucide-react';
import { Exam } from '../types';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeExam: Exam;
  onOpenHistory: () => void;
  onOpenAnswerKeys: () => void;
  onOpenBatchScan: () => void;
  onOpenTemplateGen: () => void;
  onOpenSavedTemplates: () => void;
  onOpenTemplateDownload: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  activeExam,
  onOpenHistory,
  onOpenAnswerKeys,
  onOpenBatchScan,
  onOpenTemplateGen,
  onOpenSavedTemplates,
  onOpenTemplateDownload,
  historyCount,
}) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40">
            <Scan className="w-6 h-6 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
                AI LJK SCANNER
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h.2.5" /> v2.4 CV+AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Scan • Analisis • Hasil Otomatis
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons & Navigation */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Active Exam Badge */}
          <div 
            onClick={onOpenAnswerKeys}
            className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 border border-slate-700/60 rounded-lg text-xs transition"
            title="Klik untuk ubah ujian & kunci jawaban"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium text-slate-200">{activeExam.name}</span>
            <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded text-[10px] border border-cyan-800/50">
              {activeExam.totalQuestions} Soal
            </span>
          </div>

          {/* Kunci Jawaban */}
          <button
            onClick={onOpenAnswerKeys}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-lg text-xs font-medium transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kunci Jawaban</span>
          </button>

          {/* Batch Scan */}
          <button
            onClick={onOpenBatchScan}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-lg text-xs font-medium transition"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Batch Scan</span>
          </button>

          {/* Cetak Blank LJK */}
          <button
            onClick={onOpenTemplateGen}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-lg text-xs font-medium transition"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cetak LJK</span>
          </button>

          {/* Download Template LJK (custom jumlah & pola) */}
          <button
            onClick={onOpenTemplateDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 border border-emerald-700/50 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Template</span>
          </button>

          {/* Template Tersimpan (Auto Template) */}
          <button
            onClick={onOpenSavedTemplates}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-lg text-xs font-medium transition"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Template Tersimpan</span>
          </button>

          {/* Riwayat Scan with Counter */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-lg text-xs font-medium transition"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Riwayat Scan</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold border border-amber-500/40">
                {historyCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-lg transition"
            title={darkMode ? 'Beralih ke Terang' : 'Beralih ke Gelap'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
