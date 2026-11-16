import type { Localized } from "../i18n/types";

export interface FaqItem {
  readonly id: string;
  readonly q: Localized;
  readonly a: Localized;
}

export const faq: readonly FaqItem[] = [
  {
    id: "hajm",
    q: { uz: "Loyiha hajmi qanday aniqlanadi?", ru: "Как определяется объём проекта?" },
    a: {
      uz: "Tahlil bosqichida maqsad, foydalanuvchilar va cheklovlarni aniqlaymiz. Natija — kelishilgan talablar va ish rejasi; hajm aynan shular asosida belgilanadi.", ru: "На этапе анализа определяем цели, пользователей и ограничения. Результат — согласованные требования и план работ; объём определяется именно на их основе.",
    },
  },
  {
    id: "jarayon",
    q: { uz: "Ish jarayoni qanday tashkil etiladi?", ru: "Как организована работа?" },
    a: {
      uz: "To‘rt bosqichda: tahlil, dizayn, dasturlash va ishga tushirish. Muhim qarorlar siz bilan muhokama qilinadi, oraliq natijalar muntazam ko‘rsatib boriladi. Muddat loyiha hajmiga bog‘liq va tahlildan so‘ng kelishiladi.", ru: "В четыре этапа: анализ, дизайн, разработка и запуск. Важные решения обсуждаем с вами, промежуточные результаты регулярно показываем. Сроки зависят от объёма проекта и согласуются после анализа.",
    },
  },
  {
    id: "narx",
    q: { uz: "Loyiha narxi qanday hisoblanadi?", ru: "Как рассчитывается стоимость проекта?" },
    a: {
      uz: "Narx loyiha hajmi, funksiyalar, dizayn murakkabligi va integratsiyalarga bog‘liq. Brifingiz asosida talablarni aniqlashtiramiz va shundan keyin taklif tayyorlaymiz.", ru: "Стоимость зависит от объёма проекта, функций, сложности дизайна и интеграций. На основе вашего брифа мы уточняем требования и после этого готовим предложение.",
    },
  },
  {
    id: "mavjud-loyiha",
    q: { uz: "Mavjud loyihani davom ettira olasizmi?", ru: "Можете продолжить существующий проект?" },
    a: {
      uz: "Ha. Avval mavjud kod, infratuzilma va hujjatlarni ko‘rib chiqamiz, so‘ng davom ettirish yo‘lini taklif qilamiz.", ru: "Да. Сначала изучаем существующий код, инфраструктуру и документацию, затем предлагаем, как продолжить работу.",
    },
  },
  {
    id: "materiallar",
    q: { uz: "Qanday materiallar topshiriladi?", ru: "Какие материалы передаются?" },
    a: {
      uz: "Kelishilgan ekranlarning dizayn fayllari, manba kod va texnik hujjatlar (o‘rnatish, sozlash, asosiy arxitektura). Manba kodni topshirish tartibi va aniq tarkib shartnomada belgilanadi.", ru: "Файлы дизайна согласованных экранов, исходный код и техническая документация (установка, настройка, основная архитектура). Порядок передачи исходного кода и точный состав определяются договором.",
    },
  },
  {
    id: "yordam",
    q: { uz: "Topshirilgandan keyingi yordam qanday kelishiladi?", ru: "Как согласуется поддержка после сдачи проекта?" },
    a: {
      uz: "Qo‘llab-quvvatlashni alohida xizmat sifatida taklif qilamiz: monitoring, yangilanishlar va yangi funksiyalar qo‘shish. Uning hajmi, muddati va shartlari har bir loyiha bo‘yicha alohida kelishiladi.", ru: "Поддержку предлагаем отдельной услугой: мониторинг, обновления и добавление новых функций. Её объём, сроки и условия согласуются отдельно по каждому проекту.",
    },
  },
  {
    id: "boshlash",
    q: { uz: "Boshlash uchun nima kerak?", ru: "Что нужно, чтобы начать?" },
    a: {
      uz: "Brifni to‘ldiring: loyiha haqida qisqacha, hozirgi holat, taxminiy budjet va muddat. Hammasi aniq bo‘lishi shart emas — noaniq joylarni tahlil bosqichida birga aniqlashtiramiz.", ru: "Заполните бриф: коротко о проекте, текущее состояние, примерный бюджет и сроки. Не всё должно быть ясно заранее — неясные моменты уточним вместе на этапе анализа.",
    },
  },
];
