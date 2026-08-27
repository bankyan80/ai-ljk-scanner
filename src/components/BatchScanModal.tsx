import React, { useState } from 'react';
import { Layers, X, Upload, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet, Play } from 'lucide-react';
import { BatchItem, Exam, ScanResultRecord, StudentInfo } from '../types';
import { getMockupQuestionAnswers } from '../data/sampleLJKs';
import { calculateScanMetrics } from '../services/imageProcessing';
import { exportBatchRecapToExcel } from '../services/exportService';

interface BatchScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
  onBatchCompleted: (results: ScanResultRecord[]) => void;
}

export const BatchScanModal: React.FC<BatchScanModalProps> = ({
  isOpen,
  onClose,
  exam,
  onBatchCompleted,
}) => {
  if (!isOpen) return null;

  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedResults, setCompletedResults] = useState<ScanResultRecord[]>([]);

  // Pre-seed sample batch items if queue empty
  const handleLoadSampleBatch = () => {
    const sampleStudents = [
      { name: 'ANDI PRATAMA', nisn: '1234567890', className: exam.className, score: 84 },
      { name: 'BELLA SAFITRI', nisn: '1234567891', className: exam.className, score: 92 },
      { name: 'CITRA LESTARI', nisn: '1234567892', className: exam.className, score: 78 },
      { name: 'DIMAS SETIAWAN', nisn: '1234567893', className: exam.className, score: 88 },
      { name: 'EKA FEBRIANTI', nisn: '1234567894', className: exam.className, score: 68 },
      { name: 'FAJAR NUGROHO', nisn: '1234567895', className: exam.className, score: 96 },
    ];

    const items: BatchItem[] = sampleStudents.map((st, i) => ({
      id: `batch-${i + 1}`,
      fileName: `LJK_${st.name.replace(/\s+/g, '_')}.jpg`,
      fileSize: '1.4 MB',
      imageUrl: '',
      status: 'QUEUED',
      progress: 0,
    }));

    setQueue(items);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];

    const newItems: BatchItem[] = files.map((file, i) => ({
      id: `batch-${Date.now()}-${i}`,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      imageUrl: URL.createObjectURL(file),
      status: 'QUEUED',
      progress: 0,
    }));

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleStartBatchProcessing = async () => {
    if (queue.length === 0 || isProcessing) return;
    setIsProcessing(true);
    const results: ScanResultRecord[] = [];

    const sampleNames = [
      'ANDI PRATAMA', 'BELLA SAFITRI', 'CITRA LESTARI', 
      'DIMAS SETIAWAN', 'EKA FEBRIANTI', 'FAJAR NUGROHO',
      'GILANG RAMADHAN', 'HANIFAH PUTRI', 'IQBAL MAULANA'
    ];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];

      // Update status to processing
      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'PROCESSING', progress: 30 } : q))
      );

      await new Promise((r) => setTimeout(r, 400));

      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, progress: 75 } : q))
      );

      await new Promise((r) => setTimeout(r, 400));

      const studentName = sampleNames[i % sampleNames.length];
      const student: StudentInfo = {
        name: studentName,
        nisn: `123456789${i}`,
        className: exam.className,
        subject: exam.subject,
      };

      const answers = getMockupQuestionAnswers(exam.answerKeys);
      const metrics = calculateScanMetrics(answers, exam, 3);

      const record: ScanResultRecord = {
        id: `rec-batch-${Date.now()}-${i}`,
        examId: exam.id,
        examName: exam.name,
        student,
        template: {
          id: exam.templateId,
          name: exam.name,
          description: '',
          modelType: 'STANDARD_BUBBLE_SHEET',
          totalQuestions: exam.totalQuestions,
          optionCount: exam.optionCount,
          columnsCount: 3,
          passingGrade: exam.passingGrade,
        },
        metrics,
        answers,
        scannedAt: new Date().toISOString(),
        status: 'VERIFIED',
      };

      results.push(record);

      setQueue((prev) =>
        prev.map((q, idx) =>
          idx === i ? { ...q, status: 'COMPLETED', progress: 100, result: record } : q
        )
      );
    }

    setIsProcessing(false);
    setCompletedResults(results);
    onBatchCompleted(results);
  };

  const handleExportBatchExcel = () => {
    if (completedResults.length === 0) return;
    exportBatchRecapToExcel(completedResults, exam.name, exam.className);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Batch Scanner (Koreksi Massal Kelas)
              </h3>
              <p className="text-xs text-slate-400">
                Pindai dan proses puluhan LJK siswa secara otomatis dalam satu antrean
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

        {/* Upload Zone & Quick Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/30">
              <Upload className="w-4 h-4" />
              <span>Upload Gambar LJK (Multi)</span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleLoadSampleBatch}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Muat Contoh 1 Kelas (6 Siswa)
            </button>
          </div>

          {queue.length > 0 && (
            <button
              onClick={handleStartBatchProcessing}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/30 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isProcessing ? 'Memproses Batch...' : 'Mulai Koreksi Otomatis'}</span>
            </button>
          )}
        </div>

        {/* Batch Queue List */}
        <div className="w-full bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
          {queue.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <Layers className="w-8 h-8 text-slate-600" />
              <span>Antrean kosong. Upload beberapa file foto LJK atau muat contoh kelas.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
              {queue.map((item, idx) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 font-bold w-6">#{idx + 1}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200">{item.fileName}</span>
                      <span className="text-[10px] text-slate-500">{item.fileSize}</span>
                    </div>
                  </div>

                  {/* Status & Results */}
                  <div className="flex items-center gap-3">
                    {item.status === 'QUEUED' && (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">
                        Menunggu
                      </span>
                    )}
                    {item.status === 'PROCESSING' && (
                      <span className="flex items-center gap-1 text-cyan-400 font-mono text-[11px]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Memproses ({item.progress}%)
                      </span>
                    )}
                    {item.status === 'COMPLETED' && item.result && (
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-300 font-bold">{item.result.student.name}</span>
                        <span className="text-emerald-400 font-extrabold text-sm">
                          Nilai: {item.result.metrics.score}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Recap Bar */}
        {completedResults.length > 0 && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs">
            <span className="text-emerald-300 font-medium">
              ✓ Berhasil memproses <strong>{completedResults.length}</strong> LJK siswa.
            </span>

            <button
              onClick={handleExportBatchExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Rekap Kelas (.xlsx)</span>
            </button>
          </div>
        )}

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
