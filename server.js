import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "64kb" }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// ------------------------------
// 1️⃣ API route
// ------------------------------
app.post('/api/ai', async (req, res) => {
  const { prompt, targetLang } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || typeof targetLang !== "string" || !targetLang.trim()) return res.status(400).json({ error: "prompt and targetLang are required" });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not set' });

  async function callOpenAI(model) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: `Translate to ${targetLang}: ${prompt}` }]
      })
    });
    return await response.json();
  }

  try {
    let data;
    try {
      data = await callOpenAI('gpt-4');
    } catch {
      console.warn('GPT-4 failed, falling back to GPT-3.5-turbo');
      data = await callOpenAI('gpt-3.5-turbo');
    }
    const translation = data.choices?.[0]?.message?.content || 'No translation returned';
    res.json({ translation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------
// 2️⃣ Serve frontend on /dashboard
// ------------------------------
const frontendPath = path.join(__dirname, 'frontend');
app.use('/dashboard', express.static(frontendPath));
app.get('/dashboard/*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ------------------------------
// 3️⃣ Redirect root / → /dashboard
// ------------------------------
app.get('/', (req, res) => res.redirect('/dashboard'));

// ------------------------------
// 4️⃣ Health check
// ------------------------------
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ------------------------------
// 5️⃣ Start server
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Running on port ${PORT}`));
