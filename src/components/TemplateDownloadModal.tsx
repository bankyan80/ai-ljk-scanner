import React, { useState } from 'react';
import { Download, X, FileSpreadsheet, PenLine, FileStack, CheckCircle2, Printer } from 'lucide-react';
import { generatePrintableLjkPDF, generateEssayLjkPDF } from '../services/printableLjkGenerator';

interface TemplateDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TemplateStructure = 'combined' | 'pg' | 'separate';

const STRUCTURE_OPTIONS: { id: TemplateStructure; title: string; desc: string; icon: typeof FileSpreadsheet }[] = [
  {
    id: 'combined',
    title: 'PG + Essay Menyatu',
    desc: 'Pilihan ganda dan lembar essay dalam satu file',
    icon: FileSpreadsheet,
  },
  {
    id: 'pg',
    title: 'Hanya Pilihan Ganda',
    desc: 'Hanya grid bulatan jawaban (tanpa essay)',
    icon: FileStack,
  },
  {
    id: 'separate',
    title: 'PG & Essay Terpisah',
    desc: 'Dua file: LJK pilihan ganda + lembar essay',
    icon: PenLine,
  },
];

export const TemplateDownloadModal: React.FC<TemplateDownloadModalProps> = ({ isOpen, onClose }) => {
  const [structure, setStructure] = useState<TemplateStructure>('pg');
  const [pgCount, setPgCount] = useState(30);
  const [optCount, setOptCount] = useState<4 | 5>(4);
  const [essayCount, setEssayCount] = useState(5);
  const [schoolName, setSchoolName] = useState('SMP NEGERI 1 NUSANTARA');
  const [examTitle, setExamTitle] = useState('PENILAIAN TENGAH SEMESTER (PTS) GANJIL');
  const [subject, setSubject] = useState('MATEMATIKA');
  const [academicYear, setAcademicYear] = useState('2026/2027');

  if (!isOpen) return null;

  const kop = { schoolName, examTitle, subject, academicYear };

  const handleDownload = () => {
    if (structure === 'combined') {
      generatePrintableLjkPDF({
        ...kop,
        totalQuestions: pgCount,
        optionCount: optCount,
        includeEssay: 'combined',
        essayCount,
        fileName: `LJK_PG_${pgCount}_Essay_${essayCount}_Menyatu.pdf`,
      });
    } else if (structure === 'separate') {
      generatePrintableLjkPDF({
        ...kop,
        totalQuestions: pgCount,
        optionCount: optCount,
        includeEssay: 'none',
        fileName: `LJK_PilihanGanda_${pgCount}_Soal.pdf`,
      });
      setTimeout(() => {
        generateEssayLjkPDF({
          ...kop,
          totalQuestions: 0,
          optionCount: optCount,
          includeEssay: 'separate',
          essayCount,
          fileName: `Lembar_Jawaban_Essay_${essayCount}.pdf`,
        });
      }, 350);
    } else {
      generatePrintableLjkPDF({
        ...kop,
        totalQuestions: pgCount,
        optionCount: optCount,
        includeEssay: 'none',
        fileName: `LJK_PilihanGanda_${pgCount}_Soal.pdf`,
      });
    }
  };

  const downloadLabel =
    structure === 'combined'
      ? `Download 1 File (PG ${pgCount} + Essay ${essayCount})`
      : structure === 'separate'
        ? 'Download 2 File (PG + Essay)'
        : `Download LJK ${pgCount} Soal PG`;

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
                Download Template LJK
              </h3>
              <p className="text-xs text-slate-400">
                Lembar jawaban sesuai jumlah & pola yang Anda inginkan
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

        {/* Struktur / Pola LJK */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
            Pola LJK:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {STRUCTURE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = structure === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setStructure(opt.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1.5 ${
                    active
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {active && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <span className="font-bold text-xs text-white">{opt.title}</span>
                  <span className="text-[11px] text-slate-400 leading-tight">{opt.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jumlah Soal & Opsi */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Jumlah Soal PG</label>
            <input
              type="number"
              min={1}
              max={200}
              value={pgCount}
              onChange={(e) => setPgCount(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Opsi Pilihan</label>
            <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5">
              {([4, 5] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setOptCount(n)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-semibold transition ${
                    optCount === n
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  A-{String.fromCharCode(64 + n)}
                </button>
              ))}
            </div>
          </div>

          {structure !== 'pg' && (
            <div className="col-span-2 sm:col-span-2">
              <label className="text-[10px] text-slate-400 block mb-1">Jumlah Soal Essay</label>
              <input
                type="number"
                min={1}
                max={30}
                value={essayCount}
                onChange={(e) => setEssayCount(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {/* KOP & Identitas Sekolah */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
            KOP & Identitas Sekolah:
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
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Mata Pelajaran</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Tahun Ajaran</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[10px] text-slate-500">
            LJK berisi 4 sudut penanda otomatis & siap scan dengan aplikasi ini
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};