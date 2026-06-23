export function formatCustomDate(dateObj: Date, locale: string = "az") {
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  const monthIndex = dateObj.getMonth();

  if (locale === 'az') {
    const monthsAz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
    return `${day} ${monthsAz[monthIndex]} ${year}`;
  } else if (locale === 'ru') {
    const monthsRu = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
    return `${day} ${monthsRu[monthIndex]} ${year}`;
  } else {
    const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthsEn[monthIndex]} ${day}, ${year}`;
  }
}
