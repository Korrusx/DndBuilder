// Лист персонажа для печати: HTML двух страниц A4. Без React — только данные справочника и расчёты из src/rules.
// Стр. 1 — персонаж (характеристики и навыки, бой, хиты, атаки, ресурсы, умения, владения),
// стр. 2 — заклинания, внешность и характер, снаряжение, настройка, монеты.
// Бланк чёрный с бордовым акцентом, данные тёмно-синие. Текущие и временные хиты пустые — для карандаша.

import { ABILITY_IDS, CHOICE_KEYS } from '@/entities/character/config/constants';
import { magicInitiateSlots } from '@/entities/character/model/build';
import { characterResources } from '@/entities/character/model/resources';
import { computeSheet } from '@/entities/character/model/sheet';
import type { Character, CharacterSheet, SourcedId } from '@/entities/character/model/types';
import { byId, tr } from '@/shared/content/content';
import {
  abilityAbbr,
  abilityName,
  groupSkillsByAbility,
  itemName,
  nameOf,
  proficiencyName,
} from '@/shared/content/names';
import type { AbilityId, Content } from '@/shared/content/types';
import { formatDamage, formatModifier } from '@/shared/lib/dice/dice';
import { COINS, SLOT_FORM } from '../config/constants';
import { SHEET_CSS } from '../config/sheetCss';
import type { SheetSpell } from './types';

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
const e = escapeHtml;

const circle = (on = false, extra = '') => `<span class="o${on ? ' on' : ''}${extra}"></span>`;
const circles = (n: number, filled = 0) => Array.from({ length: n }, (_, i) => circle(i < filled)).join('');
const field = (value: string, label: string, cls = '') =>
  `<div class="field ${cls}"><div class="v d">${e(value) || '&nbsp;'}</div><div class="lbl">${e(label)}</div></div>`;
const stat = (value: string, label: string) => `<div class="box stat"><div class="sv d">${e(value) || '&nbsp;'}</div><div class="lbl">${e(label)}</div></div>`;
const box = (title: string, body: string, cls = '') => `<section class="box ${cls}"><h3>${e(title)}</h3>${body}</section>`;
const lines = (n: number) => Array.from({ length: n }, () => '<div class="ln"></div>').join('');

/** Заклинания для листа: заговоры, подготовленные и от черт «Посвящённый в магию»; по кругу и названию. */
export function sheetSpells(c: Character, content: Content): SheetSpell[] {
  const out = new Map<string, SheetSpell>();
  const add = (id: string, note?: string) => {
    const spell = byId.spells.get(id);
    if (spell && !out.has(id)) out.set(id, { spell, note });
  };
  c.cantrips.forEach((id) => add(id));
  c.preparedSpells.forEach((id) => add(id));
  for (const { slot } of magicInitiateSlots(c, content)) {
    for (const id of [...(c.choices[CHOICE_KEYS.featCantrips(slot)] ?? []), ...(c.choices[CHOICE_KEYS.featSpell(slot)] ?? [])]) {
      add(id, 'черта');
    }
  }
  return [...out.values()].sort(
    (a, b) => a.spell.level - b.spell.level || tr(a.spell.name).text.localeCompare(tr(b.spell.name).text, 'ru'),
  );
}

function featureLabel(f: SourcedId): string {
  if (f.source === 'species') return nameOf('traits', f.id);
  if (f.source === 'feat') return nameOf('feats', f.id);
  return nameOf('features', f.id);
}

/** Уникальные умения без строк-заглушек «Подкласс» из таблицы класса. */
function featureGroups(sheet: CharacterSheet) {
  const seen = new Set<string>();
  const list = sheet.features.filter((f) => {
    const key = `${f.source}:${f.id}`;
    if (seen.has(key) || f.id.endsWith('-subclass')) return false;
    seen.add(key);
    return true;
  });
  const withLevel = (f: SourcedId) => {
    const lvl = byId.features.get(f.id)?.level;
    return `${e(featureLabel(f))}${lvl ? ` <span class="muted">${lvl}</span>` : ''}`;
  };
  return {
    cls: list.filter((f) => f.source === 'class').map(withLevel),
    sub: list.filter((f) => f.source === 'subclass').map(withLevel),
    species: list.filter((f) => f.source === 'species').map((f) => e(featureLabel(f))),
    feats: list.filter((f) => f.source === 'feat').map((f) => e(featureLabel(f))),
  };
}

