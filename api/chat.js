// Vercel: чат с нейросетью. Ключ — переменная GEMINI_API_KEY (или ANTHROPIC_API_KEY) в настройках Vercel.
const { apiKey, ask, validMessages, cleanLead } = require('../lib/ai');
const store = require('../lib/leads-store');
const body = require('../lib/body');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    if (!apiKey()) return res.status(500).json({ error: 'Ключ не задан: GEMINI_API_KEY в настройках Vercel' });
    const { messages, lang } = body(req);
    if (!validMessages(messages)) return res.status(400).json({ error: 'bad request' });
    const { reply, lead } = await ask(messages, lang);
    let leadSaved = false;
    if (lead && store.ready()) {
      try { await store.saveLead(cleanLead(lead)); leadSaved = true; } catch (e) { console.error(e); }
    }
    res.status(200).json({ reply, leadSaved });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
