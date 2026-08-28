export type LJKModelType = 
  | 'STANDARD_BUBBLE_SHEET'     // Model C (50 A-E) & Model D (40 A-D)
  | 'SOAL_JAWABAN_MENYATU_SD'   // Model A (SD: Soal + Pilihan langsung di bawahnya)
  | 'BLOCK_LAYOUT'              // Model B (Soal dalam blok berbingkai)
  | 'HYBRID_PG_ESSAY'           // Model E (Pilihan Ganda + Esai Tulisan Tangan)
  | 'CUSTOM_TEMPLATE';          // Model F (Custom layout)

export type QuestionStatus = 'CORRECT' | 'WRONG' | 'EMPTY' | 'MULTIPLE' | 'REVIEW';

export type OptionLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export interface OptionDensity {
  option: OptionLetter;
  density: number; // 0 - 100%
  isFilled: boolean;
  rawPixelCount?: number;
  x?: number;
  y?: number;
  radius?: number;
}

export interface QuestionResult {
  questionNumber: number;
  studentAnswer: string; // "A", "B", "C", "D", "E", "-" (Empty), "A D" (Multiple)
  correctAnswer: string;
  status: QuestionStatus;
  confidence: number; // 0 - 100%
  options: OptionDensity[];
  isManualOverride?: boolean;
  flaggedForReview?: boolean;
  aiNote?: string;
  blockCoordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface EssayQuestionResult {
  questionNumber: number;
  prompt: string;
  keyRubric: string;
  rubricKeywords: string[];
  detectedHandwritingText: string;
  confidence: number; // e.g. 92%
  matchedKeywords: string[];
  maxScore: number;
  earnedScore: number;
  teacherFeedback?: string;
  isManualOverride?: boolean;
}

export interface StudentInfo {
  name: string;
  nisn: string;
  className: string;
  subject: string;
  schoolName?: string;
  examDate?: string;
  examCode?: string;
}

export interface LJKTemplate {
  id: string;
  name: string;
  description: string;
  modelType: LJKModelType;
  totalQuestions: number;
  optionCount: number; // 4 (A-D) or 5 (A-E)
  columnsCount: number; // 2, 3, or 4 columns
  passingGrade: number; // KKM (e.g. 75)
  weightPerQuestion?: number;
  hasEssaySection?: boolean;
  essayQuestionsCount?: number;
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  className: string;
  totalQuestions: number;
  optionCount: number;
  templateId: string;
  passingGrade: number; // KKM, e.g. 75
  answerKeys: Record<number, OptionLetter>;
  questionWeights?: Record<number, number>;
  hasEssaySection?: boolean;
  essayQuestionsCount?: number;
  essayKeys?: Record<number, { prompt: string; keyRubric: string; rubricKeywords: string[]; maxScore: number }>;
  createdAt: string;
}

export interface ScanMetrics {
  totalQuestions: number;
  correct: number;
  wrong: number;
  empty: number;
  multiple: number;
  score: number; // 0 - 100 (PG score or combined score)
  accuracyPercent: number; // (correct / total) * 100
  qualitativeGrade: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' | 'Perlu Remedial';
  processTimeSeconds: number;
  averageConfidence: number;
  hasEssay?: boolean;
  pgScore?: number;
  essayScore?: number;
  combinedScore?: number;
}

export interface ScanResultRecord {
  id: string;
  examId: string;
  examName: string;
  student: StudentInfo;
  template: LJKTemplate;
  metrics: ScanMetrics;
  answers: QuestionResult[];
  essayAnswers?: EssayQuestionResult[];
  imageUrl?: string;
  scannedAt: string;
  status: 'VERIFIED' | 'NEEDS_REVIEW' | 'AUTO_SAVED';
}

export type ScanStep = 1 | 2 | 3 | 4; 
// 1: Upload, 2: Deteksi LJK, 3: Analisis Jawaban, 4: Hasil

export interface AnalysisProgress {
  currentStage: 'DETECTING_SHEET' | 'STRAIGHTENING' | 'DETECTING_REGIONS' | 'ANALYZING_ANSWERS' | 'VALIDATING' | 'COMPLETED';
  currentQuestionIndex: number;
  totalQuestions: number;
  percentage: number;
  laserYPercent: number; // 0 - 100 for visual scanner beam
  subStatus: string;
  detectedStudent?: Partial<StudentInfo>;
}

// Deep Scan Animation speed presets. Only affects the visualization pacing,
// never the real scan processing pipeline.
export type ScanMode = 'normal' | 'detail' | 'demo';

export interface BatchItem {
  id: string;
  fileName: string;
  fileSize: string;
  imageUrl: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  progress: number;
  result?: ScanResultRecord;
  error?: string;
}
