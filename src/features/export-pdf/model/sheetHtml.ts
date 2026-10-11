// Лист персонажа для печати: HTML двух страниц A4. Без React — только данные справочника и расчёты из src/rules.
// Стр. 1 — персонаж (характеристики и навыки, бой, хиты, атаки, ресурсы, умения, владения),
// стр. 2 — заклинания, внешность и характер, снаряжение, настройка, монеты.
// Бланк чёрный с бордовым акцентом, данные тёмно-синие. Текущие и временные хиты пустые — для карандаша.

import {
  abilityAbbr,
  abilityName,
  groupSkillsByAbility,
  itemName,
  nameOf,
  proficiencyName,
} from '@/shared/content/names';
import { byId, tr } from '@/shared/content/content';
import type { AbilityId, Coin, Content, Spell } from '@/shared/content/types';
import { ABILITY_IDS, type Character } from '@/entities/character/model/character';
import { CHOICE_KEYS } from '@/entities/character/model/choices';
import { magicInitiateSlots } from '@/entities/character/model/build';
import { formatDamage, formatModifier } from '@/shared/lib/dice/dice';
import { characterResources } from '@/entities/character/model/resources';
import { computeSheet, type CharacterSheet, type SourcedId } from '@/entities/character/model/sheet';

/** Сколько кружков ячеек рисует бланк на каждом круге (максимум по правилам). */
export const SLOT_FORM = [4, 3, 3, 3, 3, 2, 2, 1, 1];

const COINS: { id: Coin; label: string }[] = [
  { id: 'cp', label: 'ММ' },
  { id: 'sp', label: 'СМ' },
  { id: 'ep', label: 'ЭМ' },
  { id: 'gp', label: 'ЗМ' },
  { id: 'pp', label: 'ПМ' },
];

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

type SheetSpell = { spell: Spell; note?: string };

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

const CSS = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 210mm; background: #fff; }
body { font-family: 'SheetText', 'Helvetica Neue', Arial, sans-serif; font-size: 7.6pt; line-height: 1.25; color: #111;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; padding: 8mm 8mm 6mm; display: flex; flex-direction: column; gap: 2mm;
  overflow: hidden; page-break-after: always; break-after: page; }
