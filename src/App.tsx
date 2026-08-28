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
import { SourcePickerModal } from './components/SourcePickerModal';

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
  const [currentStep, setCurrentStep] = useState<ScanStep>(3);
  const [exams, setExams] = useState<Exam[]>(PRESET_EXAMS);
  const [activeExam, setActiveExam] = useState<Exam>(PRESET_EXAMS[0]);
  const [student, setStudent] = useState<StudentInfo>(SAMPLE_STUDENT_ANDI);

  // Question & Scoring States
  const [answers, setAnswers] = useState<QuestionResult[]>(() =>
    getMockupQuestionAnswers(PRESET_EXAMS[0].answerKeys)
  );
  const [essayAnswers, setEssayAnswers] = useState<EssayQuestionResult[] | undefined>(undefined);

  const [metrics, setMetrics] = useState<ScanMetrics>(() =>
    calculateScanMetrics(getMockupQuestionAnswers(PRESET_EXAMS[0].answerKeys), PRESET_EXAMS[0], 8)
  );

  // Live Scanner & Progress States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeScanningQIndex, setActiveScanningQIndex] = useState<number>(27); // Index 27 = Soal 28 matching mockup
  const [laserYPercent, setLaserYPercent] = useState<number>(56);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    currentStage: 'ANALYZING_ANSWERS',
    currentQuestionIndex: 28,
    totalQuestions: 50,
    percentage: 56,
    laserYPercent: 56,
    subStatus: 'Menganalisis tingkat kehitaman dan pola arsiran...',
    detectedStudent: SAMPLE_STUDENT_ANDI,
  });

  // Modals & Overlays
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSourcePickerOpen, setIsSourcePickerOpen] = useState(false);
  const [isAnswerKeyOpen, setIsAnswerKeyOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBatchScanOpen, setIsBatchScanOpen] = useState(false);
  const [isTemplateGenOpen, setIsTemplateGenOpen] = useState(false);
  const [reviewingQuestionNum, setReviewingQuestionNum] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

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
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto px-3 lg:px-6 py-3 flex flex-col gap-3">
        {/* Glowing 4-Step Stepper */}
        <Stepper
          currentStep={currentStep}
          onStepClick={(step) => {
            if (!isScanning) setCurrentStep(step);
          }}
        />

        {/* Top Split Layout: Left Viewer + Right Analysis Panel */}
        <div className="flex-[2] min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Left Column: LJK Sheet Interactive Viewport (7 Cols) */}
          <div className="lg:col-span-7 w-full min-h-0 flex flex-col">
            <LJKCanvasViewer
              student={student}
              exam={activeExam}
              answers={answers}
              activeScanningQIndex={activeScanningQIndex}
              laserYPercent={laserYPercent}
              isScanning={isScanning}
              onUploadClick={() => document.getElementById('ljk-file-upload-input')?.click()}
              onCameraClick={() => setIsCameraOpen(true)}
              onLoadPreset={handleLoadPreset}
              onQuestionClick={(qNum) => setReviewingQuestionNum(qNum)}
              customImage={customImage}
            />
          </div>

          {/* Right Column: Realtime Analysis Panel (5 Cols) */}
          <div className="lg:col-span-5 w-full min-h-0 flex flex-col">
            <AnalysisPanel
              progress={analysisProgress}
              isScanning={isScanning}
              student={student}
              exam={activeExam}
              onTriggerRescan={() => startScanFlow(student)}
            />
          </div>
        </div>

        {/* Bottom Full-Width Section: HASIL SCAN (Matching Mockup) */}
        <div className="w-full flex-[3] min-h-0">
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
            onSaveResult={handleSaveResult}
            onScanNew={() => setIsSourcePickerOpen(true)}
            onQuestionClick={(qNum) => setReviewingQuestionNum(qNum)}
            onUpdateEssayScore={handleUpdateEssayScore}
            isSaved={isSaved}
          />
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
    </div>
  );
};

export default App;
