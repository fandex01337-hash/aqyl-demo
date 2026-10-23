// Данные демо-версии (вымышленные): продукция, культуры, регионы. Используются и ботом, и сайтом.
(function () {
  const PRODUCTS = {
    urea: { price: 9500, tag: '46% N', norm: '100–150',
      name: { ru: 'Карбамид 46%', kk: 'Карбамид 46%', en: 'Urea 46%' },
      use: { ru: 'Азотное удобрение для весенней подкормки зерновых и кукурузы.', kk: 'Дәнді дақылдар мен жүгерінің көктемгі қоректендіруіне арналған азотты тыңайтқыш.', en: 'Nitrogen fertilizer for spring top dressing of cereals and corn.' } },
    selitra: { price: 8200, tag: '34% N', norm: '150–200',
      name: { ru: 'Аммиачная селитра 34%', kk: 'Аммиак селитрасы 34%', en: 'Ammonium nitrate 34%' },
      use: { ru: 'Быстродействующий азот для подкормки в период вегетации.', kk: 'Вегетация кезеңінде қоректендіруге арналған жылдам әсер ететін азот.', en: 'Fast-acting nitrogen for in-season top dressing.' } },
    ammofos: { price: 14300, tag: '11:46', norm: '50–100',
      name: { ru: 'Аммофос 11:46', kk: 'Аммофос 11:46', en: 'Ammophos 11:46' },
      use: { ru: 'Вносится при посеве, стимулирует развитие корневой системы.', kk: 'Себу кезінде енгізіледі, тамыр жүйесінің дамуын ынталандырады.', en: 'Applied at sowing, stimulates root development.' } },
    npk161616: { price: 12800, tag: '16:16:16', norm: '200–300',
      name: { ru: 'NPK 16:16:16', kk: 'NPK 16:16:16', en: 'NPK 16:16:16' },
      use: { ru: 'Универсальное комплексное удобрение под основную обработку.', kk: 'Негізгі өңдеуге арналған әмбебап кешенді тыңайтқыш.', en: 'Universal complex fertilizer for primary tillage.' } },
    npk102626: { price: 16200, tag: '10:26:26', norm: '120–180',
      name: { ru: 'NPK 10:26:26', kk: 'NPK 10:26:26', en: 'NPK 10:26:26' },
      use: { ru: 'С повышенным фосфором и калием — для масличных и пропашных культур.', kk: 'Фосфор мен калий көп — майлы және қатарлы дақылдарға.', en: 'High in phosphorus and potassium, for oilseed and row crops.' } },
    dsp: { price: 13500, tag: '46% P₂O₅', norm: '60–100',
      name: { ru: 'Суперфосфат двойной 46%', kk: 'Қос суперфосфат 46%', en: 'Double superphosphate 46%' },
      use: { ru: 'Фосфорное удобрение для закладки урожая и развития корней.', kk: 'Өнім қалыптастыруға және тамыр дамуына арналған фосфорлы тыңайтқыш.', en: 'Phosphorus fertilizer for yield formation and root growth.' } },
    kcl: { price: 15000, tag: '60% K₂O', norm: '100–200',
      name: { ru: 'Хлористый калий 60%', kk: 'Калий хлориді 60%', en: 'Potassium chloride 60%' },
      use: { ru: 'Калий для картофеля, овощей и повышения устойчивости растений.', kk: 'Картопқа, көкөністерге және өсімдік төзімділігін арттыруға арналған калий.', en: 'Potassium for potatoes, vegetables and stress tolerance.' } },
    ams: { price: 6500, tag: '21% N + 24% S', norm: '100–150',
      name: { ru: 'Сульфат аммония', kk: 'Аммоний сульфаты', en: 'Ammonium sulfate' },
      use: { ru: 'Азот и сера — особенно для рапса и подсолнечника.', kk: 'Азот пен күкірт — әсіресе рапс пен күнбағысқа.', en: 'Nitrogen and sulfur, especially for rapeseed and sunflower.' } },
  };

  // plan: [продукт, норма кг/га, этап]
  const CROPS = {
    wheat: { icon: '🌾', name: { ru: 'Пшеница', kk: 'Бидай', en: 'Wheat' }, plan: [['ammofos', 75, 'sow'], ['urea', 125, 'top']] },
    barley: { icon: '🌿', name: { ru: 'Ячмень', kk: 'Арпа', en: 'Barley' }, plan: [['ammofos', 60, 'sow'], ['selitra', 150, 'top']] },
    sunflower: { icon: '🌻', name: { ru: 'Подсолнечник', kk: 'Күнбағыс', en: 'Sunflower' }, plan: [['npk102626', 150, 'sow'], ['ams', 100, 'top']] },
    corn: { icon: '🌽', name: { ru: 'Кукуруза', kk: 'Жүгері', en: 'Corn' }, plan: [['npk161616', 250, 'base'], ['urea', 150, 'top']] },
    rapeseed: { icon: '🌼', name: { ru: 'Рапс', kk: 'Рапс', en: 'Rapeseed' }, plan: [['ams', 150, 'top'], ['dsp', 80, 'sow']] },
    potato: { icon: '🥔', name: { ru: 'Картофель', kk: 'Картоп', en: 'Potato' }, plan: [['npk161616', 400, 'base'], ['kcl', 150, 'base']] },
  };
  const CROP_RX = {
    wheat: /пшениц|бидай|wheat/i, barley: /ячмен|арпа|barley/i, sunflower: /подсолнеч|күнбағыс|sunflower/i,
    corn: /кукуруз|жүгері|corn|maize/i, rapeseed: /рапс|rapeseed|canola/i, potato: /картофел|картошк|картоп|potato/i,
  };

  // days — ориентировочный срок доставки (раб. дни)
  const REGIONS = [
    { id: 'astana', days: '1–2', rx: /астан|astana|нур-султан/i, ru: 'г. Астана', kk: 'Астана қ.', en: 'Astana' },
    { id: 'akmola', days: '2–3', rx: /акмол|ақмола|akmola/i, ru: 'Акмолинская область', kk: 'Ақмола облысы', en: 'Akmola region' },
    { id: 'kostanay', days: '3–4', rx: /костанай|қостанай|kostanay|kustanay/i, ru: 'Костанайская область', kk: 'Қостанай облысы', en: 'Kostanay region' },
    { id: 'nko', days: '3–4', rx: /северо|солтүстік|north.?kaz|петропавл/i, ru: 'Северо-Казахстанская область', kk: 'Солтүстік Қазақстан облысы', en: 'North Kazakhstan region' },
    { id: 'pavlodar', days: '3–4', rx: /павлодар/i, ru: 'Павлодарская область', kk: 'Павлодар облысы', en: 'Pavlodar region' },
    { id: 'karaganda', days: '3–4', rx: /караганд|қарағанды|karaganda/i, ru: 'Карагандинская область', kk: 'Қарағанды облысы', en: 'Karaganda region' },
    { id: 'ulytau', days: '4–5', rx: /улытау|ұлытау|ulytau/i, ru: 'Улытауская область', kk: 'Ұлытау облысы', en: 'Ulytau region' },
    { id: 'abai', days: '4–5', rx: /абай|abai/i, ru: 'Область Абай', kk: 'Абай облысы', en: 'Abai region' },
    { id: 'vko', days: '5–6', rx: /восточно|шығыс қазақ|east.?kaz|өскемен|усть-каме/i, ru: 'Восточно-Казахстанская область', kk: 'Шығыс Қазақстан облысы', en: 'East Kazakhstan region' },
    { id: 'aktobe', days: '4–5', rx: /актюб|ақтөбе|актобе|aktobe|aktyubinsk/i, ru: 'Актюбинская область', kk: 'Ақтөбе облысы', en: 'Aktobe region' },
    { id: 'zko', days: '6–7', rx: /западно|батыс қазақ|west.?kaz|уральск/i, ru: 'Западно-Казахстанская область', kk: 'Батыс Қазақстан облысы', en: 'West Kazakhstan region' },
    { id: 'atyrau', days: '6–7', rx: /атырау|atyrau|гурьев/i, ru: 'Атырауская область', kk: 'Атырау облысы', en: 'Atyrau region' },
    { id: 'mangystau', days: '6–7', rx: /мангист|маңғыстау|mangystau|актау/i, ru: 'Мангистауская область', kk: 'Маңғыстау облысы', en: 'Mangystau region' },
    { id: 'kyzylorda', days: '5–6', rx: /кызылорд|қызылорда|kyzylorda/i, ru: 'Кызылординская область', kk: 'Қызылорда облысы', en: 'Kyzylorda region' },
    { id: 'turkistan', days: '6–7', rx: /туркестан|түркістан|turkistan|turkestan/i, ru: 'Туркестанская область', kk: 'Түркістан облысы', en: 'Turkistan region' },
    { id: 'zhambyl', days: '5–6', rx: /жамбыл|zhambyl|jambyl|тараз/i, ru: 'Жамбылская область', kk: 'Жамбыл облысы', en: 'Zhambyl region' },
    { id: 'almaty_r', days: '5–6', rx: /алматинск|алматы облыс|almaty (region|oblast)/i, ru: 'Алматинская область', kk: 'Алматы облысы', en: 'Almaty region' },
    { id: 'zhetysu', days: '5–6', rx: /жетісу|жетису|zhetysu|jetisu|талдыкорган/i, ru: 'Область Жетісу', kk: 'Жетісу облысы', en: 'Zhetysu region' },
    { id: 'almaty_c', days: '5–6', rx: /алматы|алма-ата|almaty/i, ru: 'г. Алматы', kk: 'Алматы қ.', en: 'Almaty city' },
    { id: 'shymkent', days: '6–7', rx: /шымкент|shymkent/i, ru: 'г. Шымкент', kk: 'Шымкент қ.', en: 'Shymkent city' },
  ];

  window.AQYL_DATA = { PRODUCTS, CROPS, CROP_RX, REGIONS };
})();
