// Gələcəkdə bura Supabase DB çağırışları ilə əvəzlənəcək
export type Locale = "az" | "en" | "ru";

const mockDbTranslations = {
  az: {
    hero: {
      tag: "Vətəndaş Cəmiyyətində Debat",
      title1: "Sözün Gücü ilə",
      title2: "Gələcəyi Formalaşdır",
      desc: "DVC gənclərin inkişafı, debat mədəniyyətinin formalaşması və innovativ təşəbbüslərin dəstəklənməsi üçün ən böyük platformadır.",
      join: "Bizə Qoşul",
      about: "Haqqımızda"
    },
    nav: {
      about: "Haqqımızda",
      programs: "Proqramlar",
      news: "Xəbərlər",
      contact: "Əlaqə",
      login: "Daxil ol"
    }
  },
  en: {
    hero: {
      tag: "Debate in Civil Society",
      title1: "Shape the Future",
      title2: "with the Power of Words",
      desc: "DVC is the largest platform for youth development, debate culture, and innovative initiatives.",
      join: "Join Us",
      about: "About Us"
    },
    nav: {
      about: "About Us",
      programs: "Programs",
      news: "News",
      contact: "Contact",
      login: "Login"
    }
  },
  ru: {
    hero: {
      tag: "Дебаты в Гражданском Обществе",
      title1: "Формируй Будущее",
      title2: "Силой Слова",
      desc: "DVC — это крупнейшая платформа для развития молодежи, культуры дебатов и инновационных инициатив.",
      join: "Присоединяйся",
      about: "О нас"
    },
    nav: {
      about: "О нас",
      programs: "Программы",
      news: "Новости",
      contact: "Контакты",
      login: "Войти"
    }
  }
};

export const getDictionary = async (locale: Locale) => {
  // Simulyasiya: DB-dən yükləmə
  return new Promise<typeof mockDbTranslations["az"]>((resolve) => {
    setTimeout(() => {
      resolve(mockDbTranslations[locale] || mockDbTranslations["az"]);
    }, 50);
  });
};
