import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend on /dashboard
const frontendPath = path.join(__dirname, 'frontend');
app.use('/dashboard', express.static(frontendPath));

// Redirect root / → /dashboard
app.get('/', (req, res) => res.redirect('/dashboard'));

// Catch-all for frontend routes under /dashboard
app.get('/dashboard/*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// OpenAI API route (GPT-4 + fallback)
app.post('/api/ai', async (req, res) => {
  const { prompt, targetLang } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not set' });

  async function callOpenAI(model) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
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

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Running on port ${PORT}`));