.page:last-child { page-break-after: auto; break-after: auto; }
h2, h3, .abname, .lbl, .namebox .v { font-family: 'SheetHead', 'SheetHeadCyr', Georgia, serif; }
.d { color: #1B2A4A; }
.muted { color: #888; font-size: 6.5pt; }
.box { border: 0.3mm solid #111; border-radius: 1.6mm; padding: 1.2mm 1.8mm; }
.box h3 { color: #7B2D26; font-size: 8.6pt; font-weight: 700; letter-spacing: 0.02em; border-bottom: 0.25mm solid #7B2D26;
  margin-bottom: 1mm; padding-bottom: 0.3mm; }
.lbl { color: #7B2D26; font-size: 6.4pt; letter-spacing: 0.03em; }
.hint { color: #666; font-size: 6pt; margin-top: 0.8mm; }
.c { text-align: center; }
.ln { border-bottom: 0.2mm solid #999; height: 4.6mm; }
.ln.short { width: 60%; height: 4mm; }
.ln.inline { flex: 1; height: 3.6mm; }
span.o { display: inline-block; width: 2.6mm; height: 2.6mm; border: 0.25mm solid #111; border-radius: 50%; vertical-align: -0.4mm; flex: none; }
span.o.on { background: #1B2A4A; border-color: #1B2A4A; }
span.o.x { border-radius: 0.5mm; transform: rotate(45deg) scale(0.85); }
span.o.have { border-color: #1B2A4A; border-width: 0.35mm; }
span.o.off { border-style: dotted; border-color: #bbb; }

.hdr { display: flex; gap: 3mm; align-items: flex-end; border-bottom: 0.5mm solid #7B2D26; padding-bottom: 1.5mm; }
.namebox { width: 62mm; }
.namebox .field .v { font-size: 15pt; font-weight: 700; min-height: 7mm; }
.fields { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1mm 3mm; }
.field .v { border-bottom: 0.25mm solid #111; min-height: 4.4mm; font-size: 8.4pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.body { flex: 1; display: flex; gap: 2.5mm; min-height: 0; }
.col { display: flex; flex-direction: column; gap: 1.6mm; min-height: 0; }
.left { width: 62mm; }
.right { flex: 1; min-width: 0; }
.grow { flex: 1; min-height: 0; overflow: hidden; }
.pair { display: flex; gap: 1.6mm; }
.pair > * { flex: 1; }

.ab { padding: 1mm 1.6mm 1.2mm; }
.abh { display: flex; align-items: center; gap: 1.5mm; border-bottom: 0.25mm solid #7B2D26; padding-bottom: 0.6mm; margin-bottom: 0.6mm; }
.abname { flex: 1; color: #7B2D26; font-size: 9pt; font-weight: 700; }
.abname .muted { font-family: 'SheetText', sans-serif; font-weight: 400; }
.abmod { font-size: 13pt; font-weight: 600; min-width: 9mm; text-align: center; }
.absc { border: 0.25mm solid #111; border-radius: 3mm; min-width: 8mm; text-align: center; font-size: 8pt; padding: 0 1mm; }
.row { display: flex; align-items: center; gap: 1mm; min-height: 3.8mm; }
.row .num { min-width: 6mm; text-align: right; font-weight: 600; }
.row.save { font-weight: 600; }
.legend { font-size: 6.2pt; color: #666; }

.stats { display: flex; gap: 1.6mm; }
.stat { flex: 1; text-align: center; padding: 1mm 0.8mm; }
.stat .sv { font-size: 12pt; font-weight: 600; min-height: 5.4mm; white-space: nowrap; overflow: hidden; }
.pair .stat .sv { font-size: 11pt; }

.hp { display: flex; gap: 1.6mm; }
.hpgrid { display: flex; gap: 1.6mm; }
.hpcell { flex: 1; text-align: center; }
.hpcell.blank .big { border-bottom: 0.25mm solid #999; }
.big { font-size: 15pt; font-weight: 600; min-height: 7mm; }
.hd { width: 30mm; }
.ds { width: 30mm; }
.ds .row { justify-content: space-between; min-height: 5mm; }

.tbl { width: 100%; border-collapse: collapse; }
.tbl th { color: #7B2D26; font-weight: 400; font-size: 6.4pt; text-align: left; border-bottom: 0.25mm solid #7B2D26; padding: 0.3mm 0.8mm; }
.tbl td { border-bottom: 0.2mm solid #bbb; padding: 0.5mm 0.8mm; height: 4.4mm; }
.tbl th.c, .tbl td.c { text-align: center; }
.sp td { height: 4.2mm; font-size: 7.2pt; }
.sp.dense td { height: 3.5mm; padding: 0.2mm 0.8mm; font-size: 6.6pt; }

.cols2 { column-count: 2; column-gap: 4mm; }
.res { display: flex; justify-content: space-between; align-items: center; gap: 1mm; break-inside: avoid; min-height: 3.8mm; }
.res .marks { display: flex; gap: 0.6mm; flex-wrap: wrap; justify-content: flex-end; }
.pool { white-space: nowrap; }
.flist { list-style: none; column-gap: 4mm; }
.flist li { break-inside: avoid; padding: 0.15mm 0; }
.prof { margin-bottom: 0.5mm; }

.hdr2 { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 0.5mm solid #7B2D26; padding-bottom: 1mm; }
.hdr2 h2 { color: #7B2D26; font-size: 14pt; }
.n2 { font-size: 11pt; font-weight: 600; }
.slots { display: grid; grid-template-columns: repeat(9, 1fr); gap: 1.2mm; }
.slot { text-align: center; padding: 0.8mm; }
.slot .marks { display: flex; justify-content: center; gap: 0.8mm; margin-top: 0.6mm; min-height: 3mm; }
.spells { flex: 1 1 auto; }
.bottom { display: flex; gap: 1.6mm; height: 92mm; }
.bottom > .col { flex: 1; }
.items .item, .box .item { display: flex; align-items: center; gap: 1.2mm; min-height: 4.4mm; border-bottom: 0.2mm solid #ddd; }
.coins { display: flex; gap: 1.2mm; }
.coin { flex: 1; text-align: center; border: 0.25mm solid #111; border-radius: 1.2mm; padding: 0.6mm 0; }
.coin .sv { font-size: 9pt; font-weight: 600; }
.notes { white-space: pre-wrap; }
footer { color: #888; font-size: 6pt; text-align: center; }
`;

/** HTML листа персонажа (две страницы A4). `fontCss` — встроенные шрифты (@font-face). */
export function characterSheetHtml(c: Character, content: Content, fontCss = ''): string {
  const sheet = computeSheet(c, content);
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=210mm">
<title>${e(c.name || 'Персонаж')}</title>
<style>${fontCss}\n${CSS}</style></head>
<body>${page1(c, content, sheet)}${page2(c, content, sheet)}</body></html>`;
}
