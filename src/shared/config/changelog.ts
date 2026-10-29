export type ChangelogEntry = {
  version: string;
  date: { ru: string; en: string };
  items: { ru: string; en: string }[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.5.0',
    date: { ru: 'октябрь 2026', en: 'October 2026' },
    items: [
      {
        ru: 'Хроника кампании: кнопка кампании на «Листе» открывает летопись — сессии, заметки и события по времени',
        en: 'Campaign chronicle: the campaign button on the Sheet opens the chronicle — sessions, notes and events in order',
      },
      {
        ru: 'Летопись пишется сама: натуральные 20 и 1, 0 хитов, вещи, монеты, новый уровень, отдых',
        en: 'The chronicle writes itself: natural 20s and 1s, 0 HP, items, coins, new levels, rests',
      },
      {
        ru: 'Наберите @ в записи — появится карточка человека, места, фракции или квеста, которая сама собирает упоминания',
        en: 'Type @ in an entry to create a person, place, faction or quest card that gathers its mentions by itself',
      },
      {
        ru: 'Квесты с шагами и личная линия со счётчиком: «Внести из кошелька» списывает монеты героя',
        en: 'Quests with steps and a personal thread with a counter: “Pay from the wallet” takes the hero’s coins',
      },
      {
        ru: '«В прошлый раз…» — сводка прошлой сессии для чтения вслух; тайные записи в неё не попадают',
        en: '“Last time…” — a recap of the previous session to read aloud; secret entries stay out',
      },
      {
        ru: '«Зал героев» для павших и ушедших на покой, фото в записях, экспорт хроники в файл',
        en: 'Hall of Heroes for the fallen and retired, photos in entries, chronicle export to a file',
      },
      {
        ru: 'Нижние окна поднимаются над клавиатурой',
        en: 'Bottom sheets move above the keyboard',
      },
    ],
  },
  {
    version: '1.4.0',
    date: { ru: 'октябрь 2026', en: 'October 2026' },
    items: [
      {
        ru: 'Быстрее: галочка при выборе ставится сразу, «Далее» не ждёт сохранения; шаги создания листаются как слайдер',
        en: 'Faster: picks are checked instantly, “Next” no longer waits for saving; creation steps slide like pages',
      },
      {
        ru: 'Создание персонажа: под плитками класса, вида и предыстории — карточка с описанием: что умеет, что даёт, что дальше; предыстории, подходящие классу, — первыми',
        en: 'Character creation: a description card under class, species and background tiles — what it can do, what it gives, what comes next; backgrounds that fit your class come first',
      },
      {
        ru: 'Новый выбор заклинаний: поиск, фильтры, описание в шторке, «Выбрано N из M»',
        en: 'New spell picker: search, filters, details sheet, “N of M selected”',
      },
      {
        ru: 'Черты, воззвания, метамагия, боевые стили, приёмы оружия и предметы выбираются строкой с описанием по нажатию',
        en: 'Feats, invocations, metamagic, fighting styles, weapon masteries and items: pick from a list, details on tap',
      },
      {
        ru: 'Редакция 2014: те же расы, что в 2024 — голиаф, орк, аасимар, дампир, калаштар, кованый, ченджлинг, шифтер',
        en: '2014 edition: the same races as 2024 — goliath, orc, aasimar, dhampir, kalashtar, warforged, changeling, shifter',
      },
      {
        ru: 'Редакция 2014: подрасы тифлинга; драконий предок выбирается под карточкой расы, как подраса',
        en: '2014 edition: tiefling subraces; draconic ancestry is chosen under the race card, like a subrace',
      },
      {
        ru: 'Редакция 2014: «Человек (стандартный)» и «Человек (альтернативный)»',
        en: '2014 edition: clearer Russian names for Human and Human (Variant)',
      },
      {
        ru: 'Исправлено: падение мастера на шаге навыков (духовая трубка), одно заклинание можно было выбрать дважды',
        en: 'Fixed: character creation crash on the skills step (blowgun), the same spell could be picked twice',
      },
    ],
  },
  {
    version: '1.3.3',
    date: { ru: 'октябрь 2026', en: 'October 2026' },
    items: [
      {
        ru: '«О приложении»: отметка о неофициальном приложении, оригинальный текст атрибуции SRD, источник данных и шрифты',
        en: 'About: unofficial app notice, original SRD attribution text, data source and fonts',
      },
      { ru: 'Ссылки в атрибуции открываются по нажатию', en: 'Links in the attribution open on tap' },
      {
        ru: 'Новое название — «Конструктор 5e», из интерфейса убраны товарные знаки',
        en: 'App renamed to “Конструктор 5e”, trademarks removed from the interface',
      },
    ],
  },
  {
    version: '1.3.2',
    date: { ru: 'октябрь 2026', en: 'October 2026' },
    items: [
      {
        ru: 'Исправлено открытие экранов редактирования и повышения уровня',
        en: 'Fixed opening the edit and level-up screens',
      },
      {
        ru: 'Вкладка «Вещи»: понятный счётчик настройки на магические предметы с пояснением по нажатию',
        en: 'Items tab: clearer magic item attunement counter with an explanation on tap',
      },
      {
        ru: 'История обновлений: сразу видны 3 последние версии, остальные — по кнопке',
        en: 'Version history: the 3 latest versions are shown, the rest behind a button',
      },
    ],
  },
  {
    version: '1.3.1',
    date: { ru: 'октябрь 2026', en: 'October 2026' },
    items: [
      {
        ru: 'Исправлены 3D-броски: стол падал на первом стуке кубика и бросок становился простым',
        en: 'Fixed 3D dice: the table crashed on the first die hit and fell back to a simple roll',
      },
      { ru: 'Обновление до Expo SDK 58', en: 'Updated to Expo SDK 58' },
    ],
  },
  {
    version: '1.3.0',
    date: { ru: 'октябрь 2026', en: 'October 2026' },
    items: [
      { ru: 'Хоумбрю предметы: создание, редактирование, удаление', en: 'Homebrew items: create, edit, delete' },
      {
        ru: 'Движок эффектов предметов: магический бонус к атаке/урону, дополнительный урон',
        en: 'Item effects engine: magic attack/damage bonus, extra damage',
      },
      {
        ru: 'Оптимизация: устранены фризы при переключении вкладок и открытии шторки «Добавить»',
        en: 'Performance: fixed freezes when switching tabs and opening the Add sheet',
      },
      { ru: 'История обновлений в разделе «О приложении»', en: 'Version history in the About screen' },
    ],
  },
  {
    version: '1.2.1',
    date: { ru: 'октябрь 2026', en: 'October 2026' },
    items: [
      { ru: 'Исправлен фриз при первом переходе на вкладку «Вещи»', en: 'Fixed freeze on first open of the Items tab' },
      { ru: 'Исправлена ошибка «database is locked»', en: 'Fixed "database is locked" error' },
      {
        ru: 'Подтверждение перед удалением предмета из рюкзака',
        en: 'Confirmation before removing an item from the inventory',
      },
    ],
  },
  {
    version: '1.2.0',
    date: { ru: 'октябрь 2026', en: 'October 2026' },
    items: [
      { ru: 'Черта Skilled: дедупликация при выборе', en: 'Skilled feat: deduplication on pick' },
      {
        ru: 'Волшебник, шаг 5: скрывать подготовку до заполнения книги',
        en: 'Wizard step 5: hide preparation until spellbook is filled',
      },
      { ru: 'Монеты как визуальная плашка в инвентаре', en: 'Coins displayed as a visual chip in inventory' },
    ],
  },
  {
    version: '1.1.0',
    date: { ru: 'октябрь 2026', en: 'October 2026' },
    items: [
      { ru: 'Полный мастер создания персонажа (6 шагов)', en: 'Full character creation wizard (6 steps)' },
      { ru: 'Режим игры: хиты, броски, заклинания, отдых', en: 'Play mode: HP, rolls, spells, rest' },
      { ru: 'Экспорт/импорт персонажа файлом (.dnd.json)', en: 'Character export/import as a file (.dnd.json)' },
      { ru: 'Поддержка правил 5e 2014 и 2024', en: 'Support for 5e 2014 and 2024 rules' },
    ],
  },
];
