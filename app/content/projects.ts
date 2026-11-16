import type { Localized } from "../i18n/types";
import type { ProjectCategory } from "./services";

export type PreviewKind = "dashboard" | "finance";

export interface Project {
  readonly slug: string;
  readonly category: ProjectCategory;
  readonly categoryLabel: Localized;
  readonly platform: Localized;
  readonly title: Localized;
  readonly description: Localized;
  readonly lead: Localized;
  readonly tags: readonly string[];
  readonly preview: PreviewKind;
  readonly task: Localized;
  readonly solution: Localized;
  readonly features: readonly { readonly title: Localized; readonly text: Localized }[];
  readonly benefits: readonly Localized[];
  /** The service page this concept belongs to. */
  readonly service: string;
  /** Card story: task → user flow → decision → opportunity, one short line each (≤ 12 words). */
  readonly story: { readonly task: Localized; readonly flow: Localized; readonly decision: Localized; readonly opportunity: Localized };
  /** 3 key user types. */
  readonly users: readonly { readonly role: Localized; readonly need: Localized }[];
  /** The main user flow, 4–5 short steps. */
  readonly flow: readonly Localized[];
  /** 3 key design decisions and why. */
  readonly decisions: readonly { readonly title: Localized; readonly text: Localized }[];
  /** Technical approach, 2–3 sentences, consistent with `tags`. */
  readonly approach: Localized;
  /** Honest limits of the concept. */
  readonly limits: readonly Localized[];
  /** What a real project would do next. */
  readonly nextStep: Localized;
}

