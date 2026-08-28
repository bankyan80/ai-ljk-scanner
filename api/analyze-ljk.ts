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
      const { imageBase64, totalQuestions = 50, optionCount = 5, answerKeys } = req.body;

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
Analisis gambar LJK ini dan ekstrak informasi berikut dalam format JSON:
1. Informasi Identitas Siswa:
   - name: Nama lengkap siswa (jika terbaca)
   - nisn: Nomor NISN / Nomor Peserta
   - className: Kelas (misal: IX-B, VI-A)
   - subject: Mata Pelajaran (misal: MATEMATIKA, IPA)
2. Model LJK:
   - detectedType: salah satu dari "STANDARD_BUBBLE_SHEET", "SOAL_JAWABAN_MENYATU_SD", "BLOCK_LAYOUT", "CUSTOM"
   - confidence: tingkat keyakinan 0-1
   - detectedTotalQuestions: perkiraan jumlah soal (misal: 40, 50)
   - detectedOptionCount: jumlah pilihan (misal: 4 atau 5)
   - extractedAnswers: Array string jawaban siswa (contoh: ["A", "B", "-", "C", ...])

Kembalikan HANYA JSON valid tanpa markdown blok \`\`\`json.`;

      // Build answer-key context for Gemini verification if provided.
      let answerKeyContext = "";
      if (Array.isArray(answerKeys) && answerKeys.length > 1) {
        const pairs: string[] = [];
        for (let i = 1; i < answerKeys.length; i++) {
          pairs.push(`${i}:${answerKeys[i] || "A"}`);
        }
        answerKeyContext =
          "\n\n3. KUNCI JAWABAN (untuk verifikasi benar/salah):\n" +
          pairs.join(", ") +
          "\n\nBandingkan extractedAnswers dengan kunci jawaban ini, lalu pada field verificationResults isi untuk SETIAP soal (index dimulai dari 1):\n" +
          "- status: salah satu dari \"CORRECT\" | \"WRONG\" | \"EMPTY\" | \"MULTIPLE\" | \"REVIEW\"\n" +
          "  - CORRECT = jawaban siswa sama dengan kunci\n" +
          "  - WRONG = jawaban siswa terisi tapi berbeda dari kunci\n" +
          "  - EMPTY = LJK kosong untuk soal ini\n" +
          "  - MULTIPLE = lebih dari satu pilihan terisi untuk soal ini\n" +
          "  - REVIEW = ragu-ragu / perlu pengecekan manual\n" +
          "- studentAnswer: jawaban terisi yang terbaca (gunakan \"-\" bila kosong)\n" +
          "verificationResults harus berupa array 1-indexed (verificationResults[1] untuk soal 1, dst).";
      }

      const fullPrompt = prompt + answerKeyContext;

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
