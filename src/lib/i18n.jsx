import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DICT = {
  kz: {
    'nav.home': 'Басты', 'nav.map': 'Карта', 'nav.report': 'Су/Жағажай', 'nav.cleanup': 'EcoCoin', 'nav.leaderboard': 'Рейтинг', 'nav.sos': 'EcoSOS', 'nav.admin': 'Әкімдік', 'nav.profile': 'Профиль', 'nav.ecotour': 'EcoTour', 'nav.community': 'Қауым',
    'common.analyze': 'AI талдау', 'common.save': 'Сақтау', 'common.send': 'Жіберу', 'common.loading': 'Жүктелуде...', 'common.openMap': 'Картаны ашу', 'common.viewAll': 'Барлығын көру', 'common.login': 'Кіру', 'common.signup': 'Тіркелу', 'common.logout': 'Шығу', 'common.distance': 'Қашықтық', 'common.rating': 'Баға', 'common.reviews': 'Пікірлер', 'common.route': 'Бағыт', 'common.navigate': 'Навигация',
    'home.badge': 'Каспийдің цифрлық экожүйесі', 'home.title1': 'Каспийдің тазалығын', 'home.title2': 'AI қорғайды', 'home.sub': 'Жасанды интеллект, спутник суреті және азаматтардың қатысуы арқылы теңізді бірге қорғаймыз.', 'home.cta1': 'Жағажайды бағалау', 'home.health': 'Каспий Health Index', 'home.latest': 'Соңғі экобаяндамалар', 'home.sos': 'Соңғы EcoSOS', 'home.wallet': 'EcoCoin баланс', 'home.statsReports': 'AI бағалау', 'home.statsWaste': 'Жиналған қоқыс', 'home.statsPeople': 'Қатысушы', 'home.statsCoins': 'EcoCoin берілді',
    'mod.smartBeach': 'Smart Beach AI', 'mod.smartBeachDesc': 'Спутник/фото арқылы судың және жағажайдың тазалығын бағалайды.', 'mod.ecoCoin': 'EcoCoin', 'mod.ecoCoinDesc': '«Дейін/Кейін» фотоны салыстырып, ұпай және KZT конверсия береді.', 'mod.ecoSos': 'EcoSOS', 'mod.ecoSosDesc': 'Мұнай, өлі каспий итбалығы, балық, заңсыз үйінді — жедел хабар.',
    'health.healthy': 'Сау', 'health.moderate': 'Орташа', 'health.dangerous': 'Қауіпті', 'health.critical': 'Аса қауіпті',
    'layers.title': 'Карта қабаттары', 'layers.water': 'Су деңгейі', 'layers.seal': 'Каспий итбалығы', 'layers.sturgeon': 'Бекіре қорығы', 'layers.oil': 'Мұнай ластануы', 'layers.waste': 'Қоқыс баяндамалары', 'layers.sos': 'EcoSOS', 'layers.citizen': 'Азамат баяндамалары',
    'profile.title': 'Профиль', 'profile.coins': 'EcoCoin', 'profile.kzt': 'KZT эквиваленті', 'profile.history': 'Тазалау тарихы', 'profile.rank': 'Рейтингтегі орны', 'profile.locations': 'Тазартылған орындар', 'profile.walletNote': '100 EcoCoin = 100 KZT. Бұл экологиялық сыйақы жүйесі. Болашақта әкімшілікпен коммуналдық төлемдерде жеңілдік ретінде қолданылуы мүмкін.',
    'tour.title': 'EcoTour', 'tour.sub': 'Каспий маңындағы әдемі орындар.', 'tour.fav': 'Таңдаулы', 'tour.roadGood': 'Жақсы', 'tour.roadMod': 'Орташа', 'tour.roadRough': 'Нашар',
    'com.title': 'Қауым', 'com.sub': 'Жаңа орындар қос, пікір жаз, бағала.', 'com.add': 'Орын қосу', 'com.moderated': 'AI модерация өтті',
    'sos.title': 'EcoSOS', 'sos.sub': 'Экологиялық жедел хабарлама. AI әкімдікке хабарлама дайындайды.', 'sos.catOil': 'Мұнай төгіндісі', 'sos.catFish': 'Өлі балық', 'sos.catSeal': 'Өлі каспий итбалығы', 'sos.catDump': 'Заңсыз қоқыс үйіндісі', 'sos.catFishing': 'Заңсыз балық аулау', 'sos.catAccident': 'Экологиялық апат', 'sos.catOther': 'Өзге қауіп', 'sos.send': 'SOS жіберу', 'sos.reports': 'Хабарламалар', 'sos.copy': 'Мәтінді көшіру',
    'admin.title': 'Әкімдік панелі', 'admin.weekly': 'Апталық өзгеріс', 'admin.exportPdf': 'PDF экспорт', 'admin.exportExcel': 'Excel экспорт', 'admin.dirtiest': 'Ең лас жағажайлар', 'admin.byBeach': 'Жағажайлар бойынша орташа ластану',
    'water.title': 'Су тазалығы және жағажай', 'water.sub': 'Спутник суретін AI талдап, ластану аймақтарын бояйды.', 'water.clean': 'Таза су', 'water.moderate': 'Орташа', 'water.polluted': 'Лас аймақ', 'water.quality': 'Су сапасы', 'water.risk': 'Қауіп деңгейі', 'water.actions': 'Ұсынылатын шаралар',
    'clean.title': 'EcoCoin', 'clean.sub': '«Дейін» және «кейін» фотоларын жүкте — AI салыстырып, ұпай береді.', 'clean.before': 'Дейін', 'clean.after': 'Кейін', 'clean.submit': 'Тексеруге жіберу',
    'lb.title': 'Рейтинг', 'lb.sub': 'Ең көп EcoCoin жинаған экоқаһармандар.',
  },
  ru: {
    'nav.home': 'Главная', 'nav.map': 'Карта', 'nav.report': 'Вода/Пляж', 'nav.cleanup': 'EcoCoin', 'nav.leaderboard': 'Рейтинг', 'nav.sos': 'EcoSOS', 'nav.admin': 'Админ', 'nav.profile': 'Профиль', 'nav.ecotour': 'EcoTour', 'nav.community': 'Сообщество',
    'common.analyze': 'AI-анализ', 'common.save': 'Сохранить', 'common.send': 'Отправить', 'common.loading': 'Загрузка...', 'common.openMap': 'Открыть карту', 'common.viewAll': 'Все', 'common.login': 'Войти', 'common.signup': 'Регистрация', 'common.logout': 'Выйти', 'common.distance': 'Расстояние', 'common.rating': 'Оценка', 'common.reviews': 'Отзывы', 'common.route': 'Маршрут', 'common.navigate': 'Навигация',
    'home.badge': 'Цифровая экосистема Каспия', 'home.title1': 'Чистоту Каспия', 'home.title2': 'защищает AI', 'home.sub': 'Искусственный интеллект, спутниковые снимки и участие граждан — вместе защитим море.', 'home.cta1': 'Оценить пляж', 'home.health': 'Индекс здоровья Каспия', 'home.latest': 'Последние эко-отчёты', 'home.sos': 'Последние EcoSOS', 'home.wallet': 'Баланс EcoCoin', 'home.statsReports': 'AI-оценок', 'home.statsWaste': 'Собрано мусора', 'home.statsPeople': 'Участников', 'home.statsCoins': 'EcoCoin выдано',
    'mod.smartBeach': 'Smart Beach AI', 'mod.smartBeachDesc': 'Спутник/фото — оценка чистоты воды и пляжа.', 'mod.ecoCoin': 'EcoCoin', 'mod.ecoCoinDesc': 'Сравнение фото «До/После», баллы и конвертация в KZT.', 'mod.ecoSos': 'EcoSOS', 'mod.ecoSosDesc': 'Нефть, мёртвый тюлень, рыба, свалки — срочный сигнал.',
    'health.healthy': 'Здоров', 'health.moderate': 'Умеренно', 'health.dangerous': 'Опасно', 'health.critical': 'Критично',
    'layers.title': 'Слои карты', 'layers.water': 'Уровень воды', 'layers.seal': 'Каспийский тюлень', 'layers.sturgeon': 'Заповедник осетра', 'layers.oil': 'Нефтяное загрязнение', 'layers.waste': 'Свалки', 'layers.sos': 'EcoSOS', 'layers.citizen': 'Сигналы граждан',
    'profile.title': 'Профиль', 'profile.coins': 'EcoCoin', 'profile.kzt': 'Эквивалент в KZT', 'profile.history': 'История уборок', 'profile.rank': 'Место в рейтинге', 'profile.locations': 'Очищено мест', 'profile.walletNote': '100 EcoCoin = 100 KZT. Это эко-награда. В будущем — скидки на коммуналку через партнёрство с властью.',
    'tour.title': 'EcoTour', 'tour.sub': 'Красивые места вокруг Каспия.', 'tour.fav': 'Избранное', 'tour.roadGood': 'Хорошая', 'tour.roadMod': 'Средняя', 'tour.roadRough': 'Плохая',
    'com.title': 'Сообщество', 'com.sub': 'Добавляйте места, пишите отзывы, оценивайте.', 'com.add': 'Добавить место', 'com.moderated': 'Проверено AI',
    'sos.title': 'EcoSOS', 'sos.sub': 'Срочный эко-сигнал. AI готовит сообщение для власти.', 'sos.catOil': 'Нефть', 'sos.catFish': 'Мёртвая рыба', 'sos.catSeal': 'Мёртвый тюлень', 'sos.catDump': 'Нелегальная свалка', 'sos.catFishing': 'Браконьерство', 'sos.catAccident': 'Эко-авария', 'sos.catOther': 'Иная угроза', 'sos.send': 'Отправить SOS', 'sos.reports': 'Сигналы', 'sos.copy': 'Копировать текст',
    'admin.title': 'Админ-панель', 'admin.weekly': 'Изменение за неделю', 'admin.exportPdf': 'Экспорт PDF', 'admin.exportExcel': 'Экспорт Excel', 'admin.dirtiest': 'Самые грязные пляжи', 'admin.byBeach': 'Среднее загрязнение по пляжам',
    'water.title': 'Чистота воды и пляжа', 'water.sub': 'AI анализирует спутник и закрашивает зоны загрязнения.', 'water.clean': 'Чистая вода', 'water.moderate': 'Умеренно', 'water.polluted': 'Загрязнено', 'water.quality': 'Качество воды', 'water.risk': 'Уровень риска', 'water.actions': 'Рекомендации',
    'clean.title': 'EcoCoin', 'clean.sub': 'Загрузите фото «до» и «после» — AI сравнит и начислит баллы.', 'clean.before': 'До', 'clean.after': 'После', 'clean.submit': 'Отправить на проверку',
    'lb.title': 'Рейтинг', 'lb.sub': 'Эко-герои с наибольшим числом EcoCoin.',
  },
  en: {
    'nav.home': 'Home', 'nav.map': 'Map', 'nav.report': 'Water/Beach', 'nav.cleanup': 'EcoCoin', 'nav.leaderboard': 'Leaderboard', 'nav.sos': 'EcoSOS', 'nav.admin': 'Admin', 'nav.profile': 'Profile', 'nav.ecotour': 'EcoTour', 'nav.community': 'Community',
    'common.analyze': 'Analyze with AI', 'common.save': 'Save', 'common.send': 'Send', 'common.loading': 'Loading...', 'common.openMap': 'Open map', 'common.viewAll': 'View all', 'common.login': 'Sign in', 'common.signup': 'Sign up', 'common.logout': 'Sign out', 'common.distance': 'Distance', 'common.rating': 'Rating', 'common.reviews': 'Reviews', 'common.route': 'Route', 'common.navigate': 'Navigate',
    'home.badge': 'Caspian Digital Twin', 'home.title1': 'Protecting the Caspian', 'home.title2': 'with AI', 'home.sub': 'Artificial intelligence, satellite imagery and citizen participation — together we protect the sea.', 'home.cta1': 'Assess a beach', 'home.health': 'Caspian Health Index', 'home.latest': 'Latest reports', 'home.sos': 'Latest EcoSOS', 'home.wallet': 'EcoCoin balance', 'home.statsReports': 'AI reports', 'home.statsWaste': 'Waste collected', 'home.statsPeople': 'Participants', 'home.statsCoins': 'EcoCoin awarded',
    'mod.smartBeach': 'Smart Beach AI', 'mod.smartBeachDesc': 'Satellite/photo assessment of water and beach cleanliness.', 'mod.ecoCoin': 'EcoCoin', 'mod.ecoCoinDesc': 'Before/After photo comparison, points and KZT conversion.', 'mod.ecoSos': 'EcoSOS', 'mod.ecoSosDesc': 'Oil, dead seal, fish, illegal dumps — emergency signal.',
    'health.healthy': 'Healthy', 'health.moderate': 'Moderate', 'health.dangerous': 'Dangerous', 'health.critical': 'Critical',
    'layers.title': 'Map layers', 'layers.water': 'Water level', 'layers.seal': 'Caspian seal', 'layers.sturgeon': 'Sturgeon reserve', 'layers.oil': 'Oil pollution', 'layers.waste': 'Waste reports', 'layers.sos': 'EcoSOS', 'layers.citizen': 'Citizen reports',
    'profile.title': 'Profile', 'profile.coins': 'EcoCoin', 'profile.kzt': 'KZT equivalent', 'profile.history': 'Cleanup history', 'profile.rank': 'Rank', 'profile.locations': 'Cleaned locations', 'profile.walletNote': '100 EcoCoin = 100 KZT. This is an eco-reward system. Future: utility discounts via government partnership.',
    'tour.title': 'EcoTour', 'tour.sub': 'Beautiful places around the Caspian.', 'tour.fav': 'Favorite', 'tour.roadGood': 'Good', 'tour.roadMod': 'Moderate', 'tour.roadRough': 'Rough',
    'com.title': 'Community', 'com.sub': 'Add places, write reviews, rate.', 'com.add': 'Add place', 'com.moderated': 'AI moderated',
    'sos.title': 'EcoSOS', 'sos.sub': 'Emergency eco report. AI prepares a message for authorities.', 'sos.catOil': 'Oil spill', 'sos.catFish': 'Dead fish', 'sos.catSeal': 'Dead seal', 'sos.catDump': 'Illegal dump', 'sos.catFishing': 'Illegal fishing', 'sos.catAccident': 'Eco accident', 'sos.catOther': 'Other hazard', 'sos.send': 'Send SOS', 'sos.reports': 'Reports', 'sos.copy': 'Copy text',
    'admin.title': 'Admin panel', 'admin.weekly': 'Weekly change', 'admin.exportPdf': 'Export PDF', 'admin.exportExcel': 'Export Excel', 'admin.dirtiest': 'Dirtiest beaches', 'admin.byBeach': 'Average pollution by beach',
    'water.title': 'Water & beach cleanliness', 'water.sub': 'AI analyzes satellite imagery and highlights pollution zones.', 'water.clean': 'Clean water', 'water.moderate': 'Moderate', 'water.polluted': 'Polluted', 'water.quality': 'Water quality', 'water.risk': 'Risk level', 'water.actions': 'Recommended actions',
    'clean.title': 'EcoCoin', 'clean.sub': 'Upload Before & After photos — AI compares and awards points.', 'clean.before': 'Before', 'clean.after': 'After', 'clean.submit': 'Submit for verification',
    'lb.title': 'Leaderboard', 'lb.sub': 'Eco-heroes with the most EcoCoin.',
  },
};

const LangCtx = createContext({ lang: 'kz', t: (k) => k, setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('eco-lang') || 'kz');
  useEffect(() => { localStorage.setItem('eco-lang', lang); }, [lang]);
  const t = useCallback((key) => (DICT[lang] && DICT[lang][key]) || DICT.kz[key] || key, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);