export const projects: readonly Project[] = [
  {
    slug: "biznes-boshqaruv-platformasi",
    category: "web",
    categoryLabel: { uz: "Web", ru: "Веб" },
    platform: { uz: "Veb platforma · desktop va mobil brauzer", ru: "Веб-платформа · десктопный и мобильный браузер" },
    title: { uz: "Biznes boshqaruv platformasi", ru: "Платформа управления бизнесом" },
    description: {
      uz: "Buyurtmalar, mijozlar, ombor va hisobotlarni bitta tizimda boshqarish uchun veb platforma konsepti.", ru: "Концепт веб-платформы для управления заказами, клиентами, складом и отчётами в одной системе.",
    },
    lead: {
      uz: "Kichik va o‘rta biznes uchun yagona ish joyi: buyurtma qabul qilishdan ombor qoldig‘i va oylik hisobotgacha.", ru: "Единое рабочее место для малого и среднего бизнеса: от приёма заказа до остатков на складе и ежемесячного отчёта.",
    },
    tags: ["React", "TypeScript", "FastAPI", "PostgreSQL"],
    preview: "dashboard",
    task: {
      uz: "Buyurtmalar Telegram, telefon va jadvallar orqali yuritiladigan biznesni tasavvur qilamiz. Ma’lumotlar tarqoq, ombor qoldig‘i kechikib yangilanadi, hisobot tayyorlashga esa har oy bir necha kun ketadi.", ru: "Представим бизнес, в котором заказы ведутся через Telegram, телефон и таблицы. Данные разрознены, остатки на складе обновляются с опозданием, а на подготовку отчёта каждый месяц уходит несколько дней.",
    },
    solution: {
      uz: "Bitta veb platforma: buyurtmalar ro‘yxati holatlar bilan, mijozlar kartotekasi, ombor harakati va real vaqtdagi hisobotlar. Har bir xodim o‘z roliga mos ekranni ko‘radi.", ru: "Единая веб-платформа: список заказов со статусами, картотека клиентов, движение по складу и отчёты в реальном времени. Каждый сотрудник видит экран, соответствующий его роли.",
    },
    features: [
      { title: { uz: "Buyurtmalar", ru: "Заказы" }, text: { uz: "Qidiruv, holat bo‘yicha filtr va holatni bir bosishda o‘zgartirish.", ru: "Поиск, фильтр по статусу и смена статуса в один клик." } },
      { title: { uz: "Mijozlar", ru: "Клиенты" }, text: { uz: "Har bir mijozning buyurtmalar tarixi va izohlari bitta kartada.", ru: "История заказов и комментарии по каждому клиенту — в одной карточке." } },
      { title: { uz: "Ombor", ru: "Склад" }, text: { uz: "Kirim, chiqim va qoldiq; kam qolgan mahsulotlar haqida ogohlantirish.", ru: "Приход, расход и остатки; предупреждения о заканчивающихся товарах." } },
      { title: { uz: "Hisobotlar", ru: "Отчёты" }, text: { uz: "Kunlik, haftalik va oylik ko‘rsatkichlar, eksport imkoniyati bilan.", ru: "Ежедневные, еженедельные и ежемесячные показатели с возможностью экспорта." } },
      { title: { uz: "Rollar", ru: "Роли" }, text: { uz: "Menejer, omborchi va rahbar uchun alohida huquqlar.", ru: "Отдельные права для менеджера, кладовщика и руководителя." } },
    ],
    benefits: [
      { uz: "Ma’lumotlar bitta manbada: jadval va chatlar orasida qidirish kamayadi.", ru: "Данные в одном источнике: меньше поиска по таблицам и чатам." },
      { uz: "Buyurtma holati har bir xodimga bir xil ko‘rinadi.", ru: "Статус заказа одинаково виден каждому сотруднику." },
      { uz: "Hisobot qo‘lda yig‘ilmaydi — tizim o‘zi tayyorlaydi.", ru: "Отчёт не собирается вручную — система готовит его сама." },
    ],
    service: "web-platformalar",
    story: {
      task: { uz: "Buyurtmalar Telegram, telefon va jadvallar orasida tarqalgan.", ru: "Заказы разбросаны между Telegram, телефоном и таблицами." },
      flow: { uz: "Buyurtma qabul qilinadi, holati yangilanadi, ombor va hisobotga tushadi.", ru: "Заказ принят, статус обновлён, данные попадают на склад и в отчёт." },
      decision: { uz: "Har bir rol faqat o‘z ishiga kerakli ekranni ko‘radi.", ru: "Каждая роль видит только экран, нужный для её работы." },
      opportunity: { uz: "Ma’lumotlar bir joyda bo‘lsa, hisobotni qo‘lda yig‘ish shart bo‘lmaydi.", ru: "Когда данные в одном месте, отчёт можно не собирать вручную." },
    },
    users: [
      { role: { uz: "Menejer", ru: "Менеджер" }, need: { uz: "Buyurtmani tez topish va holatini o‘zgartirish.", ru: "Быстро найти заказ и сменить его статус." } },
      { role: { uz: "Omborchi", ru: "Кладовщик" }, need: { uz: "Kirim-chiqimni yozish va kam qolgan mahsulotni ko‘rish.", ru: "Записывать приход и расход, видеть заканчивающиеся товары." } },
      { role: { uz: "Rahbar", ru: "Руководитель" }, need: { uz: "Asosiy ko‘rsatkichlar va hisobotlarni bir joyda ko‘rish.", ru: "Видеть основные показатели и отчёты в одном месте." } },
    ],
    flow: [
      { uz: "Buyurtma qabul qilinadi va mijozga bog‘lanadi", ru: "Заказ принимается и привязывается к клиенту" },
      { uz: "Menejer buyurtma holatini yangilaydi", ru: "Менеджер обновляет статус заказа" },
      { uz: "Omborchi mahsulotni chiqim qiladi", ru: "Кладовщик списывает товар со склада" },
      { uz: "Ombor qoldig‘i yangilanadi", ru: "Остаток на складе обновляется" },
      { uz: "Buyurtma hisobotda ko‘rinadi", ru: "Заказ отражается в отчёте" },
    ],
    decisions: [
      {
        title: { uz: "Holat — asosiy o‘q", ru: "Статус — главная ось" },
        text: { uz: "Buyurtmalar ro‘yxati holat bo‘yicha tuzilgan, chunki menejer kun davomida eng ko‘p «buyurtma hozir qayerda?» degan savolga javob qidiradi.", ru: "Список заказов построен вокруг статуса, потому что в течение дня менеджер чаще всего ищет ответ на вопрос «где сейчас этот заказ?»." },
      },
      {
        title: { uz: "Rolga mos ekranlar", ru: "Экраны по ролям" },
        text: { uz: "Menejer, omborchi va rahbar turli vazifalarni bajaradi, shuning uchun har biri faqat kerakli ma’lumot va huquqlarni ko‘radi.", ru: "Менеджер, кладовщик и руководитель решают разные задачи, поэтому каждый видит только нужные ему данные и права." },
      },
      {
        title: { uz: "Bitta mijoz kartasi", ru: "Единая карточка клиента" },
        text: { uz: "Buyurtmalar tarixi va izohlar bitta kartada jamlangan, shunda ularni chat va jadvallardan qidirishga hojat qolmaydi.", ru: "История заказов и комментарии собраны в одной карточке, чтобы их не приходилось искать в чатах и таблицах." },
      },
    ],
    approach: {
      uz: "Interfeys React va TypeScript’da, server qismi FastAPI’da yoziladi. Buyurtma, mijoz va ombor ma’lumotlari PostgreSQL’da o‘zaro bog‘langan holda saqlanadi. Rollar va huquqlar server tomonida tekshiriladi.", ru: "Интерфейс пишется на React и TypeScript, серверная часть — на FastAPI. Данные о заказах, клиентах и складе хранятся в PostgreSQL и связаны между собой. Роли и права проверяются на стороне сервера.",
    },
    limits: [
      { uz: "Konseptda namunaviy ma’lumotlar ishlatilgan.", ru: "В концепте используются демонстрационные данные." },
      { uz: "Telegram, to‘lov yoki buxgalteriya tizimlari bilan haqiqiy integratsiya yo‘q.", ru: "Нет реальных интеграций с Telegram, платёжными или учётными системами." },
      { uz: "Haqiqiy foydalanuvchilar bilan sinovdan o‘tkazilmagan.", ru: "Не проверялся на реальных пользователях." },
    ],
    nextStep: {
      uz: "Haqiqiy loyihada avval mavjud jarayonlar va xodimlarning ishini o‘rganamiz, prototipni ular bilan sinab ko‘ramiz. Shundan so‘ng birinchi versiya hajmini kelishamiz.", ru: "В реальном проекте сначала изучаем текущие процессы и работу сотрудников и проверяем прототип вместе с ними. После этого согласуем объём первой версии.",
    },
  },
  {
    slug: "mobil-moliya-ilovasi",
    category: "mobil",
    categoryLabel: { uz: "Mobil", ru: "Мобильное" },
    platform: { uz: "Mobil ilova · iOS va Android", ru: "Мобильное приложение · iOS и Android" },
    title: { uz: "Mobil moliya ilovasi", ru: "Мобильное приложение для финансов" },
    description: {
      uz: "Shaxsiy xarajatlar, to‘lovlar va budjetni kuzatish uchun mobil ilova konsepti.", ru: "Концепт мобильного приложения для учёта личных расходов, платежей и бюджета.",
    },
    lead: {
      uz: "Har kungi xarajatlarni bir necha soniyada yozib borish va oy oxirida pul qayerga ketganini aniq ko‘rish uchun.", ru: "Чтобы записывать ежедневные расходы за несколько секунд и в конце месяца точно видеть, куда ушли деньги.",
    },
    tags: ["TypeScript", "React Native", "FastAPI", "PostgreSQL"],
    preview: "finance",
    task: {
      uz: "Ko‘pchilik xarajatlarini yozib borishni boshlaydi, lekin bir haftadan keyin tashlab qo‘yadi: yozish uzoq, natija esa ko‘rinmaydi. Vazifa — buni tez va foydali qilish.", ru: "Многие начинают записывать расходы, но через неделю бросают: записывать долго, а результата не видно. Задача — сделать это быстрым и полезным.",
    },
    solution: {
      uz: "Asosiy ekranda bitta tugma bilan xarajat qo‘shish, toifalar bo‘yicha budjet chegaralari va to‘lov eslatmalari. Oy natijasi sodda grafikda ko‘rinadi.", ru: "Добавление расхода одной кнопкой на главном экране, лимиты бюджета по категориям и напоминания о платежах. Итоги месяца видны на простом графике.",
    },
    features: [
      { title: { uz: "Tez kiritish", ru: "Быстрый ввод" }, text: { uz: "Summa va toifa — ikki qadamda xarajat qo‘shiladi.", ru: "Сумма и категория — расход добавляется в два шага." } },
      { title: { uz: "Budjet", ru: "Бюджет" }, text: { uz: "Har bir toifa uchun oylik chegara va qolgan summa.", ru: "Месячный лимит и остаток по каждой категории." } },
      { title: { uz: "To‘lovlar", ru: "Платежи" }, text: { uz: "Kommunal va obuna to‘lovlari uchun eslatmalar.", ru: "Напоминания о коммунальных платежах и подписках." } },
      { title: { uz: "Tahlil", ru: "Аналитика" }, text: { uz: "Oy bo‘yicha xarajatlar tuzilmasi va o‘tgan oy bilan taqqoslash.", ru: "Структура расходов за месяц и сравнение с прошлым месяцем." } },
    ],
    benefits: [
      { uz: "Xarajatni yozish odatga aylanishi uchun minimal qadamlar.", ru: "Минимум шагов, чтобы запись расходов вошла в привычку." },
      { uz: "Budjetdan oshish oldindan ko‘rinadi.", ru: "Превышение бюджета видно заранее." },
      { uz: "Muhim to‘lovlar unutilmaydi.", ru: "Важные платежи не забываются." },
    ],
    service: "mobil-ilovalar",
    story: {
      task: { uz: "Xarajatlarni yozish uzoq, natija esa ko‘rinmaydi.", ru: "Записывать расходы долго, а результата не видно." },
      flow: { uz: "Xarajat ikki qadamda qo‘shiladi va budjetda darhol ko‘rinadi.", ru: "Расход добавляется в два шага и сразу виден в бюджете." },
      decision: { uz: "Asosiy ekranda bitta tugma — tez kiritish birinchi o‘rinda.", ru: "Одна кнопка на главном экране — быстрый ввод на первом месте." },
      opportunity: { uz: "Kiritish tez bo‘lsa, xarajatni yozish odatga aylanishi mumkin.", ru: "Если ввод быстрый, запись расходов может войти в привычку." },
    },
    users: [
      { role: { uz: "Kundalik foydalanuvchi", ru: "Повседневный пользователь" }, need: { uz: "Xarajatni bir necha soniyada yozib qo‘yish.", ru: "Записать расход за несколько секунд." } },
      { role: { uz: "Oila budjetini yurituvchi", ru: "Тот, кто ведёт семейный бюджет" }, need: { uz: "Toifalar bo‘yicha chegara va qoldiqni ko‘rish.", ru: "Видеть лимиты и остаток по категориям." } },
      { role: { uz: "Muntazam to‘lovlari bor foydalanuvchi", ru: "Пользователь с регулярными платежами" }, need: { uz: "Kommunal va obuna to‘lovlarini unutmaslik.", ru: "Не забывать о коммунальных платежах и подписках." } },
    ],
    flow: [
      { uz: "Ilovani ochish", ru: "Открыть приложение" },
      { uz: "Summani kiritish", ru: "Ввести сумму" },
      { uz: "Toifani tanlash", ru: "Выбрать категорию" },
      { uz: "Toifa qoldig‘ini ko‘rish", ru: "Увидеть остаток по категории" },
      { uz: "Oy oxirida natijani ko‘rib chiqish", ru: "В конце месяца посмотреть итоги" },
    ],
    decisions: [
      {
        title: { uz: "Ikki qadamli kiritish", ru: "Ввод в два шага" },
        text: { uz: "Faqat summa va toifa so‘raladi, chunki uzun forma xarajat yozishni tashlab qo‘yishga sabab bo‘lishi mumkin.", ru: "Запрашиваются только сумма и категория, потому что из-за длинной формы учёт расходов легко бросить." },
      },
      {
        title: { uz: "Toifa bo‘yicha chegaralar", ru: "Лимиты по категориям" },
        text: { uz: "Umumiy budjet o‘rniga har bir toifa uchun chegara, shunda qayerda oshib ketish xavfi borligi oldindan ko‘rinadi.", ru: "Вместо общего бюджета — лимит на каждую категорию, чтобы заранее было видно, где есть риск превышения." },
      },
      {
        title: { uz: "Sodda oylik grafik", ru: "Простой месячный график" },
        text: { uz: "Murakkab hisobotlar o‘rniga bitta tushunarli grafik va o‘tgan oy bilan taqqoslash — natija bir qarashda ko‘rinishi uchun.", ru: "Вместо сложных отчётов — один понятный график и сравнение с прошлым месяцем, чтобы итог был виден с одного взгляда." },
      },
    ],
    approach: {
      uz: "Ilova React Native va TypeScript’da yoziladi, shunda iOS va Android uchun umumiy kod bazasi bo‘ladi. Ma’lumotlarni saqlash va qurilmalar o‘rtasida sinxronlash uchun FastAPI va PostgreSQL asosidagi server qismi ishlatiladi.", ru: "Приложение пишется на React Native и TypeScript, чтобы у iOS и Android была общая кодовая база. Для хранения данных и синхронизации между устройствами используется серверная часть на FastAPI и PostgreSQL.",
    },
    limits: [
      { uz: "Konseptda namunaviy ma’lumotlar ishlatilgan.", ru: "В концепте используются демонстрационные данные." },
      { uz: "Bank yoki to‘lov tizimlari bilan haqiqiy integratsiya yo‘q.", ru: "Нет реальных интеграций с банками или платёжными системами." },
      { uz: "Haqiqiy foydalanuvchilar bilan sinovdan o‘tkazilmagan.", ru: "Не проверялся на реальных пользователях." },
    ],
    nextStep: {
      uz: "Haqiqiy loyihada avval prototipni bir necha foydalanuvchi bilan sinab ko‘ramiz. So‘ng birinchi versiya funksiyalari va hajmini kelishamiz.", ru: "В реальном проекте сначала проверяем прототип на нескольких пользователях. Затем согласуем функции и объём первой версии.",
    },
  },
];

export function getProject(slug: string | undefined): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const projectFilters: readonly { readonly value: "all" | ProjectCategory; readonly label: Localized }[] = [
  { value: "all", label: { uz: "Barchasi", ru: "Все" } },
  { value: "web", label: { uz: "Web", ru: "Веб" } },
  { value: "mobil", label: { uz: "Mobil", ru: "Мобильные" } },
  { value: "avtomatlashtirish", label: { uz: "Avtomatlashtirish", ru: "Автоматизация" } },
];
