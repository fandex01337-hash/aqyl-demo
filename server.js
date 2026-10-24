// Aqyl: сервер сайта + прокси к Claude API. Без зависимостей, Node 18+.
// Запуск: set ANTHROPIC_API_KEY=... ; node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3030;   // 3030, чтобы не мешать другим проектам на 3000
const COMPANY = process.env.COMPANY_NAME || 'AgroQazyna';
const MANAGER = process.env.MANAGER_CONTACTS || '+7 (7172) 57-45-20, sales@agroqazyna.kz';
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

// ---------- Заявки: папка «заявки» ----------
// заявки.txt   — читает человек (открыть в Блокноте или Word)
// заявки.jsonl — читает панель менеджера
// Пароль панели: переменная MANAGER_PASSWORD или файл manager-password.txt (в GitHub не попадает)
const LEADS_DIR = path.join(__dirname, 'заявки');
const LEADS_TXT = path.join(LEADS_DIR, 'заявки.txt');
const LEADS_JSONL = path.join(LEADS_DIR, 'заявки.jsonl');
const PASS_FILE = path.join(__dirname, 'manager-password.txt');
const managerPassword = () =>
  process.env.MANAGER_PASSWORD || (fs.existsSync(PASS_FILE) ? fs.readFileSync(PASS_FILE, 'utf8').trim() : '');

const clip = (v) => String(v ?? '').replace(/[\r\n]+/g, ' ').slice(0, 500);
function readLeads() {
  if (!fs.existsSync(LEADS_JSONL)) return [];
  return fs.readFileSync(LEADS_JSONL, 'utf8').split('\n').filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
function saveLead(raw) {
  fs.mkdirSync(LEADS_DIR, { recursive: true });
  const all = readLeads();
  const id = clip(raw.id) || Date.now().toString(36);
  if (all.some((x) => x.id === id)) return;                       // повтор той же заявки не дублируем
  const lead = { id, дата: new Date().toISOString(), имя: clip(raw.имя), контакт: clip(raw.контакт),
    запрос: clip(raw.запрос), время: clip(raw.время), язык: clip(raw.язык), устройство: clip(raw.устройство) };
  fs.appendFileSync(LEADS_JSONL, JSON.stringify(lead) + '\n');
  const when = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' });
  fs.appendFileSync(LEADS_TXT,
    `==== Заявка № ${all.length + 1} · ${when} · ${lead.устройство || 'сайт'} ====\r\n` +
    `Имя:           ${lead.имя}\r\nКонтакт:       ${lead.контакт}\r\nЗапрос:        ${lead.запрос}\r\n` +
    `Удобное время: ${lead.время}\r\nЯзык:          ${lead.язык}\r\n\r\n`);
  console.log('Новая заявка:', lead.имя, lead.контакт);
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
      saveLead({ ...JSON.parse(m[1]), устройство: 'чат (живой режим)' });
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
        return send(res, 200, { company: COMPANY, firstMessage: FIRST_MESSAGE, hasKey: !!API_KEY, leads: true });
      }
      // новая заявка с сайта (демо-чат или форма)
      if (req.method === 'POST' && req.url === '/api/lead') {
        saveLead(JSON.parse(await readBody(req)));
        return send(res, 200, { ok: true });
      }
      // панель менеджера: список и очистка — только с паролем
      if (req.method === 'POST' && (req.url === '/api/leads' || req.url === '/api/leads/clear')) {
        const { key } = JSON.parse(await readBody(req));
        const pass = managerPassword();
        if (!pass || key !== pass) return send(res, 403, { ok: false, error: 'bad key' });
        if (req.url === '/api/leads/clear') {
          fs.rmSync(LEADS_JSONL, { force: true });
          fs.appendFileSync(LEADS_TXT, `---- Список очищен менеджером ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })} ----\r\n\r\n`);
          return send(res, 200, { ok: true });
        }
        return send(res, 200, { ok: true, leads: readLeads().reverse() });
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
        const file = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
        const full = path.join(__dirname, 'docs', path.normalize(file));
        if (!full.startsWith(path.join(__dirname, 'docs')) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
          res.writeHead(404); return res.end('Not found');
        }
        const type = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
          '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' }[path.extname(full)] || 'application/octet-stream';
        res.writeHead(200, { 'content-type': type });
        return res.end(fs.readFileSync(full));
      }
      res.writeHead(405); res.end();
    } catch (e) {
      console.error(e);
      send(res, 500, { error: 'Ошибка сервера' });
    }
  })
  .listen(PORT, () => {
    console.log(`Aqyl запущен: http://localhost:${PORT}`);
    // адрес для телефонов в той же Wi-Fi сети
    for (const list of Object.values(require('os').networkInterfaces()))
      for (const a of list || []) if (a.family === 'IPv4' && !a.internal) console.log(`С телефона (та же Wi-Fi): http://${a.address}:${PORT}`);
    if (!managerPassword()) console.log('⚠ Пароль панели не задан: создайте manager-password.txt или MANAGER_PASSWORD');
    console.log(`Заявки сохраняются в: ${LEADS_TXT}`);
  });
