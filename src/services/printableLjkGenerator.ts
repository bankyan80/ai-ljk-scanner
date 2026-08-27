import jsPDF from 'jspdf';
import { LJKTemplate } from '../types';

export interface PrintableLjkConfig {
  schoolName: string;
  examTitle: string;
  subject: string;
  academicYear: string;
  template: LJKTemplate;
}

export function generatePrintableLjkPDF(config: PrintableLjkConfig) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;

  // 4 Corner Registration Square Markers (for auto scanner perspective alignment)
  const markerSize = 6;
  const drawCornerMarker = (x: number, y: number) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(x, y, markerSize, markerSize, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(x + 1, y + 2.5, markerSize - 2, 1, 'F');
    doc.rect(x + 2.5, y + 1, 1, markerSize - 2, 'F');
  };

  drawCornerMarker(margin, margin);
  drawCornerMarker(pageWidth - margin - markerSize, margin);
  drawCornerMarker(margin, pageHeight - margin - markerSize);
  drawCornerMarker(pageWidth - margin - markerSize, pageHeight - margin - markerSize);

  // Header Box
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.rect(margin + 10, margin + 4, pageWidth - (margin + 10) * 2, 18);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(config.schoolName.toUpperCase(), pageWidth / 2, margin + 11, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`LEMBAR JAWABAN KOMPUTER (LJK) — ${config.examTitle.toUpperCase()}`, pageWidth / 2, margin + 18, { align: 'center' });

  // Student Identity Form
  const formY = margin + 26;
  doc.setDrawColor(148, 163, 184);
  doc.rect(margin + 10, formY, 120, 36);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PETUNJUK PENGISIAN:', margin + 12, formY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('1. Gunakan pensil 2B untuk menghitamkan bulatan.', margin + 12, formY + 12);
  doc.text('2. Hitamkan penuh salah satu bulatan pilihan jawaban.', margin + 12, formY + 17);
  doc.text('3. Jika ingin mengganti jawaban, hapus sampai bersih.', margin + 12, formY + 22);
  doc.text('4. Jangan melipat atau merobek lembar jawaban ini.', margin + 12, formY + 27);

  // Identity Form Box on right
  const idBoxX = margin + 134;
  doc.rect(idBoxX, formY, pageWidth - idBoxX - margin - 10, 36);

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

  // Questions Columns
  const questionsStartY = formY + 42;
  const totalQ = config.template.totalQuestions;
  const optCount = config.template.optionCount;
  const options = ['A', 'B', 'C', 'D', 'E'].slice(0, optCount);

  const colCount = totalQ > 50 ? 4 : totalQ > 25 ? 3 : 2;
  const questionsPerCol = Math.ceil(totalQ / colCount);
  const colWidth = (pageWidth - (margin + 10) * 2 - (colCount - 1) * 4) / colCount;

  for (let c = 0; c < colCount; c++) {
    const colX = margin + 10 + c * (colWidth + 4);
    const startQ = c * questionsPerCol + 1;
    const endQ = Math.min((c + 1) * questionsPerCol, totalQ);

    // Column Header Box
    doc.setFillColor(241, 245, 249);
    doc.rect(colX, questionsStartY, colWidth, 7, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('No.', colX + 2, questionsStartY + 5);

    options.forEach((opt, oIdx) => {
      const optX = colX + 11 + oIdx * 5.2;
      doc.text(opt, optX, questionsStartY + 5, { align: 'center' });
    });

    // Column Rows
    const rowH = 7.6;
    for (let q = startQ; q <= endQ; q++) {
      const rIdx = q - startQ;
      const rowY = questionsStartY + 8 + rIdx * rowH;

      doc.setDrawColor(226, 232, 240);
      doc.rect(colX, rowY - 1, colWidth, rowH);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`${q}.`, colX + 2, rowY + 4);

      // Bubbles
      options.forEach((opt, oIdx) => {
        const bubbleX = colX + 11 + oIdx * 5.2;
        const bubbleY = rowY + 3;

        doc.setDrawColor(71, 85, 105);
        doc.circle(bubbleX, bubbleY, 1.8, 'S');

        doc.setFontSize(5.5);
        doc.setTextColor(100, 116, 139);
        doc.text(opt, bubbleX, bubbleY + 0.8, { align: 'center' });
      });
    }
  }

  doc.save(`Blank_LJK_${config.template.name.replace(/\s+/g, '_')}.pdf`);
}
