import { Exam, EssayQuestionResult, LJKTemplate, OptionLetter, QuestionResult, StudentInfo } from '../types';

export const PRESET_TEMPLATES: LJKTemplate[] = [
  {
    id: 'tpl-smp-50-ae',
    name: 'LJK Standar Nasional SMP/SMA (50 Soal A-E)',
    description: 'Format lembar 3 kolom, 5 pilihan (A, B, C, D, E) untuk ujian semester & tryout.',
    modelType: 'STANDARD_BUBBLE_SHEET',
    totalQuestions: 50,
    optionCount: 5,
    columnsCount: 3,
    passingGrade: 75,
    weightPerQuestion: 2,
  },
  {
    id: 'tpl-hybrid-25pg-5essay',
    name: 'LJK Campuran (25 PG + 5 Soal Uraian / Isian Tulisan Tangan)',
    description: 'Format gabungan Pilihan Ganda dan kolom khusus tulisan tangan siswa dengan AI OCR HTR.',
    modelType: 'HYBRID_PG_ESSAY',
    totalQuestions: 25,
    optionCount: 4,
    columnsCount: 2,
    passingGrade: 75,
    weightPerQuestion: 2.4,
    hasEssaySection: true,
    essayQuestionsCount: 5,
  },
  {
    id: 'tpl-sd-40-ad',
    name: 'LJK SD Soal & Jawaban Menyatu (40 Soal A-D)',
    description: 'Format SD tingkat dasar dengan soal dan pilihan lingkaran A-D.',
    modelType: 'SOAL_JAWABAN_MENYATU_SD',
    totalQuestions: 40,
    optionCount: 4,
    columnsCount: 2,
    passingGrade: 70,
    weightPerQuestion: 2.5,
  },
  {
    id: 'tpl-block-30-ad',
    name: 'LJK Model Kotak / Blok Soal (30 Soal A-D)',
    description: 'Format berbingkai kotak per butir soal dengan bulatan di samping teks.',
    modelType: 'BLOCK_LAYOUT',
    totalQuestions: 30,
    optionCount: 4,
    columnsCount: 2,
    passingGrade: 75,
    weightPerQuestion: 3.33,
  },
  {
    id: 'tpl-sma-100-ae',
    name: 'LJK Ujian Nasional Komprehensif (100 Soal A-E)',
    description: 'Format 4 kolom padat untuk tryout UTBK dan ujian sekolah lanjutan.',
    modelType: 'STANDARD_BUBBLE_SHEET',
    totalQuestions: 100,
    optionCount: 5,
    columnsCount: 4,
    passingGrade: 75,
    weightPerQuestion: 1,
  },
];

// Sample Answer Key matching Mockup
export const SAMPLE_ANSWER_KEYS_50: Record<number, OptionLetter> = {
  1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'C',
  6: 'B', 7: 'A', 8: 'E', 9: 'C', 10: 'B',
  11: 'B', 12: 'D', 13: 'A', 14: 'E', 15: 'A',
  16: 'C', 17: 'B', 18: 'D', 19: 'A', 20: 'E',
  21: 'C', 22: 'B', 23: 'D', 24: 'A', 25: 'C',
  26: 'E', 27: 'B', 28: 'D', 29: 'A', 30: 'C',
  31: 'E', 32: 'B', 33: 'D', 34: 'A', 35: 'C',
  36: 'E', 37: 'B', 38: 'D', 39: 'A', 40: 'C',
  41: 'E', 42: 'B', 43: 'D', 44: 'A', 45: 'C',
  46: 'B', 47: 'C', 48: 'D', 49: 'C', 50: 'E'
};

export const SAMPLE_STUDENT_ANDI: StudentInfo = {
  name: 'NAMA SISWA',
  nisn: '0000000000',
  className: 'KELAS',
  subject: 'MATA PELAJARAN',
  schoolName: 'NAMA SEKOLAH',
  examDate: 'DD/MM/YYYY',
  examCode: 'KODE-UJIAN',
};

