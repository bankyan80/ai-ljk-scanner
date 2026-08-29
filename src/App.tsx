import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { LJKCanvasViewer } from './components/LJKCanvasViewer';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ResultsSection } from './components/ResultsSection';
import { ManualReviewModal } from './components/ManualReviewModal';
import { CameraModal } from './components/CameraModal';
import { AnswerKeyModal } from './components/AnswerKeyModal';
import { HistoryModal } from './components/HistoryModal';
import { BatchScanModal } from './components/BatchScanModal';
import { TemplateModal } from './components/TemplateModal';
import { SavedTemplatesModal } from './components/SavedTemplatesModal';
import { SourcePickerModal } from './components/SourcePickerModal';
import { TemplateDownloadModal } from './components/TemplateDownloadModal';
import { Camera, FileText, FileSpreadsheet, X, AlertTriangle } from 'lucide-react';

import { 
  AnalysisProgress, 
  EssayQuestionResult,
  Exam, 
  OptionLetter, 
  QuestionResult, 
  ScanMetrics, 
  ScanResultRecord, 
  ScanStep, 
  StudentInfo 
} from './types';

import { 
  PRESET_EXAMS, 
  PRESET_TEMPLATES, 
  SAMPLE_STUDENT_ANDI, 
  SAMPLE_STUDENT_ESSAY_ANSWERS,
  getMockupQuestionAnswers 
} from './data/sampleLJKs';

import { calculateScanMetrics, runRealtimeCVScan } from './services/imageProcessing';
import { exportSingleResultToExcel, exportSingleResultToPDF } from './services/exportService';

