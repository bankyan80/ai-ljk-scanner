import React from 'react';
import { Camera, Upload, X, ScanLine } from 'lucide-react';

interface SourcePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
  onCamera: () => void;
}

export const SourcePickerModal: React.FC<SourcePickerModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  onCamera,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Mulai Scan LJK Baru
              </h3>
              <p className="text-xs text-slate-400">
                Pilih sumber gambar lembar LJK untuk dipindai
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

        {/* Source Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onCamera();
              onClose();
            }}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-cyan-600/15 hover:bg-cyan-600/25 text-cyan-300 border border-cyan-500/40 transition shadow-sm shadow-cyan-500/20 group"
          >
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 group-hover:scale-110 transition">
              <Camera className="w-7 h-7" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm text-white">Buka Kamera</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Ambil foto LJK langsung dengan kamera perangkat
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onUpload();
              onClose();
            }}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 transition shadow-sm shadow-indigo-500/20 group"
          >
            <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 group-hover:scale-110 transition">
              <Upload className="w-7 h-7" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm text-white">Upload LJK</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Pilih file gambar LJK dari galeri atau penyimpanan
              </div>
            </div>
          </button>
        </div>

        {/* Tip */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <ScanLine className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            Anda juga bisa memuat <span className="text-emerald-300 font-semibold">Contoh Simulasi</span> dari tombol preset untuk mencoba tanpa gambar.
          </span>
        </div>
      </div>
    </div>
  );
};