// Sample Handwritten Essay Questions & Student Answers
export const SAMPLE_ESSAY_KEYS: Record<number, { prompt: string; keyRubric: string; rubricKeywords: string[]; maxScore: number }> = {
  1: {
    prompt: 'Jelaskan proses fotosintesis pada tumbuhan dan sebutkan zat yang dihasilkan!',
    keyRubric: 'Fotosintesis terjadi pada kloroplas di daun dengan bantuan cahaya matahari dan air, menghasilkan glukosa serta gas oksigen (O2).',
    rubricKeywords: ['kloroplas', 'cahaya matahari', 'glukosa', 'oksigen', 'daun'],
    maxScore: 20,
  },
  2: {
    prompt: 'Sebutkan 3 perbedaan utama antara sel hewan dan sel tumbuhan!',
    keyRubric: 'Sel tumbuhan memiliki dinding sel, kloroplas, dan vakuola besar. Sel hewan tidak memiliki dinding sel tetapi memiliki sentriol.',
    rubricKeywords: ['dinding sel', 'kloroplas', 'vakuola', 'sentriol'],
    maxScore: 20,
  },
  3: {
    prompt: 'Sebuah balok bermassa 5 kg ditarik gaya 20 N. Hitung percepatannya (F = m x a)!',
    keyRubric: 'Rumus: a = F / m = 20 N / 5 kg = 4 m/s².',
    rubricKeywords: ['a = f / m', '20 / 5', '4 m/s', '4 m/s2', '4'],
    maxScore: 20,
  },
  4: {
    prompt: 'Jelaskan fungsi organ lambung dalam sistem pencernaan manusia!',
    keyRubric: 'Lambung mencerna makanan secara mekanik (otot lambung) dan kimiawi (asam klorida HCl dan enzim pepsin untuk protein).',
    rubricKeywords: ['asam klorida', 'hcl', 'pepsin', 'mekanik', 'protein'],
    maxScore: 20,
  },
  5: {
    prompt: 'Apa yang dimaksud dengan simbiosis mutualisme? Berikan satu contoh!',
    keyRubric: 'Simbiosis mutualisme adalah hubungan dua makhluk hidup yang saling menguntungkan, contohnya lebah dan bunga atau kerbau dan burung jalak.',
    rubricKeywords: ['saling menguntungkan', 'lebah', 'bunga', 'kerbau', 'jalak'],
    maxScore: 20,
  },
};

export const SAMPLE_STUDENT_ESSAY_ANSWERS: EssayQuestionResult[] = [
  {
    questionNumber: 1,
    prompt: 'Jelaskan proses fotosintesis pada tumbuhan dan sebutkan zat yang dihasilkan!',
    keyRubric: 'Fotosintesis terjadi pada kloroplas di daun dengan bantuan cahaya matahari dan air, menghasilkan glukosa serta gas oksigen (O2).',
    rubricKeywords: ['kloroplas', 'cahaya matahari', 'glukosa', 'oksigen', 'daun'],
    detectedHandwritingText: 'Fotosintesis terjadi di kloroplas daun dengan bantuan cahaya matahari. Menghasilkan oksigen dan glukosa.',
    confidence: 96,
    matchedKeywords: ['kloroplas', 'cahaya matahari', 'glukosa', 'oksigen', 'daun'],
    maxScore: 20,
    earnedScore: 20,
    teacherFeedback: 'Sangat lengkap dan tepat.',
  },
  {
    questionNumber: 2,
    prompt: 'Sebutkan 3 perbedaan utama antara sel hewan dan sel tumbuhan!',
    keyRubric: 'Sel tumbuhan memiliki dinding sel, kloroplas, dan vakuola besar. Sel hewan tidak memiliki dinding sel tetapi memiliki sentriol.',
    rubricKeywords: ['dinding sel', 'kloroplas', 'vakuola', 'sentriol'],
    detectedHandwritingText: 'Sel tumbuhan punya dinding sel dan kloroplas. Sel hewan tidak punya dinding sel.',
    confidence: 92,
    matchedKeywords: ['dinding sel', 'kloroplas'],
    maxScore: 20,
    earnedScore: 16,
    teacherFeedback: 'Sudah menyebutkan 2 perbedaan utama, belum menyebut vakuola/sentriol.',
  },
  {
    questionNumber: 3,
    prompt: 'Sebuah balok bermassa 5 kg ditarik gaya 20 N. Hitung percepatannya (F = m x a)!',
    keyRubric: 'Rumus: a = F / m = 20 N / 5 kg = 4 m/s².',
    rubricKeywords: ['a = f / m', '20 / 5', '4 m/s', '4 m/s2', '4'],
    detectedHandwritingText: 'a = F / m = 20 / 5 = 4 m/s2',
    confidence: 97,
    matchedKeywords: ['a = f / m', '20 / 5', '4 m/s2', '4'],
    maxScore: 20,
    earnedScore: 20,
    teacherFeedback: 'Jawaban dan satuan eksak.',
  },
  {
    questionNumber: 4,
    prompt: 'Jelaskan fungsi organ lambung dalam sistem pencernaan manusia!',
    keyRubric: 'Lambung mencerna makanan secara mekanik (otot lambung) dan kimiawi (asam klorida HCl dan enzim pepsin untuk protein).',
    rubricKeywords: ['asam klorida', 'hcl', 'pepsin', 'mekanik', 'protein'],
    detectedHandwritingText: 'Lambung memecah makanan dengan asam HCl dan enzim pepsin untuk cerna protein.',
    confidence: 94,
    matchedKeywords: ['hcl', 'pepsin', 'protein'],
    maxScore: 20,
    earnedScore: 18,
    teacherFeedback: 'Bagus, konsep enzim dan asam lambung tepat.',
  },
  {
    questionNumber: 5,
    prompt: 'Apa yang dimaksud dengan simbiosis mutualisme? Berikan satu contoh!',
    keyRubric: 'Simbiosis mutualisme adalah hubungan dua makhluk hidup yang saling menguntungkan, contohnya lebah dan bunga atau kerbau dan burung jalak.',
    rubricKeywords: ['saling menguntungkan', 'lebah', 'bunga', 'kerbau', 'jalak'],
    detectedHandwritingText: 'Hubungan yang saling menguntungkan kedua pihak, contohnya lebah madu menghisap nektar bunga.',
    confidence: 95,
    matchedKeywords: ['saling menguntungkan', 'lebah', 'bunga'],
    maxScore: 20,
    earnedScore: 20,
    teacherFeedback: 'Penjelasan dan contoh sempurna.',
  },
];

