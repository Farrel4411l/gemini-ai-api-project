import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';                // TAMBAHAN BARU
import { fileURLToPath } from 'url';    // TAMBAHAN BARU
import { GoogleGenAI } from "@google/genai";

// Konfigurasi agar __dirname bisa dipakai di mode "module"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash";

app.use(cors());
app.use(express.json());

// === BAGIAN PENTING DARI SLIDE TERAKHIR ===
// Memberi tahu server: "Eh, kalau ada yang buka alamat utama,
// tolong sajikan file yang ada di folder 'frontend' ya!"
app.use(express.static(path.join(__dirname, 'frontend'))); 

// Endpoint Chatbot
app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        const contents = conversation.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
        });

        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Chatbot ready on http://localhost:${PORT}`));