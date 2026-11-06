import type { Localized } from "../i18n/types";

export interface FaqItem {
  readonly id: string;
  readonly q: Localized;
  readonly a: Localized;
}

export const faq: readonly FaqItem[] = [
  {
    id: "narx",
    q: { uz: "Loyiha narxi qanday hisoblanadi?", ru: "Как рассчитывается стоимость проекта?" },
    a: {
      uz: "Narx loyiha hajmi, funksiyalar, dizayn murakkabligi va integratsiyalarga bog‘liq. Brifingiz asosida talablarni aniqlashtiramiz va shundan keyin taklif tayyorlaymiz.", ru: "Стоимость зависит от объёма проекта, функций, сложности дизайна и интеграций. На основе вашего брифа мы уточняем требования и после этого готовим предложение.",
    },
  },
  {
    id: "muddat",
    q: { uz: "Ish jarayoni qancha davom etadi?", ru: "Сколько длится работа?" },
    a: {
      uz: "Muddat loyiha hajmi va murakkabligiga bog‘liq. Tahlil bosqichidan so‘ng bosqichma-bosqich ish rejasini kelishib olamiz.", ru: "Сроки зависят от объёма и сложности проекта. После этапа анализа согласуем поэтапный план работ.",
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
    id: "manba-kod",
    q: { uz: "Manba kod kimga topshiriladi?", ru: "Кому передаётся исходный код?" },
    a: { uz: "Manba kodni topshirish tartibi va unga bo‘lgan huquqlar shartnomada aniq belgilanadi.", ru: "Порядок передачи исходного кода и права на него чётко определяются договором." },
  },
  {
    id: "yordam",
    q: { uz: "Loyiha topshirilgach yordam berasizmi?", ru: "Помогаете ли вы после сдачи проекта?" },
    a: {
      uz: "Ha, qo‘llab-quvvatlash xizmatini taklif qilamiz. Uning hajmi va shartlari loyiha bo‘yicha alohida kelishiladi.", ru: "Да, мы предлагаем услугу поддержки. Её объём и условия согласуются отдельно по каждому проекту.",
    },
  },
];
