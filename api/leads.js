// Vercel: панель менеджера — список заявок, только с паролем (переменная MANAGER_PASSWORD)
const { managerPassword } = require('../lib/ai');
const store = require('../lib/leads-store');
const body = require('../lib/body');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const pass = managerPassword();
  if (!pass || body(req).key !== pass) return res.status(403).json({ ok: false, error: 'bad key' });
  try {
    res.status(200).json({ ok: true, leads: await store.readLeads() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Ошибка сервера' });
  }
};
