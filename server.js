// Aqyl: сервер сайта на ноутбуке + прокси к нейросети (Gemini или Claude). Без зависимостей, Node 18+.
// Запуск: node server.js (ключ — в gemini-key.txt или anthropic-key.txt). Та же логика на Vercel — в api/.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { COMPANY, FIRST_MESSAGE, apiKey, managerPassword, ask, validMessages, cleanLead } = require('./lib/ai');

const PORT = process.env.PORT || 3030;   // 3030, чтобы не мешать другим проектам на 3000

// ---------- Заявки: папка «заявки» ----------
// заявки.txt   — читает человек (открыть в Блокноте или Word)
// заявки.jsonl — читает панель менеджера
const LEADS_DIR = path.join(__dirname, 'заявки');
const LEADS_TXT = path.join(LEADS_DIR, 'заявки.txt');
const LEADS_JSONL = path.join(LEADS_DIR, 'заявки.jsonl');

function readLeads() {
  if (!fs.existsSync(LEADS_JSONL)) return [];
  return fs.readFileSync(LEADS_JSONL, 'utf8').split('\n').filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
function saveLead(raw) {
  fs.mkdirSync(LEADS_DIR, { recursive: true });
  const all = readLeads();
  const lead = cleanLead(raw);
  if (all.some((x) => x.id === lead.id)) return;                  // повтор той же заявки не дублируем
  fs.appendFileSync(LEADS_JSONL, JSON.stringify(lead) + '\n');
  const when = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' });
  fs.appendFileSync(LEADS_TXT,
    `==== Заявка № ${all.length + 1} · ${when} · ${lead.устройство || 'сайт'} ====\r\n` +
    `Имя:           ${lead.имя}\r\nКонтакт:       ${lead.контакт}\r\nЗапрос:        ${lead.запрос}\r\n` +
    `Удобное время: ${lead.время}\r\nЯзык:          ${lead.язык}\r\n\r\n`);
  console.log('Новая заявка:', lead.имя, lead.контакт);
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
        return send(res, 200, { company: COMPANY, firstMessage: FIRST_MESSAGE, hasKey: !!apiKey(), leads: true });
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
        if (!apiKey()) return send(res, 500, { error: 'Ключ не задан: gemini-key.txt или anthropic-key.txt' });
        const { messages, lang } = JSON.parse(await readBody(req));
        if (!validMessages(messages)) return send(res, 400, { error: 'bad request' });
        const { reply, lead } = await ask(messages, lang);
        if (lead) saveLead(lead);
        return send(res, 200, { reply, leadSaved: !!lead });
      }
      if (req.method === 'GET') {
        const file = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
        const full = path.join(__dirname, 'docs', path.normalize(file));
        if (!full.startsWith(path.join(__dirname, 'docs')) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
          // та же страница 404, что и на GitHub Pages
          res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
          return res.end(fs.readFileSync(path.join(__dirname, 'docs', '404.html')));
        }
        const type = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
          '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8',
          '.webmanifest': 'application/manifest+json' }[path.extname(full)] || 'application/octet-stream';
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
