import 'dotenv/config'; 
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { GoogleGenAI } from "@google/genai";

const app = express();
const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// **Set your default Gemini model here:**
const GEMINI_MODEL = "gemini-2.5-flash";
app.use(express.json());
app.post('/generate-text', async (req, res) => {
    // 1. MENGAMBIL PESANAN
    const { prompt } = req.body; 

    try {
        // 2. MENGIRIM KE KOKI (GEMINI)
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });

        // 3. MENGANTAR JAWABAN KE PEMBELI
        res.status(200).json({ result: response.text }); 
    } catch (e) {
        // 4. JIKA ADA MASALAH
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  try {
    // 1. Ambil Teks & Gambar dari User
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString("base64");

    // 2. Kirim ke Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Sesuaikan dengan model yang kamu pakai
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    // 3. Kirim Jawaban Balik
    res.status(200).json({ result: response.text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});
app.post("/generate-from-document", upload.single("document"), async (req, res) => {
  try {
    // 1. Ambil Data
    const { prompt } = req.body;
    const base64Document = req.file.buffer.toString("base64");

    // 2. Kirim ke Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            // Perhatikan ini: Kalau user tidak kirim prompt, kita kasih default "Tolong buat ringkasan..."
            { text: prompt ? prompt : "Tolong buat ringkasan dari dokumen berikut." },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Document,
              },
            },
          ],
        },
      ],
    });

    // 3. Balas ke User
    res.status(200).json({ result: response.text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  try {
    // 1. Ambil Data
    const { prompt } = req.body;
    const base64Audio = req.file.buffer.toString("base64");

    // 2. Kirim ke Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            // Kalau prompt kosong, default-nya minta transkrip
            { text: prompt ? prompt : "Tolong buatkan transkrip dari rekaman berikut." },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Audio,
              },
            },
          ],
        },
      ],
    });

    // 3. Balas ke User
    res.status(200).json({ result: response.text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));