export const PRESET_EXAMS: Exam[] = [
  {
    id: 'exam-mtk-ix',
    name: 'Penilaian Tengah Semester (PTS) Matematika',
    subject: 'MATEMATIKA',
    className: 'IX - B',
    totalQuestions: 50,
    optionCount: 5,
    templateId: 'tpl-smp-50-ae',
    passingGrade: 75,
    answerKeys: SAMPLE_ANSWER_KEYS_50,
    createdAt: '2026-08-27T08:00:00Z',
  },
  {
    id: 'exam-ipa-hybrid',
    name: 'Ujian IPA Terpadu (25 PG + 5 Uraian Tulisan Tangan)',
    subject: 'IPA TERPADU',
    className: 'IX - A',
    totalQuestions: 25,
    optionCount: 4,
    templateId: 'tpl-hybrid-25pg-5essay',
    passingGrade: 75,
    hasEssaySection: true,
    essayQuestionsCount: 5,
    essayKeys: SAMPLE_ESSAY_KEYS,
    answerKeys: {
      1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'C',
      6: 'B', 7: 'A', 8: 'D', 9: 'C', 10: 'B',
      11: 'B', 12: 'D', 13: 'A', 14: 'C', 15: 'A',
      16: 'C', 17: 'B', 18: 'D', 19: 'A', 20: 'D',
      21: 'C', 22: 'B', 23: 'D', 24: 'A', 25: 'C',
    },
    createdAt: '2026-08-26T10:15:00Z',
  },
  {
    id: 'exam-ipa-vi',
    name: 'Ujian Sekolah IPA Terpadu SD',
    subject: 'IPA',
    className: 'VI - A',
    totalQuestions: 40,
    optionCount: 4,
    templateId: 'tpl-sd-40-ad',
    passingGrade: 70,
    answerKeys: {
      1: 'B', 2: 'A', 3: 'C', 4: 'D', 5: 'B',
      6: 'C', 7: 'A', 8: 'D', 9: 'B', 10: 'C',
      11: 'A', 12: 'D', 13: 'B', 14: 'C', 15: 'A',
      16: 'D', 17: 'B', 18: 'C', 19: 'A', 20: 'D',
      21: 'B', 22: 'C', 23: 'A', 24: 'D', 25: 'B',
      26: 'C', 27: 'A', 28: 'D', 29: 'B', 30: 'C',
      31: 'A', 32: 'D', 33: 'B', 34: 'C', 35: 'A',
      36: 'D', 37: 'B', 38: 'C', 39: 'A', 40: 'D',
    },
    createdAt: '2026-08-26T09:30:00Z',
  }
];

