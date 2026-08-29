import { jsPDF } from 'jspdf';
import { LJKTemplate } from '../types';

export interface PrintableLjkConfig {
  schoolName: string;
  examTitle: string;
  subject: string;
  academicYear: string;
  template?: LJKTemplate;
  totalQuestions?: number;
  optionCount?: number;
  includeEssay?: 'combined' | 'separate' | 'none';
  essayCount?: number;
  fileName?: string;
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 10;
const PAD = 16; // padding kiri/kanan konten (mm)
const CONTENT_W = PAGE_W - PAD * 2; // 178
const FOOTER_Y = 283;
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

const HDR_H = 7; // tinggi baris header tabel
const ROW_H = 7.6; // tinggi tiap baris soal

// Registration marks hitam di 4 sudut untuk scanner OMR.
function drawCornerMarkers(doc: jsPDF) {
  const size = 6;
  const marker = (x: number, y: number) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(x, y, size, size, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(x + 1, y + 2.5, size - 2, 1, 'F');
    doc.rect(x + 2.5, y + 1, 1, size - 2, 'F');
  };
  marker(MARGIN, MARGIN);
  marker(PAGE_W - MARGIN - size, MARGIN);
  marker(MARGIN, PAGE_H - MARGIN - size);
  marker(PAGE_W - MARGIN - size, PAGE_H - MARGIN - size);
}

// --- HEADER DOKUMEN: sekolah + judul LJK di kiri, mark sudut di kanan, garis ---
function drawHeader(doc: jsPDF, config: PrintableLjkConfig) {
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);

  doc.setFontSize(12);
  doc.text(config.schoolName.toUpperCase(), PAD, 20);

  doc.setFontSize(10);
  doc.text('LEMBAR JAWABAN KOMPUTER (LJK)', PAD, 26.5);

  doc.setFontSize(9);
  doc.text(`${config.examTitle.toUpperCase()} — TA ${config.academicYear}`, PAD, 32);

  // Corner mark kecil di pojok kanan header
  doc.setFillColor(15, 23, 42);
  doc.rect(PAGE_W - PAD - 7, 14, 7, 7, 'F');

  // Garis pemisah header
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1);
  doc.line(PAD, 37, PAGE_W - PAD, 37);
}

