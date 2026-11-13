// Vercel: новая заявка с сайта (демо-чат или форма)
const { cleanLead } = require('../lib/ai');
const store = require('../lib/leads-store');
const body = require('../lib/body');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  if (!store.ready()) return res.status(503).json({ ok: false, error: 'База заявок не подключена' });
  try {
    await store.saveLead(cleanLead(body(req)));
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Ошибка сервера' });
  }
};
