import React, { useState } from 'react';
import { 
  History, 
  X, 
  Search, 
  FileSpreadsheet, 
  Trash2, 
  Eye, 
  Award, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { ScanResultRecord } from '../types';
import { exportBatchRecapToExcel, exportSingleResultToPDF } from '../services/exportService';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScanResultRecord[];
  onSelectResult: (res: ScanResultRecord) => void;
  onClearHistory: () => void;
  onDeleteRecord: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onClearHistory,
  onDeleteRecord,
}) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');

  const filteredHistory = history.filter((item) => 
    item.student.name.toLowerCase().includes(search.toLowerCase()) ||
    item.student.nisn.includes(search) ||
    item.student.className.toLowerCase().includes(search.toLowerCase()) ||
    item.examName.toLowerCase().includes(search.toLowerCase())
  );

  // Compute Class Analytics
  const totalScans = history.length;
  const totalScores = history.reduce((sum, h) => sum + h.metrics.score, 0);
  const avgScore = totalScans > 0 ? (totalScores / totalScans).toFixed(1) : '0';
  const highestScore = totalScans > 0 ? Math.max(...history.map((h) => h.metrics.score)) : 0;
  const lowestScore = totalScans > 0 ? Math.min(...history.map((h) => h.metrics.score)) : 0;
  const passingCount = history.filter((h) => h.metrics.score >= (h.template?.passingGrade || 75)).length;

  const handleExportClassExcel = () => {
    if (history.length === 0) return;
    const examName = history[0].examName || 'PTS';
    const className = history[0].student.className || 'IX-B';
    exportBatchRecapToExcel(history, examName, className);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Riwayat Pindai & Rekap Nilai Siswa
              </h3>
              <p className="text-xs text-slate-400">
                Data hasil koreksi otomatis yang telah disimpan
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

        {/* Class Analytics Summary Cards */}
        {totalScans > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                Total LJK Terkoreksi
              </span>
              <span className="text-2xl font-bold text-white font-mono mt-1">
                {totalScans} <span className="text-xs font-normal text-slate-400">Siswa</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                Rata-rata Kelas
              </span>
              <span className="text-2xl font-bold text-cyan-400 font-mono mt-1">
                {avgScore}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                Tertinggi / Terendah
              </span>
              <span className="text-lg font-bold text-white font-mono mt-1">
                <span className="text-emerald-400">{highestScore}</span> / <span className="text-rose-400">{lowestScore}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                Tuntas / Remedial
              </span>
              <span className="text-lg font-bold text-white font-mono mt-1">
                <span className="text-emerald-400">{passingCount}</span> / <span className="text-amber-400">{totalScans - passingCount}</span>
              </span>
            </div>
          </div>
        )}

        {/* Toolbar (Search & Export) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama siswa, NISN, kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportClassExcel}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700/20 hover:bg-emerald-700/30 text-emerald-300 border border-emerald-600/40 rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Rekap Excel</span>
            </button>

            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 rounded-xl text-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua</span>
              </button>
            )}
          </div>
        </div>

        {/* Records Table */}
        <div className="w-full bg-slate-900/70 border border-slate-800 rounded-xl overflow-x-auto">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <History className="w-8 h-8 text-slate-600" />
              <span>Belum ada riwayat hasil scan yang tersimpan.</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">No</th>
                  <th className="px-3 py-2.5">Nama Siswa</th>
                  <th className="px-3 py-2.5">NISN / Kelas</th>
                  <th className="px-3 py-2.5">Mata Pelajaran</th>
                  <th className="px-3 py-2.5 text-center">B / S / K</th>
                  <th className="px-3 py-2.5 text-center">Nilai</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredHistory.map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-3 py-2.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-white">{rec.student.name}</td>
                    <td className="px-3 py-2.5 text-slate-400 font-mono">
                      {rec.student.nisn} <span className="text-slate-500">• {rec.student.className}</span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-300">{rec.student.subject}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-[11px]">
                      <span className="text-emerald-400 font-bold">{rec.metrics.correct}</span> /{' '}
                      <span className="text-rose-400">{rec.metrics.wrong}</span> /{' '}
                      <span className="text-amber-400">{rec.metrics.empty}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-sm text-cyan-300">
                      {rec.metrics.score}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.metrics.score >= (rec.template?.passingGrade || 75)
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-800/40'
                      }`}>
                        {rec.metrics.qualitativeGrade}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            onSelectResult(rec);
                            onClose();
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 transition"
                          title="Buka Lembar Hasil"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => exportSingleResultToPDF(rec)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 transition"
                          title="Download PDF"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRecord(rec.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
