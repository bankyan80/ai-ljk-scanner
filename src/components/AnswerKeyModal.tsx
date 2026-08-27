import React, { useState } from 'react';
import { KeyRound, X, Plus, Trash2, Check, Sparkles, FileText, Upload } from 'lucide-react';
import { Exam, OptionLetter } from '../types';
import { PRESET_TEMPLATES } from '../data/sampleLJKs';

interface AnswerKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: Exam[];
  activeExam: Exam;
  onSelectExam: (exam: Exam) => void;
  onSaveExam: (exam: Exam) => void;
}

export const AnswerKeyModal: React.FC<AnswerKeyModalProps> = ({
  isOpen,
  onClose,
  exams,
  activeExam,
  onSelectExam,
  onSaveExam,
}) => {
  if (!isOpen) return null;

  const [currentExam, setCurrentExam] = useState<Exam>({ ...activeExam });
  const [quickPasteText, setQuickPasteText] = useState('');
  const [activeTab, setActiveTab] = useState<'LIST' | 'EDIT'>('EDIT');

  const options: OptionLetter[] = currentExam.optionCount === 4 ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E'];

  const handleKeyChange = (qNum: number, letter: OptionLetter) => {
    setCurrentExam((prev) => ({
      ...prev,
      answerKeys: {
        ...prev.answerKeys,
        [qNum]: letter,
      },
    }));
  };

  const handleQuickPaste = () => {
    if (!quickPasteText.trim()) return;
    const clean = quickPasteText.toUpperCase().replace(/[^A-E]/g, '');
    const newKeys = { ...currentExam.answerKeys };
    for (let i = 0; i < clean.length && i < currentExam.totalQuestions; i++) {
      newKeys[i + 1] = clean[i] as OptionLetter;
    }
    setCurrentExam((prev) => ({ ...prev, answerKeys: newKeys }));
    setQuickPasteText('');
  };

  const handleSave = () => {
    onSaveExam(currentExam);
    onSelectExam(currentExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Kelola Kunci Jawaban & Ujian
              </h3>
              <p className="text-xs text-slate-400">
                Atur format soal, jumlah butir, opsi pilihan (A-D / A-E), dan kunci jawaban
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

        {/* Tab Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('EDIT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'EDIT'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Edit Kunci Ujian Aktif
          </button>
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'LIST'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Daftar Bank Ujian ({exams.length})
          </button>
        </div>

        {activeTab === 'LIST' ? (
          <div className="flex flex-col gap-3">
            {exams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => {
                  setCurrentExam(exam);
                  onSelectExam(exam);
                  setActiveTab('EDIT');
                }}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  activeExam.id === exam.id
                    ? 'bg-cyan-950/40 border-cyan-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-white">{exam.name}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Mapel: <strong className="text-slate-200">{exam.subject}</strong></span>
                    <span>Kelas: <strong className="text-slate-200">{exam.className}</strong></span>
                    <span>{exam.totalQuestions} Soal ({exam.optionCount === 4 ? 'A-D' : 'A-E'})</span>
                    <span>KKM: <strong className="text-emerald-400">{exam.passingGrade}</strong></span>
                  </div>
                </div>

                {activeExam.id === exam.id && (
                  <span className="px-2 py-1 bg-emerald-950 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-800/50">
                    Aktif
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Exam Meta Config Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block mb-1">
                  Nama Ujian
                </label>
                <input
                  type="text"
                  value={currentExam.name}
                  onChange={(e) => setCurrentExam({ ...currentExam, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block mb-1">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={currentExam.subject}
                  onChange={(e) => setCurrentExam({ ...currentExam, subject: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block mb-1">
                  Kelas & Passing Grade (KKM)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentExam.className}
                    onChange={(e) => setCurrentExam({ ...currentExam, className: e.target.value })}
                    placeholder="Kelas"
                    className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    value={currentExam.passingGrade}
                    onChange={(e) => setCurrentExam({ ...currentExam, passingGrade: Number(e.target.value) })}
                    placeholder="KKM"
                    className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Questions Format & Quick Paste */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                Input Cepat Kunci (Quick Paste):
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: ACBDCBADE... (masukkan deretan huruf kunci)"
                  value={quickPasteText}
                  onChange={(e) => setQuickPasteText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleQuickPaste}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-cyan-600/30"
                >
                  Terapkan
                </button>
              </div>
            </div>

            {/* Matrix of Answer Keys (1 to totalQuestions) */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                Daftar Kunci ({currentExam.totalQuestions} Butir Soal):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
                {Array.from({ length: currentExam.totalQuestions }, (_, i) => i + 1).map((qNum) => {
                  const keyVal = currentExam.answerKeys[qNum] || 'A';
                  return (
                    <div
                      key={qNum}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800"
                    >
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{qNum}
                      </span>
                      <div className="flex gap-1">
                        {options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleKeyChange(qNum, opt)}
                            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono transition ${
                              keyVal === opt
                                ? 'bg-cyan-500 text-slate-950 ring-1 ring-cyan-300'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/30"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
