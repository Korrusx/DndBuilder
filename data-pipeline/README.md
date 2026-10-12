# Конвейер справочника

```
npm run data:fetch   # скачать сырые данные из dnd5eapi в raw/ (нужен интернет, ~2 минуты)
npm run data:build   # собрать assets/content/content.json и обновить translations/*.csv
```

## Как переводить

1. Откройте нужный файл из `translations/` в Google Таблицах или Excel (кодировка UTF-8, разделитель — запятая).
2. Заполните колонку `ru`, в `status` поставьте `draft` (черновик) или `done` (готово).
   Колонки `key` и `en` не меняйте.
3. Сохраните как CSV в тот же файл и запустите `npm run data:build`.

Файлы: `core` (характеристики, навыки, владения, языки, состояния), `classes` (классы, умения, подклассы),
`origins` (виды, предыстории, черты), `equipment`, `spells`, `magic-items`.

Если английский текст в источнике поменяется, готовый перевод получит статус `draft`, а сборка
напишет предупреждение. Ключи без перевода перечислены в `missing-translations.txt`;
в приложении вместо перевода показывается английский текст с пометкой «EN».

## Тексты SRD, которых нет в API (`srd/`)

`srd/class-options.json` — таинственные воззвания колдуна и метамагия чародея из SRD 5.2.1 (с. 66–67, 72–74):
`en` — текст SRD, `ru` — наш перевод. Перевод при первой сборке попадает в `translations/classes.csv` черновиком
(ключи `classOption.<id>.name` / `.description`); дальше его правят в CSV. Поля `prerequisite`, `repeatable`, `cost`,
`spells` — механика для приложения.

## Механика не из SRD (`extra/`)

`extra/backgrounds.json` и `extra/feats.json` — предыстории и черты происхождения Player's Handbook 2024,
которых нет в SRD 5.2. Только механика; тексты книги не копируем и не пересказываем
(см. принцип 4 в CLAUDE.md). Сборка добавляет их в справочник с пометкой `extra: true`,
названия и описания попадают в `translations/origins.csv` как обычные ключи перевода.

Предыстория:
- `abilities` — три характеристики для бонусов +2/+1 или +1/+1/+1;
- `feat` — id черты происхождения; `featSpellList` — список для «Посвящённого в магию»;
- `proficiencies` — id владений без выбора (`skill-…`, `tool-…`);
- `proficiencyChoices` — `{ choose, options }` или `{ choose, fromProficiencyType: artisanTool | instrument | gamingSet }`;
- `equipment` — набор A: `items` (`[id, количество]`), `pickFromCategory` (предмет на выбор из категории), `gp`.
  Вариант B (50 зм) добавляется автоматически.

Черта: `id`, `name`, `type`, `description` (механика своими словами), `proficiencyChoices`.

`extra/species.json` — виды не из SRD (Аасимар из PHB 2024; Дампир, Калаштар, Кованый, Кхоравар, Ченджлинг, Шифтер
из других книг). Вид: `id`, `name` (`{ en, ru }`), `creatureType`, `sizes`, `speed`, `traits`, `subspecies`.
Особенность в `traits` — либо строка (id готовой особенности SRD, например `darkvision-60`), либо объект
`{ id, name, text, spells?, proficiencyChoices?, speed? }`; `text` — описание сразу по-русски.
В `proficiencyChoices` кроме `artisanTool | instrument | gamingSet` можно `skill` (любой навык) и `anyTool`
(любой инструмент), `desc` — подсказка к выбору. Подвид: `{ id, name, traits }`, у особенностей подвида можно указать `level`.
Ресурсы особенностей (сколько раз до отдыха) — в `extra/resources.json`.

Английский текст для механики из `extra` (у неё нет английского оригинала): у умения подкласса и особенности вида —
`textEn` рядом с `text`, у подкласса — `summaryEn` рядом с `summary`, у выбора владений — `descEn` рядом с `desc`.
Он показывается, когда в приложении выбран английский язык. Если английского поля нет, сборка предупредит
(«Нет английского текста»), а тест `tr.test.ts` упадёт.
Механические эффекты (например, «Крепкий» +2 хита за уровень) задаются в `src/entities/character/config/effects.ts`.