// Generates the sample student's marked answers matching the exact mockup
export function getMockupQuestionAnswers(keys: Record<number, OptionLetter>): QuestionResult[] {
  const results: QuestionResult[] = [];
  const total = 50;

  for (let i = 1; i <= total; i++) {
    const key = keys[i] || 'A';
    let studentAns: string = key;
    let status: 'CORRECT' | 'WRONG' | 'EMPTY' | 'MULTIPLE' | 'REVIEW' = 'CORRECT';
    let confidence = 94 + Math.floor(Math.random() * 5); // 94-98%
    
    // Exact anomalies as shown in the screenshot mockup:
    // Soal 5: student answer A, key C => WRONG
    // Soal 7: student marked A & D => GANDA (Lebih dari 1)
    // Soal 10: student left blank => KOSONG
    // Soal 13: student answer C, key A => WRONG
    // Soal 49: student answer A, key C => WRONG
    if (i === 5) {
      studentAns = 'A';
      status = 'WRONG';
    } else if (i === 7) {
      studentAns = 'A D';
      status = 'MULTIPLE';
      confidence = 91;
    } else if (i === 10) {
      studentAns = '-';
      status = 'EMPTY';
      confidence = 98;
    } else if (i === 13) {
      studentAns = 'C';
      status = 'WRONG';
    } else if (i === 42) {
      studentAns = '-';
      status = 'EMPTY';
    } else if (i === 49) {
      studentAns = 'A';
      status = 'WRONG';
    } else if (i === 28) {
      studentAns = 'C';
      status = 'WRONG'; // key is D
    } else if (i === 39) {
      studentAns = 'C';
      status = 'WRONG'; // key is A
    }

    const options = (['A', 'B', 'C', 'D', 'E'] as OptionLetter[]).map((opt) => {
      let density = 6 + Math.floor(Math.random() * 8); // 6-14% baseline noise
      let isFilled = false;

      if (studentAns.includes(opt)) {
        density = 88 + Math.floor(Math.random() * 11); // 88-99%
        isFilled = true;
      }
      return {
        option: opt,
        density,
        isFilled,
      };
    });

    results.push({
      questionNumber: i,
      studentAnswer: studentAns,
      correctAnswer: key,
      status,
      confidence,
      options,
    });
  }

  return results;
}

/**
 * Draws a high-resolution authentic LJK sheet directly onto a Canvas
 */
