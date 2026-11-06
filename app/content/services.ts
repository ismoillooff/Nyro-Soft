import type { Localized } from "../i18n/types";

/** Hairline figures used on the site; each means one thing (spec §5.3). */
export type FigureName = "laptop" | "phone" | "exploded" | "settle" | "drawer" | "query" | "plug";

export type ProjectCategory = "web" | "mobil" | "avtomatlashtirish";

export interface ServiceFaq {
  readonly q: Localized;
  readonly a: Localized;
}

export interface Service {
  readonly slug: string;
  readonly number: string;
  readonly figure: FigureName;
  /** Accessible name of the figure. */
  readonly figureLabel: Localized;
  readonly title: Localized;
  /** One line for the home page list. */
  readonly short: Localized;
  /** The approved description; the lead on the service page. */
  readonly description: Localized;
  readonly audience: readonly Localized[];
  readonly problems: readonly { readonly problem: Localized; readonly solution: Localized }[];
  readonly scope: readonly Localized[];
  readonly faq: readonly ServiceFaq[];
  /** Project categories whose concepts are shown as related work. */
  readonly related: readonly ProjectCategory[];
  /** Which brief option this service maps to. */
  readonly briefValue: string;
}

export const services: readonly Service[] = [
  {
    slug: "web-platformalar",
    number: "01",
    figure: "laptop",
    figureLabel: { uz: "Ochiq noutbuk: qopqog‘i ko‘rsatkich balandligiga qarab ochiladi", ru: "Открытый ноутбук: крышка открывается в зависимости от высоты указателя" },
    title: { uz: "Web platformalar", ru: "Веб-платформы" },
    short: { uz: "Korporativ saytlardan CRM va ichki tizimlargacha.", ru: "От корпоративных сайтов до CRM и внутренних систем." },
    description: {
      uz: "Biznes jarayonlaringizga moslashgan, tez ishlaydigan va kengaytirish oson veb tizimlar: korporativ saytlardan CRM va ichki platformalargacha.", ru: "Быстрые и легко расширяемые веб-системы, адаптированные под ваши бизнес-процессы: от корпоративных сайтов до CRM и внутренних платформ.",
    },
    audience: [
      { uz: "Buyurtma, mijoz va hisobotlarni jadvallarda yuritayotgan kompaniyalar", ru: "Компании, которые ведут заказы, клиентов и отчёты в таблицах" },
      { uz: "Eskirgan saytini yangilamoqchi bo‘lgan bizneslar", ru: "Компании, которые хотят обновить устаревший сайт" },
      { uz: "Ichki jarayonlar uchun alohida tizim kerak bo‘lgan jamoalar", ru: "Команды, которым нужна отдельная система для внутренних процессов" },
      { uz: "Mavjud platformani kengaytirmoqchi bo‘lgan mahsulot egalari", ru: "Владельцы продуктов, которые хотят расширить действующую платформу" },
    ],
    problems: [
      {
        problem: { uz: "Ma’lumotlar turli jadval va chatlarda tarqalib ketgan", ru: "Данные разбросаны по разным таблицам и чатам" },
        solution: { uz: "Bitta tizim: buyurtmalar, mijozlar va hisobotlar bir joyda", ru: "Одна система: заказы, клиенты и отчёты в одном месте" },
      },
      {
        problem: { uz: "Sayt sekin ochiladi va mobil qurilmada noqulay", ru: "Сайт медленно открывается и неудобен на мобильных устройствах" },
        solution: { uz: "Tez yuklanadigan, har qanday ekranga moslashgan interfeys", ru: "Быстро загружающийся интерфейс, адаптированный под любой экран" },
      },
      {
        problem: { uz: "Har bir o‘zgarish uchun dasturchini kutish kerak", ru: "Для каждого изменения приходится ждать разработчика" },
        solution: { uz: "Kontent va sozlamalarni o‘zingiz boshqaradigan panel", ru: "Панель, в которой вы сами управляете контентом и настройками" },
      },
    ],
    scope: [
      { uz: "Talablar tahlili va tuzilma", ru: "Анализ требований и структура" },
      { uz: "UI/UX dizayn va interaktiv prototip", ru: "UI/UX-дизайн и интерактивный прототип" },
      { uz: "Frontend va backend dasturlash", ru: "Frontend- и backend-разработка" },
      { uz: "Boshqaruv paneli va foydalanuvchi rollari", ru: "Панель управления и роли пользователей" },
      { uz: "Tashqi xizmatlar bilan integratsiya", ru: "Интеграция с внешними сервисами" },
      { uz: "Serverga joylash va topshirish", ru: "Размещение на сервере и передача" },
    ],
    faq: [
      {
        q: { uz: "Tayyor shablon emas, noldan qilasizmi?", ru: "Делаете с нуля, а не на готовом шаблоне?" },
        a: { uz: "Ha. Tuzilma va dizayn sizning jarayonlaringiz asosida ishlab chiqiladi; tayyor kutubxonalardan faqat texnik asos sifatida foydalanamiz.", ru: "Да. Структура и дизайн разрабатываются на основе ваших процессов; готовые библиотеки используем только как техническую основу." },
      },
      {
        q: { uz: "Mavjud saytimizni qayta yozish shartmi?", ru: "Обязательно ли переписывать наш текущий сайт?" },
        a: { uz: "Har doim emas. Avval mavjud kodni ko‘rib chiqamiz va qaysi qismlarni saqlash mumkinligini aytamiz.", ru: "Не всегда. Сначала изучаем существующий код и говорим, какие части можно сохранить." },
      },
      {
        q: { uz: "Platformani keyin kengaytirish mumkinmi?", ru: "Можно ли потом расширить платформу?" },
        a: { uz: "Arxitektura yangi modullar qo‘shishni hisobga olib tuziladi. Kengaytirish rejasi tahlil bosqichida kelishiladi.", ru: "Архитектура строится с учётом добавления новых модулей. План расширения согласуется на этапе анализа." },
      },
    ],
    related: ["web"],
    briefValue: "web",
  },
  {
    slug: "mobil-ilovalar",
    number: "02",
    figure: "phone",
    figureLabel: { uz: "Qatlamlarga ajralgan telefon: shisha, plata, batareya va korpus", ru: "Телефон в разобранном виде: стекло, плата, батарея и корпус" },
    title: { uz: "Mobil ilovalar", ru: "Мобильные приложения" },
    short: { uz: "iOS va Android uchun qulay va barqaror ilovalar.", ru: "Удобные и стабильные приложения для iOS и Android." },
    description: {
      uz: "iOS va Android uchun qulay va barqaror mobil ilovalar — mijozlaringiz siz bilan doim aloqada bo‘lishi uchun.", ru: "Удобные и стабильные мобильные приложения для iOS и Android — чтобы ваши клиенты всегда были на связи с вами.",
    },
    audience: [
      { uz: "Mijozlari bilan doimiy aloqada bo‘lishi kerak bo‘lgan xizmatlar", ru: "Сервисы, которым нужна постоянная связь с клиентами" },
      { uz: "Veb platformasiga mobil ilova qo‘shmoqchi bo‘lgan bizneslar", ru: "Компании, которые хотят добавить мобильное приложение к своей веб-платформе" },
      { uz: "Yangi mobil mahsulot g‘oyasini sinab ko‘rmoqchi bo‘lgan jamoalar", ru: "Команды, которые хотят проверить идею нового мобильного продукта" },
    ],
    problems: [
      {
        problem: { uz: "Mijozlar faqat telefon orqali murojaat qiladi va yo‘qolib ketadi", ru: "Клиенты обращаются только по телефону и теряются" },
        solution: { uz: "Buyurtma, holat va bildirishnomalar bitta ilovada", ru: "Заказы, статусы и уведомления в одном приложении" },
      },
      {
        problem: { uz: "Ikki platforma uchun alohida jamoa saqlash qimmat", ru: "Держать отдельную команду под каждую платформу дорого" },
        solution: { uz: "Mos hollarda iOS va Android uchun umumiy kod bazasi", ru: "Общая кодовая база для iOS и Android, где это уместно" },
      },
      {
        problem: { uz: "Ilova sekin ishlaydi va tez-tez xato beradi", ru: "Приложение работает медленно и часто выдаёт ошибки" },
        solution: { uz: "Barqarorlikka yo‘naltirilgan arxitektura va testlash", ru: "Архитектура, ориентированная на стабильность, и тестирование" },
      },
    ],
    scope: [
      { uz: "Foydalanuvchi ssenariylari va prototip", ru: "Пользовательские сценарии и прототип" },
      { uz: "iOS va Android uchun interfeys dizayni", ru: "Дизайн интерфейса для iOS и Android" },
      { uz: "Ilova va server qismini dasturlash", ru: "Разработка приложения и серверной части" },
      { uz: "Push-bildirishnomalar va integratsiyalar", ru: "Push-уведомления и интеграции" },
      { uz: "Do‘konlarga joylashga tayyorlash", ru: "Подготовка к публикации в магазинах приложений" },
    ],
    faq: [
      {
        q: { uz: "Bitta ilova ikkala platformada ishlaydimi?", ru: "Будет ли одно приложение работать на обеих платформах?" },
        a: { uz: "Ko‘p loyihalarda ha — umumiy kod bazasi bilan. Qaysi yondashuv mos ekanini talablar asosida birga tanlaymiz.", ru: "Во многих проектах — да, с общей кодовой базой. Какой вариант лучше, выберем вместе исходя из требований." },
      },
      {
        q: { uz: "Ilovani App Store va Google Play’ga joylaysizmi?", ru: "Публикуете ли вы приложение в App Store и Google Play?" },
        a: { uz: "Ilovani joylashga tayyorlaymiz va jarayonda yordam beramiz. Do‘kon akkauntlari sizning nomingizga ochiladi.", ru: "Подготавливаем приложение к публикации и помогаем в процессе. Аккаунты в магазинах открываются на ваше имя." },
      },
      {
        q: { uz: "Ilovaga server qismi kerakmi?", ru: "Нужна ли приложению серверная часть?" },
        a: { uz: "Ko‘pincha ha: ma’lumotlarni saqlash va sinxronlash uchun. Bu ham ish hajmiga kiritilishi mumkin.", ru: "Чаще всего да: для хранения и синхронизации данных. Её тоже можно включить в объём работ." },
      },
    ],
    related: ["mobil"],
    briefValue: "mobil",
  },
  {
    slug: "ui-ux-dizayn",
    number: "03",
    figure: "exploded",
    figureLabel: { uz: "Qatlamlarga ajralgan ilova oynasi: tuzilmadan yakuniy interfeysgacha", ru: "Окно приложения в разобранном виде: от структуры до финального интерфейса" },
    title: { uz: "UI/UX dizayn", ru: "UI/UX-дизайн" },
    short: { uz: "Tadqiqotdan tayyor dizayn tizimigacha.", ru: "От исследования до готовой дизайн-системы." },
    description: {
      uz: "Foydalanuvchi tadqiqotidan tayyor dizayn tizimigacha: tushunarli, chiroyli va dasturlashga tayyor interfeyslar.", ru: "От пользовательского исследования до готовой дизайн-системы: понятные, красивые и готовые к разработке интерфейсы.",
    },
    audience: [
      { uz: "Mahsulotini qayta ishlamoqchi bo‘lgan jamoalar", ru: "Команды, которые хотят переработать свой продукт" },
      { uz: "O‘z dasturchilari bor, lekin dizayner yo‘q kompaniyalar", ru: "Компании, у которых есть разработчики, но нет дизайнера" },
      { uz: "Investor yoki mijozga prototip ko‘rsatishi kerak bo‘lganlar", ru: "Те, кому нужно показать прототип инвестору или клиенту" },
    ],
    problems: [
      {
        problem: { uz: "Foydalanuvchilar kerakli funksiyani topa olmaydi", ru: "Пользователи не могут найти нужную функцию" },
        solution: { uz: "Ssenariylarga asoslangan tushunarli tuzilma", ru: "Понятная структура на основе сценариев" },
      },
      {
        problem: { uz: "Har bir ekran turlicha ko‘rinadi", ru: "Каждый экран выглядит по-разному" },
        solution: { uz: "Komponentlar va qoidalardan iborat dizayn tizimi", ru: "Дизайн-система из компонентов и правил" },
      },
      {
        problem: { uz: "Dizayn dasturlashda boshqacha chiqadi", ru: "В разработке дизайн получается другим" },
        solution: { uz: "Holatlari va o‘lchamlari aniq belgilangan maketlar", ru: "Макеты с чётко заданными состояниями и размерами" },
      },
    ],
    scope: [
      { uz: "Foydalanuvchi va raqobatchilar tahlili", ru: "Анализ пользователей и конкурентов" },
      { uz: "Tuzilma va wireframe’lar", ru: "Структура и wireframe-макеты" },
      { uz: "Yakuniy interfeys dizayni", ru: "Дизайн финального интерфейса" },
      { uz: "Interaktiv prototip", ru: "Интерактивный прототип" },
      { uz: "Dizayn tizimi va komponentlar", ru: "Дизайн-система и компоненты" },
      { uz: "Dasturchilarga topshirish", ru: "Передача разработчикам" },
    ],
    faq: [
      {
        q: { uz: "Faqat dizayn buyurtma qilsa bo‘ladimi?", ru: "Можно заказать только дизайн?" },
        a: { uz: "Ha. Maketlar va dizayn tizimini o‘z jamoangiz dasturlashi uchun tayyorlab beramiz.", ru: "Да. Подготовим макеты и дизайн-систему, чтобы ваша команда могла их разработать." },
      },
      {
        q: { uz: "Qaysi vositalarda ishlaysiz?", ru: "В каких инструментах вы работаете?" },
        a: { uz: "Asosan Figma’da. Manba fayllar topshirish tartibi shartnomada belgilanadi.", ru: "В основном в Figma. Порядок передачи исходных файлов определяется договором." },
      },
      {
        q: { uz: "Foydalanuvchi tadqiqoti shartmi?", ru: "Обязательно ли пользовательское исследование?" },
        a: { uz: "Hajmi loyihaga bog‘liq. Kichik loyihalarda qisqa intervyu va mavjud ma’lumotlar tahlili yetarli bo‘lishi mumkin.", ru: "Объём зависит от проекта. В небольших проектах может быть достаточно коротких интервью и анализа имеющихся данных." },
      },
    ],
    related: ["web", "mobil"],
    briefValue: "dizayn",
  },
  {
    slug: "biznesni-avtomatlashtirish",
    number: "04",
    figure: "settle",
    figureLabel: { uz: "Tartibsiz plitkalar markaz atrofida daraxtga yig‘iladi", ru: "Беспорядочные плитки собираются в дерево вокруг центра" },
    title: { uz: "Biznesni avtomatlashtirish", ru: "Автоматизация бизнеса" },
    short: { uz: "Integratsiyalar, hisobotlar va ichki jarayonlar.", ru: "Интеграции, отчёты и внутренние процессы." },
    description: {
      uz: "Takrorlanuvchi qo‘l mehnatini tizimga topshiring: integratsiyalar, hisobotlar va ichki jarayonlarni avtomatlashtirish.", ru: "Передайте повторяющуюся ручную работу системе: интеграции, отчёты и автоматизация внутренних процессов.",
    },
    audience: [
      { uz: "Hisobotlarni har hafta qo‘lda yig‘adigan jamoalar", ru: "Команды, которые каждую неделю собирают отчёты вручную" },
      { uz: "Bir nechta xizmat o‘rtasida ma’lumot ko‘chiradigan xodimlar", ru: "Сотрудники, которые переносят данные между несколькими сервисами" },
      { uz: "Jarayonlari o‘sib, qo‘lda boshqarib bo‘lmay qolgan bizneslar", ru: "Компании, чьи процессы выросли настолько, что вручную ими уже не управлять" },
    ],
    problems: [
      {
        problem: { uz: "Bir xil ma’lumot bir necha joyga qo‘lda kiritiladi", ru: "Одни и те же данные вручную вносятся в несколько мест" },
        solution: { uz: "Tizimlar o‘rtasida avtomatik sinxronlash", ru: "Автоматическая синхронизация между системами" },
      },
      {
        problem: { uz: "Hisobot tayyorlashga kunlar ketadi", ru: "На подготовку отчёта уходят дни" },
        solution: { uz: "Kerakli vaqtda tayyor bo‘ladigan avtomatik hisobotlar", ru: "Автоматические отчёты, готовые к нужному времени" },
      },
      {
        problem: { uz: "Muhim voqealar haqida kech xabar topiladi", ru: "О важных событиях узнают с опозданием" },
        solution: { uz: "Telegram yoki email orqali o‘z vaqtidagi bildirishnomalar", ru: "Своевременные уведомления в Telegram или по email" },
      },
    ],
    scope: [
      { uz: "Mavjud jarayonlarni tahlil qilish", ru: "Анализ текущих процессов" },
      { uz: "Tashqi xizmatlar va API integratsiyalari", ru: "Интеграции с внешними сервисами и API" },
      { uz: "Avtomatik hisobotlar", ru: "Автоматические отчёты" },
      { uz: "Telegram botlar va bildirishnomalar", ru: "Telegram-боты и уведомления" },
      { uz: "Ichki boshqaruv vositalari", ru: "Внутренние инструменты управления" },
    ],
    faq: [
      {
        q: { uz: "Qaysi jarayonlarni avtomatlashtirish mumkin?", ru: "Какие процессы можно автоматизировать?" },
        a: { uz: "Qoidasi aniq va takrorlanadigan har qanday jarayonni. Tahlil bosqichida eng ko‘p vaqt olayotganlaridan boshlaymiz.", ru: "Любой повторяющийся процесс с чёткими правилами. На этапе анализа начинаем с тех, что отнимают больше всего времени." },
      },
      {
        q: { uz: "Hozirgi dasturlarimiz bilan ishlaydimi?", ru: "Будет ли это работать с нашими текущими программами?" },
        a: { uz: "Agar ularda API yoki eksport imkoniyati bo‘lsa — ko‘pincha ha. Buni tahlil bosqichida tekshiramiz.", ru: "Если у них есть API или возможность экспорта — чаще всего да. Это проверяем на этапе анализа." },
      },
      {
        q: { uz: "Xodimlarimizni o‘qitasizmi?", ru: "Обучаете ли вы наших сотрудников?" },
        a: { uz: "Topshirish paytida tizimdan foydalanishni ko‘rsatib beramiz. Qo‘shimcha o‘qitish hajmi alohida kelishiladi.", ru: "При передаче показываем, как пользоваться системой. Объём дополнительного обучения согласуется отдельно." },
      },
    ],
    related: ["avtomatlashtirish"],
    briefValue: "avtomatlashtirish",
  },
];

export function getService(slug: string | undefined): Service | undefined {
  return services.find((s) => s.slug === slug);
}