export const App: React.FC = () => {
  // Global States
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<ScanStep>(1);
  const [exams, setExams] = useState<Exam[]>(PRESET_EXAMS);
  const [activeExam, setActiveExam] = useState<Exam>(PRESET_EXAMS[0]);
  const [student, setStudent] = useState<StudentInfo>({ name: '', nisn: '', className: '', subject: '' });

  // Question & Scoring States
  const [answers, setAnswers] = useState<QuestionResult[]>([]);
  const [essayAnswers, setEssayAnswers] = useState<EssayQuestionResult[] | undefined>(undefined);

  const [metrics, setMetrics] = useState<ScanMetrics>(() => ({
    totalQuestions: PRESET_EXAMS[0].totalQuestions,
    correct: 0,
    wrong: 0,
    empty: 0,
    multiple: 0,
    score: 0,
    accuracyPercent: 0,
    qualitativeGrade: 'Perlu Remedial',
    processTimeSeconds: 0,
    averageConfidence: 0,
  }));

  // Live Scanner & Progress States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeScanningQIndex, setActiveScanningQIndex] = useState<number>(-1);
  const [laserYPercent, setLaserYPercent] = useState<number>(0);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    currentStage: 'DETECTING_SHEET',
    currentQuestionIndex: 0,
    totalQuestions: PRESET_EXAMS[0].totalQuestions,
    percentage: 0,
    laserYPercent: 0,
    subStatus: 'Menunggu pemindaian baru...',
  });

  // Modals & Overlays
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSourcePickerOpen, setIsSourcePickerOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isAnswerKeyOpen, setIsAnswerKeyOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBatchScanOpen, setIsBatchScanOpen] = useState(false);
  const [isTemplateGenOpen, setIsTemplateGenOpen] = useState(false);
  const [isSavedTemplatesOpen, setIsSavedTemplatesOpen] = useState(false);
  const [isTemplateDownloadOpen, setIsTemplateDownloadOpen] = useState(false);
  const [reviewingQuestionNum, setReviewingQuestionNum] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'normal' | 'detail' | 'demo'>('demo');

  // History Records Repository
  const [history, setHistory] = useState<ScanResultRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ai_ljk_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default initial saved record matching Andi Pratama
    return [
      {
        id: 'rec-andi-01',
        examId: PRESET_EXAMS[0].id,
        examName: PRESET_EXAMS[0].name,
        student: SAMPLE_STUDENT_ANDI,
        template: PRESET_TEMPLATES[0],
        metrics: calculateScanMetrics(getMockupQuestionAnswers(PRESET_EXAMS[0].answerKeys), PRESET_EXAMS[0], 8),
        answers: getMockupQuestionAnswers(PRESET_EXAMS[0].answerKeys),
        scannedAt: '2026-08-27T08:15:00Z',
        status: 'VERIFIED',
      },
    ];
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_ljk_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  // Execute Realtime Scan Pipeline
  const startScanFlow = async (
    targetStudent: StudentInfo = student,
    imageSrc?: string
  ) => {
    setIsScanning(true);
    setIsSaved(false);
    setCurrentStep(2);

    try {
      const scanResult = await runRealtimeCVScan(
        imageSrc || '',
        activeExam,
        targetStudent,
        (p) => {
          setLaserYPercent(p.laserY);
          setActiveScanningQIndex(p.currentQuestion - 1);
          setAnalysisProgress({
            currentStage: p.stage,
            currentQuestionIndex: p.currentQuestion,
            totalQuestions: p.totalQuestions,
            percentage: p.percentage,
            laserYPercent: p.laserY,
            subStatus: p.subText,
            detectedStudent: targetStudent,
          });

          if (p.partialAnswers) {
            setAnswers(p.partialAnswers);
          }

          if (p.percentage > 30 && p.percentage < 90) {
            setCurrentStep(3);
          }
        }
      );

      setAnswers(scanResult.answers);
      setEssayAnswers(scanResult.essayAnswers);
      setMetrics(scanResult.metrics);
      setStudent(scanResult.student);
      setCurrentStep(4);
      setIsScanning(false);
      setActiveScanningQIndex(-1);

      // Celebration Confetti for high score
      if (scanResult.metrics.score >= 80) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00f0ff', '#10b981', '#6366f1'],
        });
      }
    } catch (err) {
      console.error('Scan error:', err);
      setIsScanning(false);
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan saat memindai LJK.');
    }
  };

  // Upload Custom File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImage(dataUrl);
      startScanFlow(student, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Camera Capture Handler
  const handleCameraCapture = (dataUrl: string) => {
    setCustomImage(dataUrl);
    startScanFlow(student, dataUrl);
  };

  // Preset Template Loader
  const handleLoadPreset = (presetId: string) => {
    setCustomImage(null);
    if (presetId === 'tpl-hybrid-25pg-5essay') {
      const hybridExam = PRESET_EXAMS.find((e) => e.templateId === 'tpl-hybrid-25pg-5essay') || {
        id: 'exam-hybrid-25pg-5essay',
        name: 'PTS IPA & Biologi Campuran (PG + Esai)',
        subject: 'ILMU PENGETAHUAN ALAM',
        className: 'VIII - A',
        totalQuestions: 25,
        optionCount: 4,
        templateId: 'tpl-hybrid-25pg-5essay',
        passingGrade: 75,
        hasEssaySection: true,
        essayQuestionsCount: 5,
        answerKeys: {
          1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A',
          6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B',
          11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C',
          16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D',
          21: 'A', 22: 'B', 23: 'C', 24: 'D', 25: 'A',
        },
        createdAt: new Date().toISOString(),
      };
      setActiveExam(hybridExam);
      const hybridStudent: StudentInfo = {
        name: 'DIAN SAPUTRA',
        nisn: '2026112501',
        className: 'VIII - A',
        subject: 'IPA (PG + ESAI HTR)',
        schoolName: 'SMP NEGERI 1 NUSANTARA',
      };
      setStudent(hybridStudent);
      setEssayAnswers([...SAMPLE_STUDENT_ESSAY_ANSWERS]);
      startScanFlow(hybridStudent);
    } else if (presetId === 'tpl-sd-40-ad') {
      const sdExam = PRESET_EXAMS[1];
      setActiveExam(sdExam);
      const sdStudent: StudentInfo = {
        name: 'SITI NURHALIZA',
        nisn: '2026114002',
        className: 'VI - A',
        subject: 'IPA TERPADU',
      };
      setStudent(sdStudent);
      setEssayAnswers(undefined);
      startScanFlow(sdStudent);
    } else if (presetId === 'tpl-block-30-ad') {
      const blockExam: Exam = {
        id: 'exam-block-30',
        name: 'Ulangan Harian Model Kotak',
        subject: 'BAHASA INDONESIA',
        className: 'VIII - C',
        totalQuestions: 30,
        optionCount: 4,
        templateId: 'tpl-block-30-ad',
        passingGrade: 75,
        answerKeys: {
          1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A',
          6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B',
          11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C',
          16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D',
          21: 'A', 22: 'B', 23: 'C', 24: 'D', 25: 'A',
          26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B',
        },
        createdAt: new Date().toISOString(),
      };
      setActiveExam(blockExam);
      const blockStudent: StudentInfo = {
        name: 'BUDI SANTOSO',
        nisn: '2026113009',
        className: 'VIII - C',
        subject: 'B. INDONESIA',
      };
      setStudent(blockStudent);
      setEssayAnswers(undefined);
      startScanFlow(blockStudent);
    } else {
      setActiveExam(PRESET_EXAMS[0]);
      setStudent(SAMPLE_STUDENT_ANDI);
      setEssayAnswers(undefined);
      startScanFlow(SAMPLE_STUDENT_ANDI);
    }
  };

  // Manual Review / Override Handler for Multiple Choice
  const handleUpdateAnswer = (qNum: number, newAnswer: string) => {
    const updatedAnswers = answers.map((ans) => {
      if (ans.questionNumber === qNum) {
        let newStatus: 'CORRECT' | 'WRONG' | 'EMPTY' | 'MULTIPLE' | 'REVIEW' = 'WRONG';
        if (newAnswer === ans.correctAnswer) {
          newStatus = 'CORRECT';
        } else if (newAnswer === '-') {
          newStatus = 'EMPTY';
        } else if (newAnswer.includes(' ')) {
          newStatus = 'MULTIPLE';
        }

        const updatedOptions = ans.options.map((opt) => ({
          ...opt,
          isFilled: newAnswer.includes(opt.option),
          density: newAnswer.includes(opt.option) ? 95 : 8,
        }));

        return {
          ...ans,
          studentAnswer: newAnswer,
          status: newStatus,
          isManualOverride: true,
          options: updatedOptions,
        };
      }
      return ans;
    });

    setAnswers(updatedAnswers);
    setMetrics(calculateScanMetrics(updatedAnswers, activeExam, metrics.processTimeSeconds, essayAnswers));
  };

  // Manual Review / Override Handler for Essay Score
  const handleUpdateEssayScore = (qNum: number, newScore: number, feedback?: string) => {
    if (!essayAnswers) return;
    const updatedEssays = essayAnswers.map((eq) => {
      if (eq.questionNumber === qNum) {
        return {
          ...eq,
          earnedScore: Math.max(0, Math.min(eq.maxScore, newScore)),
          teacherFeedback: feedback !== undefined ? feedback : eq.teacherFeedback,
        };
      }
      return eq;
    });

    setEssayAnswers(updatedEssays);
    setMetrics(calculateScanMetrics(answers, activeExam, metrics.processTimeSeconds, updatedEssays));
  };

  // Save Scan Result to History
  const handleSaveResult = () => {
    const newRecord: ScanResultRecord = {
      id: `rec-${Date.now()}`,
      examId: activeExam.id,
      examName: activeExam.name,
      student,
      template: {
        id: activeExam.templateId,
        name: activeExam.name,
        description: '',
        modelType: activeExam.hasEssaySection ? 'HYBRID_PG_ESSAY' : 'STANDARD_BUBBLE_SHEET',
        totalQuestions: activeExam.totalQuestions,
        optionCount: activeExam.optionCount,
        columnsCount: activeExam.hasEssaySection ? 2 : 3,
        passingGrade: activeExam.passingGrade,
        hasEssaySection: activeExam.hasEssaySection,
        essayQuestionsCount: activeExam.essayQuestionsCount,
      },
      metrics,
      answers,
      essayAnswers,
      scannedAt: new Date().toISOString(),
      status: 'VERIFIED',
    };

    setHistory((prev) => [newRecord, ...prev]);
    setIsSaved(true);
  };

  const reviewingQuestion = reviewingQuestionNum
    ? answers.find((a) => a.questionNumber === reviewingQuestionNum) || null
    : null;

  return (
    <div className={`h-screen overflow-hidden flex flex-col ${darkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-100 text-slate-900'} transition-colors font-sans antialiased selection:bg-cyan-500 selection:text-white`}>
      {/* Hidden File Input for Image Upload */}
      <input
        id="ljk-file-upload-input"
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeExam={activeExam}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAnswerKeys={() => setIsAnswerKeyOpen(true)}
        onOpenBatchScan={() => setIsBatchScanOpen(true)}
        onOpenTemplateGen={() => setIsTemplateGenOpen(true)}
        onOpenSavedTemplates={() => setIsSavedTemplatesOpen(true)}
        onOpenTemplateDownload={() => setIsTemplateDownloadOpen(true)}
        historyCount={history.length}
      />

      {/* Error Banner (e.g. CV ringan menolak gambar kosong/rusak) */}
      {isScanning && errorMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 max-w-lg w-[92%] px-4 py-3 rounded-xl bg-rose-950/90 border border-rose-600/50 text-rose-200 text-xs shadow-2xl shadow-rose-900/40 animate-in slide-in-from-top duration-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => { setErrorMessage(null); setIsScanning(false); }}
            className="p-1 rounded-md text-rose-300 hover:text-white hover:bg-rose-900/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto px-3 lg:px-6 py-3 flex flex-col gap-3">
        {/* Glowing 4-Step Stepper */}
        <Stepper
          currentStep={currentStep}
          onStepClick={(step) => {
            if (!isScanning) setCurrentStep(step);
          }}
        />

        {/* Two-Column Body: Left Visual + Right Control Panel (single screen) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Left: LJK Sheet Interactive Viewport (large visual) */}
          <div className="lg:col-span-8 w-full min-h-0 flex flex-col">
            <LJKCanvasViewer
              student={student}
              exam={activeExam}
              answers={answers}
              activeScanningQIndex={activeScanningQIndex}
              laserYPercent={laserYPercent}
              isScanning={isScanning}
              mode={scanMode}
              onModeChange={setScanMode}
              onUploadClick={() => document.getElementById('ljk-file-upload-input')?.click()}
              onCameraClick={() => setIsCameraOpen(true)}
              onLoadPreset={handleLoadPreset}
              onQuestionClick={(qNum) => setReviewingQuestionNum(qNum)}
              customImage={customImage}
            />
          </div>

          {/* Right: Control Panel with Analysis + Score Summary + Actions */}
          <div className="lg:col-span-4 w-full min-h-0 flex flex-col gap-3">
            {/* Source switchers (upload / camera) */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => setIsSourcePickerOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-500/25 ring-1 ring-cyan-400/40"
              >
                <Camera className="w-4 h-4" />
                <span>Scan LJK Baru</span>
              </button>
            </div>

            {/* Realtime Analysis Panel */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <AnalysisPanel
                progress={analysisProgress}
                isScanning={isScanning}
                student={student}
                exam={activeExam}
                onTriggerRescan={() => startScanFlow(student)}
              />
            </div>

            {/* Score Summary + Actions */}
            <div className="shrink-0 w-full rounded-2xl bg-slate-950/90 border border-slate-800/80 p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-14 h-14 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center bg-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <span className="text-lg font-extrabold text-white font-mono leading-none">{metrics.score}</span>
                    <span className="text-[8px] text-emerald-400 font-mono font-bold">{metrics.qualitativeGrade}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-[11px]">
                    <span className="font-bold text-white">{student.name}</span>
                    <span className="text-slate-400">{student.className} • {student.subject}</span>
                    <div className="flex items-center gap-2.5 font-mono font-bold">
                      <span className="text-emerald-400">✓ {metrics.correct}</span>
                      <span className="text-rose-400">✗ {metrics.wrong}</span>
                      <span className="text-amber-400">○ {metrics.empty}</span>
                    </div>
                    {answers.filter((a) => a.status === 'REVIEW' || a.flaggedForReview || a.confidence < 60).length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-300 mt-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        {answers.filter((a) => a.status === 'REVIEW' || a.flaggedForReview || a.confidence < 60).length} soal perlu review
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setIsResultsOpen(true)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[11px] font-bold transition shadow-md shadow-cyan-600/25"
                  >
                    Lihat Detail
                  </button>
                  <button
                    onClick={handleSaveResult}
                    disabled={isSaved}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                      isSaved
                        ? 'bg-emerald-700/30 text-emerald-300 border border-emerald-600/40'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25'
                    }`}
                  >
                    {isSaved ? '✓ Tersimpan' : 'Simpan'}
                  </button>
                </div>
              </div>

              {/* Export actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    exportSingleResultToPDF({
                      id: 'current',
                      examId: activeExam.id,
                      examName: activeExam.name,
                      student,
                      template: {
                        id: activeExam.templateId,
                        name: activeExam.name,
                        description: '',
                        modelType: activeExam.hasEssaySection ? 'HYBRID_PG_ESSAY' : 'STANDARD_BUBBLE_SHEET',
                        totalQuestions: activeExam.totalQuestions,
                        optionCount: activeExam.optionCount,
                        columnsCount: activeExam.hasEssaySection ? 2 : 3,
                        passingGrade: activeExam.passingGrade,
                      },
                      metrics,
                      answers,
                      essayAnswers,
                      scannedAt: new Date().toISOString(),
                      status: 'VERIFIED',
                    });
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-[11px] font-semibold transition"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={() => {
                    exportSingleResultToExcel({
                      id: 'current',
                      examId: activeExam.id,
                      examName: activeExam.name,
                      student,
                      template: {
                        id: activeExam.templateId,
                        name: activeExam.name,
                        description: '',
                        modelType: activeExam.hasEssaySection ? 'HYBRID_PG_ESSAY' : 'STANDARD_BUBBLE_SHEET',
                        totalQuestions: activeExam.totalQuestions,
                        optionCount: activeExam.optionCount,
                        columnsCount: activeExam.hasEssaySection ? 2 : 3,
                        passingGrade: activeExam.passingGrade,
                      },
                      metrics,
                      answers,
                      essayAnswers,
                      scannedAt: new Date().toISOString(),
                      status: 'VERIFIED',
                    });
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-[11px] font-semibold transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Manual Answer Review / Verification Modal */}
      <ManualReviewModal
        isOpen={reviewingQuestionNum !== null}
        question={reviewingQuestion}
        onClose={() => setReviewingQuestionNum(null)}
        onUpdateAnswer={handleUpdateAnswer}
        optionCount={activeExam.optionCount}
      />

      {/* Camera Live Scanner Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Scan Source Picker Modal */}
      <SourcePickerModal
        isOpen={isSourcePickerOpen}
        onClose={() => setIsSourcePickerOpen(false)}
        onUpload={() => document.getElementById('ljk-file-upload-input')?.click()}
        onCamera={() => setIsCameraOpen(true)}
      />

      {/* Detailed Results Modal */}
      {isResultsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl h-[90vh] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">Detail Hasil Scan</h3>
                  <p className="text-xs text-slate-400">{student.name} ({student.nisn})</p>
                </div>
              </div>
              <button
                onClick={() => setIsResultsOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Scrollable Results Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <ResultsSection
                metrics={metrics}
                answers={answers}
                essayAnswers={essayAnswers}
                student={student}
                onExportPDF={() => {
                  exportSingleResultToPDF({
                    id: 'current',
                    examId: activeExam.id,
                    examName: activeExam.name,
                    student,
                    template: {
                      id: activeExam.templateId,
                      name: activeExam.name,
                      description: '',
                      modelType: activeExam.hasEssaySection ? 'HYBRID_PG_ESSAY' : 'STANDARD_BUBBLE_SHEET',
                      totalQuestions: activeExam.totalQuestions,
                      optionCount: activeExam.optionCount,
                      columnsCount: activeExam.hasEssaySection ? 2 : 3,
                      passingGrade: activeExam.passingGrade,
                    },
                    metrics,
                    answers,
                    essayAnswers,
                    scannedAt: new Date().toISOString(),
                    status: 'VERIFIED',
                  });
                }}
                onExportExcel={() => {
                  exportSingleResultToExcel({
                    id: 'current',
                    examId: activeExam.id,
                    examName: activeExam.name,
                    student,
                    template: {
                      id: activeExam.templateId,
                      name: activeExam.name,
                      description: '',
                      modelType: activeExam.hasEssaySection ? 'HYBRID_PG_ESSAY' : 'STANDARD_BUBBLE_SHEET',
                      totalQuestions: activeExam.totalQuestions,
                      optionCount: activeExam.optionCount,
                      columnsCount: activeExam.hasEssaySection ? 2 : 3,
                      passingGrade: activeExam.passingGrade,
                    },
                    metrics,
                    answers,
                    essayAnswers,
                    scannedAt: new Date().toISOString(),
                    status: 'VERIFIED',
                  });
                }}
                onSaveResult={() => {
                  handleSaveResult();
                  setIsResultsOpen(false);
                }}
                onScanNew={() => {
                  setIsResultsOpen(false);
                  setIsSourcePickerOpen(true);
                }}
                onQuestionClick={(qNum) => setReviewingQuestionNum(qNum)}
                onUpdateEssayScore={handleUpdateEssayScore}
                isSaved={isSaved}
              />
            </div>
          </div>
        </div>
      )}

      {/* Answer Key & Exam Builder Modal */}
      <AnswerKeyModal
        isOpen={isAnswerKeyOpen}
        onClose={() => setIsAnswerKeyOpen(false)}
        exams={exams}
        activeExam={activeExam}
        onSelectExam={(e) => {
          setActiveExam(e);
          setAnswers(getMockupQuestionAnswers(e.answerKeys));
          setMetrics(calculateScanMetrics(getMockupQuestionAnswers(e.answerKeys), e, 8));
        }}
        onSaveExam={(e) => {
          setExams((prev) => prev.map((x) => (x.id === e.id ? e : x)));
          setActiveExam(e);
        }}
      />

      {/* History & Class Recap Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectResult={(rec) => {
          setStudent(rec.student);
          setAnswers(rec.answers);
          setMetrics(rec.metrics);
        }}
        onClearHistory={() => setHistory([])}
        onDeleteRecord={(id) => setHistory((prev) => prev.filter((r) => r.id !== id))}
      />

      {/* Batch Scan Modal */}
      <BatchScanModal
        isOpen={isBatchScanOpen}
        onClose={() => setIsBatchScanOpen(false)}
        exam={activeExam}
        onBatchCompleted={(results) => {
          setHistory((prev) => [...results, ...prev]);
        }}
      />

      {/* Printable Blank LJK Generator Modal */}
      <TemplateModal
        isOpen={isTemplateGenOpen}
        onClose={() => setIsTemplateGenOpen(false)}
      />

      {/* Saved Auto Templates Manager Modal */}
      <SavedTemplatesModal
        isOpen={isSavedTemplatesOpen}
        onClose={() => setIsSavedTemplatesOpen(false)}
      />

      {/* Download Custom LJK Template Modal */}
      <TemplateDownloadModal
        isOpen={isTemplateDownloadOpen}
        onClose={() => setIsTemplateDownloadOpen(false)}
      />
    </div>
  );
};

export default App;
