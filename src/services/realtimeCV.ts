// CV ringan via canvas: validasi kualitas gambar kertas LJK sebelum dikirim ke AI.
// Bertindak sebagai "mata" — menolak scan yang rusak/kosong agar tidak membuang kuota API.

export interface ImageQualityReport {
  ok: boolean;
  blank: boolean;
  lowRes: boolean;
  undecodable: boolean;
  width: number;
  height: number;
  inkDensity: number; // 0-100, persentase piksel gelap
  message?: string;
}

const BLANK_INK_DENSITY = 0.4; // < 0.4% piksel gelap => hampir seluruhnya putih
const MIN_DIMENSION = 480; // px; di bawah ini dianggap terlalu buram/kecii

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = src;
  });
}

function toCanvas(image: HTMLImageElement): HTMLCanvasElement {
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const w = Math.max(1, Math.round(image.width * scale));
  const h = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas tidak didukung');
  ctx.drawImage(image, 0, 0, w, h);
  return canvas;
}

function computeInkDensity(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 0;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let dark = 0;
  const total = width * height;
  // Sampling: analisis sebagian piksel untuk kecepatan.
  const stride = 4;
  for (let y = 0; y < height; y += stride) {
    const rowBase = y * width;
    for (let x = 0; x < width; x += stride) {
      const i = (rowBase + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Piksel gelap = luminance rendah (di bawah ambang).
      if (0.299 * r + 0.587 * g + 0.114 * b < 128) dark++;
    }
  }
  const sampled = Math.ceil(width / stride) * Math.ceil(height / stride);
  return (dark / Math.max(1, sampled)) * 100;
}

export async function analyzeImageQuality(imageStr: string): Promise<ImageQualityReport> {
  const report: ImageQualityReport = {
    ok: true,
    blank: false,
    lowRes: false,
    undecodable: false,
    width: 0,
    height: 0,
    inkDensity: 0,
  };

  try {
    const img = await loadImage(imageStr);
    report.width = img.width;
    report.height = img.height;

    if (img.width < 1 || img.height < 1) {
      report.undecodable = true;
      report.ok = false;
      report.message = 'Gambar tidak dapat didecode (ukuran tak valid).';
      return report;
    }

    if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
      report.lowRes = true;
    }

    const canvas = toCanvas(img);
    report.inkDensity = computeInkDensity(canvas);

    if (report.inkDensity < BLANK_INK_DENSITY) {
      report.blank = true;
      report.ok = false;
      report.message = 'Gambar terlihat hampir kosong (kertas putih/belum terisi). Mohon periksa hasil scan.';
    } else if (report.lowRes) {
      report.ok = false;
      report.message = 'Resolusi gambar terlalu rendah untuk analisis akurat. Gunakan foto/scan yang lebih tajam.';
    }
  } catch {
    report.undecodable = true;
    report.ok = false;
    report.message = 'Gambar rusak atau tidak valid. Coba upload ulang.';
  }

  return report;
}
