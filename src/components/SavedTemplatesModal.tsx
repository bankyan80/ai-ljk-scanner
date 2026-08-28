import React, { useEffect, useState } from 'react';
import { X, Database, Trash2, CheckCircle2, Grid2x2, LayoutGrid, Rows3, FileText } from 'lucide-react';
import { SavedLayoutTemplate, getSavedTemplates, removeTemplate, clearTemplates } from '../services/ljkTemplates';

interface SavedTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function orientationLabel(orientation?: string): string {
  switch ((orientation || '').toLowerCase()) {
    case 'portrait':
      return 'Portrait';
    case 'landscape':
      return 'Landscape';
    default:
      return orientation || '—';
  }
}

export const SavedTemplatesModal: React.FC<SavedTemplatesModalProps> = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState<SavedLayoutTemplate[]>([]);

  useEffect(() => {
    if (isOpen) setTemplates(getSavedTemplates());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    removeTemplate(id);
    setTemplates(getSavedTemplates());
  };

  const handleClearAll = () => {
    clearTemplates();
    setTemplates([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Template LJK Tersimpan (Auto Template)
              </h3>
              <p className="text-xs text-slate-400">
                Layout yang dikenali AI dari scan sebelumnya — dipakai ulang agar scan lebih cepat & stabil
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

        {/* Template List */}
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-500" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-slate-300">Belum ada template tersimpan</span>
              <span className="text-xs text-slate-500 max-w-xs">
                Scanner menyimpan layout secara otomatis setelah Anda berhasil memindai sebuah LJK.
                Template yang sama akan otomatis dipakai ulang untuk model LJK yang identik.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-3 hover:bg-slate-900 transition group"
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white truncate">{tpl.name}</span>
                    <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded text-[9px] font-bold border border-cyan-800/50 flex items-center gap-0.5 flex-shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Auto
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Grid2x2 className="w-3 h-3 text-cyan-400" />
                      {tpl.detectedTotalQuestions} Soal
                    </span>
                    <span className="flex items-center gap-1">
                      <Rows3 className="w-3 h-3 text-cyan-400" />
                      {tpl.detectedOptionCount} Pilihan
                    </span>
                    <span className="flex items-center gap-1">
                      <LayoutGrid className="w-3 h-3 text-cyan-400" />
                      {tpl.columns || '—'} kolom • {orientationLabel(tpl.orientation)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Model: {tpl.detectedType} • Sumber: {tpl.source} • Dibuat: {new Date(tpl.createdAt).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(tpl.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition flex-shrink-0"
                  title="Hapus template ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handleClearAll}
            disabled={templates.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/50 disabled:opacity-40 disabled:cursor-not-allowed text-rose-300 rounded-lg text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus Semua
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