function proficiencyGroups(sheet: CharacterSheet, c: Character) {
  const of = (...types: string[]) =>
    sheet.proficiencies
      .filter((id) => types.includes(byId.proficiencies.get(id)?.type ?? ''))
      .map(proficiencyName)
      .join(', ');
  return [
    { label: 'Доспехи', text: of('armor') },
    { label: 'Оружие', text: of('weapon') },
    { label: 'Инструменты', text: of('tool', 'artisanTool', 'instrument', 'other') },
    { label: 'Языки', text: c.languages.map((l) => nameOf('languages', l)).join(', ') },
  ];
}

// ---------------------------------------------------------------------------

function page1(c: Character, content: Content, sheet: CharacterSheet): string {
  const cls = c.classes.map((x) => `${nameOf('classes', x.classId)} ${x.level}`).join(' / ');
  const sub = c.classes.map((x) => (x.subclassId ? tr(byId.subclasses.get(x.subclassId)?.name).text : '')).filter(Boolean).join(', ');
  const species = [nameOf('species', c.speciesId), c.subspeciesId ? nameOf('subspecies', c.subspeciesId) : ''].filter(Boolean).join(': ');
  const alignment = c.alignment ? tr(content.alignments.find((a) => a.id === c.alignment)?.name).text : '';
  const size = c.size ?? byId.species.get(c.speciesId)?.sizes[0] ?? '';
  const sizeRu: Record<string, string> = { Small: 'Маленький', Medium: 'Средний' };

  const header = `
    <header class="hdr">
      <div class="namebox">${field(c.name, 'Имя персонажа', 'name')}</div>
      <div class="fields">
        ${field(cls, 'Класс и уровень')}${field(sub, 'Подкласс')}${field(nameOf('backgrounds', c.backgroundId), 'Предыстория')}
        ${field(species, 'Вид')}${field(alignment, 'Мировоззрение')}${field(c.player ?? '', 'Игрок')}
      </div>
    </header>`;

  // --- Левая колонка: характеристики со спасбросками и навыками ---
  const groups = new Map(groupSkillsByAbility(sheet.skills).map((g) => [g.ability, g.skills]));
  const abilityBox = (id: AbilityId) => {
    const a = sheet.abilities[id];
    const skills = (groups.get(id) ?? [])
      .map(
        (s) =>
          `<div class="row">${circle(s.proficient)}${circle(s.expertise, ' x')}<span class="num d">${formatModifier(s.bonus)}</span><span>${e(nameOf('skills', s.id))}</span></div>`,
      )
      .join('');
    return `
      <section class="box ab">
        <div class="abh">
          <div class="abname">${e(abilityName(id))} <span class="muted">${e(abilityAbbr(id))}</span></div>
          <div class="abmod d">${formatModifier(a.mod)}</div>
          <div class="absc d">${a.score}</div>
        </div>
        <div class="row save">${circle(a.saveProficient)}<span class="num d">${formatModifier(a.save)}</span><span>Спасбросок</span></div>
        ${skills}
      </section>`;
  };
  const left = `
    <div class="col left">
      ${ABILITY_IDS.map(abilityBox).join('')}
      <div class="legend">${circle(true)} владение &nbsp; ${circle(true, ' x')} компетентность</div>
      <div class="pair">
        ${stat(c.state.heroicInspiration ? '★' : '', 'Героическое вдохновение')}
        ${stat(String(sheet.passivePerception), 'Пассивное восприятие')}
      </div>
    </div>`;

  // --- Правая колонка ---
  const stats = `
    <div class="stats">
      ${stat(String(sheet.armorClass), 'Класс защиты')}${stat(formatModifier(sheet.initiative), 'Инициатива')}
      ${stat(`${sheet.speed} фт`, 'Скорость')}${stat(sizeRu[size] ?? size, 'Размер')}${stat(formatModifier(sheet.profBonus), 'Бонус мастерства')}
    </div>`;

  const hitDice = sheet.hitDice.map((h) => `${h.total}к${h.die}`).join(' + ');
  const hp = `
    <div class="hp">
      ${box(
        'Хиты',
        `<div class="hpgrid">
          <div class="hpcell"><div class="big d">${sheet.maxHp}</div><div class="lbl">Максимум</div></div>
          <div class="hpcell blank"><div class="big">&nbsp;</div><div class="lbl">Текущие</div></div>
          <div class="hpcell blank"><div class="big">&nbsp;</div><div class="lbl">Временные</div></div>
        </div>`,
        'grow',
      )}
      ${box(
        'Кости хитов',
        `<div class="big d">${e(hitDice)}</div><div class="lbl">Всего</div><div class="ln short"></div><div class="lbl">Потрачено</div>`,
        'hd',
      )}
      ${box(
        'Спасброски от смерти',
        `<div class="row">Успехи&nbsp;${circles(3)}</div><div class="row">Провалы&nbsp;${circles(3)}</div>`,
        'ds',
      )}
    </div>`;

  const masteryOf = (itemId: string) => {
    if (!c.weaponMasteries.includes(itemId)) return '';
    const m = byId.equipment.get(itemId)?.weapon?.mastery;
    return m ? tr(content.weaponMasteries.find((w) => w.id === m)?.name).text : '';
  };
  const attackRows = sheet.attacks.map((a) => {
    const type = a.damageType ? tr(content.damageTypes.find((d) => d.id === a.damageType)?.name).text : '';
    const mastery = masteryOf(a.itemId);
    return `<tr><td class="d">${e(nameOf('equipment', a.itemId))}</td><td class="d c">${formatModifier(a.toHit)}</td><td class="d">${e(
      `${formatDamage(a.damageDice, a.damageBonus)} ${type}`.trim(),
    )}</td><td class="d">${mastery ? `Приём: ${e(mastery)}` : ''}</td></tr>`;
  });
  while (attackRows.length < 4) attackRows.push('<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>');
  const attacks = box(
    'Оружие и атаки',
    `<table class="tbl"><thead><tr><th>Название</th><th class="c">Бонус</th><th>Урон и вид</th><th>Заметки</th></tr></thead><tbody>${attackRows.join('')}</tbody></table>`,
  );

  const resources = characterResources(c, content, sheet);
  const resourceBox = resources.length
    ? box(
        'Ресурсы',
        `<div class="cols2">${resources
          .map((r) => {
            const marks = r.max <= 10 ? circles(r.max) : `<span class="pool">___ / <span class="d">${r.max}</span></span>`;
            const recovery = r.recovery === 'long' ? 'Д' : r.recovery === 'short' ? 'К' : 'К1';
            return `<div class="res"><span>${e(tr(r.name).text)}${r.die ? ` <span class="d">к${r.die}</span>` : ''} <span class="muted">${recovery}</span></span><span class="marks">${marks}</span></div>`;
          })
          .join('')}</div><div class="hint">Д — восстанавливается долгим отдыхом, К — коротким, К1 — по одному за короткий.</div>`,
      )
    : '';

  const fg = featureGroups(sheet);
  const featureList = (items: string[], cols = 2) =>
    items.length ? `<ul class="flist d" style="column-count:${cols}">${items.map((x) => `<li>${x}</li>`).join('')}</ul>` : lines(2);
  const classItems = [...fg.cls, ...fg.sub.map((x) => `${x} <span class="muted">подкл.</span>`)];
  const features = `
    ${box('Умения класса', featureList(classItems, classItems.length > 24 ? 3 : 2), 'grow')}
    <div class="pair">
      ${box('Особенности вида', featureList(fg.species, 1))}
      ${box('Черты', featureList(fg.feats, 1))}
    </div>`;

  const profs = box(
    'Владения и языки',
    proficiencyGroups(sheet, c)
      .map((p) => `<div class="prof"><span class="lbl">${e(p.label)}</span> <span class="d">${e(p.text) || '—'}</span></div>`)
      .join(''),
  );

  return `
    <div class="page">
      ${header}
      <div class="body">
        ${left}
        <div class="col right">${stats}${hp}${attacks}${resourceBox}${features}${profs}</div>
      </div>
    </div>`;
}

