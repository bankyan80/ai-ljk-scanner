import React, { useState } from 'react';
import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';
import { PRESET_TEMPLATES } from '../data/sampleLJKs';
import { generatePrintableLjkPDF } from '../services/printableLjkGenerator';
import { LJKTemplate } from '../types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [selectedTemplate, setSelectedTemplate] = useState<LJKTemplate>(PRESET_TEMPLATES[0]);
  const [schoolName, setSchoolName] = useState('SMP NEGERI 1 NUSANTARA');
  const [examTitle, setExamTitle] = useState('PENILAIAN TENGAH SEMESTER (PTS) GANJIL');
  const [subject, setSubject] = useState('MATEMATIKA');
  const [academicYear, setAcademicYear] = useState('2026/2027');

  const handleGeneratePDF = () => {
    generatePrintableLjkPDF({
      schoolName,
      examTitle,
      subject,
      academicYear,
      template: selectedTemplate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Generator Lembar Jawaban (Cetak LJK Siap Pakai)
              </h3>
              <p className="text-xs text-slate-400">
                Buat dan unduh format LJK PDF standar dengan 4 sudut deteksi otomatis
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

        {/* Template Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
            Pilih Model / Template LJK:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PRESET_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1 ${
                  selectedTemplate.id === tpl.id
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{tpl.name}</span>
                  {selectedTemplate.id === tpl.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">
                  {tpl.description}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 mt-1">
                  {tpl.totalQuestions} Soal • {tpl.optionCount === 4 ? 'Opsi A-D' : 'Opsi A-E'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customization Form */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
            Kustomisasi KOP & Identitas Sekolah:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Nama Sekolah / Lembaga</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Judul Ujian / Asesmen</label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Batal
          </button>

          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/50"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Blank LJK (Siap Cetak)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
