// Aqyl: сервер сайта + прокси к Claude API. Без зависимостей, Node 18+.
// Запуск: set ANTHROPIC_API_KEY=... ; node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const COMPANY = process.env.COMPANY_NAME || 'AgroQazyna';
const MANAGER = process.env.MANAGER_CONTACTS || '+7 700 000 00 00, info@example.kz';
const MODEL = process.env.MODEL || 'claude-sonnet-5-5';
const API_KEY = process.env.ANTHROPIC_API_KEY;

const FIRST_MESSAGE = `Сәлеметсіз бе! Здравствуйте! Я Aqyl — ИИ-консультант компании ${COMPANY}. Помогу подобрать продукт, отвечу на вопросы по документам и помогу оставить заявку. Чем могу помочь?`;

function buildSystem() {
  const prompt = fs
    .readFileSync(path.join(__dirname, 'prompt.md'), 'utf8')
    .replaceAll('[НАЗВАНИЕ КОМПАНИИ]', COMPANY)
    .replaceAll('[КОМПАНИЯ]', COMPANY)
    .replaceAll('[КОНТАКТЫ МЕНЕДЖЕРА]', MANAGER);
  const dir = path.join(__dirname, 'knowledge');
  const docs = fs
    .readdirSync(dir)
    .filter((f) => /\.(md|txt)$/i.test(f))
    .map((f) => `<документ название="${f}">\n${fs.readFileSync(path.join(dir, f), 'utf8')}\n</документ>`)
    .join('\n');
  return `${prompt}\n\n<документы>\n${docs}\n</документы>`;
}

const LEAD_RE = /\[ЗАЯВКА\]([\s\S]*?)\[\/ЗАЯВКА\]/;

async function chat(messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: [{ type: 'text', text: buildSystem(), cache_control: { type: 'ephemeral' } }],
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  let text = data.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const m = text.match(LEAD_RE);
  if (m) {
    try {
      const lead = { ...JSON.parse(m[1]), дата: new Date().toISOString() };
      fs.appendFileSync(path.join(__dirname, 'leads.jsonl'), JSON.stringify(lead) + '\n');
      console.log('Новая заявка:', lead);
    } catch (e) {
      console.error('Не удалось разобрать заявку:', m[1]);
    }
    text = text.replace(LEAD_RE, '').trim();
  }
  return { reply: text, leadSaved: !!m };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', (c) => {
      b += c;
      if (b.length > 100_000) { reject(new Error('too large')); req.destroy(); }
    });
    req.on('end', () => resolve(b));
  });
}

const send = (res, code, obj) => {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
};

http
  .createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/api/config') {
        return send(res, 200, { company: COMPANY, firstMessage: FIRST_MESSAGE, hasKey: !!API_KEY });
      }
      if (req.method === 'POST' && req.url === '/api/chat') {
        if (!API_KEY) return send(res, 500, { error: 'ANTHROPIC_API_KEY не задан' });
        const { messages } = JSON.parse(await readBody(req));
        const ok =
          Array.isArray(messages) &&
          messages.length > 0 &&
          messages.length <= 40 &&
          messages.every((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length <= 4000);
        if (!ok) return send(res, 400, { error: 'bad request' });
        return send(res, 200, await chat(messages));
      }
      if (req.method === 'GET') {
        const file = req.url === '/' ? '/index.html' : req.url.split('?')[0];
        const full = path.join(__dirname, 'docs', path.normalize(file));
        if (!full.startsWith(path.join(__dirname, 'docs')) || !fs.existsSync(full)) {
          res.writeHead(404); return res.end('Not found');
        }
        const type = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }[path.extname(full)] || 'application/octet-stream';
        res.writeHead(200, { 'content-type': type + '; charset=utf-8' });
        return res.end(fs.readFileSync(full));
      }
      res.writeHead(405); res.end();
    } catch (e) {
      console.error(e);
      send(res, 500, { error: 'Ошибка сервера' });
    }
  })
  .listen(PORT, () => console.log(`Aqyl запущен: http://localhost:${PORT}`));
