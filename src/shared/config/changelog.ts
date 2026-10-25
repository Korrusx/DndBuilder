export type ChangelogEntry = {
  version: string;
  date: { ru: string; en: string };
  items: { ru: string; en: string }[];
};

export const CHANGELOG: ChangelogEntry[] = [
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
