// Заявки на Vercel: у Vercel нет постоянных файлов, поэтому храним в Upstash Redis (бесплатно,
// подключается в Vercel → Storage). Переменные Vercel добавит сам: KV_REST_API_URL и KV_REST_API_TOKEN
// (или UPSTASH_REDIS_REST_URL и UPSTASH_REDIS_REST_TOKEN). Без базы заявки остаются в браузере клиента.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const LIST = 'aqyl:leads';
const IDS = 'aqyl:lead-ids';

const ready = () => !!(URL_ && TOKEN);

async function redis(cmd) {
  const res = await fetch(URL_, { method: 'POST', headers: { authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(cmd) });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`Redis: ${data.error || res.status}`);
  return data.result;
}

async function saveLead(lead) {
  if (!(await redis(['SADD', IDS, lead.id]))) return;            // повтор той же заявки не дублируем
  await redis(['LPUSH', LIST, JSON.stringify(lead)]);             // новые — первыми
  console.log('Новая заявка:', lead.имя, lead.контакт);
}

async function readLeads() {
  return (await redis(['LRANGE', LIST, 0, -1]))
    .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

async function clearLeads() {
  await redis(['DEL', LIST, IDS]);
}

module.exports = { ready, saveLead, readLeads, clearLeads };
