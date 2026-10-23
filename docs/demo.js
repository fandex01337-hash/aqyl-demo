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
      chips: ['Подобрать удобрение', 'Цены в каталоге', 'Доставка и оплата', 'Частые вопросы', 'Оставить заявку', 'Позвать менеджера'],
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
      recoChips: ['Да, оформить заявку', 'Подобрать для другой культуры', 'Условия оплаты', 'Позвать менеджера'],
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
    },
    en: {
      hello: `Hello! I'm Aqyl, the AI consultant of ${COMPANY}. I can pick a fertilizer for your crop, calculate the cost, answer questions from our documents and place a request. How can I help?`,
      chips: ['Pick a fertilizer', 'Catalog prices', 'Delivery and payment', 'FAQ', 'Leave a request', 'Call a manager'],
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
      recoDisc: (tons, d, s) => ` Volume of ${tons} t qualifies for a ${d}% bulk discount — ≈ ${fmt(s)} ₸.`,
      recoMin: ' Minimum order is 1 tonne.',
      recoDeliv: (r, d) => `\nDelivery to "${r}" takes about ${d} business days; a manager will calculate the exact cost.`,
      recoAsk: '\n\n📄 Source: catalog.md, delivery_faq.md\n\nWould you like to place a request?',
      recoChips: ['Yes, place a request', 'Pick for another crop', 'Payment terms', 'Call a manager'],
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
    },
    kk: {
      hello: `Сәлеметсіз бе! Здравствуйте! Мен Aqyl — ${COMPANY} компаниясының ЖИ-кеңесшісімін. Дақылға тыңайтқыш таңдап, құнын есептеп, құжаттар бойынша сұрақтарға жауап беріп, өтінім қалдыруға көмектесемін. Қалай көмектесе аламын?`,
      chips: ['Тыңайтқыш таңдау', 'Каталог бағасы', 'Жеткізу және төлем', 'Жиі қойылатын сұрақтар', 'Өтінім қалдыру', 'Менеджерді шақыру'],
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
      recoChips: ['Иә, өтінім ресімдеу', 'Басқа дақылға таңдау', 'Төлем шарттары', 'Менеджерді шақыру'],
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
    },
  };

  const RX = {
    jail: /забудь|игнориру|промт|промпт|системн|инструкци[июя] (выше|свои)|ты теперь|prompt|ignore|system prompt|jailbreak|ұмыт|нұсқаулықты ұмыт/i,
    returns: /возврат|вернуть|жалоб|претензи|не доволен|недоволен|ужасн|refund|return|complaint|қайтар|шағым/i,
    manager: /менеджер|человек|оператор|живой|специалист|адам|manager|human|operator|agent/i,
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
  const findRegion = (t) => REGIONS.find((r) => r.rx.test(t));

  window.createDemo = function (startLang) {
    let lang = startLang || 'ru';
    let flow = null; // crop | area | region | name | contact | request | time | confirm
    let ctx = {};
    const out = (text, chips) => ({ text, chips: chips || [] });
    const cropChips = () => Object.values(CROPS).map((c) => `${c.icon} ${c.name[lang]}`);
    const areaChips = () => AREAS.map((a) => `${a} ${lang === 'en' ? 'ha' : 'га'}`);
    const regionChips = () => REGIONS.map((r) => r[lang]);
    const lead = () => ({ имя: ctx.name, контакт: ctx.contact, запрос: ctx.request || S[lang].defaultReq, время: ctx.time });

    function askCrop(L) { flow = 'crop'; return out(L.askCrop, cropChips()); }
    function askArea(L) { flow = 'area'; return out(L.askArea(CROPS[ctx.crop].name[lang]), areaChips()); }

    function recommend(L, regionText) {
      const reg = findRegion(regionText);
      const rName = reg ? reg[lang] : regionText.slice(0, 60);
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
      let text = L.recoHead(crop.name[lang], a, rName) + lines.join('\n') + L.recoTotal(sum);
      if (disc) text += L.recoDisc(fmtT(tons, lang), disc, sum * (1 - disc / 100));
      if (tons < 1) text += L.recoMin;
      text += L.recoDeliv(rName, days) + L.recoAsk;
      ctx.request = `${crop.name[lang]}, ${a} ${lang === 'en' ? 'ha' : 'га'}, ${rName}: ` +
        crop.plan.map(([pk, norm]) => `${PRODUCTS[pk].name[lang]} ${fmtT((norm * a) / 1000, lang)} т`).join(', ');
      flow = null;
      return out(text, L.recoChips);
    }

    function stepLead(text, L) {
      switch (flow) {
        case 'name':
          ctx.name = text.slice(0, 60); flow = 'contact';
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

    return {
      get lang() { return lang; },
      setLang(l) { if (S[l]) { lang = l; flow = null; ctx = {}; } },
      greeting() { return out(S[lang].hello, S[lang].chips); },
      reply(raw) {
        const text = raw.trim();
        if (!flow) lang = detectLang(text, lang);
        const L = S[lang];

        if (RX.cancel.test(text) && flow) { flow = null; ctx = {}; return out(L.cancel, L.chips); }
        if (RX.jail.test(text)) return out(L.jail, L.chips);

        if (flow === 'crop') {
          const c = findCrop(text);
          if (!c) return out(L.badCrop, cropChips());
          ctx.crop = c; return askArea(L);
        }
        if (flow === 'area') {
          const m = text.replace(/(\d)[\s ](\d{3})/g, '$1$2').match(/(\d+(?:[.,]\d+)?)/);
          const v = m && parseFloat(m[1].replace(',', '.'));
          if (!(v > 0) || v > 1000000) return out(L.badArea, areaChips());
          ctx.area = v; flow = 'region';
          return out(L.askRegion(v), regionChips());
        }
        if (flow === 'region') return recommend(L, text);
        if (flow) return stepLead(text, L);

        if (RX.returns.test(text)) return out(L.returns, L.leadChips);
        if (RX.manager.test(text)) return out(L.manager, L.leadChips);
        if (RX.faq.test(text)) return out(L.faqIntro, L.faqChips);
        if (RX.about.test(text)) return out(L.about, L.chips);
        if (RX.regions.test(text)) {
          return out(L.regionsHead + REGIONS.map((r) => `• ${r[lang]} — ${r.days}`).join('\n') + '\n' + L.regionsFoot, L.faqChips);
        }
        if (RX.timing.test(text)) return out(L.timing, L.faqChips);
        if (RX.storage.test(text)) return out(L.storage, L.faqChips);
        if (RX.packaging.test(text)) return out(L.packaging, L.faqChips);
        if (RX.contacts.test(text)) return out(L.contacts, L.leadChips);
        if (RX.delivery.test(text)) return out(L.delivery, L.faqChips);
        if (RX.payment.test(text)) return out(L.payment, L.faqChips);
        if (RX.docs.test(text)) return out(L.docs, L.leadChips);
        if (RX.discount.test(text)) return out(L.discount, L.faqChips);
        if (RX.lead.test(text)) { flow = 'name'; return out(L.leadName); }

        const crop = findCrop(text);
        if (crop && !PROD_RX.some(([, rx]) => rx.test(text))) { ctx = { crop }; return askArea(L); }
        if (RX.reco.test(text) || text === L.other) return askCrop(L);

        const prod = PROD_RX.find(([, rx]) => rx.test(text));
        if (prod) {
          const p = PRODUCTS[prod[0]];
          return out(L.priceOne(p.name[lang], p.price, p.use[lang], p.norm), L.priceChips);
        }
        if (RX.price.test(text)) {
          const list = Object.values(PRODUCTS).map((p) => `• ${p.name[lang]} — ${fmt(p.price)} ₸`).join('\n');
          return out(L.priceHead + list + '\n' + L.priceFoot, L.priceChips);
        }
        if (RX.thanks.test(text)) return out(L.thanks, L.chips);
        if (RX.greet.test(text)) return out(L.hello, L.chips);
        if (RX.off.test(text)) return out(L.offtopic, L.chips);
        return out(L.unknown, L.chips);
      },
    };
  };

  // Ответ на вопрос без состояния (для блока FAQ на сайте)
  window.aqylAnswer = (lang, q) => { const d = window.createDemo(lang); return d.reply(q).text; };
  window.AQYL_FAQ_CHIPS = (lang) => S[lang].faqChips;
  window.AQYL_AREA_CHIPS = AREAS;
})();
