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
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

// 4 Corner Registration Square Markers (for auto scanner perspective alignment)
function drawCornerMarkers(doc: jsPDF) {
  const markerSize = 6;
  const marker = (x: number, y: number) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(x, y, markerSize, markerSize, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(x + 1, y + 2.5, markerSize - 2, 1, 'F');
    doc.rect(x + 2.5, y + 1, 1, markerSize - 2, 'F');
  };
  marker(MARGIN, MARGIN);
  marker(PAGE_W - MARGIN - markerSize, MARGIN);
  marker(MARGIN, PAGE_H - MARGIN - markerSize);
  marker(PAGE_W - MARGIN - markerSize, PAGE_H - MARGIN - markerSize);
}

// Header (kop) + petunjuk pengisian + form identitas siswa. Returns formY.
function drawHeaderBlock(doc: jsPDF, config: PrintableLjkConfig): number {
  // Header Box
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.rect(MARGIN + 10, MARGIN + 4, PAGE_W - (MARGIN + 10) * 2, 18);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(config.schoolName.toUpperCase(), PAGE_W / 2, MARGIN + 11, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`LEMBAR JAWABAN KOMPUTER (LJK) — ${config.examTitle.toUpperCase()}`, PAGE_W / 2, MARGIN + 18, { align: 'center' });

  // Petunjuk Pengisian
  const formY = MARGIN + 26;
  doc.setDrawColor(148, 163, 184);
  doc.rect(MARGIN + 10, formY, 120, 36);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PETUNJUK PENGISIAN:', MARGIN + 12, formY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const tips = [
    '1. Gunakan pensil 2B untuk menghitamkan bulatan.',
    '2. Hitamkan penuh salah satu bulatan pilihan jawaban.',
    '3. Jika ingin mengganti jawaban, hapus sampai bersih.',
    '4. Jangan melipat atau merobek lembar jawaban ini.',
  ];
  tips.forEach((t, i) => dot(doc, MARGIN + 12, formY + 12 + i * 5, t));

  // Form Identitas Siswa (kanan)
  const idBoxX = MARGIN + 134;
  doc.rect(idBoxX, formY, PAGE_W - idBoxX - MARGIN - 10, 36);

  const idLabels = [
    { label: 'NAMA', y: formY + 7 },
    { label: 'NO. PESERTA', y: formY + 14 },
    { label: 'KELAS', y: formY + 21 },
    { label: 'MAPEL', y: formY + 28 },
    { label: 'TANGGAL', y: formY + 34 },
  ];

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  idLabels.forEach((item) => {
    doc.text(item.label, idBoxX + 3, item.y);
    doc.text(':', idBoxX + 22, item.y);
    doc.line(idBoxX + 25, item.y, idBoxX + 50, item.y);
  });

  return formY;
}

function dot(doc: jsPDF, x: number, y: number, text: string) {
  doc.text(text, x, y);
}

// Grid pilihan ganda. Mengembalikan posisi Y terakhir baris yang digambar.
function drawMcGrid(
  doc: jsPDF,
  config: PrintableLjkConfig,
  totalQ: number,
  optCount: number
): number {
  const formY = MARGIN + 26;
  const startY = formY + 42;
  const options = OPTION_LETTERS.slice(0, optCount);
  const rowH = 7.6;
  const colCount = totalQ > 60 ? 4 : totalQ > 30 ? 3 : totalQ > 10 ? 2 : 1;
  const maxRows = Math.max(1, Math.floor((PAGE_H - MARGIN - startY - 8) / rowH));
  const colWidth = (PAGE_W - (MARGIN + 10) * 2 - (colCount - 1) * 4) / colCount;

  let drawn = 0;
  let lastRowY = startY + 8;
  let firstPage = true;

  while (drawn < totalQ) {
    const remaining = totalQ - drawn;
    const cols = Math.min(colCount, Math.max(1, Math.ceil(remaining / maxRows)));
    const perCol = Math.ceil(remaining / cols);

    if (!firstPage) {
      doc.addPage();
      drawCornerMarkers(doc);
    }
    firstPage = false;

    for (let c = 0; c < cols; c++) {
      const x = MARGIN + 10 + c * (colWidth + 4);
      const startQ = drawn + c * perCol + 1;
      const endQ = Math.min(drawn + (c + 1) * perCol, totalQ);

      // Column Header Box
      doc.setFillColor(241, 245, 249);
      doc.rect(x, startY, colWidth, 7, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('No.', x + 2, startY + 5);
      options.forEach((o, oi) => dot(doc, x + 11 + oi * 5.2, startY + 5, o));

      // Column Rows
      for (let q = startQ; q <= endQ; q++) {
        const rIdx = q - startQ;
        const rowY = startY + 8 + rIdx * rowH;

        doc.setDrawColor(226, 232, 240);
        doc.rect(x, rowY - 1, colWidth, rowH);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(`${q}.`, x + 2, rowY + 4);

        options.forEach((o, oi) => {
          const bubbleX = x + 11 + oi * 5.2;
          const bubbleY = rowY + 3;
          doc.setDrawColor(71, 85, 105);
          doc.circle(bubbleX, bubbleY, 1.8, 'S');
          doc.setFontSize(5.5);
          doc.setTextColor(100, 116, 139);
          doc.text(o, bubbleX, bubbleY + 0.8, { align: 'center' });
        });

        lastRowY = rowY;
      }
    }

    drawn += cols * perCol;
  }

  return lastRowY + rowH;
}

// Area jawaban essay (baris garis tulis). Paginasi otomatis bila penuh.
function drawEssayArea(doc: jsPDF, config: PrintableLjkConfig, startY: number, linesPerBox: number): number {
  const count = Math.max(1, config.essayCount ?? 5);
  const boxH = 9 + linesPerBox * 3.4;
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
      doc.line(MARGIN + 12, y + 8 + k * 3.4, PAGE_W - MARGIN - 12, y + 8 + k * 3.4);
    }

    y += boxH + 3;
  }

  return y;
}

function drawFooter(doc: jsPDF, config: PrintableLjkConfig) {
  const text = `AI LJK SCANNER — ${config.subject} • Tahun Ajaran ${config.academicYear}`;
  for (let p = 1; p <= doc.getNumberOfPages(); p++) {
    doc.setPage(p);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(text, PAGE_W / 2, PAGE_H - 6, { align: 'center' });
  }
}

// LJK Pilihan Ganda (dengan/bebas essay menyatu di lembar sama).
export function generatePrintableLjkPDF(config: PrintableLjkConfig) {
  const totalQ = Math.max(
    1,
    config.totalQuestions ?? config.template?.totalQuestions ?? 50
  );
  const optCount = config.optionCount ?? config.template?.optionCount ?? 5;
  const includeEssay = config.includeEssay ?? (config.template?.hasEssaySection ? 'combined' : 'none');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCornerMarkers(doc);
  drawHeaderBlock(doc, config);

  const gridEnd = drawMcGrid(doc, config, totalQ, optCount);

  if (includeEssay === 'combined') {
    drawEssayArea(doc, config, gridEnd, 4);
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
  drawHeaderBlock(doc, config);

  const formY = MARGIN + 26;
  drawEssayArea(doc, config, formY + 12, 8);

  drawFooter(doc, config);

  const count = config.essayCount ?? 5;
  doc.save(config.fileName || `Lembar_Jawaban_Essay_${count}.pdf`);
}