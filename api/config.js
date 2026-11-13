// Vercel: настройки для сайта — есть ли ключ нейросети и база заявок
const { COMPANY, FIRST_MESSAGE, apiKey } = require('../lib/ai');
const store = require('../lib/leads-store');

module.exports = (req, res) => {
  res.status(200).json({ company: COMPANY, firstMessage: FIRST_MESSAGE, hasKey: !!apiKey(), leads: store.ready() });
};
