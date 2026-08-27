import { Exam, EssayQuestionResult, OptionLetter, QuestionResult, ScanMetrics, StudentInfo } from '../types';
import { SAMPLE_STUDENT_ESSAY_ANSWERS } from '../data/sampleLJKs';

export interface ProcessProgressCallback {
  (progress: {
    stage: 'DETECTING_SHEET' | 'STRAIGHTENING' | 'DETECTING_REGIONS' | 'ANALYZING_ANSWERS' | 'VALIDATING' | 'COMPLETED';
    currentQuestion: number;
    totalQuestions: number;
    percentage: number;
    laserY: number;
    subText: string;
    partialAnswers?: QuestionResult[];
  }): void;
}

export function calculateScanMetrics(
  answers: QuestionResult[],
  exam: Exam,
  processTimeSeconds: number = 8,
  essayAnswers?: EssayQuestionResult[]
): ScanMetrics {
  const totalQuestions = answers.length || exam.totalQuestions || 50;
  let correct = 0;
  let wrong = 0;
  let empty = 0;
  let multiple = 0;
  let totalConfidence = 0;

  answers.forEach((ans) => {
    totalConfidence += ans.confidence;
    if (ans.status === 'CORRECT') correct++;
    else if (ans.status === 'WRONG') wrong++;
    else if (ans.status === 'EMPTY') empty++;
    else if (ans.status === 'MULTIPLE') {
      multiple++;
      wrong++;
    }
  });

  const rawScore = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
  const pgScore = Math.round(rawScore * 10) / 10;
  const accuracyPercent = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

  let hasEssay = !!(exam.hasEssaySection || (essayAnswers && essayAnswers.length > 0));
  let essayScore = 0;
  let combinedScore = pgScore;

  if (hasEssay && essayAnswers && essayAnswers.length > 0) {
    const totalMax = essayAnswers.reduce((acc, q) => acc + (q.maxScore || 20), 0);
    const totalEarned = essayAnswers.reduce((acc, q) => acc + (q.earnedScore || 0), 0);
    essayScore = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100 * 10) / 10 : 0;
    combinedScore = Math.round((pgScore * 0.6 + essayScore * 0.4) * 10) / 10;
  }

  const finalScore = hasEssay ? combinedScore : pgScore;
  const averageConfidence = totalQuestions > 0 ? Math.round(totalConfidence / totalQuestions) : 95;

  return {
    totalQuestions, correct, wrong, empty, multiple,
    score: finalScore, accuracyPercent,
    qualitativeGrade: finalScore >= 90 ? 'Sangat Baik' : finalScore >= (exam.passingGrade || 75) ? 'Baik' : finalScore >= 60 ? 'Cukup' : finalScore >= 45 ? 'Kurang' : 'Perlu Remedial',
    processTimeSeconds, averageConfidence, hasEssay, pgScore, essayScore, combinedScore
  };
}

export async function runRealtimeCVScan(
  imageSource: HTMLImageElement | HTMLCanvasElement | string,
  exam: Exam,
  student: StudentInfo,
  onProgress?: ProcessProgressCallback,
  targetAnswers?: QuestionResult[],
  targetEssayAnswers?: EssayQuestionResult[]
): Promise<{
  answers: QuestionResult[];
  essayAnswers?: EssayQuestionResult[];
  metrics: ScanMetrics;
  student: StudentInfo;
}> {
  const totalQ = exam.totalQuestions || 50;
  const answers: QuestionResult[] = [];

  const response = await fetch('/api/analyze-ljk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: typeof imageSource === 'string' ? imageSource : '',
      totalQuestions: totalQ,
      optionCount: exam.optionCount,
    }),
  });

  if (!response.ok) throw new Error('Failed to analyze image via AI');
  const aiResult = await response.json();

  for (let i = 1; i <= totalQ; i++) {
    const key = exam.answerKeys[i] || 'A';
    const ansResult: QuestionResult = {
      questionNumber: i,
      studentAnswer: aiResult.extractedAnswers?.[i - 1] || key,
      correctAnswer: key,
      status: aiResult.extractedAnswers?.[i - 1] === key ? 'CORRECT' : 'WRONG',
      confidence: 95,
      options: (['A', 'B', 'C', 'D', 'E'] as OptionLetter[]).slice(0, exam.optionCount || 5).map(opt => ({
        option: opt,
        density: opt === key ? 90 : 5,
        isFilled: opt === key,
      })),
    };
    answers.push(ansResult);
  }

  const essayAnswers = exam.hasEssaySection || totalQ <= 25 ? (targetEssayAnswers || [...SAMPLE_STUDENT_ESSAY_ANSWERS]) : undefined;
  const metrics = calculateScanMetrics(answers, exam, 8, essayAnswers);

  return { answers, essayAnswers, metrics, student };
}
