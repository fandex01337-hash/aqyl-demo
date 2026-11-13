// Тело запроса на Vercel: обычно уже разобрано в объект, но без нужного content-type приходит строкой
module.exports = (req) => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {});
