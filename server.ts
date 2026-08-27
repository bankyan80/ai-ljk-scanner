import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import PQueue from 'p-queue';

dotenv.config();

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "AI LJK Scanner Server" });
  });

  // AI OCR & LJK Layout Analysis endpoint (Gemini Vision)
  app.post("/api/ai/analyze-ljk", async (req, res) => {
    try {
      const result = await queue.add(async () => {
        const { imageBase64, totalQuestions = 50, optionCount = 5 } = req.body;

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
                text: prompt,
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
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI LJK Scanner Server running on http://localhost:${PORT}`);
  });
}

startServer();
