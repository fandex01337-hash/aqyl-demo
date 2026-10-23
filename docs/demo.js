// Демо-движок Aqyl: отвечает по готовому сценарию, без сервера и API-ключа.
// Работает в браузере (GitHub Pages, открытие файла с диска).
(function () {
  const COMPANY = 'AgroQazyna';
  const fmt = (n) => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');

  // Цены из knowledge/catalog.md (демо-данные)
  const AMMOFOS = { kg: 14300 / 50, norm: 75 }; // ₸/кг, кг/га (середина 50–100)
  const UREA = { kg: 9500 / 50, norm: 125 }; // середина 100–150

  const S = {
    ru: {
      hello: `Сәлеметсіз бе! Здравствуйте! Я Aqyl — ИИ-консультант компании ${COMPANY}. Помогу подобрать продукт, отвечу на вопросы по документам и помогу оставить заявку. Чем могу помочь?`,
      chips: ['Подобрать удобрение для пшеницы', 'Цены в каталоге', 'Доставка и оплата', 'Оставить заявку', 'Позвать менеджера'],
      askArea: 'Чтобы подобрать точнее, уточните, пожалуйста: какая площадь посева (га)?',
      areaChips: ['50 га', '100 га', '500 га'],
      badArea: 'Не удалось понять площадь. Напишите число гектаров, например: 100.',
      askRegion: (a) => `Принято: ${a} га. В каком регионе находится поле?`,
      regionChips: ['Акмолинская область', 'Костанайская область', 'Туркестанская область'],
      reco: (a, r, t) =>
        `Для пшеницы на ${a} га (${r}) подойдут два продукта:\n\n` +
        `1) Аммофос 11:46 — при посеве, развивает корневую систему. Норма 50–100 кг/га, берём 75: ${t.am.t} т, ≈ ${fmt(t.am.sum)} ₸.\n` +
        `2) Карбамид 46% — весенняя подкормка. Норма 100–150 кг/га, берём 125: ${t.ur.t} т, ≈ ${fmt(t.ur.sum)} ₸.\n\n` +
        `Итого ≈ ${fmt(t.sum)} ₸ без доставки.` +
        (t.disc ? ` Ваш объём ${t.tons} т даёт оптовую скидку ${t.disc}% — ≈ ${fmt(t.sumDisc)} ₸.` : '') +
        (t.tons < 1 ? ' Минимальный заказ — 1 тонна.' : '') +
        `\nДоставка в регион «${r}» — 3–7 рабочих дней, точную стоимость рассчитает менеджер.\n\n📄 Источник: catalog.md, delivery_faq.md\n\nОформить заявку?`,
      recoChips: ['Да, оформить заявку', 'Условия оплаты', 'Позвать менеджера'],
      price:
        'Цены на 01.10.2026, с НДС, без доставки (мешок 50 кг):\n• Карбамид 46% — 9 500 ₸\n• Аммиачная селитра 34% — 8 200 ₸\n• NPK 16:16:16 — 12 800 ₸\n• Аммофос 11:46 — 14 300 ₸\n\n📄 Источник: catalog.md, прайс-лист\nПодобрать вариант под вашу культуру?',
      priceOne: {
        urea: 'Карбамид (46% N), мешок 50 кг — 9 500 ₸. Подходит для весенней подкормки зерновых, норма 100–150 кг/га.\n\n📄 Источник: catalog.md, раздел «Азотные»',
        selitra: 'Аммиачная селитра (34% N), мешок 50 кг — 8 200 ₸. Норма 150–200 кг/га.\n\n📄 Источник: catalog.md, раздел «Азотные»',
        npk: 'NPK 16:16:16, мешок 50 кг — 12 800 ₸. Универсальное, под основную обработку, норма 200–300 кг/га.\n\n📄 Источник: catalog.md, раздел «Комплексные»',
        ammofos: 'Аммофос (11:46), мешок 50 кг — 14 300 ₸. Вносится при посеве, стимулирует корневую систему пшеницы, норма 50–100 кг/га.\n\n📄 Источник: catalog.md, раздел «Комплексные»',
      },
      priceChips: ['Подобрать удобрение для пшеницы', 'Скидки на опт', 'Оставить заявку'],
      delivery:
        'Доставка по Казахстану автотранспортом — 3–7 рабочих дней, стоимость считает менеджер по адресу и объёму. Самовывоз со склада в Астане бесплатно, пн–пт 9:00–18:00.\n\n📄 Источник: delivery_faq.md, раздел «Доставка»',
      payment:
        'Оплата безналичная, по счёту: предоплата 50% или 100%. Постоянным клиентам по договору возможна отсрочка до 30 дней.\n\n📄 Источник: delivery_faq.md, раздел «Оплата»',
      discount:
        'Оптовая скидка: от 20 тонн — 5%, от 50 тонн — 8%. Минимальный заказ — 1 тонна.\n\n📄 Источник: catalog.md, delivery_faq.md',
      docs: 'Сертификаты соответствия предоставляются на каждую партию по запросу — менеджер отправит их вместе со счётом.\n\n📄 Источник: delivery_faq.md, раздел «FAQ»',
      docsChips: ['Оставить заявку', 'Позвать менеджера'],
      faqChips: ['Подобрать удобрение для пшеницы', 'Цены в каталоге', 'Доставка и оплата'],
      manager:
        'Понимаю, сейчас передам вопрос менеджеру. Кратко: клиент просит помощи специалиста. Свяжитесь с менеджером: +7 700 000 00 00, info@example.kz (пн–пт 9:00–18:00).\n\nМогу также оформить заявку, и менеджер перезвонит сам.',
      returns:
        'Приношу извинения за неудобства. Нераспечатанная продукция принимается в течение 14 дней, но решение по возврату и жалобам принимает менеджер. Кратко передам суть: возврат/претензия по заказу.\n\nСвяжитесь с менеджером: +7 700 000 00 00, info@example.kz — или оставьте заявку, и он перезвонит.',
      leadChips: ['Оставить заявку', 'Подобрать удобрение для пшеницы'],
      thanks: 'Пожалуйста! Если появятся ещё вопросы — я на связи.',
      offtopic: 'Я консультант ' + COMPANY + ' и лучше всего помогу с вопросами об удобрениях, ценах, доставке и оформлении заявки.',
      jail: 'Я не могу раскрывать внутренние инструкции и менять свою роль. Но с удовольствием помогу с выбором удобрений, ценами и заявкой.',
      unknown: 'В моих материалах нет точной информации по этому вопросу. Могу передать его менеджеру: +7 700 000 00 00, info@example.kz. А пока — чем ещё помочь?',
      cancel: 'Хорошо, заявку отменил. Чем ещё могу помочь?',
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
    },
    en: {
      hello: `Hello! I'm Aqyl, the AI consultant of ${COMPANY}. I can help you choose a product, answer questions from our documents and place a request. How can I help?`,
      chips: ['Fertilizer for wheat', 'Catalog prices', 'Delivery and payment', 'Leave a request', 'Call a manager'],
      askArea: 'To pick the right option, please tell me: what is the sowing area (hectares)?',
      areaChips: ['50 ha', '100 ha', '500 ha'],
      badArea: "I couldn't understand the area. Please type a number of hectares, e.g. 100.",
      askRegion: (a) => `Got it: ${a} ha. Which region is the field in?`,
      regionChips: ['Akmola region', 'Kostanay region', 'Turkistan region'],
      reco: (a, r, t) =>
        `For wheat on ${a} ha (${r}) I suggest two products:\n\n` +
        `1) Ammophos 11:46 — at sowing, boosts the root system. Rate 50–100 kg/ha, using 75: ${t.am.t} t, ≈ ${fmt(t.am.sum)} ₸.\n` +
        `2) Urea 46% — spring top dressing. Rate 100–150 kg/ha, using 125: ${t.ur.t} t, ≈ ${fmt(t.ur.sum)} ₸.\n\n` +
        `Total ≈ ${fmt(t.sum)} ₸ excluding delivery.` +
        (t.disc ? ` Your volume of ${t.tons} t qualifies for a ${t.disc}% bulk discount — ≈ ${fmt(t.sumDisc)} ₸.` : '') +
        (t.tons < 1 ? ' Minimum order is 1 tonne.' : '') +
        `\nDelivery to "${r}" takes 3–7 business days; a manager will calculate the exact cost.\n\n📄 Source: catalog.md, delivery_faq.md\n\nWould you like to place a request?`,
      recoChips: ['Yes, place a request', 'Payment terms', 'Call a manager'],
      price:
        'Prices as of 01.10.2026, VAT included, delivery excluded (50 kg bag):\n• Urea 46% — 9,500 ₸\n• Ammonium nitrate 34% — 8,200 ₸\n• NPK 16:16:16 — 12,800 ₸\n• Ammophos 11:46 — 14,300 ₸\n\n📄 Source: catalog.md\nShall I pick a product for your crop?',
      priceOne: {
        urea: 'Urea (46% N), 50 kg bag — 9,500 ₸. For spring top dressing of grain crops, 100–150 kg/ha.\n\n📄 Source: catalog.md',
        selitra: 'Ammonium nitrate (34% N), 50 kg bag — 8,200 ₸. Rate 150–200 kg/ha.\n\n📄 Source: catalog.md',
        npk: 'NPK 16:16:16, 50 kg bag — 12,800 ₸. Universal, for primary tillage, 200–300 kg/ha.\n\n📄 Source: catalog.md',
        ammofos: 'Ammophos (11:46), 50 kg bag — 14,300 ₸. Applied at sowing, stimulates wheat roots, 50–100 kg/ha.\n\n📄 Source: catalog.md',
      },
      priceChips: ['Fertilizer for wheat', 'Bulk discounts', 'Leave a request'],
      delivery:
        'Delivery across Kazakhstan by truck takes 3–7 business days; a manager calculates the cost by address and volume. Pickup from our Astana warehouse is free, Mon–Fri 9:00–18:00.\n\n📄 Source: delivery_faq.md',
      payment:
        'Payment is by bank transfer against an invoice: 50% or 100% prepayment. Regular clients can get up to 30 days deferral under a contract.\n\n📄 Source: delivery_faq.md',
      discount: 'Bulk discount: 5% from 20 tonnes, 8% from 50 tonnes. Minimum order is 1 tonne.\n\n📄 Source: catalog.md, delivery_faq.md',
      docs: 'Conformity certificates are provided for each batch on request; the manager sends them with the invoice.\n\n📄 Source: delivery_faq.md',
      docsChips: ['Leave a request', 'Call a manager'],
      faqChips: ['Fertilizer for wheat', 'Catalog prices', 'Delivery and payment'],
      manager:
        "Understood, I'll pass this to a manager. Summary: the client asks for a specialist. Contact: +7 700 000 00 00, info@example.kz (Mon–Fri 9:00–18:00).\n\nI can also take a request so the manager calls you.",
      returns:
        'I apologize for the inconvenience. Unopened goods are accepted within 14 days, but returns and complaints are decided by a manager. Summary: return/complaint about an order.\n\nContact: +7 700 000 00 00, info@example.kz — or leave a request and the manager will call you.',
      leadChips: ['Leave a request', 'Fertilizer for wheat'],
      thanks: "You're welcome! I'm here if you have more questions.",
      offtopic: `I'm a consultant of ${COMPANY}, so I can best help with fertilizers, prices, delivery and requests.`,
      jail: "I can't reveal internal instructions or change my role, but I'm happy to help with fertilizers, prices and requests.",
      unknown: "I don't have exact information on this in my materials. I can pass it to a manager: +7 700 000 00 00, info@example.kz. Anything else I can help with?",
      cancel: 'Okay, request cancelled. What else can I help with?',
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
    },
    kk: {
      hello: `Сәлеметсіз бе! Здравствуйте! Мен Aqyl — ${COMPANY} компаниясының ЖИ-кеңесшісімін. Өнім таңдауға, құжаттар бойынша сұрақтарға жауап беруге және өтінім қалдыруға көмектесемін. Қалай көмектесе аламын?`,
      chips: ['Бидайға тыңайтқыш таңдау', 'Каталог бағасы', 'Жеткізу және төлем', 'Өтінім қалдыру', 'Менеджерді шақыру'],
      askArea: 'Дәлірек таңдау үшін айтыңыз: егіс алқабының ауданы қанша (га)?',
      areaChips: ['50 га', '100 га', '500 га'],
      badArea: 'Ауданды түсінбедім. Гектар санын жазыңыз, мысалы: 100.',
      askRegion: (a) => `Қабылданды: ${a} га. Алқап қай облыста орналасқан?`,
      regionChips: ['Ақмола облысы', 'Қостанай облысы', 'Түркістан облысы'],
      reco: (a, r, t) =>
        `${r} аймағындағы ${a} га бидай үшін екі өнім ұсынамын:\n\n` +
        `1) Аммофос 11:46 — себу кезінде, тамыр жүйесін дамытады. Нормасы 50–100 кг/га, 75 аламыз: ${t.am.t} т, ≈ ${fmt(t.am.sum)} ₸.\n` +
        `2) Карбамид 46% — көктемгі қосымша қоректендіру. Нормасы 100–150 кг/га, 125 аламыз: ${t.ur.t} т, ≈ ${fmt(t.ur.sum)} ₸.\n\n` +
        `Барлығы ≈ ${fmt(t.sum)} ₸ (жеткізусіз).` +
        (t.disc ? ` ${t.tons} т көлемге көтерме жеңілдік ${t.disc}% беріледі — ≈ ${fmt(t.sumDisc)} ₸.` : '') +
        (t.tons < 1 ? ' Ең аз тапсырыс — 1 тонна.' : '') +
        `\n«${r}» аймағына жеткізу — 3–7 жұмыс күні, нақты құнын менеджер есептейді.\n\n📄 Дереккөз: catalog.md, delivery_faq.md\n\nӨтінім ресімдейік пе?`,
      recoChips: ['Иә, өтінім ресімдеу', 'Төлем шарттары', 'Менеджерді шақыру'],
      price:
        'Бағалар 01.10.2026 күніне, ҚҚС-пен, жеткізусіз (50 кг қап):\n• Карбамид 46% — 9 500 ₸\n• Аммиак селитрасы 34% — 8 200 ₸\n• NPK 16:16:16 — 12 800 ₸\n• Аммофос 11:46 — 14 300 ₸\n\n📄 Дереккөз: catalog.md\nЕгініңізге өнім таңдап берейін бе?',
      priceOne: {
        urea: 'Карбамид (46% N), 50 кг қап — 9 500 ₸. Дәнді дақылдарды көктемде қоректендіруге, нормасы 100–150 кг/га.\n\n📄 Дереккөз: catalog.md',
        selitra: 'Аммиак селитрасы (34% N), 50 кг қап — 8 200 ₸. Нормасы 150–200 кг/га.\n\n📄 Дереккөз: catalog.md',
        npk: 'NPK 16:16:16, 50 кг қап — 12 800 ₸. Әмбебап, негізгі өңдеуге, нормасы 200–300 кг/га.\n\n📄 Дереккөз: catalog.md',
        ammofos: 'Аммофос (11:46), 50 кг қап — 14 300 ₸. Себу кезінде енгізіледі, бидай тамырын дамытады, нормасы 50–100 кг/га.\n\n📄 Дереккөз: catalog.md',
      },
      priceChips: ['Бидайға тыңайтқыш таңдау', 'Көтерме жеңілдік', 'Өтінім қалдыру'],
      delivery:
        'Қазақстан бойынша автокөлікпен жеткізу — 3–7 жұмыс күні, құнын мекенжай мен көлемге қарай менеджер есептейді. Астанадағы қоймадан өзі алып кету — тегін, дс–жм 9:00–18:00.\n\n📄 Дереккөз: delivery_faq.md',
      payment:
        'Төлем шот бойынша қолма-қол ақшасыз: 50% немесе 100% алдын ала төлем. Тұрақты клиенттерге келісімшарт бойынша 30 күнге дейін кейінге қалдыру мүмкін.\n\n📄 Дереккөз: delivery_faq.md',
      discount: 'Көтерме жеңілдік: 20 тоннадан — 5%, 50 тоннадан — 8%. Ең аз тапсырыс — 1 тонна.\n\n📄 Дереккөз: catalog.md, delivery_faq.md',
      docs: 'Сәйкестік сертификаттары әр партияға сұраныс бойынша беріледі — менеджер шотпен бірге жібереді.\n\n📄 Дереккөз: delivery_faq.md',
      docsChips: ['Өтінім қалдыру', 'Менеджерді шақыру'],
      faqChips: ['Бидайға тыңайтқыш таңдау', 'Каталог бағасы', 'Жеткізу және төлем'],
      manager:
        'Түсіндім, сұрағыңызды менеджерге береміз. Қысқаша: клиент маманның көмегін сұрайды. Байланыс: +7 700 000 00 00, info@example.kz (дс–жм 9:00–18:00).\n\nӨтінім де қалдыра аласыз, менеджер өзі хабарласады.',
      returns:
        'Ыңғайсыздық үшін кешірім сұраймын. Ашылмаған өнім 14 күн ішінде қабылданады, бірақ қайтару мен шағым бойынша шешімді менеджер қабылдайды. Қысқаша: тапсырыс бойынша қайтару/шағым.\n\nБайланыс: +7 700 000 00 00, info@example.kz — немесе өтінім қалдырыңыз.',
      leadChips: ['Өтінім қалдыру', 'Бидайға тыңайтқыш таңдау'],
      thanks: 'Оқасы жоқ! Сұрақ болса, мен осындамын.',
      offtopic: `Мен ${COMPANY} кеңесшісімін, тыңайтқыш, баға, жеткізу және өтінім мәселелерінде жақсы көмектесемін.`,
      jail: 'Ішкі нұсқаулықты ашып, рөлімді өзгерте алмаймын. Бірақ тыңайтқыш таңдауға, бағаға және өтінімге қуана көмектесемін.',
      unknown: 'Менің материалдарымда бұл сұрақ бойынша нақты ақпарат жоқ. Менеджерге бере аламын: +7 700 000 00 00, info@example.kz. Тағы немен көмектесейін?',
      cancel: 'Жарайды, өтінім бас тартылды. Тағы немен көмектесе аламын?',
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
    },
  };

  const RX = {
    jail: /забудь|игнориру|промт|промпт|системн|инструкци|ты теперь|prompt|ignore|system|jailbreak|ұмыт|нұсқаулық/i,
    returns: /возврат|вернуть|жалоб|претензи|не доволен|недоволен|ужасн|refund|return|complaint|қайтар|шағым/i,
    manager: /менеджер|человек|оператор|живой|специалист|адам|manager|human|operator|agent/i,
    delivery: /достав|привез|самовывоз|жеткіз|алып кет|delivery|shipping|ship |pickup/i,
    payment: /оплат|предоплат|отсрочк|счет|счёт|төлем|payment|pay |invoice/i,
    docs: /сертификат|документ|договор|паспорт|certificate|document|contract/i,
    discount: /скидк|оптов|опт |жеңілдік|көтерме|discount|bulk|wholesale|минимальн|минимум|ең аз|minimum/i,
    lead: /заявк|заказ|купить|оформ|связаться|хочу взять|тапсырыс|өтінім|сатып ал|order|buy|request|apply|place/i,
    reco: /подбер|подойд|посоветуй|рекоменд|пшениц|ячмен|посев|урожа|бидай|таңда|ұсын|тыңайтқыш|recommend|wheat|barley|crop|fertili[sz]er|suggest|which/i,
    price: /цен|стоит|сколько|прайс|стоимост|каталог|баға|қанша|price|cost|how much|catalog|prices/i,
    thanks: /спасибо|благодар|рахмет|thank/i,
    greet: /^(привет|здравствуй|добрый|салем|сәлем|hello|hi\b|hey|good )/i,
    off: /погод|анекдот|футбол|курс|президент|политик|кино|weather|joke|football|movie/i,
    cancel: /^(отмена|отменить|cancel|стоп|stop|бас тарту)/i,
  };

  function detectLang(text, prev) {
    if (/[әіңғүұқөһ]/i.test(text)) return 'kk';
    if (/[а-яё]/i.test(text)) return 'ru';
    if (/[a-z]/i.test(text)) return 'en';
    return prev;
  }

  function calc(area) {
    const t = (kg) => +(kg / 1000).toFixed(2);
    const am = { t: t(AMMOFOS.norm * area), sum: AMMOFOS.norm * AMMOFOS.kg * area };
    const ur = { t: t(UREA.norm * area), sum: UREA.norm * UREA.kg * area };
    const sum = am.sum + ur.sum;
    const tons = +(am.t + ur.t).toFixed(1);
    const disc = tons >= 50 ? 8 : tons >= 20 ? 5 : 0;
    return { am, ur, sum, tons, disc, sumDisc: sum * (1 - disc / 100) };
  }

  window.createDemo = function () {
    let lang = 'ru';
    let flow = null; // area | region | name | contact | request | time | confirm
    let ctx = {};

    const out = (text, chips) => ({ text, chips: chips || [] });
    const startLead = (L) => {
      flow = 'name';
      return out(L.leadName);
    };

    function stepLead(text, L) {
      switch (flow) {
        case 'name':
          ctx.name = text.slice(0, 60);
          flow = 'contact';
          return out(L.leadContact(ctx.name));
        case 'contact':
          if (!(/\d{5,}|@/.test(text.replace(/[\s()-]/g, '')))) return out(L.badContact);
          ctx.contact = text.slice(0, 80);
          if (ctx.request) { flow = 'time'; return out(L.leadTime, L.timeChips); }
          flow = 'request';
          return out(L.leadRequest);
        case 'request':
          ctx.request = text.slice(0, 200);
          flow = 'time';
          return out(L.leadTime, L.timeChips);
        case 'time':
          ctx.time = text.slice(0, 80);
          flow = 'confirm';
          return out(L.leadSummary(lead()), L.confirmChips);
        case 'confirm':
          if (L.yes.test(text)) {
            const l = lead();
            flow = null;
            const r = out(L.leadDone, L.faqChips);
            r.lead = { ...l, дата: new Date().toISOString() };
            ctx = {};
            return r;
          }
          if (L.no.test(text)) { flow = null; ctx = {}; return out(L.cancel, L.faqChips); }
          return out(L.confirmAgain, L.confirmChips);
      }
    }
    const lead = () => ({ имя: ctx.name, контакт: ctx.contact, запрос: ctx.request || S[lang].defaultReq, время: ctx.time });

    return {
      greeting() {
        return out(S.ru.hello, S.ru.chips);
      },
      reply(raw) {
        const text = raw.trim();
        if (!flow) lang = detectLang(text, lang);
        const L = S[lang];

        if (RX.cancel.test(text) && flow) { flow = null; ctx = {}; return out(L.cancel, L.faqChips); }
        if (RX.jail.test(text)) return out(L.jail, L.faqChips);

        if (flow === 'area') {
          const m = text.match(/(\d+(?:[.,]\d+)?)/);
          if (!m) return out(L.badArea, L.areaChips);
          ctx.area = parseFloat(m[1].replace(',', '.'));
          if (!(ctx.area > 0) || ctx.area > 1000000) return out(L.badArea, L.areaChips);
          flow = 'region';
          return out(L.askRegion(ctx.area), L.regionChips);
        }
        if (flow === 'region') {
          const region = text.slice(0, 60);
          const t = calc(ctx.area);
          ctx.request = `${lang === 'en' ? 'Wheat' : lang === 'kk' ? 'Бидай' : 'Пшеница'}, ${ctx.area} га, ${region}: ${lang === 'en' ? 'Ammophos' : 'Аммофос'} ${t.am.t} т, ${lang === 'en' ? 'Urea' : 'Карбамид'} ${t.ur.t} т`;
          flow = null;
          return out(L.reco(ctx.area, region, t), L.recoChips);
        }
        if (flow) return stepLead(text, L);

        if (RX.returns.test(text)) return out(L.returns, L.leadChips);
        if (RX.manager.test(text)) return out(L.manager, L.leadChips);
        if (RX.delivery.test(text)) return out(L.delivery, L.faqChips);
        if (RX.payment.test(text)) return out(L.payment, L.faqChips);
        if (RX.docs.test(text)) return out(L.docs, L.docsChips);
        if (RX.discount.test(text)) return out(L.discount, L.faqChips);
        if (RX.lead.test(text)) return startLead(L);
        if (RX.reco.test(text)) { flow = 'area'; return out(L.askArea, L.areaChips); }
        if (RX.price.test(text) || /карбамид|мочевин|селитр|аммофос|npk|urea|nitrate|ammophos/i.test(text)) {
          const key = /карбамид|мочевин|urea/i.test(text) ? 'urea'
            : /селитр|nitrate/i.test(text) ? 'selitra'
            : /npk/i.test(text) ? 'npk'
            : /аммофос|ammophos/i.test(text) ? 'ammofos' : null;
          return out(key ? L.priceOne[key] : L.price, L.priceChips);
        }
        if (RX.thanks.test(text)) return out(L.thanks, L.faqChips);
        if (RX.greet.test(text)) return out(L.hello, L.chips);
        if (RX.off.test(text)) return out(L.offtopic, L.faqChips);
        return out(L.unknown, L.chips);
      },
    };
  };
})();
