import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";
import PQueue from 'p-queue';

const queue = new PQueue({ concurrency: 1 });
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await queue.add(async () => {
      const { imageBase64, totalQuestions = 50, optionCount = 5, answerKeys, templateHint } = req.body;

      if (!imageBase64) {
        throw new Error("Missing imageBase64 in request body");
      }

      const client = getGeminiClient();
      if (!client) {
        return {
          success: true,
          fallback: true,
          student: {
            name: "NAMA SISWA",
            nisn: "0000000000",
            className: "KELAS",
            subject: "MATA PELAJARAN",
          },
          layout: {
            detectedType: "STANDARD_BUBBLE_SHEET",
            questionCount: totalQuestions,
            optionCount: optionCount,
            confidence: 0.96,
          },
        };
      }

      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `Anda adalah AI pakar Computer Vision dan OCR untuk Lembar Jawaban Komputer (LJK) Ujian Sekolah Indonesia.
Analisis gambar LJK ini secara bertahap dan kembalikan struktur JSON yang kaya.

LANGKAH 1 - Pahami model & layout LJK:
- detectedType: salah satu dari "STANDARD_BUBBLE_SHEET", "SOAL_JAWABAN_MENYATU_SD", "BLOCK_LAYOUT", "CUSTOM"
  * STANDARD_BUBBLE_SHEET = kolom pilihan jawaban terpisah dari soal
  * SOAL_JAWABAN_MENYATU_SD = soal + pilihan A-D berada di baris yang sama (khas SD)
  * BLOCK_LAYOUT = soal dalam blok berbingkai
  * CUSTOM = tata letak khusus sekolah
- detectedTotalQuestions: jumlah soal yang terdeteksi
- detectedOptionCount: jumlah pilihan (4 untuk A-D, 5 untuk A-E)
- layoutConfidence: keyakinan 0-1 terhadap struktur yang dimengerti
- orientation: perkiraan orientasi halaman ("portrait" | "landscape")
- columns: perkiraan jumlah kolom jawaban pada lembar
- region: objek yang menggambarkan area-area penting
  { answerRegion: "deskripsi/persentase posisi area jawaban", identityRegion: "deskripsi area identitas" }

LANGKAH 2 - Baca identitas siswa (gunakan HTR untuk tulisan tangan):
- name, nisn, className, subject
- identityConfidence: keyakinan 0-1 terhadap keseluruhan identitas yang terbaca
Lalu pada identityReading beri per field:
- name: { text, confidence } dst.

LANGKAH 3 - Baca EKSTRAKSI JAWABAN per soal (paling penting):
Berikan field "answers" berupa objek / array 1-indexed (answers["1"], answers["2"], ...) di mana setiap soal berisi:
- rawMark: deskripsi singkat tanda yang terdeteksi ("A", "B", "C", "D", "E", "-" (kosong), "A+B" (ganda), "X" (tanda silang / dicoret), "?" (tidak jelas))
- detectedOptions: array huruf pilihan yang berisi arsiran (misal ["A"], ["B","C"] untuk ganda)
- confidence: keyakinan 0-1 (rendah jika arsiran tipis, miring, atau tidak konsisten)
- note: alasan singkat jika confidence rendah

Status yang dapat diberikan (field status):
- "X_CROSS" = ada tanda silang / dicoret
- "MULTIPLE" = lebih dari satu pilihan terisi
- "NOT_CLEAR" = tanda tidak jelas / arsiran tipis / ragu
- "FILLED" = satu pilihan terisi
- "EMPTY" = kosong

Jangan paksakan jawaban. Jika confidence < 0.6, tandai status "NOT_CLEAR" dan tetap isi perkiraan pada rawMark.

LANGKAH 4 - Ringkasan:
- extractedAnswers: Array ringkas 0-indexed jawaban representatif (misal ["A","B","-","C",...]) untuk kompatibilitas; gunakan "-" untuk kosong dan "X" untuk tanda silang, "?" untuk tidak jelas.
- overallConfidence: keyakinan keseluruhan 0-1

Gunakan keyakinan yang jujur pada setiap status. JANGAN menebak saat tidak yakin - lebih baik beri status NOT_CLEAR / REVIEW daripada memaksa jawaban.

Kembalikan HANYA JSON valid tanpa markdown blok \`\`\`json.`;

      // Build answer-key context for Gemini verification if provided.
      let answerKeyContext = "";
      if (Array.isArray(answerKeys) && answerKeys.length > 1) {
        const pairs: string[] = [];
        for (let i = 1; i < answerKeys.length; i++) {
          pairs.push(`${i}:${answerKeys[i] || "A"}`);
        }
        answerKeyContext =
          "\n\nLANGKAH 5 - VERIFIKASI dengan KUNCI JAWABAN:\n" +
          "KUNCI JAWABAN (1-indexed):\n" +
          pairs.join(", ") +
          "\n\nBandingkan setiap rawMark pada field answers dengan kunci jawaban, lalu isi pada setiap soal field verification = " +
          "salah satu dari \"CORRECT\" | \"WRONG\" | \"EMPTY\" | \"MULTIPLE\" | \"REVIEW\":\n" +
          "  - CORRECT = jawaban terisi sama dengan kunci\n" +
          "  - WRONG = jawaban terisi tapi berbeda dari kunci (termasuk jika tanda silang)\n" +
          "  - EMPTY = kosong\n" +
          "  - MULTIPLE = lebih dari satu pilihan terisi\n" +
          "  - REVIEW = confidence rendah / arsiran tidak jelas / perlu pengecekan manual guru\n" +
          "Prioritaskan REVIEW jika confidence < 0.6 meskipun cocok dengan kunci.";
      }

      // Add known layout context (Auto Template) when available.
      let templateHintContext = "";
      if (templateHint && typeof templateHint === "object") {
        const h: any = templateHint;
        templateHintContext =
          "\n\nINFORMASI MODEL LJK YANG SUDAH DIKENALI (dari template tersimpan):\n" +
          `- detectedType: ${h.detectedType || "CUSTOM"}\n` +
          (h.columns ? `- columns: ${h.columns}\n` : "") +
          (h.orientation ? `- orientation: ${h.orientation}\n` : "") +
          (h.region?.answerRegion ? `- answerRegion: ${h.region.answerRegion}\n` : "") +
          "Gunakan informasi ini untuk mempercepat dan mempertegas analisis struktur. " +
          "Jika gambar sesuai dengan layout ini, ikuti strukturnya. Jika tidak, laporkan struktur sebenarnya.";
      }

      const fullPrompt = prompt + templateHintContext + answerKeyContext;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
            {
              text: fullPrompt,
            },
          ],
        },
      });

      const text = response.text || "{}";
      const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        return {
          success: true,
          ...JSON.parse(cleanJson),
        };
      } catch (parseError) {
        return {
          success: true,
          rawText: text,
          student: {
            name: "NAMA SISWA",
            nisn: "0000000000",
            className: "KELAS",
            subject: "MATA PELAJARAN",
          },
        };
      }
    });
    return res.json(result);
  } catch (error: any) {
    console.error("AI LJK Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze LJK with AI" });
  }
}
