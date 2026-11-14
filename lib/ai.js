// Aqyl: общая логика нейросети — для сервера ноутбука (server.js) и для Vercel (api/).
// Ключи: переменная окружения или файл в корне проекта (файлы в GitHub не попадают).
// Читаем при каждом запросе — после вставки ключа в файл перезапуск не нужен.
// Если есть ключ Gemini — отвечает Gemini, иначе Claude.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMPANY = process.env.COMPANY_NAME || 'AgroQazyna';
const MANAGER = process.env.MANAGER_CONTACTS || '+7 (7172) 57-45-20, sales@agroqazyna.kz';
const MODEL = process.env.MODEL || 'claude-sonnet-5-5';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

// trim: при вставке в настройки Vercel легко прихватить пробел или перенос строки
const readKey = (env, file) =>
  (process.env[env] || '').trim() || (fs.existsSync(path.join(ROOT, file)) ? fs.readFileSync(path.join(ROOT, file), 'utf8').trim() : '');
const geminiKey = () => readKey('GEMINI_API_KEY', 'gemini-key.txt');
const claudeKey = () => readKey('ANTHROPIC_API_KEY', 'anthropic-key.txt');
const apiKey = () => geminiKey() || claudeKey();
// Пароль панели менеджера: переменная MANAGER_PASSWORD или файл manager-password.txt
const managerPassword = () => readKey('MANAGER_PASSWORD', 'manager-password.txt');

const FIRST_MESSAGE = `Сәлеметсіз бе! Здравствуйте! Я Aqyl — ИИ-консультант компании ${COMPANY}. Помогу подобрать продукт, отвечу на вопросы по документам и помогу оставить заявку. Чем могу помочь?`;

function buildSystem() {
  const prompt = fs
    .readFileSync(path.join(ROOT, 'prompt.md'), 'utf8')
    .replaceAll('[НАЗВАНИЕ КОМПАНИИ]', COMPANY)
    .replaceAll('[КОМПАНИЯ]', COMPANY)
    .replaceAll('[КОНТАКТЫ МЕНЕДЖЕРА]', MANAGER);
  const dir = path.join(ROOT, 'knowledge');
  const docs = fs
    .readdirSync(dir)
    .filter((f) => /\.(md|txt)$/i.test(f))
    .map((f) => `<документ название="${f}">\n${fs.readFileSync(path.join(dir, f), 'utf8')}\n</документ>`)
    .join('\n');
  return `${prompt}\n\n<документы>\n${docs}\n</документы>`;
}

// язык, выбранный на сайте: Aqyl отвечает на нём, даже если клиент пишет на другом
const LANG_HINT = { ru: 'Отвечай на русском языке.', kk: 'Жауапты қазақ тілінде бер.', en: 'Answer in English.' };
// чат показывает простой текст — просим без Markdown (на всякий случай разметку ещё и вырезаем в plain)
const FORMAT_HINT = 'Пиши простым текстом без Markdown: без звёздочек, решёток и таблиц. Для списков используй «•».';

async function askClaude(messages, lang) {
  const system = [{ type: 'text', text: buildSystem(), cache_control: { type: 'ephemeral' } }];
  if (LANG_HINT[lang]) system.push({ type: 'text', text: LANG_HINT[lang] });
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': claudeKey(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
}

// запасные модели: если основная перегружена (503/429/500) или молчит дольше 25 с, пробуем следующую
const GEMINI_MODELS = [...new Set([GEMINI_MODEL, 'gemini-flash-latest', 'gemini-3.5-flash-lite'])];

async function askGemini(messages, lang) {
  const system = `${buildSystem()}\n\n${FORMAT_HINT}` + (LANG_HINT[lang] ? `\n\n${LANG_HINT[lang]}` : '');
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    // у Gemini ответы бота идут с ролью model
    contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    generationConfig: { maxOutputTokens: 2048 },
  });
  let res;
  for (const model of GEMINI_MODELS) {
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': geminiKey() },
        body,
        signal: AbortSignal.timeout(25_000),
      });
    } catch (e) {
      console.log(`Gemini ${model}: нет ответа (${e.name}), пробуем следующую модель`);
      res = null;
      continue;
    }
    if (res.ok || ![404, 429, 500, 503].includes(res.status)) break;
    console.log(`Gemini ${model}: ${res.status}, пробуем следующую модель`);
  }
  if (!res) throw new Error('Gemini: ни одна модель не ответила');
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.filter((p) => p.text && !p.thought).map((p) => p.text).join('');
  if (!text) throw new Error(`Gemini: пустой ответ ${JSON.stringify(data.promptFeedback || data.candidates?.[0]?.finishReason || '')}`);
  return text;
}

const validMessages = (messages) =>
  Array.isArray(messages) &&
  messages.length > 0 &&
  messages.length <= 40 &&
  messages.every((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length <= 4000);

const LEAD_RE = /\[ЗАЯВКА\]([\s\S]*?)\[\/ЗАЯВКА\]/;

// Сайт показывает ответ простым текстом: убираем разметку Markdown (**жирный**, # заголовки, * списки)
const plain = (text) => text
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/__(.+?)__/g, '$1')
  .replace(/^#{1,6}\s+/gm, '')
  .replace(/^(\s*)[*-]\s+/gm, '$1• ')
  .replace(/(^|\s)\*(\S[^*\n]*?)\*(?=\s|[.,!?:;)]|$)/g, '$1$2');

// Ответ нейросети; заявку из текста ([ЗАЯВКА]{...}[/ЗАЯВКА]) вырезаем и отдаём отдельно — сохраняет вызывающий
async function ask(messages, lang) {
  let text = geminiKey() ? await askGemini(messages, lang) : await askClaude(messages, lang);
  let lead = null;
  const m = text.match(LEAD_RE);
  if (m) {
    try {
      lead = { ...JSON.parse(m[1]), устройство: 'чат (живой режим)' };
    } catch (e) {
      console.error('Не удалось разобрать заявку:', m[1]);
    }
    text = text.replace(LEAD_RE, '').trim();
  }
  return { reply: plain(text), lead };
}

// заявка в едином виде: обрезаем длинные поля и переносы строк
const clip = (v) => String(v ?? '').replace(/[\r\n]+/g, ' ').slice(0, 500);
const cleanLead = (raw) => ({
  id: clip(raw.id) || Date.now().toString(36), дата: new Date().toISOString(), имя: clip(raw.имя), контакт: clip(raw.контакт),
  запрос: clip(raw.запрос), время: clip(raw.время), язык: clip(raw.язык), устройство: clip(raw.устройство),
});

module.exports = { COMPANY, FIRST_MESSAGE, apiKey, managerPassword, ask, validMessages, cleanLead };
