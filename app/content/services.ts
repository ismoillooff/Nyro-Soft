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
    figureLabel: { uz: "Ochiq noutbuk: qopqog‘i ko‘rsatkich balandligiga qarab ochiladi" },
    title: { uz: "Web platformalar" },
    short: { uz: "Korporativ saytlardan CRM va ichki tizimlargacha." },
    description: {
      uz: "Biznes jarayonlaringizga moslashgan, tez ishlaydigan va kengaytirish oson veb tizimlar: korporativ saytlardan CRM va ichki platformalargacha.",
    },
    audience: [
      { uz: "Buyurtma, mijoz va hisobotlarni jadvallarda yuritayotgan kompaniyalar" },
      { uz: "Eskirgan saytini yangilamoqchi bo‘lgan bizneslar" },
      { uz: "Ichki jarayonlar uchun alohida tizim kerak bo‘lgan jamoalar" },
      { uz: "Mavjud platformani kengaytirmoqchi bo‘lgan mahsulot egalari" },
    ],
    problems: [
      {
        problem: { uz: "Ma’lumotlar turli jadval va chatlarda tarqalib ketgan" },
        solution: { uz: "Bitta tizim: buyurtmalar, mijozlar va hisobotlar bir joyda" },
      },
      {
        problem: { uz: "Sayt sekin ochiladi va mobil qurilmada noqulay" },
        solution: { uz: "Tez yuklanadigan, har qanday ekranga moslashgan interfeys" },
      },
      {
        problem: { uz: "Har bir o‘zgarish uchun dasturchini kutish kerak" },
        solution: { uz: "Kontent va sozlamalarni o‘zingiz boshqaradigan panel" },
      },
    ],
    scope: [
      { uz: "Talablar tahlili va tuzilma" },
      { uz: "UI/UX dizayn va interaktiv prototip" },
      { uz: "Frontend va backend dasturlash" },
      { uz: "Boshqaruv paneli va foydalanuvchi rollari" },
      { uz: "Tashqi xizmatlar bilan integratsiya" },
      { uz: "Serverga joylash va topshirish" },
    ],
    faq: [
      {
        q: { uz: "Tayyor shablon emas, noldan qilasizmi?" },
        a: { uz: "Ha. Tuzilma va dizayn sizning jarayonlaringiz asosida ishlab chiqiladi; tayyor kutubxonalardan faqat texnik asos sifatida foydalanamiz." },
      },
      {
        q: { uz: "Mavjud saytimizni qayta yozish shartmi?" },
        a: { uz: "Har doim emas. Avval mavjud kodni ko‘rib chiqamiz va qaysi qismlarni saqlash mumkinligini aytamiz." },
      },
      {
        q: { uz: "Platformani keyin kengaytirish mumkinmi?" },
        a: { uz: "Arxitektura yangi modullar qo‘shishni hisobga olib tuziladi. Kengaytirish rejasi tahlil bosqichida kelishiladi." },
      },
    ],
    related: ["web"],
    briefValue: "web",
  },
  {
    slug: "mobil-ilovalar",
    number: "02",
    figure: "phone",
    figureLabel: { uz: "Qatlamlarga ajralgan telefon: shisha, plata, batareya va korpus" },
    title: { uz: "Mobil ilovalar" },
    short: { uz: "iOS va Android uchun qulay va barqaror ilovalar." },
    description: {
      uz: "iOS va Android uchun qulay va barqaror mobil ilovalar — mijozlaringiz siz bilan doim aloqada bo‘lishi uchun.",
    },
    audience: [
      { uz: "Mijozlari bilan doimiy aloqada bo‘lishi kerak bo‘lgan xizmatlar" },
      { uz: "Veb platformasiga mobil ilova qo‘shmoqchi bo‘lgan bizneslar" },
      { uz: "Yangi mobil mahsulot g‘oyasini sinab ko‘rmoqchi bo‘lgan jamoalar" },
    ],
    problems: [
      {
        problem: { uz: "Mijozlar faqat telefon orqali murojaat qiladi va yo‘qolib ketadi" },
        solution: { uz: "Buyurtma, holat va bildirishnomalar bitta ilovada" },
      },
      {
        problem: { uz: "Ikki platforma uchun alohida jamoa saqlash qimmat" },
        solution: { uz: "Mos hollarda iOS va Android uchun umumiy kod bazasi" },
      },
      {
        problem: { uz: "Ilova sekin ishlaydi va tez-tez xato beradi" },
        solution: { uz: "Barqarorlikka yo‘naltirilgan arxitektura va testlash" },
      },
    ],
    scope: [
      { uz: "Foydalanuvchi ssenariylari va prototip" },
      { uz: "iOS va Android uchun interfeys dizayni" },
      { uz: "Ilova va server qismini dasturlash" },
      { uz: "Push-bildirishnomalar va integratsiyalar" },
      { uz: "Do‘konlarga joylashga tayyorlash" },
    ],
    faq: [
      {
        q: { uz: "Bitta ilova ikkala platformada ishlaydimi?" },
        a: { uz: "Ko‘p loyihalarda ha — umumiy kod bazasi bilan. Qaysi yondashuv mos ekanini talablar asosida birga tanlaymiz." },
      },
      {
        q: { uz: "Ilovani App Store va Google Play’ga joylaysizmi?" },
        a: { uz: "Ilovani joylashga tayyorlaymiz va jarayonda yordam beramiz. Do‘kon akkauntlari sizning nomingizga ochiladi." },
      },
      {
        q: { uz: "Ilovaga server qismi kerakmi?" },
        a: { uz: "Ko‘pincha ha: ma’lumotlarni saqlash va sinxronlash uchun. Bu ham ish hajmiga kiritilishi mumkin." },
      },
    ],
    related: ["mobil"],
    briefValue: "mobil",
  },
  {
    slug: "ui-ux-dizayn",
    number: "03",
    figure: "exploded",
    figureLabel: { uz: "Qatlamlarga ajralgan ilova oynasi: tuzilmadan yakuniy interfeysgacha" },
    title: { uz: "UI/UX dizayn" },
    short: { uz: "Tadqiqotdan tayyor dizayn tizimigacha." },
    description: {
      uz: "Foydalanuvchi tadqiqotidan tayyor dizayn tizimigacha: tushunarli, chiroyli va dasturlashga tayyor interfeyslar.",
    },
    audience: [
      { uz: "Mahsulotini qayta ishlamoqchi bo‘lgan jamoalar" },
      { uz: "O‘z dasturchilari bor, lekin dizayner yo‘q kompaniyalar" },
      { uz: "Investor yoki mijozga prototip ko‘rsatishi kerak bo‘lganlar" },
    ],
    problems: [
      {
        problem: { uz: "Foydalanuvchilar kerakli funksiyani topa olmaydi" },
        solution: { uz: "Ssenariylarga asoslangan tushunarli tuzilma" },
      },
      {
        problem: { uz: "Har bir ekran turlicha ko‘rinadi" },
        solution: { uz: "Komponentlar va qoidalardan iborat dizayn tizimi" },
      },
      {
        problem: { uz: "Dizayn dasturlashda boshqacha chiqadi" },
        solution: { uz: "Holatlari va o‘lchamlari aniq belgilangan maketlar" },
      },
    ],
    scope: [
      { uz: "Foydalanuvchi va raqobatchilar tahlili" },
      { uz: "Tuzilma va wireframe’lar" },
      { uz: "Yakuniy interfeys dizayni" },
      { uz: "Interaktiv prototip" },
      { uz: "Dizayn tizimi va komponentlar" },
      { uz: "Dasturchilarga topshirish" },
    ],
    faq: [
      {
        q: { uz: "Faqat dizayn buyurtma qilsa bo‘ladimi?" },
        a: { uz: "Ha. Maketlar va dizayn tizimini o‘z jamoangiz dasturlashi uchun tayyorlab beramiz." },
      },
      {
        q: { uz: "Qaysi vositalarda ishlaysiz?" },
        a: { uz: "Asosan Figma’da. Manba fayllar topshirish tartibi shartnomada belgilanadi." },
      },
      {
        q: { uz: "Foydalanuvchi tadqiqoti shartmi?" },
        a: { uz: "Hajmi loyihaga bog‘liq. Kichik loyihalarda qisqa intervyu va mavjud ma’lumotlar tahlili yetarli bo‘lishi mumkin." },
      },
    ],
    related: ["web", "mobil"],
    briefValue: "dizayn",
  },
  {
    slug: "biznesni-avtomatlashtirish",
    number: "04",
    figure: "settle",
    figureLabel: { uz: "Tartibsiz plitkalar markaz atrofida daraxtga yig‘iladi" },
    title: { uz: "Biznesni avtomatlashtirish" },
    short: { uz: "Integratsiyalar, hisobotlar va ichki jarayonlar." },
    description: {
      uz: "Takrorlanuvchi qo‘l mehnatini tizimga topshiring: integratsiyalar, hisobotlar va ichki jarayonlarni avtomatlashtirish.",
    },
    audience: [
      { uz: "Hisobotlarni har hafta qo‘lda yig‘adigan jamoalar" },
      { uz: "Bir nechta xizmat o‘rtasida ma’lumot ko‘chiradigan xodimlar" },
      { uz: "Jarayonlari o‘sib, qo‘lda boshqarib bo‘lmay qolgan bizneslar" },
    ],
    problems: [
      {
        problem: { uz: "Bir xil ma’lumot bir necha joyga qo‘lda kiritiladi" },
        solution: { uz: "Tizimlar o‘rtasida avtomatik sinxronlash" },
      },
      {
        problem: { uz: "Hisobot tayyorlashga kunlar ketadi" },
        solution: { uz: "Kerakli vaqtda tayyor bo‘ladigan avtomatik hisobotlar" },
      },
      {
        problem: { uz: "Muhim voqealar haqida kech xabar topiladi" },
        solution: { uz: "Telegram yoki email orqali o‘z vaqtidagi bildirishnomalar" },
      },
    ],
    scope: [
      { uz: "Mavjud jarayonlarni tahlil qilish" },
      { uz: "Tashqi xizmatlar va API integratsiyalari" },
      { uz: "Avtomatik hisobotlar" },
      { uz: "Telegram botlar va bildirishnomalar" },
      { uz: "Ichki boshqaruv vositalari" },
    ],
    faq: [
      {
        q: { uz: "Qaysi jarayonlarni avtomatlashtirish mumkin?" },
        a: { uz: "Qoidasi aniq va takrorlanadigan har qanday jarayonni. Tahlil bosqichida eng ko‘p vaqt olayotganlaridan boshlaymiz." },
      },
      {
        q: { uz: "Hozirgi dasturlarimiz bilan ishlaydimi?" },
        a: { uz: "Agar ularda API yoki eksport imkoniyati bo‘lsa — ko‘pincha ha. Buni tahlil bosqichida tekshiramiz." },
      },
      {
        q: { uz: "Xodimlarimizni o‘qitasizmi?" },
        a: { uz: "Topshirish paytida tizimdan foydalanishni ko‘rsatib beramiz. Qo‘shimcha o‘qitish hajmi alohida kelishiladi." },
      },
    ],
    related: ["avtomatlashtirish"],
    briefValue: "avtomatlashtirish",
  },
];

export function getService(slug: string | undefined): Service | undefined {
  return services.find((s) => s.slug === slug);
}
