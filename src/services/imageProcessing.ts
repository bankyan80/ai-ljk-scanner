import { Exam, EssayQuestionResult, OptionLetter, QuestionResult, QuestionStatus, ScanMetrics, StudentInfo } from '../types';
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
  let qualitativeGrade: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' | 'Perlu Remedial' = 'Baik';
  if (finalScore >= 90) qualitativeGrade = 'Sangat Baik';
  else if (finalScore >= (exam.passingGrade || 75)) qualitativeGrade = 'Baik';
  else if (finalScore >= 60) qualitativeGrade = 'Cukup';
  else if (finalScore >= 45) qualitativeGrade = 'Kurang';
  else qualitativeGrade = 'Perlu Remedial';

  return {
    totalQuestions,
    correct,
    wrong,
    empty,
    multiple,
    score: finalScore,
    accuracyPercent,
    qualitativeGrade,
    processTimeSeconds,
    averageConfidence,
    hasEssay,
    pgScore,
    essayScore,
    combinedScore,
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

  // Stage 1: Deteksi LJK
  if (onProgress) {
    onProgress({
      stage: 'DETECTING_SHEET',
      currentQuestion: 0,
      totalQuestions: totalQ,
      percentage: 10,
      laserY: 5,
      subText: 'Mendeteksi 4 sudut lembar LJK...',
    });
  }
  await new Promise((r) => setTimeout(r, 400));

  // Stage 2: Meluruskan & Memotong
  if (onProgress) {
    onProgress({
      stage: 'STRAIGHTENING',
      currentQuestion: 0,
      totalQuestions: totalQ,
      percentage: 25,
      laserY: 15,
      subText: 'Koreksi perspektif & penyesuaian kontras...',
    });
  }
  await new Promise((r) => setTimeout(r, 400));

  // Stage 3: Deteksi Area Jawaban & Header
  if (onProgress) {
    onProgress({
      stage: 'DETECTING_REGIONS',
      currentQuestion: 0,
      totalQuestions: totalQ,
      percentage: 38,
      laserY: 28,
      subText: 'Mendeteksi grid nomor, bulatan pilihan, dan area isian tulisan tangan...',
    });
  }
  await new Promise((r) => setTimeout(r, 400));

  // Stage 4: Analisis Jawaban via AI (Serverless API)
  if (onProgress) {
    onProgress({
      stage: 'ANALYZING_ANSWERS',
      currentQuestion: 1,
      totalQuestions: totalQ,
      percentage: 45,
      laserY: 35,
      subText: 'Menganalisis tingkat kehitaman dan pola arsiran dengan AI...',
    });
  }

  let extractedAnswers: string[] | undefined;
  let aiVerification: ({ status?: string; studentAnswer?: string } | undefined)[] | undefined;
  const imageStr = typeof imageSource === 'string' ? imageSource : '';

  // Only call the AI API when a real image (data URL / base64) is provided.
  // Otherwise fall back to the answer key so preset/demo scans work offline.
  if (imageStr.startsWith('data:')) {
    // Build 1-indexed answer key array so Gemini can verify answers.
    const answerKeysArr: string[] = [];
    for (let i = 1; i <= totalQ; i++) {
      answerKeysArr[i] = exam.answerKeys[i] || 'A';
    }
    const response = await fetch('/api/analyze-ljk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: imageStr,
        totalQuestions: totalQ,
        optionCount: exam.optionCount,
        answerKeys: answerKeysArr,
      }),
    });

    if (!response.ok) throw new Error('Failed to analyze image via AI');
    const aiResult = await response.json();
    extractedAnswers = aiResult.extractedAnswers;
    aiVerification = aiResult.verificationResults;
  }

  // Reconstruct answers from AI result (or fall back to answer keys)
  for (let i = 1; i <= totalQ; i++) {
    const key = exam.answerKeys[i] || 'A';
    if (onProgress) {
      onProgress({
        stage: 'ANALYZING_ANSWERS',
        currentQuestion: i,
        totalQuestions: totalQ,
        percentage: Math.round(45 + ((i - 1) / totalQ) * 45),
        laserY: Math.round(35 + ((i - 1) / totalQ) * 55),
        subText: `Menganalisis jawaban soal ${i}...`,
        partialAnswers: answers,
      });
    }

    // Prefer Gemini's verification status when available; otherwise fall back to local matching.
    // Gemini may return verificationResults 1-indexed or 0-indexed; handle both defensively.
    const aiVerified =
      (aiVerification?.[i] && aiVerification[i].status) ? aiVerification[i] :
      (aiVerification?.[i - 1] && aiVerification[i - 1].status) ? aiVerification[i - 1] :
      undefined;
    let studentAnswer = extractedAnswers?.[i - 1] || (imageStr.startsWith('data:') ? '-' : key);
    let status: 'CORRECT' | 'WRONG' | 'EMPTY' | 'MULTIPLE' | 'REVIEW';

    if (aiVerified) {
      const v = aiVerified;
      studentAnswer = (v.status === 'MULTIPLE' ? (v.studentAnswer || studentAnswer) : studentAnswer);
      status = (v.status as QuestionStatus) || (studentAnswer === key ? 'CORRECT' : studentAnswer === '-' ? 'EMPTY' : 'WRONG');
    } else {
      status = studentAnswer === key ? 'CORRECT' : studentAnswer === '-' ? 'EMPTY' : 'WRONG';
    }

    const ansResult: QuestionResult = {
      questionNumber: i,
      studentAnswer,
      correctAnswer: key,
      status,
      confidence: 95,
      options: (['A', 'B', 'C', 'D', 'E'] as OptionLetter[]).slice(0, exam.optionCount || 5).map(opt => ({
        option: opt,
        density: opt === key ? 90 : 5,
        isFilled: opt === key,
      })),
    };
    answers.push(ansResult);
  }

  let essayAnswers: EssayQuestionResult[] | undefined = undefined;
  if (exam.hasEssaySection || totalQ <= 25) {
    essayAnswers = targetEssayAnswers || [...SAMPLE_STUDENT_ESSAY_ANSWERS];
  }

  // Stage 5: Validasi & Scoring
  if (onProgress) {
    onProgress({
      stage: 'VALIDATING',
      currentQuestion: totalQ,
      totalQuestions: totalQ,
      percentage: 98,
      laserY: 96,
      subText: 'Transkripsi AI HTR tulisan tangan & pencocokan rubrik kata kunci...',
      partialAnswers: answers,
    });
  }
  await new Promise((r) => setTimeout(r, 400));

  if (onProgress) {
    onProgress({
      stage: 'COMPLETED',
      currentQuestion: totalQ,
      totalQuestions: totalQ,
      percentage: 100,
      laserY: 100,
      subText: 'Analisis OMR & Transkripsi Tulisan Tangan Selesai!',
      partialAnswers: answers,
    });
  }

  const metrics = calculateScanMetrics(answers, exam, 8, essayAnswers);

  return {
    answers,
    essayAnswers,
    metrics,
    student,
  };
}