function page2(c: Character, content: Content, sheet: CharacterSheet): string {
  const sc = sheet.spellcasting;
  const slots = sc?.slots ?? [];
  const pact = sc?.classId === 'warlock';

  const castRow = `
    <div class="stats">
      ${stat(sc ? nameOf('classes', sc.classId) : '', 'Класс заклинателя')}
      ${stat(sc ? abilityAbbr(sc.ability) : '', 'Характеристика')}
      ${stat(sc ? formatModifier(sheet.abilities[sc.ability].mod) : '', 'Модификатор')}
      ${stat(sc ? String(sc.saveDC) : '', 'СЛ спасброска')}
      ${stat(sc ? formatModifier(sc.attackBonus) : '', 'Бонус атаки')}
    </div>`;

  const slotBoxes = SLOT_FORM.map((n, i) => {
    const have = slots[i] ?? 0;
    const marks = Array.from({ length: Math.max(n, have) }, (_, k) => circle(false, k < have ? ' have' : ' off')).join('');
    return `<div class="box slot"><div class="lbl">${i + 1} круг</div><div class="marks">${marks}</div></div>`;
  }).join('');
  const slotsBlock = `<div class="slots">${slotBoxes}</div>${
    pact ? '<div class="hint">Магия договора: ячейки восстанавливаются коротким отдыхом.</div>' : ''
  }`;

  const spells = sheetSpells(c, content);
  const spellRows = spells.map(({ spell: s, note }) => {
    const comps = s.components.map((x) => ({ V: 'В', S: 'С', M: 'М' })[x]).join('');
    return `<tr><td class="d c">${s.level === 0 ? 'заг.' : s.level}</td><td class="d">${e(tr(s.name).text)}${
      note ? ` <span class="muted">${e(note)}</span>` : ''
    }</td><td class="d">${e(tr(s.castingTime).text)}</td><td class="d">${e(tr(s.range).text)}</td><td class="d">${e(
      tr(s.duration).text,
    )}</td><td class="d c">${comps}</td><td class="c">${s.concentration ? circle(true) : circle()}</td><td class="c">${
      s.ritual ? circle(true) : circle()
    }</td></tr>`;
  });
  // Пустые строки — для карандаша; при длинном списке строки ниже и мельче, чтобы всё влезло.
  const dense = spellRows.length > 28;
  while (spellRows.length < 28) spellRows.push('<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td class="c">' + circle() + '</td><td class="c">' + circle() + '</td></tr>');
  const spellTable = box(
    'Заговоры и подготовленные заклинания',
    `<table class="tbl sp${dense ? ' dense' : ''}"><thead><tr><th class="c">Круг</th><th>Название</th><th>Время</th><th>Дистанция</th><th>Длительность</th><th class="c">Комп.</th><th class="c">К</th><th class="c">Р</th></tr></thead><tbody>${spellRows.join(
      '',
    )}</tbody></table><div class="hint">заг. — заговор, К — концентрация, Р — ритуал; компоненты: В — вербальный, С — соматический, М — материальный.</div>`,
    'grow spells',
  );

  const items = c.equipment.map(
    (i) =>
      `<div class="item">${circle(!!i.equipped)}<span class="d">${e(itemName(i))}${i.quantity > 1 ? ` ×${i.quantity}` : ''}</span></div>`,
  );
  while (items.length < 14) items.push(`<div class="item">${circle()}<span class="ln inline"></span></div>`);
  const equipment = box('Снаряжение', `<div class="items">${items.join('')}</div><div class="hint">${circle(true)} — надето или в руках</div>`, 'grow');

  const attune = box('Настройка', Array.from({ length: 3 }, () => `<div class="item">${circle()}<span class="ln inline"></span></div>`).join(''));
  const coins = box(
    'Монеты',
    `<div class="coins">${COINS.map((x) => `<div class="coin"><div class="sv d">${c.coins[x.id] ?? ''}&nbsp;</div><div class="lbl">${x.label}</div></div>`).join('')}</div>`,
  );

  const notes = c.notes?.trim();
  return `
    <div class="page">
      <header class="hdr2">
        <div class="d n2">${e(c.name)}</div>
        <h2>Заклинания</h2>
      </header>
      ${castRow}
      ${slotsBlock}
      ${spellTable}
      <div class="bottom">
        <div class="col">
          ${box('Внешность', lines(4))}
          ${box('Характер и предыстория', notes ? `<div class="notes d">${e(notes)}</div>` : lines(6), 'grow')}
        </div>
        <div class="col">${equipment}</div>
        <div class="col">${attune}${coins}${box('Заметки', lines(5), 'grow')}</div>
      </div>
      <footer>Лист создан в «Конструкторе персонажей D&amp;D». Правила — System Reference Document 5.2, CC BY 4.0.</footer>
    </div>`;
}

/** HTML листа персонажа (две страницы A4). `fontCss` — встроенные шрифты (@font-face). */
export function characterSheetHtml(c: Character, content: Content, fontCss = ''): string {
  const sheet = computeSheet(c, content);
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=210mm">
<title>${e(c.name || 'Персонаж')}</title>
<style>${fontCss}\n${SHEET_CSS}</style></head>
<body>${page1(c, content, sheet)}${page2(c, content, sheet)}</body></html>`;
}
