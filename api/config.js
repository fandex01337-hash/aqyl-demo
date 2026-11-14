// Vercel: настройки для сайта — есть ли ключ нейросети, база заявок и пароль панели (сам пароль не отдаём)
const { COMPANY, FIRST_MESSAGE, apiKey, managerPassword } = require('../lib/ai');
const store = require('../lib/leads-store');

module.exports = (req, res) => {
  res.status(200).json({ company: COMPANY, firstMessage: FIRST_MESSAGE, hasKey: !!apiKey(), leads: store.ready(),
    hasPassword: !!managerPassword() });
};
