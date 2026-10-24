// Демо-движок Aqyl: отвечает по готовому сценарию, без сервера и API-ключа.
// Нужен data.js (продукция, культуры, регионы). Работает в браузере и на GitHub Pages.
(function () {
  const COMPANY = 'AgroQazyna';
  const { PRODUCTS, CROPS, CROP_RX, REGIONS } = window.AQYL_DATA;
  const fmt = (n) => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
  const fmtT = (n, lang) => String(+n.toFixed(2)).replace('.', lang === 'en' ? '.' : ',');
  const AREAS = [10, 25, 50, 100, 250, 500, 1000, 5000];
  const CONTACT = '+7 700 000 00 00, info@example.kz';

  const STAGE = {
    ru: { sow: 'при посеве', top: 'подкормка', base: 'под основную обработку' },
    kk: { sow: 'себу кезінде', top: 'қосымша қоректендіру', base: 'негізгі өңдеуге' },
    en: { sow: 'at sowing', top: 'top dressing', base: 'basic application' },
  };

  const S = {
    ru: {
      hello: `Сәлеметсіз бе! Здравствуйте! Я Aqyl — ИИ-консультант компании ${COMPANY}. Помогу подобрать удобрение под культуру, посчитаю стоимость, отвечу на вопросы по документам и помогу оставить заявку. Чем могу помочь?`,
      chips: ['Подобрать удобрение', 'Цены в каталоге', 'Доставка и оплата', 'Анализ документа', 'Частые вопросы', 'Оставить заявку', 'Позвать менеджера'],
      faqIntro: 'Вот что у меня спрашивают чаще всего. Выберите вопрос или напишите свой:',
      faqChips: ['В какие регионы доставка?', 'Когда вносить удобрения?', 'Как хранить удобрения?', 'Какая фасовка?', 'Скидки на опт', 'Сертификаты', 'Контакты и график', 'Кто ты и что умеешь?'],
      askCrop: 'Для какой культуры подбираем удобрение?',
      badCrop: 'Пока я подбираю программу для пшеницы, ячменя, подсолнечника, кукурузы, рапса и картофеля. Выберите культуру из списка или напишите её название.',
      askArea: (c) => `Культура: ${c}. Какая площадь посева (га)? Выберите вариант или напишите число.`,
      badArea: 'Не удалось понять площадь. Напишите число гектаров, например: 120.',
      askRegion: (a) => `Принято: ${a} га. В каком регионе находится поле? Выберите из списка или напишите.`,
      recoHead: (c, a, r) => `Для культуры «${c}» на ${a} га (${r}) рекомендую:\n`,
      item: (i, n, st, norm, t, sum) => `${i}) ${n} — ${st}, ${norm} кг/га: ${t} т ≈ ${fmt(sum)} ₸`,
      recoTotal: (s) => `\nИтого ≈ ${fmt(s)} ₸ с НДС, без доставки.`,
      recoDisc: (tons, d, s) => ` Объём ${tons} т даёт оптовую скидку ${d}% — ≈ ${fmt(s)} ₸.`,
      recoMin: ' Минимальный заказ — 1 тонна.',
      recoDeliv: (r, d) => `\nДоставка в регион «${r}» — около ${d} раб. дней, точную стоимость рассчитает менеджер.`,
      recoAsk: '\n\n📄 Источник: catalog.md, delivery_faq.md\n\nОформить заявку?',
      recoChips: ['Какая окупаемость?', 'Да, оформить заявку', 'Подобрать для другой культуры', 'Позвать менеджера'],
      priceHead: 'Цены на 01.10.2026, с НДС, без доставки (мешок 50 кг):\n',
      priceFoot: '\n📄 Источник: catalog.md, прайс-лист\nПодобрать вариант под вашу культуру?',
      priceOne: (n, p, use, norm) => `${n}, мешок 50 кг — ${fmt(p)} ₸. ${use} Норма: ${norm} кг/га.\n\n📄 Источник: catalog.md`,
      priceChips: ['Подобрать удобрение', 'Скидки на опт', 'Какая фасовка?', 'Оставить заявку'],
      delivery: 'Доставка по Казахстану автотранспортом — от 1–2 до 7 рабочих дней, в зависимости от региона. Стоимость считает менеджер по адресу и объёму. Самовывоз со склада в Астане бесплатно, пн–пт 9:00–18:00.\n\n📄 Источник: delivery_faq.md, раздел «Доставка»',
      regionsHead: 'Доставляем во все регионы Казахстана. Ориентировочные сроки (рабочие дни):\n',
      regionsFoot: '\n📄 Источник: delivery_faq.md, раздел «Регионы»',
      payment: 'Оплата безналичная, по счёту: предоплата 50% или 100%. Постоянным клиентам по договору возможна отсрочка до 30 дней.\n\n📄 Источник: delivery_faq.md, раздел «Оплата»',
      discount: 'Оптовая скидка: от 20 тонн — 5%, от 50 тонн — 8%. Минимальный заказ — 1 тонна.\n\n📄 Источник: catalog.md, delivery_faq.md',
      docs: 'Сертификаты соответствия предоставляются на каждую партию по запросу — менеджер отправит их вместе со счётом. Паспорта безопасности — в разделе инструкций.\n\n📄 Источник: delivery_faq.md, раздел «FAQ»',
      contacts: `Офис и склад: г. Астана, ул. Примерная, 1 (демо-адрес).\nГрафик: пн–пт 9:00–18:00.\nТел.: +7 700 000 00 00\nE-mail: info@example.kz\n\n📄 Источник: delivery_faq.md, раздел «Контакты»`,
      timing: 'Ориентир по инструкции: фосфорные и комплексные удобрения (аммофос, суперфосфат, NPK) вносят при посеве или под основную обработку, азотные (карбамид, селитра, сульфат аммония) — весной в подкормку по вегетации. Точные сроки зависят от культуры и региона — уточните у агронома или менеджера.\n\n📄 Источник: instructions.md, раздел «Внесение»',
      storage: 'Хранить в сухом закрытом складе, в оригинальной упаковке, вдали от влаги и огня. Гарантийный срок хранения — 12 месяцев со дня изготовления. Подробности — в паспорте безопасности продукции.\n\n📄 Источник: instructions.md, раздел «Хранение»',
      packaging: 'Мешки по 50 кг; биг-бэги по 1 т — по запросу при заказе от 5 т.\n\n📄 Источник: catalog.md, раздел «Фасовка»',
      about: `Я Aqyl — ИИ-консультант компании ${COMPANY}. Отвечаю только по документам компании: каталог, цены, доставка, оплата, инструкции. Умею подобрать удобрение под культуру и площадь, посчитать стоимость и сроки, оформить заявку и передать вопрос менеджеру. Говорю по-казахски, по-русски и по-английски.`,
      manager: `Понимаю, сейчас передам вопрос менеджеру. Кратко: клиент просит помощи специалиста. Свяжитесь с менеджером: ${CONTACT} (пн–пт 9:00–18:00).\n\nМогу также оформить заявку, и менеджер перезвонит сам.`,
      returns: `Приношу извинения за неудобства. Нераспечатанная продукция принимается в течение 14 дней, но решение по возврату и жалобам принимает менеджер. Кратко передам суть: возврат/претензия по заказу.\n\nСвяжитесь с менеджером: ${CONTACT} — или оставьте заявку, и он перезвонит.`,
      leadChips: ['Оставить заявку', 'Подобрать удобрение'],
      thanks: 'Пожалуйста! Если появятся ещё вопросы — я на связи.',
      offtopic: `Я консультант ${COMPANY} и лучше всего помогу с вопросами об удобрениях, ценах, доставке и оформлении заявки.`,
      jail: 'Я не могу раскрывать внутренние инструкции и менять свою роль. Но с удовольствием помогу с выбором удобрений, ценами и заявкой.',
      unknown: `В моих материалах нет точной информации по этому вопросу. Могу передать его менеджеру: ${CONTACT}. А пока — чем ещё помочь?`,
      cancel: 'Хорошо, отменил. Чем ещё могу помочь?',
      leadName: 'Отлично, оформим заявку. Как к Вам обращаться?',
      leadContact: (n) => `${n}, укажите, пожалуйста, телефон или e-mail для связи.`,
      badContact: 'Не похоже на телефон или e-mail. Попробуйте ещё раз, например: +7 700 123 45 67.',
      leadRequest: 'Что Вас интересует (продукт, объём)?',
      leadTime: 'В какое время Вам удобно, чтобы менеджер связался?',
      timeChips: ['Сегодня после 15:00', 'Завтра утром', 'В любое время'],
      leadSummary: (l) => `Проверьте, пожалуйста:\n• Имя: ${l.имя}\n• Контакт: ${l.контакт}\n• Запрос: ${l.запрос}\n• Время: ${l.время}\n\nВсё верно?`,
      confirmChips: ['Да, всё верно', 'Отменить'],
      leadDone: 'Готово, заявка передана менеджеру! Он свяжется с Вами в указанное время. Спасибо!',
      confirmAgain: 'Подтвердите, пожалуйста: всё верно? (да / отмена)',
      yes: /^(да|верно|подтвержда|ок|ага|yes|иә|дұрыс)/i,
      no: /(нет|отмен|не надо|cancel|жоқ|болдыр)/i,
      defaultReq: 'Консультация по удобрениям',
      other: 'Подобрать для другой культуры',
      roiNeed: 'Сначала подберём программу питания для вашей культуры — тогда посчитаю окупаемость.',
      roi: (c, a, cost, upl, extraT, price, rev, profit, pct) =>
        `Ориентировочная окупаемость для «${c}» на ${a} га:\n• Затраты на удобрения: ≈ ${fmt(cost)} ₸\n• Ожидаемая прибавка урожая: ≈ ${extraT} т (${upl} т/га)\n• Доп. выручка при цене ${fmt(price)} ₸/т: ≈ ${fmt(rev)} ₸\n• Чистый эффект: ≈ ${fmt(profit)} ₸ (${pct}% к затратам)\n\nЭто оценка на демо-допущениях, а не гарантия: результат зависит от погоды, почвы и агротехники. Точный расчёт сделает агроном.\n\n📄 Источник: catalog.md, раздел «Допущения для окупаемости»`,
      roiChips: ['Да, оформить заявку', 'Подобрать для другой культуры', 'Позвать менеджера'],
      docHelp: 'Могу разобрать договор, счёт или коммерческое предложение: найду суммы, даты, сроки и штрафы. Нажмите 📎 в строке сообщения и выберите файл (.txt или .pdf) — он обрабатывается только в вашем браузере. Или попробуйте образец.',
      sampleChip: 'Проверить образец договора',
      docRead: (n) => `Прочитал документ «${n}». Вот главное:`,
      docAmounts: 'Суммы', docDates: 'Даты', docTerms: 'Сроки', docPen: 'Обязательства и санкции', docNone: 'не найдено',
      docNothing: 'Не нашёл в тексте сумм, дат и сроков. Возможно, это не договор или текст не удалось извлечь.',
      docDisclaimer: 'Это автоматический обзор, не юридическая консультация. Важные условия проверьте с менеджером или юристом.',
      docChips: ['Какие сроки в документе?', 'Какие штрафы в документе?', 'Какие суммы в документе?', 'Передать менеджеру'],
      docBy: (n) => `По документу «${n}»:`,
      docUnsupported: 'Пока читаю текстовые файлы и PDF (.txt, .md, .csv, .pdf). Для фото и сканов нужен живой режим с распознаванием.',
      docTooBig: 'Файл слишком большой (максимум 2 МБ).',
      docPdfFail: 'Не удалось прочитать PDF. Попробуйте текстовый файл.',
    },
    en: {
      hello: `Hello! I'm Aqyl, the AI consultant of ${COMPANY}. I can pick a fertilizer for your crop, calculate the cost, answer questions from our documents and place a request. How can I help?`,
      chips: ['Pick a fertilizer', 'Catalog prices', 'Delivery and payment', 'Analyze a document', 'FAQ', 'Leave a request', 'Call a manager'],
      faqIntro: 'Here is what people ask most often. Pick a question or type your own:',
      faqChips: ['Which regions do you deliver to?', 'When to apply fertilizer?', 'How to store fertilizer?', 'What packaging is available?', 'Bulk discounts', 'Certificates', 'Contacts and hours', 'Who are you?'],
      askCrop: 'Which crop do you need a fertilizer for?',
      badCrop: 'For now I build programs for wheat, barley, sunflower, corn, rapeseed and potato. Pick a crop from the list or type its name.',
      askArea: (c) => `Crop: ${c}. What is the sowing area (hectares)? Pick an option or type a number.`,
      badArea: "I couldn't understand the area. Please type a number of hectares, e.g. 120.",
      askRegion: (a) => `Got it: ${a} ha. Which region is the field in? Pick from the list or type it.`,
      recoHead: (c, a, r) => `For ${c.toLowerCase()} on ${a} ha (${r}) I recommend:\n`,
      item: (i, n, st, norm, t, sum) => `${i}) ${n} — ${st}, ${norm} kg/ha: ${t} t ≈ ${fmt(sum)} ₸`,
      recoTotal: (s) => `\nTotal ≈ ${fmt(s)} ₸ incl. VAT, excluding delivery.`,
      recoDisc: (tons, d, s) => ` Volume of ${tons} t qualifies for the ${d}% bulk discount — ≈ ${fmt(s)} ₸.`,
      recoMin: ' Minimum order is 1 tonne.',
      recoDeliv: (r, d) => `\nDelivery to "${r}" takes about ${d} business days; a manager will calculate the exact cost.`,
      recoAsk: '\n\n📄 Source: catalog.md, delivery_faq.md\n\nWould you like to place a request?',
      recoChips: ['What is the payback?', 'Yes, place a request', 'Pick for another crop', 'Call a manager'],
      priceHead: 'Prices as of 01.10.2026, VAT included, delivery excluded (50 kg bag):\n',
      priceFoot: '\n📄 Source: catalog.md\nShall I pick a product for your crop?',
      priceOne: (n, p, use, norm) => `${n}, 50 kg bag — ${fmt(p)} ₸. ${use} Rate: ${norm} kg/ha.\n\n📄 Source: catalog.md`,
      priceChips: ['Pick a fertilizer', 'Bulk discounts', 'What packaging is available?', 'Leave a request'],
      delivery: 'Delivery across Kazakhstan by truck takes from 1–2 to 7 business days depending on the region. A manager calculates the cost by address and volume. Pickup from our Astana warehouse is free, Mon–Fri 9:00–18:00.\n\n📄 Source: delivery_faq.md',
      regionsHead: 'We deliver to all regions of Kazakhstan. Approximate lead time (business days):\n',
      regionsFoot: '\n📄 Source: delivery_faq.md',
      payment: 'Payment is by bank transfer against an invoice: 50% or 100% prepayment. Regular clients can get up to 30 days deferral under a contract.\n\n📄 Source: delivery_faq.md',
      discount: 'Bulk discount: 5% from 20 tonnes, 8% from 50 tonnes. Minimum order is 1 tonne.\n\n📄 Source: catalog.md, delivery_faq.md',
      docs: 'Conformity certificates are provided for each batch on request; the manager sends them with the invoice. Safety data sheets are in the instructions section.\n\n📄 Source: delivery_faq.md',
      contacts: 'Office and warehouse: Astana, Primernaya st. 1 (demo address).\nHours: Mon–Fri 9:00–18:00.\nPhone: +7 700 000 00 00\nE-mail: info@example.kz\n\n📄 Source: delivery_faq.md',
      timing: 'Per the instructions: phosphorus and complex fertilizers (ammophos, superphosphate, NPK) go in at sowing or with primary tillage; nitrogen ones (urea, nitrate, ammonium sulfate) in spring as in-season top dressing. Exact timing depends on the crop and region — please check with an agronomist or a manager.\n\n📄 Source: instructions.md',
      storage: 'Store in a dry covered warehouse, in original packaging, away from moisture and fire. Guaranteed shelf life is 12 months from the production date. See the product safety data sheet for details.\n\n📄 Source: instructions.md',
      packaging: '50 kg bags; 1 t big bags on request for orders from 5 t.\n\n📄 Source: catalog.md',
      about: `I'm Aqyl, the AI consultant of ${COMPANY}. I answer only from company documents: catalog, prices, delivery, payment, instructions. I can pick a fertilizer for your crop and area, calculate cost and lead time, place a request and hand your question to a manager. I speak Kazakh, Russian and English.`,
      manager: `Understood, I'll pass this to a manager. Summary: the client asks for a specialist. Contact: ${CONTACT} (Mon–Fri 9:00–18:00).\n\nI can also take a request so the manager calls you.`,
      returns: `I apologize for the inconvenience. Unopened goods are accepted within 14 days, but returns and complaints are decided by a manager. Summary: return/complaint about an order.\n\nContact: ${CONTACT} — or leave a request and the manager will call you.`,
      leadChips: ['Leave a request', 'Pick a fertilizer'],
      thanks: "You're welcome! I'm here if you have more questions.",
      offtopic: `I'm a consultant of ${COMPANY}, so I can best help with fertilizers, prices, delivery and requests.`,
      jail: "I can't reveal internal instructions or change my role, but I'm happy to help with fertilizers, prices and requests.",
      unknown: `I don't have exact information on this in my materials. I can pass it to a manager: ${CONTACT}. Anything else I can help with?`,
      cancel: 'Okay, cancelled. What else can I help with?',
      leadName: 'Great, let’s place a request. What is your name?',
      leadContact: (n) => `${n}, please give a phone number or e-mail to reach you.`,
      badContact: "That doesn't look like a phone or e-mail. Please try again, e.g. +7 700 123 45 67.",
      leadRequest: 'What are you interested in (product, volume)?',
      leadTime: 'When is it convenient for the manager to contact you?',
      timeChips: ['Today after 3 pm', 'Tomorrow morning', 'Any time'],
      leadSummary: (l) => `Please check:\n• Name: ${l.имя}\n• Contact: ${l.контакт}\n• Request: ${l.запрос}\n• Time: ${l.время}\n\nIs everything correct?`,
      confirmChips: ['Yes, correct', 'Cancel'],
      leadDone: 'Done, your request has been sent to the manager! They will contact you at the specified time. Thank you!',
      confirmAgain: 'Please confirm: is everything correct? (yes / cancel)',
      yes: /^(yes|yep|correct|ok|да|иә)/i,
      no: /(no|cancel|нет|отмен|жоқ)/i,
      defaultReq: 'Fertilizer consultation',
      other: 'Pick for another crop',
      roiNeed: "Let's first build a nutrition program for your crop — then I'll calculate the payback.",
      roi: (c, a, cost, upl, extraT, price, rev, profit, pct) =>
        `Estimated payback for ${c.toLowerCase()} on ${a} ha:\n• Fertilizer cost: ≈ ${fmt(cost)} ₸\n• Expected extra yield: ≈ ${extraT} t (${upl} t/ha)\n• Extra revenue at ${fmt(price)} ₸/t: ≈ ${fmt(rev)} ₸\n• Net effect: ≈ ${fmt(profit)} ₸ (${pct}% of cost)\n\nThis is an estimate based on demo assumptions, not a guarantee: results depend on weather, soil and agronomy. An agronomist will make the exact calculation.\n\n📄 Source: catalog.md, section "Payback assumptions"`,
      roiChips: ['Yes, place a request', 'Pick for another crop', 'Call a manager'],
      docHelp: 'I can review a contract, invoice or commercial offer: I will find amounts, dates, deadlines and penalties. Tap 📎 next to the message box and choose a file (.txt or .pdf) — it is processed only in your browser. Or try the sample.',
      sampleChip: 'Check the sample contract',
      docRead: (n) => `I read the document "${n}". Key points:`,
      docAmounts: 'Amounts', docDates: 'Dates', docTerms: 'Deadlines', docPen: 'Obligations and penalties', docNone: 'not found',
      docNothing: "I didn't find amounts, dates or deadlines in the text. It may not be a contract, or the text could not be extracted.",
      docDisclaimer: 'This is an automatic overview, not legal advice. Please check important terms with a manager or a lawyer.',
      docChips: ['What are the deadlines in the document?', 'What are the penalties in the document?', 'What are the amounts in the document?', 'Pass to a manager'],
      docBy: (n) => `From the document "${n}":`,
      docUnsupported: 'For now I read text files and PDFs (.txt, .md, .csv, .pdf). Photos and scans need live mode with recognition.',
      docTooBig: 'The file is too large (2 MB max).',
      docPdfFail: 'Could not read the PDF. Please try a text file.',
    },
    kk: {
      hello: `Сәлеметсіз бе! Здравствуйте! Мен Aqyl — ${COMPANY} компаниясының ЖИ-кеңесшісімін. Дақылға тыңайтқыш таңдап, құнын есептеп, құжаттар бойынша сұрақтарға жауап беріп, өтінім қалдыруға көмектесемін. Қалай көмектесе аламын?`,
      chips: ['Тыңайтқыш таңдау', 'Каталог бағасы', 'Жеткізу және төлем', 'Құжатты талдау', 'Жиі қойылатын сұрақтар', 'Өтінім қалдыру', 'Менеджерді шақыру'],
      faqIntro: 'Бізден жиі сұрайтындар осылар. Сұрақты таңдаңыз немесе өзіңіз жазыңыз:',
      faqChips: ['Қай аймаққа жеткізесіздер?', 'Тыңайтқышты қашан енгізу керек?', 'Тыңайтқышты қалай сақтау керек?', 'Қандай қаптама бар?', 'Көтерме жеңілдік', 'Сертификаттар', 'Байланыс және жұмыс кестесі', 'Сен кімсің?'],
      askCrop: 'Қай дақылға тыңайтқыш таңдаймыз?',
      badCrop: 'Қазір мен бидай, арпа, күнбағыс, жүгері, рапс және картопқа бағдарлама құрамын. Тізімнен дақылды таңдаңыз немесе атауын жазыңыз.',
      askArea: (c) => `Дақыл: ${c}. Егіс алқабының ауданы қанша (га)? Нұсқаны таңдаңыз немесе санды жазыңыз.`,
      badArea: 'Ауданды түсінбедім. Гектар санын жазыңыз, мысалы: 120.',
      askRegion: (a) => `Қабылданды: ${a} га. Алқап қай аймақта орналасқан? Тізімнен таңдаңыз немесе жазыңыз.`,
      recoHead: (c, a, r) => `«${c}» дақылы үшін, ${a} га (${r}), мынаны ұсынамын:\n`,
      item: (i, n, st, norm, t, sum) => `${i}) ${n} — ${st}, ${norm} кг/га: ${t} т ≈ ${fmt(sum)} ₸`,
      recoTotal: (s) => `\nБарлығы ≈ ${fmt(s)} ₸ ҚҚС-пен, жеткізусіз.`,
      recoDisc: (tons, d, s) => ` ${tons} т көлемге көтерме жеңілдік ${d}% беріледі — ≈ ${fmt(s)} ₸.`,
      recoMin: ' Ең аз тапсырыс — 1 тонна.',
      recoDeliv: (r, d) => `\n«${r}» аймағына жеткізу — шамамен ${d} жұмыс күні, нақты құнын менеджер есептейді.`,
      recoAsk: '\n\n📄 Дереккөз: catalog.md, delivery_faq.md\n\nӨтінім ресімдейік пе?',
      recoChips: ['Қайтарымы қандай?', 'Иә, өтінім ресімдеу', 'Басқа дақылға таңдау', 'Менеджерді шақыру'],
      priceHead: 'Бағалар 01.10.2026 күніне, ҚҚС-пен, жеткізусіз (50 кг қап):\n',
      priceFoot: '\n📄 Дереккөз: catalog.md\nДақылыңызға өнім таңдап берейін бе?',
      priceOne: (n, p, use, norm) => `${n}, 50 кг қап — ${fmt(p)} ₸. ${use} Нормасы: ${norm} кг/га.\n\n📄 Дереккөз: catalog.md`,
      priceChips: ['Тыңайтқыш таңдау', 'Көтерме жеңілдік', 'Қандай қаптама бар?', 'Өтінім қалдыру'],
      delivery: 'Қазақстан бойынша автокөлікпен жеткізу — аймаққа байланысты 1–2-ден 7 жұмыс күніне дейін. Құнын мекенжай мен көлемге қарай менеджер есептейді. Астанадағы қоймадан өзі алып кету — тегін, дс–жм 9:00–18:00.\n\n📄 Дереккөз: delivery_faq.md',
      regionsHead: 'Қазақстанның барлық аймағына жеткіземіз. Шамамен мерзімдері (жұмыс күні):\n',
      regionsFoot: '\n📄 Дереккөз: delivery_faq.md',
      payment: 'Төлем шот бойынша қолма-қол ақшасыз: 50% немесе 100% алдын ала төлем. Тұрақты клиенттерге келісімшарт бойынша 30 күнге дейін кейінге қалдыру мүмкін.\n\n📄 Дереккөз: delivery_faq.md',
      discount: 'Көтерме жеңілдік: 20 тоннадан — 5%, 50 тоннадан — 8%. Ең аз тапсырыс — 1 тонна.\n\n📄 Дереккөз: catalog.md, delivery_faq.md',
      docs: 'Сәйкестік сертификаттары әр партияға сұраныс бойынша беріледі — менеджер шотпен бірге жібереді. Қауіпсіздік паспорттары нұсқаулықтар бөлімінде.\n\n📄 Дереккөз: delivery_faq.md',
      contacts: 'Кеңсе және қойма: Астана қ., Примерная к-сі, 1 (демо-мекенжай).\nЖұмыс кестесі: дс–жм 9:00–18:00.\nТел.: +7 700 000 00 00\nE-mail: info@example.kz\n\n📄 Дереккөз: delivery_faq.md',
      timing: 'Нұсқаулық бойынша: фосфорлы және кешенді тыңайтқыштар (аммофос, суперфосфат, NPK) себу кезінде немесе негізгі өңдеуге, азотты тыңайтқыштар (карбамид, селитра, аммоний сульфаты) көктемде вегетация кезінде қосымша қоректендіруге енгізіледі. Нақты мерзімі дақыл мен аймаққа байланысты — агроном немесе менеджерден нақтылаңыз.\n\n📄 Дереккөз: instructions.md',
      storage: 'Құрғақ жабық қоймада, түпнұсқа қаптамада, ылғал мен оттан аулақ сақтаңыз. Кепілдік сақтау мерзімі — өндірілген күннен бастап 12 ай. Толығырақ — өнімнің қауіпсіздік паспортында.\n\n📄 Дереккөз: instructions.md',
      packaging: '50 кг қаптар; 5 т-дан бастап тапсырысқа сұраныс бойынша 1 т биг-бэгтер.\n\n📄 Дереккөз: catalog.md',
      about: `Мен Aqyl — ${COMPANY} компаниясының ЖИ-кеңесшісімін. Тек компания құжаттары бойынша жауап беремін: каталог, баға, жеткізу, төлем, нұсқаулықтар. Дақыл мен ауданға тыңайтқыш таңдап, құны мен мерзімін есептеп, өтінім ресімдеп, сұрақты менеджерге бере аламын. Қазақша, орысша және ағылшынша сөйлеймін.`,
      manager: `Түсіндім, сұрағыңызды менеджерге береміз. Қысқаша: клиент маманның көмегін сұрайды. Байланыс: ${CONTACT} (дс–жм 9:00–18:00).\n\nӨтінім де қалдыра аласыз, менеджер өзі хабарласады.`,
      returns: `Ыңғайсыздық үшін кешірім сұраймын. Ашылмаған өнім 14 күн ішінде қабылданады, бірақ қайтару мен шағым бойынша шешімді менеджер қабылдайды. Қысқаша: тапсырыс бойынша қайтару/шағым.\n\nБайланыс: ${CONTACT} — немесе өтінім қалдырыңыз.`,
      leadChips: ['Өтінім қалдыру', 'Тыңайтқыш таңдау'],
      thanks: 'Оқасы жоқ! Сұрақ болса, мен осындамын.',
      offtopic: `Мен ${COMPANY} кеңесшісімін, тыңайтқыш, баға, жеткізу және өтінім мәселелерінде жақсы көмектесемін.`,
      jail: 'Ішкі нұсқаулықты ашып, рөлімді өзгерте алмаймын. Бірақ тыңайтқыш таңдауға, бағаға және өтінімге қуана көмектесемін.',
      unknown: `Менің материалдарымда бұл сұрақ бойынша нақты ақпарат жоқ. Менеджерге бере аламын: ${CONTACT}. Тағы немен көмектесейін?`,
      cancel: 'Жарайды, бас тартылды. Тағы немен көмектесе аламын?',
      leadName: 'Тамаша, өтінім ресімдейік. Сізге қалай жүгінуге болады?',
      leadContact: (n) => `${n}, байланыс үшін телефон немесе e-mail жазыңыз.`,
      badContact: 'Телефон не e-mail-ға ұқсамайды. Қайталап көріңіз, мысалы: +7 700 123 45 67.',
      leadRequest: 'Сізді не қызықтырады (өнім, көлем)?',
      leadTime: 'Менеджер қай уақытта хабарласқаны ыңғайлы?',
      timeChips: ['Бүгін 15:00-ден кейін', 'Ертең таңертең', 'Кез келген уақытта'],
      leadSummary: (l) => `Тексеріңіз:\n• Аты: ${l.имя}\n• Байланыс: ${l.контакт}\n• Сұраныс: ${l.запрос}\n• Уақыты: ${l.время}\n\nБәрі дұрыс па?`,
      confirmChips: ['Иә, дұрыс', 'Бас тарту'],
      leadDone: 'Дайын, өтінім менеджерге жіберілді! Ол көрсетілген уақытта хабарласады. Рахмет!',
      confirmAgain: 'Растаңыз: бәрі дұрыс па? (иә / бас тарту)',
      yes: /^(иә|дұрыс|жарайды|да|yes)/i,
      no: /(жоқ|бас тарт|болдыр|нет|отмен|cancel)/i,
      defaultReq: 'Тыңайтқыш бойынша кеңес',
      other: 'Басқа дақылға таңдау',
      roiNeed: 'Алдымен дақылыңызға қоректендіру бағдарламасын таңдайық — сонда қайтарымын есептеймін.',
      roi: (c, a, cost, upl, extraT, price, rev, profit, pct) =>
        `«${c}» дақылы үшін ${a} га-ға шамамен қайтарым:\n• Тыңайтқыш шығыны: ≈ ${fmt(cost)} ₸\n• Күтілетін өнім өсімі: ≈ ${extraT} т (${upl} т/га)\n• ${fmt(price)} ₸/т бағасымен қосымша түсім: ≈ ${fmt(rev)} ₸\n• Таза нәтиже: ≈ ${fmt(profit)} ₸ (шығынның ${pct}%)\n\nБұл демо-болжамдарға негізделген бағалау, кепілдік емес: нәтиже ауа райына, топыраққа және агротехникаға байланысты. Нақты есепті агроном жасайды.\n\n📄 Дереккөз: catalog.md, «Қайтарым болжамдары» бөлімі`,
      roiChips: ['Иә, өтінім ресімдеу', 'Басқа дақылға таңдау', 'Менеджерді шақыру'],
      docHelp: 'Шартты, шотты немесе коммерциялық ұсынысты талдай аламын: сомаларды, күндерді, мерзімдер мен айыппұлдарды табамын. Хабарлама жолындағы 📎 басып, файлды (.txt немесе .pdf) таңдаңыз — ол тек сіздің браузеріңізде өңделеді. Немесе үлгіні көріңіз.',
      sampleChip: 'Шарт үлгісін тексеру',
      docRead: (n) => `«${n}» құжатын оқыдым. Негізгісі:`,
      docAmounts: 'Сомалар', docDates: 'Күндер', docTerms: 'Мерзімдер', docPen: 'Міндеттемелер мен санкциялар', docNone: 'табылмады',
      docNothing: 'Мәтіннен сома, күн немесе мерзім таппадым. Бұл шарт емес болуы мүмкін немесе мәтін алынбады.',
      docDisclaimer: 'Бұл автоматты шолу, заңгерлік кеңес емес. Маңызды шарттарды менеджермен немесе заңгермен тексеріңіз.',
      docChips: ['Құжатта қандай мерзімдер бар?', 'Құжатта қандай айыппұлдар бар?', 'Құжатта қандай сомалар бар?', 'Менеджерге беру'],
      docBy: (n) => `«${n}» құжаты бойынша:`,
      docUnsupported: 'Әзірге мәтіндік файлдар мен PDF оқимын (.txt, .md, .csv, .pdf). Фото мен сканерге танумен тірі режим керек.',
      docTooBig: 'Файл тым үлкен (ең көбі 2 МБ).',
      docPdfFail: 'PDF оқу мүмкін болмады. Мәтіндік файлды қолданып көріңіз.',
    },
  };

  const RX = {
    jail: /забудь|игнориру|промт|промпт|системн|инструкци[июя] (выше|свои)|ты теперь|prompt|ignore|system prompt|jailbreak|ұмыт|нұсқаулықты ұмыт/i,
    returns: /возврат|вернуть|жалоб|претензи|не доволен|недоволен|ужасн|refund|return|complaint|қайтару|қайтарғым|шағым/i,
    manager: /менеджер|человек|оператор|живой|специалист|адам|manager|human|operator|agent/i,
    docupload: /анализ документ|проверить договор|загрузить документ|образец договора|прикрепить|analy[sz]e (a )?document|sample contract|upload (a )?document|құжатты талда|шарт үлгісі/i,
    docref: /документ|договор|құжат|шарт|document|contract/i,
    roi: /окупаем|выгод|прибавк|рентабельн|сколько заработ|payback|profit|return on investment|\broi\b|қайтарым|пайда|табыс|ақталу/i,
    faq: /частые вопросы|^faq|жиі қойылатын|что спросить|help$|помощь/i,
    about: /кто ты|кто вы|ты бот|ты робот|ты человек|что умеешь|что ты можешь|о компании|чем занимаетесь|who are you|are you (a )?(bot|human|ai)|what can you|about (the )?company|сен кімсің|не істей аласың|компания туралы/i,
    regions: /какие регион|в какие регион|куда достав|все област|список област|по каким област|қай аймақ|қай облыс|which region|where do you deliver|all regions/i,
    timing: /когда вносить|как вносить|сроки внесения|внесени|когда применя|қашан енгіз|қалай енгіз|when to apply|how to apply|application time/i,
    storage: /хранить|хранени|срок годности|складир|сақта|storage|store |shelf life/i,
    packaging: /фасовк|упаковк|биг-?бэг|big.?bag|қаптама|packag/i,
    contacts: /контакт|телефон|график|режим работы|время работы|офис|адрес склада|где находит|байланыс|жұмыс кестес|жұмыс уақыт|мекенжайы|contact|phone|office|working hours|hours/i,
    delivery: /достав|привез|самовывоз|жеткіз|алып кет|delivery|shipping|ship |pickup/i,
    payment: /оплат|предоплат|отсрочк|счет|счёт|төлем|payment|pay |invoice/i,
    docs: /сертификат|документ|договор|паспорт|certificate|document|contract/i,
    discount: /скидк|оптов|опт |жеңілдік|көтерме|discount|bulk|wholesale|минимальн|минимум|ең аз|minimum/i,
    lead: /заявк|заказ|купить|оформ|связаться|хочу взять|тапсырыс|өтінім|сатып ал|order|buy|request|apply|place/i,
    reco: /подобр|подбер|подойд|посоветуй|рекоменд|урожа|посев|таңда|ұсын|тыңайтқыш таңдау|recommend|pick|suggest|which fert|fertili[sz]er for|crop/i,
    price: /цен|стоит|сколько|прайс|стоимост|каталог|баға|қанша|price|cost|how much|catalog|prices/i,
    thanks: /спасибо|благодар|рахмет|thank/i,
    greet: /^(привет|здравствуй|добрый|салем|сәлем|hello|hi\b|hey|good )/i,
    off: /погод|анекдот|футбол|курс|президент|политик|кино|weather|joke|football|movie/i,
    cancel: /^(отмена|отменить|cancel|стоп|stop|бас тарту)/i,
  };
  const PROD_RX = [
    ['npk102626', /10[:\-]26|102626/i], ['npk161616', /16[:\-]16|npk/i], ['urea', /карбамид|мочевин|urea/i],
    ['ams', /сульфат|аммоний сульфат|sulfate|sulphate/i], ['selitra', /селитр|nitrate/i], ['ammofos', /аммофос|ammophos/i],
    ['dsp', /суперфосфат|superphosphate/i], ['kcl', /калий|potassium|kcl/i],
  ];

  function detectLang(text, prev) {
    if (/[әіңғүұқөһ]/i.test(text)) return 'kk';
    // кириллица без казахских букв: короткие слова («Арпа», «Бидай») не должны менять казахский на русский
    if (/[а-яё]/i.test(text)) {
      const longWords = text.split(/[^а-яё]+/i).filter((w) => w.length >= 4).length;
      return prev === 'kk' && !/[ыэёъщ]/i.test(text) && longWords < 3 ? 'kk' : 'ru';
    }
    if (/[a-z]/i.test(text)) return 'en';
    return prev;
  }
  const findCrop = (t) => Object.keys(CROP_RX).find((k) => CROP_RX[k].test(t));
  const findRegion = (t) => (t ? REGIONS.find((r) => r.rx.test(t)) : undefined);
  const findProd = (t) => (PROD_RX.find(([, rx]) => rx.test(t)) || [])[0];

  // ---- нормализация речи: числа словами, слова-паразиты, опечатки ----
  const NUMW = {
    ru: { ноль: 0, один: 1, одна: 1, одну: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5, шесть: 6, семь: 7, восемь: 8, девять: 9, десять: 10, одиннадцать: 11, двенадцать: 12, тринадцать: 13, четырнадцать: 14, пятнадцать: 15, шестнадцать: 16, семнадцать: 17, восемнадцать: 18, девятнадцать: 19, двадцать: 20, тридцать: 30, сорок: 40, пятьдесят: 50, шестьдесят: 60, семьдесят: 70, восемьдесят: 80, девяносто: 90, сто: 100, двести: 200, триста: 300, четыреста: 400, пятьсот: 500, шестьсот: 600, семьсот: 700, восемьсот: 800, девятьсот: 900, полторы: 1.5, сотня: 100, полсотни: 50, тысяча: 'K', тысячу: 'K', тысячи: 'K', тысяч: 'K' },
    kk: { нөл: 0, бір: 1, екі: 2, үш: 3, төрт: 4, бес: 5, алты: 6, жеті: 7, сегіз: 8, тоғыз: 9, он: 10, жиырма: 20, отыз: 30, қырық: 40, елу: 50, алпыс: 60, жетпіс: 70, сексен: 80, тоқсан: 90, жүз: 'H', мың: 'K' },
    en: { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 'H', thousand: 'K' },
  };
  const FILLERS = new Set(['э', 'ээ', 'эээ', 'эм', 'мм', 'ммм', 'ну', 'короче', 'значит', 'вот', 'типа', 'ыы', 'аа', 'ааа', 'uh', 'um', 'umm', 'erm', 'эй']);
  const UNIT_AFTER = /^(га|гектар\S*|ha|hectares?|тонн\S*|т|tons?|tonnes?|кг|килограмм\S*|мешк\S*|мешок|bags?|kg|қап\S*)$/;

  const VOCAB = (() => {
    const w = new Set();
    const add = (s) => String(s).toLowerCase().split(/[\s\-.,:%()]+/).forEach((x) => { if (x.length >= 5 && !/\d/.test(x)) w.add(x); });
    Object.values(CROPS).forEach((c) => Object.values(c.name).forEach(add));
    Object.values(PRODUCTS).forEach((p) => Object.values(p.name).forEach(add));
    REGIONS.forEach((r) => { add(r.ru); add(r.kk); add(r.en); });
    ('удобрение удобрения удобрений доставка доставки оплата оплаты цена цены скидка скидки сертификат сертификаты менеджер менеджера заявка заявку заказ заказать гектар гектаров ' +
     'договор документ возврат штраф окупаемость хранение хранить фасовка контакты регион регионы культура площадь подобрать ' +
     'тыңайтқыш жеткізу төлем жеңілдік өтінім тапсырыс баға қанша құжат ' +
     'fertilizer delivery payment price prices discount certificate manager request order hectare hectares document').split(' ').forEach(add);
    return [...w];
  })();
  const VSET = new Set(VOCAB);
  function lev(a, b) {
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function fixWord(tok) {
    if (tok.length < 5 || VSET.has(tok) || /\d/.test(tok)) return tok;
    const max = tok.length >= 8 ? 2 : 1;
    let best = tok, bd = 99;
    for (const v of VOCAB) {
      if (v[0] !== tok[0] || Math.abs(v.length - tok.length) > max) continue;
      const d = lev(tok, v);
      if (d < bd) { bd = d; best = v; }
    }
    if (bd <= max) return best;
    // падежные окончания + опечатка («костонайской» → «костанайская»): сравниваем основы
    best = tok; bd = 99;
    for (const v of VOCAB) {
      if (v.length < 8 || v[0] !== tok[0]) continue;
      const n = Math.max(6, v.length - 3);
      if (tok.length < n) continue;
      const d = lev(tok.slice(0, n), v.slice(0, n));
      if (d < bd) { bd = d; best = v; }
    }
    return bd <= 1 ? best : tok;
  }

  // нормализованный текст нужен только для распознавания; исходный остаётся для показа и заявок
  function normalize(raw, lang) {
    const dict = lang === 'kk' ? { ...NUMW.ru, ...NUMW.kk } : lang === 'en' ? NUMW.en : NUMW.ru;
    const s = raw.toLowerCase()
      .replace(/(?<!\d)[,;:!?()«»"]+|[,;:!?()«»"]+(?!\d)/g, ' ')
      .replace(/\s+/g, ' ').trim();
    const toks = s.split(' ').map((t) => t.replace(/\.+$/, '')).filter((t) => t && !FILLERS.has(t));
    const out = [];
    let run = null;
    const flush = (next) => {
      if (!run) return;
      const val = run.total + run.cur;
      if (val >= 10 || UNIT_AFTER.test(next || '')) out.push(String(val)); else out.push(...run.words);
      run = null;
    };
    for (const t of toks) {
      if (t === 'and' && run) continue;
      const n = dict[t];
      if (n !== undefined) {
        run = run || { total: 0, cur: 0, words: [] };
        run.words.push(t);
        if (n === 'K') { run.total += (run.cur || 1) * 1000; run.cur = 0; }
        else if (n === 'H') run.cur = run.cur === 0 ? 100 : run.cur < 10 ? run.cur * 100 : run.cur + 100;
        else run.cur += n;
      } else { flush(t); out.push(fixWord(t)); }
    }
    flush('');
    return out.join(' ');
  }

  const UNIT_AREA = /(\d+(?:[.,]\d+)?)\s*(?:га(?![а-яёa-z])|гектар|ha(?![a-z])|hectare)/i;
  const UNIT_QTY = /(\d+(?:[.,]\d+)?)\s*(тонн\S*|т(?![а-яёa-z])|кг|килограмм\S*|мешк\S*|мешок|қап\S*|tons?(?![a-z])|tonnes?|kg|bags?)/i;
  function parseArea(nt, relaxed) {
    const t = nt.replace(/(\d)\s(\d{3})(?!\d)/g, '$1$2');
    let m = t.match(UNIT_AREA);
    if (!m && relaxed) m = t.match(/(\d+(?:[.,]\d+)?)/);
    const v = m && parseFloat(m[1].replace(',', '.'));
    return v > 0 && v <= 1e6 ? v : null;
  }
  function parseQty(nt) {
    const m = nt.replace(/(\d)\s(\d{3})(?!\d)/g, '$1$2').match(UNIT_QTY);
    if (!m) return null;
    const n = parseFloat(m[1].replace(',', '.')), u = m[2].toLowerCase();
    const kg = /^(кг|kg|килограмм)/.test(u) ? n : /^(меш|bag|қап)/.test(u) ? n * 50 : n * 1000;
    return kg > 0 && kg <= 1e7 ? kg : null;
  }

  const FRUSTRATED = /ужас|безобраз|надоел|достал|бесит|сколько можно|почему так долго|не работает|отвратит|бесполезн|terrible|awful|angry|annoy|useless|worst|ashulan|ашулан|жиіркен/i;
  const URGENT = /срочно|как можно быстрее|прямо сейчас|сегодня же|asap|urgent|right now|шұғыл|тезірек/i;
  const NAME_RX = [/меня зовут\s+([а-яёәіңғүұқөһ]{2,20})/i, /(?:моё|мое) имя\s+([а-яёәіңғүұқөһ]{2,20})/i, /my name is\s+([a-z]{2,20})/i, /менің атым\s+([а-яёәіңғүұқөһ]{2,20})/i];
  const VAGUE = /желт|слаб|плох|мало урожа|низк|не растёт|не растет|болеют|вянут|ақсарған|нашар|аз өнім|yellow|poor|low yield|wilt|stunted/i;

  // новые строки: «умные» ответы
  Object.assign(S.ru, {
    yes: /^(да|верно|подтвержда|ок|ага|угу|конечно|давайте|хорошо|оформ)/i,
    no: /^(нет|не надо|не нужно|отмен|потом|пока не)/i,
    heard: (s) => `🎤 Понял так: ${s}.\n\n`, recalc: 'Пересчитал с новыми параметрами.\n',
    empathy: 'Понимаю, это неприятно. Давайте разберёмся.',
    frustrated: `Приношу извинения за неудобства. Давайте подключим менеджера: ${CONTACT} (пн–пт 9:00–18:00), он разберётся с вашим вопросом лично. Могу также оформить заявку, и менеджер перезвонит сам.`,
    urgent: `\n\nЕсли вопрос срочный, позвоните менеджеру: ${CONTACT}.`,
    nameHello: (n) => `Приятно познакомиться, ${n}! Чем могу помочь?`,
    deliveryRegion: (r, d) => `Доставка в «${r}» — около ${d} раб. дней.\n\n`,
    declined: 'Хорошо. Если понадобится, я рядом.',
    quoteNeedProduct: 'Какой продукт посчитать для этого объёма?',
    quote: (n, t, bags, price, ppt, disc, saving, total, small) =>
      `Расчёт для «${n}», ${t} т (${bags} мешков по 50 кг):\n• По прайсу: ${fmt(price)} ₸ (${fmt(ppt)} ₸/т)\n` +
      (disc ? `• Оптовая скидка ${disc}%: −${fmt(saving)} ₸\n` : '') + `Итого ≈ ${fmt(total)} ₸ с НДС, без доставки.` +
      (small ? ' Минимальный заказ — 1 тонна (20 мешков), менеджер уточнит объём.' : '') +
      '\nСтоимость доставки рассчитает менеджер по адресу.\n\n📄 Источник: catalog.md\n\nОформить заявку?',
    quoteChips: ['Да, оформить заявку', 'Цены в каталоге', 'Позвать менеджера'],
    vague: 'Понимаю. Диагноз по состоянию посевов ставит агроном (нужен осмотр и анализ почвы), я не буду гадать. Зато могу подобрать программу питания и передать вопрос специалисту. Для какой культуры?',
    unknownSmart: `Не уверен, что правильно понял вопрос, или такой информации нет в моих материалах. Выберите тему ниже или переформулируйте. Могу передать вопрос менеджеру: ${CONTACT}.`,
  });
  Object.assign(S.en, {
    yes: /^(yes|yep|yeah|sure|ok|okay|correct|please|go ahead|да|иә)/i,
    no: /^(no|nope|not now|cancel|нет|жоқ)/i,
    heard: (s) => `🎤 I understood: ${s}.\n\n`, recalc: 'Recalculated with the new parameters.\n',
    empathy: "I understand, that's frustrating. Let's sort it out.",
    frustrated: `I'm sorry for the trouble. Let's bring in a manager: ${CONTACT} (Mon–Fri 9:00–18:00) — they will handle this personally. I can also take a request so the manager calls you.`,
    urgent: `\n\nIf it's urgent, please call a manager: ${CONTACT}.`,
    nameHello: (n) => `Nice to meet you, ${n}! How can I help?`,
    deliveryRegion: (r, d) => `Delivery to "${r}" takes about ${d} business days.\n\n`,
    declined: "Okay. I'm here if you need me.",
    quoteNeedProduct: 'Which product should I calculate for this volume?',
    quote: (n, t, bags, price, ppt, disc, saving, total, small) =>
      `Calculation for "${n}", ${t} t (${bags} bags of 50 kg):\n• List price: ${fmt(price)} ₸ (${fmt(ppt)} ₸/t)\n` +
      (disc ? `• Bulk discount ${disc}%: −${fmt(saving)} ₸\n` : '') + `Total ≈ ${fmt(total)} ₸ incl. VAT, excluding delivery.` +
      (small ? ' Minimum order is 1 tonne (20 bags); a manager will confirm the volume.' : '') +
      '\nA manager will calculate delivery by address.\n\n📄 Source: catalog.md\n\nWould you like to place a request?',
    quoteChips: ['Yes, place a request', 'Catalog prices', 'Call a manager'],
    vague: "I understand. A diagnosis of crop condition is for an agronomist (it needs an inspection and soil analysis), so I won't guess. I can build a nutrition program and pass the question to a specialist. Which crop is it?",
    unknownSmart: `I'm not sure I understood the question, or this information isn't in my materials. Pick a topic below or rephrase. I can pass it to a manager: ${CONTACT}.`,
  });
  Object.assign(S.kk, {
    yes: /^(иә|иа|дұрыс|жарайды|әрине|да|yes)/i,
    no: /^(жоқ|болмайды|бас тарт|болдыр|нет)/i,
    heard: (s) => `🎤 Былай түсіндім: ${s}.\n\n`, recalc: 'Жаңа параметрлермен қайта есептедім.\n',
    empathy: 'Түсінемін, бұл ыңғайсыз. Бірге шешейік.',
    frustrated: `Ыңғайсыздық үшін кешірім сұраймын. Менеджерді қосайық: ${CONTACT} (дс–жм 9:00–18:00), ол сұрағыңызды жеке шешеді. Өтінім де қалдыра аласыз, менеджер өзі хабарласады.`,
    urgent: `\n\nСұрақ шұғыл болса, менеджерге қоңырау шалыңыз: ${CONTACT}.`,
    nameHello: (n) => `Танысқаныма қуаныштымын, ${n}! Қалай көмектесе аламын?`,
    deliveryRegion: (r, d) => `«${r}» аймағына жеткізу — шамамен ${d} жұмыс күні.\n\n`,
    declined: 'Жарайды. Қажет болса, мен осындамын.',
    quoteNeedProduct: 'Осы көлемге қай өнімді есептеймін?',
    quote: (n, t, bags, price, ppt, disc, saving, total, small) =>
      `«${n}» үшін есеп, ${t} т (50 кг-дық ${bags} қап):\n• Прайс бойынша: ${fmt(price)} ₸ (${fmt(ppt)} ₸/т)\n` +
      (disc ? `• Көтерме жеңілдік ${disc}%: −${fmt(saving)} ₸\n` : '') + `Барлығы ≈ ${fmt(total)} ₸ ҚҚС-пен, жеткізусіз.` +
      (small ? ' Ең аз тапсырыс — 1 тонна (20 қап), көлемін менеджер нақтылайды.' : '') +
      '\nЖеткізу құнын менеджер мекенжайға қарай есептейді.\n\n📄 Дереккөз: catalog.md\n\nӨтінім ресімдейік пе?',
    quoteChips: ['Иә, өтінім ресімдеу', 'Каталог бағасы', 'Менеджерді шақыру'],
    vague: 'Түсінемін. Егіс жағдайына диагнозды агроном қояды (қарап, топырақ талдауы керек), мен болжап айтпаймын. Бірақ қоректендіру бағдарламасын таңдап, сұрақты маманға бере аламын. Қай дақыл?',
    unknownSmart: `Сұрақты дұрыс түсінгеніме сенімді емеспін, немесе мұндай ақпарат менің материалдарымда жоқ. Төмендегі тақырыпты таңдаңыз немесе басқаша жазыңыз. Менеджерге бере аламын: ${CONTACT}.`,
  });

  // ---- анализ документа: достаём суммы, даты, сроки и санкции прямо из текста ----
  const SAMPLE = `ДОГОВОР ПОСТАВКИ № 15/10-2026
г. Астана, 15.10.2026

ТОО «Дала-Агро» (Покупатель) и ${COMPANY} (Поставщик) заключили настоящий договор.

1. Предмет. Поставщик обязуется поставить аммофос 11:46 в количестве 10 тонн и карбамид 46% в количестве 20 тонн.
2. Цена и оплата. Общая сумма договора составляет 6 660 000 тенге, включая НДС. Покупатель обязан внести предоплату 50% (3 330 000 тенге) в течение 5 рабочих дней с даты подписания. Остаток оплачивается не позднее 30.11.2026.
3. Поставка. Товар поставляется партиями до 20.03.2027 на склад Покупателя в Костанайской области силами Поставщика.
4. Ответственность. За просрочку поставки Поставщик уплачивает пеню 0,1% от стоимости непоставленного товара за каждый день, но не более 10% от суммы договора. За просрочку оплаты Покупатель уплачивает пеню 0,1% за каждый день просрочки.
5. Гарантия. Гарантийный срок хранения продукции составляет 12 месяцев со дня изготовления.
6. Срок действия. Договор действует до 31.12.2027.`;

  function extractDoc(raw) {
    const text = raw.replace(/\r/g, '').replace(/[ \t ]+/g, ' ');
    const uniq = (a) => [...new Set(a)];
    const amounts = uniq([...text.matchAll(/(\d{1,3}(?: \d{3})+|\d{4,})(?:[.,]\d{1,2})?\s*(?:₸|тенге|тг\.?|kzt|tenge)/gi)]
      .map((m) => fmt(parseInt(m[1].replace(/ /g, ''), 10)) + ' ₸')).slice(0, 6);
    const dates = uniq([...text.matchAll(/\b\d{1,2}[./]\d{1,2}[./]\d{4}\b/g)].map((m) => m[0])).slice(0, 6);
    const sentences = text.split(/(?<=[.;!?])\s+(?=[А-ЯA-ZӘІҢҒҮҰҚӨҺ0-9«"])|\n+/).map((s) => s.replace(/\s+/g, ' ').trim()).filter((s) => s.length > 15);
    const cut = (s) => (s.length > 170 ? s.slice(0, 167) + '…' : s);
    const terms = uniq(sentences.filter((s) => /в течение|не позднее|в срок|срок|до \d{1,2}\.\d{1,2}\.\d{4}|within|no later than|deadline|мерзім|дейін/i.test(s)).map(cut)).slice(0, 4);
    const PEN = /штраф|пен[яиюе]|неустойк|penalt|fine|айыппұл/i;
    const pens = uniq(sentences.filter((s) => PEN.test(s) || /обязан|обязуется|гаранти|предоплат|shall|obliged|prepayment|warranty|міндеттен/i.test(s)).map(cut))
      .filter((s) => !terms.includes(s)).sort((a, b) => PEN.test(b) - PEN.test(a)).slice(0, 5);
    return { amounts, dates, terms, pens };
  }

  const FAQ_KEYS = ['regions', 'timing', 'storage', 'packaging', 'contacts', 'delivery', 'payment', 'docs', 'discount'];

  window.createDemo = function (startLang) {
    let lang = startLang || 'ru';
    let flow = null; // crop | area | region | name | contact | request | time | confirm
    let ctx = {};
    const mem = {}; // память диалога: имя клиента и последний расчёт
    const out = (text, chips) => ({ text, chips: chips || [] });
    const cropChips = () => Object.values(CROPS).map((c) => `${c.icon} ${c.name[lang]}`);
    const areaChips = () => AREAS.map((a) => `${a} ${lang === 'en' ? 'ha' : 'га'}`);
    const regionChips = () => REGIONS.map((r) => r[lang]);
    const prodChips = () => Object.values(PRODUCTS).map((p) => p.name[lang]);
    const lead = () => ({ имя: ctx.name, контакт: ctx.contact, запрос: ctx.request || S[lang].defaultReq, время: ctx.time });

    // берём из фразы всё, что узнали: культуру, площадь, регион
    function absorb(nt, raw, relaxedArea, regionFallback) {
      let got = 0;
      const c = findCrop(nt), a = parseArea(nt, relaxedArea), r = findRegion(nt);
      if (c) { ctx.crop = c; got++; }
      if (a) { ctx.area = a; got++; }
      if (r) { ctx.region = r[lang]; ctx.regionObj = r; got++; }
      else if (regionFallback && !c && !a && raw.length > 1) { ctx.region = raw.slice(0, 60); ctx.regionObj = null; got++; }
      return got;
    }
    const summary = () => [ctx.crop && CROPS[ctx.crop].name[lang], ctx.area && `${ctx.area} ${lang === 'en' ? 'ha' : 'га'}`, ctx.region].filter(Boolean).join(', ');

    function advance(L, pre = '') {
      if (!ctx.crop) { flow = 'crop'; return out(pre + L.askCrop, cropChips()); }
      if (!ctx.area) { flow = 'area'; return out(pre + L.askArea(CROPS[ctx.crop].name[lang]), areaChips()); }
      if (!ctx.region) { flow = 'region'; return out(pre + L.askRegion(ctx.area), regionChips()); }
      return recommend(L, pre);
    }

    function recommend(L, pre = '') {
      const reg = ctx.regionObj || findRegion(ctx.region);
      const rName = reg ? reg[lang] : String(ctx.region).slice(0, 60);
      const days = reg ? reg.days : '3–7';
      const crop = CROPS[ctx.crop], a = ctx.area;
      let sum = 0, tons = 0;
      const lines = crop.plan.map(([pk, norm, st], i) => {
        const p = PRODUCTS[pk], t = (norm * a) / 1000, s = norm * a * (p.price / 50);
        sum += s; tons += t;
        return L.item(i + 1, p.name[lang], STAGE[lang][st], norm, fmtT(t, lang), s);
      });
      tons = +tons.toFixed(1);
      const disc = tons >= 50 ? 8 : tons >= 20 ? 5 : 0;
      ctx.cost = sum * (1 - disc / 100);
      let text = pre + L.recoHead(crop.name[lang], a, rName) + lines.join('\n') + L.recoTotal(sum);
      if (disc) text += L.recoDisc(fmtT(tons, lang), disc, sum * (1 - disc / 100));
      if (tons < 1) text += L.recoMin;
      text += L.recoDeliv(rName, days) + L.recoAsk;
      ctx.request = `${crop.name[lang]}, ${a} ${lang === 'en' ? 'ha' : 'га'}, ${rName}: ` +
        crop.plan.map(([pk, norm]) => `${PRODUCTS[pk].name[lang]} ${fmtT((norm * a) / 1000, lang)} т`).join(', ');
      mem.last = { crop: ctx.crop, area: a, region: ctx.region, regionObj: reg || null };
      ctx.offer = 'lead';
      flow = null;
      return out(text, L.recoChips);
    }

    function quote(pk, kg, L) {
      const p = PRODUCTS[pk], tons = kg / 1000, bags = Math.ceil(kg / 50), price = (kg * p.price) / 50;
      const disc = tons >= 50 ? 8 : tons >= 20 ? 5 : 0;
      ctx.request = `${p.name[lang]} ${fmtT(tons, lang)} т`;
      ctx.offer = 'lead';
      return out(L.quote(p.name[lang], fmtT(tons, lang), bags, price, p.price * 20, disc, (price * disc) / 100, price * (1 - disc / 100), tons < 1), L.quoteChips);
    }

    function docReply(name, content) {
      const L = S[lang];
      const f = extractDoc(content);
      const none = !(f.amounts.length || f.dates.length || f.terms.length || f.pens.length);
      ctx.doc = { name, f };
      if (none) return out(L.docNothing, L.chips);
      const sec = (h, a) => `${h}:\n` + (a.length ? a.map((x) => '• ' + x).join('\n') : L.docNone);
      const text = [L.docRead(name), sec(L.docAmounts, f.amounts), sec(L.docDates, f.dates), sec(L.docTerms, f.terms), sec(L.docPen, f.pens)].join('\n\n') + '\n\n' + L.docDisclaimer;
      return out(text, L.docChips);
    }
    function docAnswer(text, L) {
      const f = ctx.doc.f;
      const pick = /штраф|пен[яиюе]|неустойк|санкц|обязан|айыппұл|міндет|penalt|fine|oblig/i.test(text) ? [L.docPen, f.pens]
        : /сумм|стоим|цен|сома|құн|баға|amount|sum|cost|price/i.test(text) ? [L.docAmounts, f.amounts]
        : [L.docTerms, f.terms.concat(f.dates.length ? ['(' + L.docDates + ': ' + f.dates.join(', ') + ')'] : [])];
      return out(L.docBy(ctx.doc.name) + '\n' + (pick[1].length ? pick[1].map((x) => '• ' + x).join('\n') : L.docNone) + '\n\n' + L.docDisclaimer, L.docChips);
    }

    function startLead(L, nt) {
      if (!ctx.request && (findCrop(nt) || findProd(nt))) ctx.request = nt.slice(0, 160);
      ctx.offer = null;
      if (mem.name) { ctx.name = mem.name; flow = 'contact'; return out(L.leadContact(mem.name)); }
      flow = 'name';
      return out(L.leadName);
    }

    function stepLead(text, L) {
      switch (flow) {
        case 'name':
          ctx.name = text.slice(0, 60); mem.name = mem.name || ctx.name; flow = 'contact';
          return out(L.leadContact(ctx.name));
        case 'contact':
          if (!/\d{5,}|@/.test(text.replace(/[\s()-]/g, ''))) return out(L.badContact);
          ctx.contact = text.slice(0, 80);
          if (ctx.request) { flow = 'time'; return out(L.leadTime, L.timeChips); }
          flow = 'request'; return out(L.leadRequest);
        case 'request':
          ctx.request = text.slice(0, 200); flow = 'time';
          return out(L.leadTime, L.timeChips);
        case 'time':
          ctx.time = text.slice(0, 80); flow = 'confirm';
          return out(L.leadSummary(lead()), L.confirmChips);
        case 'confirm':
          if (L.yes.test(text)) {
            const l = lead(); flow = null;
            const r = out(L.leadDone, L.faqChips.slice(0, 4));
            r.lead = { ...l, дата: new Date().toISOString() };
            ctx = {};
            return r;
          }
          if (L.no.test(text)) { flow = null; ctx = {}; return out(L.cancel, L.chips); }
          return out(L.confirmAgain, L.confirmChips);
      }
    }

    function route(raw, nt, L, opts) {
      const inLeadFlow = flow && !['crop', 'area', 'region'].includes(flow);
      if (inLeadFlow) return stepLead(raw, L);

      // шаги подбора: можно ответить сразу на несколько вопросов («пшеница, сто гектаров, Костанай»)
      if (flow === 'crop' || flow === 'area' || flow === 'region') {
        const got = absorb(nt, raw, flow === 'area', flow === 'region');
        if (!got) return out(flow === 'crop' ? L.badCrop : flow === 'area' ? L.badArea : L.askRegion(ctx.area), flow === 'crop' ? cropChips() : flow === 'area' ? areaChips() : regionChips());
        return advance(L, opts.voice ? L.heard(summary()) : '');
      }

      // имя клиента
      for (const rx of NAME_RX) {
        const m = raw.match(rx);
        if (m) {
          mem.name = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
          if (raw.length < 45) return out(L.nameHello(mem.name), L.chips);
        }
      }

      // «да» в ответ на предложение оформить заявку
      if (ctx.offer === 'lead') {
        if (L.yes.test(nt)) return startLead(L, nt);
        if (L.no.test(nt) && nt.length < 25) { ctx.offer = null; return out(L.declined, L.chips); }
      }

      if (RX.returns.test(nt)) return out(L.returns, L.leadChips);
      if (RX.manager.test(nt)) return out(L.manager, L.leadChips);
      if (RX.faq.test(nt)) return out(L.faqIntro, L.faqChips);
      if (RX.about.test(nt)) return out(L.about, L.chips);

      // расчёт по объёму: «20 тонн карбамида», «сто мешков селитры»
      const kg = parseQty(nt);
      if (kg) {
        const pk = findProd(nt);
        if (pk) return quote(pk, kg, L);
        if (/стоит|цен[аыу]|сколько|price|cost|how much|баға|қанша/i.test(nt)) return out(L.quoteNeedProduct, prodChips());
      }

      // вопросы по документам компании: можно сразу несколько в одной фразе
      const reg = findRegion(nt);
      const answers = {
        regions: () => L.regionsHead + REGIONS.map((r) => `• ${r[lang]} — ${r.days}`).join('\n') + '\n' + L.regionsFoot,
        timing: () => L.timing, storage: () => L.storage, packaging: () => L.packaging, contacts: () => L.contacts,
        delivery: () => (reg ? L.deliveryRegion(reg[lang], reg.days) : '') + L.delivery,
        payment: () => L.payment, docs: () => L.docs, discount: () => L.discount,
      };
      let hits = FAQ_KEYS.filter((k) => RX[k].test(nt));
      if (hits.includes('regions')) hits = hits.filter((k) => k !== 'delivery');
      // «цены на карбамид и доставка в Караганде»: цену тоже отдаём, если она названа явно
      const pk0 = findProd(nt);
      if (hits.length && (pk0 || /цен[аыу]|прайс|prices?\b|баға/i.test(nt))) {
        hits.unshift('price');
        answers.price = () => {
          if (pk0) { const p = PRODUCTS[pk0]; return L.priceOne(p.name[lang], p.price, p.use[lang], p.norm); }
          return L.priceHead + Object.values(PRODUCTS).map((p) => `• ${p.name[lang]} — ${fmt(p.price)} ₸`).join('\n') + '\n' + L.priceFoot;
        };
      }
      if (hits.length) {
        const chips = hits.length === 1 && ['contacts', 'docs'].includes(hits[0]) ? L.leadChips : L.faqChips;
        return out(hits.slice(0, 3).map((k) => answers[k]()).join('\n\n— — —\n\n'), chips);
      }

      if (RX.lead.test(nt)) return startLead(L, nt);

      if (RX.roi.test(nt)) {
        if (!(ctx.crop && ctx.area && ctx.cost)) { flow = 'crop'; return out(L.roiNeed, cropChips()); }
        const c = CROPS[ctx.crop], extraT = c.uplift * ctx.area, rev = extraT * c.cropPrice, profit = rev - ctx.cost;
        return out(L.roi(c.name[lang], ctx.area, ctx.cost, fmtT(c.uplift, lang), fmtT(extraT, lang), c.cropPrice, rev, profit, Math.round((profit / ctx.cost) * 100)), L.roiChips);
      }

      // «другая культура» — площадь и регион берём из прошлого расчёта
      if (raw === L.other) {
        ctx = mem.last ? { area: mem.last.area, region: mem.last.region, regionObj: mem.last.regionObj } : {};
        flow = 'crop';
        return out(L.askCrop, cropChips());
      }

      // подбор: культура / площадь / регион из одной фразы, уточнения вроде «а для ячменя?»
      const crop = findCrop(nt), prod = findProd(nt), area = parseArea(nt, false);
      const slotIntent = (crop && !prod) || area || (reg && (mem.last || RX.reco.test(nt)));
      if (slotIntent) {
        const follow = mem.last && !RX.reco.test(nt);
        ctx = follow ? { ...mem.last } : {};
        absorb(nt, raw, false, false);
        const pre = (opts.voice ? L.heard(summary()) : '') + (follow && ctx.crop && ctx.area && ctx.region ? L.recalc : '');
        return advance(L, pre);
      }
      if (RX.reco.test(nt)) { ctx = {}; return advance(L); }

      if (prod) {
        const p = PRODUCTS[prod];
        return out(L.priceOne(p.name[lang], p.price, p.use[lang], p.norm), L.priceChips);
      }
      if (RX.price.test(nt)) {
        const list = Object.values(PRODUCTS).map((p) => `• ${p.name[lang]} — ${fmt(p.price)} ₸`).join('\n');
        return out(L.priceHead + list + '\n' + L.priceFoot, L.priceChips);
      }
      if (VAGUE.test(nt)) { ctx = {}; flow = 'crop'; return out(L.vague, cropChips()); }
      if (RX.thanks.test(nt)) return out(L.thanks, L.chips);
      if (RX.greet.test(nt)) return out(mem.name ? L.nameHello(mem.name) : L.hello, L.chips);
      if (RX.off.test(nt)) return out(L.offtopic, L.chips);
      const r = out(L.unknownSmart, L.chips);
      r.unknown = true;
      return r;
    }

    return {
      get lang() { return lang; },
      setLang(l) { if (S[l]) { lang = l; flow = null; ctx = {}; delete mem.last; } },
      greeting() { return out(S[lang].hello, S[lang].chips); },
      docReply,
      docText: (k) => S[lang][k],
      // оценка «насколько фраза понятна» — чтобы выбрать лучший вариант распознавания речи
      score(rawText) {
        const keep = lang;
        lang = detectLang(rawText, lang);
        const nt = normalize(rawText, lang);
        lang = keep;
        let s = 0;
        if (findCrop(nt)) s += 2;
        if (findProd(nt)) s += 2;
        if (findRegion(nt)) s += 2;
        if (parseArea(nt, false)) s += 2;
        if (parseQty(nt)) s += 2;
        ['delivery', 'payment', 'discount', 'docs', 'storage', 'packaging', 'timing', 'contacts', 'regions', 'lead', 'roi', 'price', 'returns', 'manager', 'about'].forEach((k) => { if (RX[k].test(nt)) s += 1; });
        return s;
      },
      reply(rawInput, opts = {}) {
        const raw = rawInput.trim();
        if (!flow) lang = detectLang(raw, lang);
        const L = S[lang];
        const inLeadFlow = flow && !['crop', 'area', 'region'].includes(flow);
        const nt = inLeadFlow ? raw : normalize(raw, lang);

        if (!flow && raw === L.sampleChip) return docReply('sample-contract.txt', SAMPLE);
        if (RX.cancel.test(nt) && flow) { flow = null; ctx = {}; return out(L.cancel, L.chips); }
        if (RX.jail.test(nt)) return out(L.jail, L.chips);
        if (!flow && ctx.doc && RX.docref.test(nt) && /срок|дат|штраф|пен[яиюе]|сумм|стоим|мерзім|айыппұл|сома|deadline|term|date|penalt|fine|amount|sum/i.test(nt)) return docAnswer(nt, L);
        if (!flow && RX.docupload.test(nt)) return out(L.docHelp, [L.sampleChip]);

        const frustrated = !inLeadFlow && (FRUSTRATED.test(raw) || /[A-ZА-ЯЁ]{5,}.*[A-ZА-ЯЁ]{5,}/.test(raw) || (raw.match(/!/g) || []).length >= 3);
        const urgent = !inLeadFlow && URGENT.test(nt);
        const r = route(raw, nt, L, opts);
        if (frustrated) {
          if (r.unknown) { r.text = L.frustrated; r.chips = L.leadChips; }
          else r.text = L.empathy + '\n\n' + r.text;
        }
        if (urgent && !r.lead) r.text += L.urgent;
        return r;
      },
    };
  };

  // Ответ на вопрос без состояния (для блока FAQ на сайте)
  window.aqylAnswer = (lang, q) => { const d = window.createDemo(lang); return d.reply(q).text; };
  window.AQYL_FAQ_CHIPS = (lang) => S[lang].faqChips;
  window.AQYL_AREA_CHIPS = AREAS;
})();