// --- IDENTITAS (kiri) & PETUNJUK PENGISIAN (kanan) berdampingan ---
function drawInfoBoxes(doc: jsPDF, config: PrintableLjkConfig): number {
  const top = 42;
  const lw = 96;
  const lx = PAD;
  const rx = lx + lw + 6;
  const rw = PAGE_W - PAD - rx;
  const h = 42;

  const labelRight = lx + 37;
  const lineRight = lx + lw - 6;

  // Kotak identitas (kiri)
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.rect(lx, top, lw, h);

  const labels = ['NAMA', 'NO. PESERTA', 'KELAS', 'MATA PELAJARAN', 'TANGGAL'];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  labels.forEach((lb, i) => {
    const y = top + 8 + i * 7.1;
    doc.text(lb, labelRight - 1.5, y, { align: 'right' });
    doc.text(':', labelRight + 1.5, y);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(labelRight + 4, y, lineRight, y);
  });

  // Kotak petunjuk (kanan)
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.rect(rx, top, rw, h);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PETUNJUK PENGISIAN:', rx + 8, top + 8);

  const tips = [
    'Gunakan pensil 2B untuk menghitamkan bulatan.',
    'Hitamkan penuh salah satu bulatan jawaban.',
    'Jika mengganti jawaban, hapus sampai bersih.',
    'Jangan melipat atau merobek lembar jawaban.',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  tips.forEach((t, i) => {
    doc.text('•', rx + 7, top + 16 + i * 7);
    doc.text(t, rx + 10, top + 16 + i * 7);
  });

  return top + h;
}

// Bulatan pilihan jawaban dengan huruf di tengah (sejajar antar baris).
function drawBubble(doc: jsPDF, cx: number, cy: number, letter: string) {
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.3);
  doc.circle(cx, cy, 2.3, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(71, 85, 105);
  doc.text(letter, cx, cy + 1, { align: 'center' });
}

function range(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

// Satu blok tabel (header + baris soal dengan bulatan).
function drawTable(
  doc: jsPDF,
  x: number,
  y: number,
  questions: number[],
  optCount: number,
  noW: number,
  optW: number,
  options: string[]
) {
  // Header
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(15, 23, 42);
  doc.rect(x, y, noW + optW * optCount, HDR_H, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('No.', x + noW / 2, y + 5, { align: 'center' });
  options.forEach((o, oi) =>
    doc.text(o, x + noW + optW * oi + optW / 2, y + 5, { align: 'center' })
  );
  doc.setLineWidth(0.6);
  doc.line(x, y + HDR_H, x + noW + optW * optCount, y + HDR_H);

  // Baris soal
  questions.forEach((q, i) => {
    const ry = y + HDR_H + i * ROW_H;
    doc.setDrawColor(224, 230, 238);
    doc.setLineWidth(0.25);
    doc.rect(x, ry, noW + optW * optCount, ROW_H);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`${q}.`, x + 2, ry + ROW_H / 2 + 1);

    options.forEach((o, oi) => {
      const cx = x + noW + optW * oi + optW / 2;
      drawBubble(doc, cx, ry + ROW_H / 2, o);
    });
  });
}

// Tabel pilihan ganda dua kolom seimbang (kiri 1..n/2, kanan n/2+1..n) + paginasi.
function drawAnswerTables(
  doc: jsPDF,
  config: PrintableLjkConfig,
  totalQ: number,
  optCount: number,
  startY: number
): number {
  const tableW = (CONTENT_W - 6) / 2;
  const noW = 9;
  const optW = (tableW - noW) / optCount;
  const options = OPTION_LETTERS.slice(0, optCount);
  const maxRows = Math.max(4, Math.floor((FOOTER_Y - startY - 8) / ROW_H));

  let first = 1;
  let lastY = startY;
  let firstPage = true;

  while (first <= totalQ) {
    const last = Math.min(first + maxRows * 2 - 1, totalQ);
    const count = last - first + 1;
    const leftCount = Math.ceil(count / 2);

    if (!firstPage) {
      doc.addPage();
      drawCornerMarkers(doc);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${config.examTitle.toUpperCase()} (LANJUTAN)`, PAGE_W / 2, 13, { align: 'center' });
    }
    firstPage = false;

    drawTable(doc, PAD, startY, range(first, first + leftCount - 1), optCount, noW, optW, options);
    drawTable(doc, PAD + tableW + 6, startY, range(first + leftCount, last), optCount, noW, optW, options);

    lastY = startY + maxRows * ROW_H;
    first = last + 1;
  }

  return lastY;
}

// Area jawaban essay (baris garis tulis). Paginasi otomatis bila penuh.
function drawEssayArea(doc: jsPDF, config: PrintableLjkConfig, startY: number, linesPerBox: number): number {
  const count = Math.max(1, config.essayCount ?? 5);
  const lineSpacing = 3.2;
  const boxH = 9 + linesPerBox * lineSpacing;
  let y = startY + 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('LEMBAR JAWABAN ESAI', MARGIN + 10, y);
  y += 3;

  for (let i = 1; i <= count; i++) {
    if (y + boxH > PAGE_H - MARGIN) {
      doc.addPage();
      drawCornerMarkers(doc);
      y = MARGIN + 16;
    }

    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.rect(MARGIN + 10, y, PAGE_W - (MARGIN + 10) * 2, boxH);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${i}.`, MARGIN + 12, y + 6);

    doc.setDrawColor(203, 213, 225);
    for (let k = 1; k <= linesPerBox; k++) {
      doc.line(MARGIN + 12, y + 8 + k * lineSpacing, PAGE_W - MARGIN - 12, y + 8 + k * lineSpacing);
    }

    y += boxH + 3;
  }

  return y;
}

// Footer tiap halaman: garis + teks tengah.
function drawFooter(doc: jsPDF, config: PrintableLjkConfig) {
  const text = `AI LJK SCANNER — ${config.subject} • TAHUN AJARAN ${config.academicYear}`;
  for (let p = 1; p <= doc.getNumberOfPages(); p++) {
    doc.setPage(p);
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.5);
    doc.line(PAD, FOOTER_Y, PAGE_W - PAD, FOOTER_Y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(text, PAGE_W / 2, FOOTER_Y + 6, { align: 'center' });
  }
}

// LJK Pilihan Ganda (dengan/bebas essay menyatu di lembar sama).
export function generatePrintableLjkPDF(config: PrintableLjkConfig) {
  const totalQ = Math.max(1, config.totalQuestions ?? config.template?.totalQuestions ?? 50);
  const optCount = config.optionCount ?? config.template?.optionCount ?? 5;
  const includeEssay = config.includeEssay ?? (config.template?.hasEssaySection ? 'combined' : 'none');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCornerMarkers(doc);
  drawHeader(doc, config);

  const boxesBottom = drawInfoBoxes(doc, config);
  const tablesEnd = drawAnswerTables(doc, config, totalQ, optCount, boxesBottom + 8);

  if (includeEssay === 'combined') {
    let essayY = tablesEnd + 6;
    if (doc.getNumberOfPages() > 1 || essayY > PAGE_H - 20) {
      doc.addPage();
      drawCornerMarkers(doc);
      essayY = MARGIN + 16;
    }
    drawEssayArea(doc, config, essayY, 4);
  }

  drawFooter(doc, config);

  const safeName = (config.template?.name || `${config.examTitle}`)
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]+/g, '');
  doc.save(config.fileName || `Blank_LJK_${safeName}.pdf`);
}

// Lembar jawaban Essay terpisah (untuk pola PG & Essay terpisah).
export function generateEssayLjkPDF(config: PrintableLjkConfig) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCornerMarkers(doc);
  drawHeader(doc, config);

  const boxesBottom = drawInfoBoxes(doc, config);
  drawEssayArea(doc, config, boxesBottom + 8, 8);

  drawFooter(doc, config);

  const count = config.essayCount ?? 5;
  doc.save(config.fileName || `Lembar_Jawaban_Essay_${count}.pdf`);
}