export function drawAuthenticLJKSheet(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  student: StudentInfo,
  answers: QuestionResult[],
  activeScanningQIndex: number = -1,
  showDetectionOverlays: boolean = true
) {
  // Clear canvas with subtle textured paper background
  ctx.save();
  ctx.fillStyle = '#f8fafc'; // crisp off-white paper
  ctx.fillRect(0, 0, width, height);

  // Subtle paper grid texture
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
  ctx.lineWidth = 0.5;
  const gridSize = 16;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const margin = 28;
  const innerW = width - margin * 2;
  const innerH = height - margin * 2;

  // Outer paper border
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, innerW, innerH);

  // 4 Corner Optical Calibration Markers (Black solid squares with white cross)
  const markerSize = 22;
  const drawCalibrationMarker = (cx: number, cy: number) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - markerSize / 2, cy - markerSize / 2, markerSize, markerSize);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx - markerSize / 2 + 4, cy - 1.5, markerSize - 8, 3);
    ctx.fillRect(cx - 1.5, cy - markerSize / 2 + 4, 3, markerSize - 8);
  };

  drawCalibrationMarker(margin + 16, margin + 16);
  drawCalibrationMarker(width - margin - 16, margin + 16);
  drawCalibrationMarker(margin + 16, height - margin - 16);
  drawCalibrationMarker(width - margin - 16, height - margin - 16);

  // HEADER BANNER
  ctx.fillStyle = '#1e293b';
  const headerY = margin + 24;
  ctx.fillRect(margin + 60, headerY, innerW - 120, 24);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Inter", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LEMBAR JAWABAN KOMPUTER', width / 2, headerY + 12);

  // STUDENT INFO BOX
  const infoY = headerY + 36;
  ctx.textAlign = 'left';
  ctx.font = 'bold 10px "Inter", monospace';
  ctx.fillStyle = '#1e293b';

  const fields = [
    { label: 'NAMA', value: student.name, boxW: 180 },
    { label: 'NO. PESERTA', value: student.nisn, boxW: 180 },
    { label: 'KELAS', value: student.className, boxW: 180 },
    { label: 'MATA PELAJARAN', value: student.subject, boxW: 180 },
  ];

  fields.forEach((field, idx) => {
    const fy = infoY + idx * 22;
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(field.label, margin + 60, fy + 12);
    ctx.fillText(':', margin + 160, fy + 12);

    // Value box
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 172, fy, field.boxW, 18);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillText(field.value, margin + 178, fy + 12);

    // AI Green bounding box for detected fields
    if (showDetectionOverlays) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(margin + 170, fy - 2, field.boxW + 4, 22);
    }
  });

  // QR Code (Synthetic stylized QR)
  const qrX = width - margin - 120;
  const qrY = infoY - 4;
  const qrSize = 68;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX, qrY, qrSize, qrSize);
  // Fake QR matrix
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(qrX + 6, qrY + 6, 18, 18);
  ctx.fillRect(qrX + qrSize - 24, qrY + 6, 18, 18);
  ctx.fillRect(qrX + 6, qrY + qrSize - 24, 18, 18);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX + 10, qrY + 10, 10, 10);
  ctx.fillRect(qrX + qrSize - 20, qrY + 10, 10, 10);
  ctx.fillRect(qrX + 10, qrY + qrSize - 20, 10, 10);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(qrX + 13, qrY + 13, 4, 4);
  ctx.fillRect(qrX + qrSize - 17, qrY + 13, 4, 4);
  ctx.fillRect(qrX + 13, qrY + qrSize - 17, 4, 4);
  // Random interior blocks
  ctx.fillRect(qrX + 32, qrY + 12, 10, 6);
  ctx.fillRect(qrX + 30, qrY + 28, 14, 14);
  ctx.fillRect(qrX + 12, qrY + 34, 10, 8);
  ctx.fillRect(qrX + 48, qrY + 32, 12, 8);
  ctx.fillRect(qrX + 32, qrY + 48, 22, 10);

  // PETUNJUK PENGISIAN
  const guideY = infoY + 96;
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('PETUNJUK:', margin + 60, guideY);
  ctx.font = '7.5px sans-serif';
  ctx.fillText('1. Gunakan pensil 2B untuk menghitamkan bulatan.', margin + 60, guideY + 11);
  ctx.fillText('2. Hitamkan salah satu jawaban yang paling benar.', margin + 60, guideY + 21);
  ctx.fillText('3. Jika ingin mengganti jawaban, hapus sampai bersih.', margin + 60, guideY + 31);
  ctx.fillText('4. Jangan memberi tanda selain pada bulatan jawaban.', margin + 60, guideY + 41);

  // ANSWER COLUMNS: Check if Hybrid Mode (25 PG + 5 Essay) or Standard Mode (50 PG)
  const isHybridMode = answers.length <= 25;
  const columnsStartY = guideY + (isHybridMode ? 46 : 56);
  const options = (isHybridMode ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E']) as OptionLetter[];
  const rowHeight = isHybridMode ? 16 : 18.5;

  if (isHybridMode) {
    // HYBRID MODE: 2 Top Columns for 25 PG (1-13, 14-25)
    const colWidth = (innerW - 32) / 2;
    const hybridRanges = [
      { start: 1, end: 13 },
      { start: 14, end: 25 },
    ];

    // Section A Title Banner
    ctx.fillStyle = '#334155';
    ctx.fillRect(margin + 16, columnsStartY - 18, innerW - 32, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BAGIAN A: PILIHAN GANDA (HITAMKAN BULATAN)', margin + 22, columnsStartY - 7);

    hybridRanges.forEach((col, colIdx) => {
      const colX = margin + 16 + colIdx * (colWidth + 8);
      const totalColRows = col.end - col.start + 1;

      // Column Outer Box
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(colX, columnsStartY, colWidth, totalColRows * rowHeight + 20);

      // Header (No | A B C D)
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(colX, columnsStartY, colWidth, 18);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(colX, columnsStartY, colWidth, 18);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 8.5px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('No.', colX + 6, columnsStartY + 12);

      options.forEach((opt, oIdx) => {
        const optX = colX + 34 + oIdx * 18;
        ctx.textAlign = 'center';
        ctx.fillText(opt, optX, columnsStartY + 12);
      });

      // Rows
      for (let qNum = col.start; qNum <= col.end; qNum++) {
        const rowIndex = qNum - col.start;
        const rowY = columnsStartY + 20 + rowIndex * rowHeight;
        const ansObj = answers.find((a) => a.questionNumber === qNum);
        const isCurrentActive = activeScanningQIndex === qNum - 1;

        if (isCurrentActive) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
          ctx.fillRect(colX + 2, rowY - 2, colWidth - 4, rowHeight - 2);
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(colX + 2, rowY - 2, colWidth - 4, rowHeight - 2);
        }

        ctx.fillStyle = isCurrentActive ? '#2563eb' : '#334155';
        ctx.font = isCurrentActive ? 'bold 8.5px sans-serif' : '8px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${qNum}.`, colX + 6, rowY + 8);

        options.forEach((opt, oIdx) => {
          const optX = colX + 34 + oIdx * 18;
          const optY = rowY + 5;
          const radius = 4.6;

          const optDensity = ansObj?.options.find((o) => o.option === opt);
          const isFilled = optDensity?.isFilled || false;

          if (optDensity) {
            optDensity.x = optX;
            optDensity.y = optY;
            optDensity.radius = radius;
          }

          ctx.beginPath();
          ctx.arc(optX, optY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 0.9;
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.stroke();

          if (!isFilled) {
            ctx.fillStyle = '#64748b';
            ctx.font = '6px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(opt, optX, optY);
          } else {
            const grad = ctx.createRadialGradient(optX - 1, optY - 1, 1, optX, optY, radius);
            grad.addColorStop(0, '#111827');
            grad.addColorStop(0.7, '#1e293b');
            grad.addColorStop(1, '#334155');
            ctx.beginPath();
            ctx.arc(optX, optY, radius - 0.2, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          }

          if (showDetectionOverlays && ansObj && isFilled) {
            ctx.beginPath();
            ctx.arc(optX, optY, radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
        });
      }
    });

    // SECTION B: LEMBAR JAWABAN ISIAN / URAIAN TULISAN TANGAN
    const essayStartY = columnsStartY + 13 * rowHeight + 36;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(margin + 16, essayStartY, innerW - 32, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BAGIAN B: LEMBAR JAWABAN URAIAN / ISIAN SINGKAT (TULISAN TANGAN SISWA)', margin + 22, essayStartY + 12);

    const sampleHandwritingTexts = [
      '1. Fotosintesis terjadi di kloroplas daun dengan bantuan cahaya matahari. Menghasilkan oksigen & glukosa.',
      '2. Sel tumbuhan punya dinding sel & kloroplas. Sel hewan tidak punya dinding sel.',
      '3. a = F / m = 20 / 5 = 4 m/s²',
      '4. Lambung mencerna makanan secara mekanik & kimiawi (asam HCl dan enzim pepsin).',
      '5. Hubungan saling menguntungkan, contoh: lebah menghisap nektar bunga.',
    ];

    sampleHandwritingTexts.forEach((text, eIdx) => {
      const boxY = essayStartY + 26 + eIdx * 34;
      const boxW = innerW - 32;
      const boxH = 28;

      // Handwriting Grid Box
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(margin + 16, boxY, boxW, boxH);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(margin + 16, boxY, boxW, boxH);

      // Horizontal dashed baseline for student writing
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(margin + 20, boxY + 18);
      ctx.lineTo(margin + 16 + boxW - 10, boxY + 18);
      ctx.stroke();
      ctx.setLineDash([]);

      // Student Handwritten Text Simulation (dark slate pencil color with italic slant)
      ctx.fillStyle = '#1e293b';
      ctx.font = 'italic bold 9.5px "Comic Sans MS", "Caveat", "Segoe Print", cursive, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(text, margin + 22, boxY + 15);

      // AI ICR/HTR Bounding Box Overlay
      if (showDetectionOverlays) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(margin + 18, boxY + 2, boxW - 4, boxH - 4);

        // Badge [HTR OCR 96%]
        ctx.fillStyle = '#10b981';
        ctx.fillRect(margin + boxW - 68, boxY + 4, 62, 11);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`✓ HTR 9${5 - eIdx}%`, margin + boxW - 37, boxY + 12);
      }
    });

  } else {
    // STANDARD MODE: 3 Columns for 50 questions
    const colWidth = (innerW - 40) / 3;
    const columnRanges = [
      { start: 1, end: 17 },
      { start: 18, end: 34 },
      { start: 35, end: 50 },
    ];

    columnRanges.forEach((col, colIdx) => {
      const colX = margin + 16 + colIdx * (colWidth + 4);

      // Column Outer Box
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(colX, columnsStartY, colWidth, 17 * rowHeight + 24);

      // Column Header (No | A B C D E)
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(colX, columnsStartY, colWidth, 20);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(colX, columnsStartY, colWidth, 20);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('No.', colX + 6, columnsStartY + 13);

      // Header Options
      options.forEach((opt, oIdx) => {
        const optX = colX + 38 + oIdx * 17;
        ctx.textAlign = 'center';
        ctx.fillText(opt, optX, columnsStartY + 13);
      });

      // Rows
      for (let qNum = col.start; qNum <= col.end; qNum++) {
        const rowIndex = qNum - col.start;
        const rowY = columnsStartY + 24 + rowIndex * rowHeight;
        const ansObj = answers.find((a) => a.questionNumber === qNum);
        const isCurrentActive = activeScanningQIndex === qNum - 1;

        // Highlight active row during live scanning
        if (isCurrentActive) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
          ctx.fillRect(colX + 2, rowY - 2, colWidth - 4, rowHeight - 2);
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(colX + 2, rowY - 2, colWidth - 4, rowHeight - 2);
        }

        // Question Number
        ctx.fillStyle = isCurrentActive ? '#2563eb' : '#334155';
        ctx.font = isCurrentActive ? 'bold 9.5px sans-serif' : '8.5px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${qNum}.`, colX + 6, rowY + 9);

        // Bubbles
        options.forEach((opt, oIdx) => {
          const optX = colX + 38 + oIdx * 17;
          const optY = rowY + 6;
          const radius = 5.2;

          const optDensity = ansObj?.options.find((o) => o.option === opt);
          const isFilled = optDensity?.isFilled || false;

          // Save coordinate for clickable inspection
          if (optDensity) {
            optDensity.x = optX;
            optDensity.y = optY;
            optDensity.radius = radius;
          }

          // Draw Base Circle
          ctx.beginPath();
          ctx.arc(optX, optY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.stroke();

          // Inner Option Letter
          if (!isFilled) {
            ctx.fillStyle = '#64748b';
            ctx.font = '6.5px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(opt, optX, optY);
          } else {
            // Authentic 2B Pencil Shading Simulation
            const grad = ctx.createRadialGradient(optX - 1, optY - 1, 1, optX, optY, radius);
            grad.addColorStop(0, '#111827');
            grad.addColorStop(0.7, '#1e293b');
            grad.addColorStop(1, '#334155');
            ctx.beginPath();
            ctx.arc(optX, optY, radius - 0.2, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Subtle graphite reflection spot
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(optX - 1.5, optY - 1.5, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Overlay rings if detection enabled
          if (showDetectionOverlays && ansObj) {
            if (ansObj.status === 'MULTIPLE' && isFilled) {
              ctx.beginPath();
              ctx.arc(optX, optY, radius + 2.5, 0, Math.PI * 2);
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 1.8;
              ctx.stroke();
            } else if (ansObj.status === 'EMPTY') {
              if (opt === 'A') {
                ctx.beginPath();
                ctx.arc(colX + 38 + 2 * 17, optY, radius * 3.6, 0, Math.PI * 2);
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 1.2;
                ctx.stroke();
              }
            } else if (isFilled) {
              ctx.beginPath();
              ctx.arc(optX, optY, radius + 2, 0, Math.PI * 2);
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
        });
      }
    });
  }

  ctx.restore();
}
