import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Exam, ScanResultRecord, StudentInfo } from '../types';

/**
 * Export single scan result to Excel (.xlsx)
 */
export function exportSingleResultToExcel(result: ScanResultRecord) {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData: (string | number)[][] = [
    ['LAPORAN HASIL KOREKSI LJK (AI LJK SCANNER)'],
    [''],
    ['Nama Siswa', result.student.name],
    ['NISN / No Peserta', result.student.nisn],
    ['Kelas', result.student.className],
    ['Mata Pelajaran', result.student.subject],
    ['Nama Ujian', result.examName],
    ['Waktu Pindai', new Date(result.scannedAt).toLocaleString('id-ID')],
    [''],
    ['RINGKASAN PENILAIAN'],
    ['Nilai Akhir', result.metrics.score],
    ['Kategori', result.metrics.qualitativeGrade],
    ['Jumlah Soal PG', result.metrics.totalQuestions],
    ['Jawaban Benar', result.metrics.correct],
    ['Jawaban Salah', result.metrics.wrong],
    ['Jawaban Kosong', result.metrics.empty],
    ['Jawaban Ganda', result.metrics.multiple],
    ['Tingkat Akurasi', `${result.metrics.accuracyPercent}%`],
    ['Rata-rata Confidence', `${result.metrics.averageConfidence}%`],
  ];

  if (result.essayAnswers && result.essayAnswers.length > 0) {
    summaryData.push(['Nilai PG (60%)', result.metrics.pgScore ?? result.metrics.score]);
    summaryData.push(['Nilai Esai (40%)', result.metrics.essayScore ?? 0]);
    summaryData.push(['Jumlah Soal Esai HTR', result.essayAnswers.length]);
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // Detail Answers Sheet (PG)
  const detailsHeader = ['No Soal', 'Jawaban Siswa', 'Kunci Jawaban', 'Status', 'Tingkat Keyakinan', 'Density A', 'Density B', 'Density C', 'Density D', 'Density E'];
  const detailsRows = result.answers.map((ans) => {
    const densities: Record<string, string> = {};
    ans.options.forEach((opt) => {
      densities[opt.option] = `${opt.density}%`;
    });

    let statusText = 'Benar';
    if (ans.status === 'WRONG') statusText = 'Salah';
    if (ans.status === 'EMPTY') statusText = 'Kosong';
    if (ans.status === 'MULTIPLE') statusText = 'Ganda (Lebih dari 1)';

    return [
      ans.questionNumber,
      ans.studentAnswer,
      ans.correctAnswer,
      statusText,
      `${ans.confidence}%`,
      densities['A'] || '-',
      densities['B'] || '-',
      densities['C'] || '-',
      densities['D'] || '-',
      densities['E'] || '-',
    ];
  });

  const wsDetails = XLSX.utils.aoa_to_sheet([detailsHeader, ...detailsRows]);
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Detail PG');

  // Detail Essay Sheet (if exists)
  if (result.essayAnswers && result.essayAnswers.length > 0) {
    const essayHeader = ['No', 'Soal / Prompt', 'Transkripsi Tulisan Tangan (HTR)', 'Rubrik Kunci Guru', 'Kata Kunci Terdeteksi', 'Skor Diperoleh', 'Skor Maks', 'Akurasi HTR', 'Catatan Guru'];
    const essayRows = result.essayAnswers.map((eq) => [
      eq.questionNumber,
      eq.prompt,
      eq.detectedHandwritingText,
      eq.keyRubric,
      eq.matchedKeywords.join(', '),
      eq.earnedScore,
      eq.maxScore,
      `${eq.confidence}%`,
      eq.teacherFeedback || '-',
    ]);

    const wsEssay = XLSX.utils.aoa_to_sheet([essayHeader, ...essayRows]);
    XLSX.utils.book_append_sheet(wb, wsEssay, 'Detail Esai HTR');
  }

  const fileName = `LJK_Hasil_${result.student.name.replace(/\s+/g, '_')}_${result.student.subject}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export single scan result to official PDF Report
 */
export function exportSingleResultToPDF(result: ScanResultRecord) {
  const doc = new jsPDF();

  // Title Header
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('LEMBAR HASIL PENILAIAN LJK OTOMATIS', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Dihasilkan oleh AI LJK Scanner — Sistem Computer Vision & OCR Mandiri', 14, 25);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, 28, 196, 28);

  // Student & Exam Meta Info Box
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  doc.text(`Nama Siswa`, 14, 36);
  doc.text(`: ${result.student.name}`, 52, 36);

  doc.text(`NISN / No Peserta`, 14, 43);
  doc.text(`: ${result.student.nisn}`, 52, 43);

  doc.text(`Kelas`, 14, 50);
  doc.text(`: ${result.student.className}`, 52, 50);

  doc.text(`Mata Pelajaran`, 110, 36);
  doc.text(`: ${result.student.subject}`, 148, 36);

  doc.text(`Nama Ujian`, 110, 43);
  doc.text(`: ${result.examName}`, 148, 43);

  doc.text(`Waktu Pindai`, 110, 50);
  doc.text(`: ${new Date(result.scannedAt).toLocaleDateString('id-ID')}`, 148, 50);

  // Score Badge
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 56, 182, 28, 3, 3, 'F');

  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text('NILAI AKHIR', 24, 68);

  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129);
  doc.text(`${result.metrics.score}`, 24, 78);

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Status: ${result.metrics.qualitativeGrade}`, 62, 68);
  doc.text(`Jumlah Soal: ${result.metrics.totalQuestions}`, 62, 76);

  doc.text(`Benar: ${result.metrics.correct}`, 118, 68);
  doc.text(`Salah: ${result.metrics.wrong}`, 118, 76);

  doc.text(`Kosong: ${result.metrics.empty}`, 160, 68);
  doc.text(`Ganda: ${result.metrics.multiple}`, 160, 76);

  // Table of Answers
  const tableData = result.answers.map((a) => {
    let statusStr = 'Benar';
    if (a.status === 'WRONG') statusStr = 'Salah';
    if (a.status === 'EMPTY') statusStr = 'Kosong';
    if (a.status === 'MULTIPLE') statusStr = 'Ganda';
    return [a.questionNumber, a.studentAnswer || '-', a.correctAnswer, statusStr, `${a.confidence}%`];
  });

  autoTable(doc, {
    startY: 90,
    head: [['No', 'Jawaban Siswa', 'Kunci', 'Status', 'Confidence']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 1.8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // If Essay exists, add page or section for handwritten essay answers
  if (result.essayAnswers && result.essayAnswers.length > 0) {
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 160;
    
    if (finalY > 220) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('BAGIAN B: SOAL ISIAN & ESAI TULISAN TANGAN (AI HTR)', 14, 18);
    } else {
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('BAGIAN B: SOAL ISIAN & ESAI TULISAN TANGAN (AI HTR)', 14, finalY);
    }

    const essayTableData = result.essayAnswers.map((eq) => [
      eq.questionNumber,
      eq.prompt,
      eq.detectedHandwritingText,
      `${eq.earnedScore} / ${eq.maxScore}`,
      `${eq.confidence}%`
    ]);

    autoTable(doc, {
      startY: finalY > 220 ? 24 : finalY + 4,
      head: [['No', 'Soal / Pertanyaan', 'Transkripsi Tulisan Tangan Siswa', 'Nilai', 'Akurasi']],
      body: essayTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 55 },
        2: { cellWidth: 85 },
        3: { cellWidth: 18 },
        4: { cellWidth: 16 },
      },
    });
  }

  const fileName = `LJK_Hasil_${result.student.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Export Class Batch Recap to Excel
 */
export function exportBatchRecapToExcel(records: ScanResultRecord[], examName: string, className: string) {
  const wb = XLSX.utils.book_new();

  const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Mata Pelajaran', 'Benar', 'Salah', 'Kosong', 'Ganda', 'Nilai', 'Status Kelulusan'];
  const rows = records.map((rec, idx) => [
    idx + 1,
    rec.student.nisn,
    rec.student.name,
    rec.student.className,
    rec.student.subject,
    rec.metrics.correct,
    rec.metrics.wrong,
    rec.metrics.empty,
    rec.metrics.multiple,
    rec.metrics.score,
    rec.metrics.qualitativeGrade,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    [`REKAP PENILAIAN KELAS ${className.toUpperCase()}`],
    [`Ujian: ${examName}`],
    [`Tanggal: ${new Date().toLocaleDateString('id-ID')}`],
    [''],
    headers,
    ...rows,
  ]);

  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kelas');
  XLSX.writeFile(wb, `Rekap_Nilai_${className}_${examName.replace(/\s+/g, '_')}.xlsx`);
}
