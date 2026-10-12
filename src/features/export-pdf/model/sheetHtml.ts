import { attackName, featureName } from '@/entities/character';

// Лист персонажа для печати: HTML двух страниц A4. Без React — только данные справочника и расчёты из сущности персонажа (src/entities/character).
// Стр. 1 — персонаж (характеристики и навыки, бой, хиты, атаки, ресурсы, умения, владения),
// стр. 2 — заклинания, внешность и характер, снаряжение, настройка, монеты.
// Бланк чёрный с бордовым акцентом, данные тёмно-синие. Текущие и временные хиты пустые — для карандаша.

import type { Character, CharacterSheet, SourcedId } from '@/entities/character';
import {
  ABILITY_IDS,
  characterResources,
  CHOICE_KEYS,
  chosenClassOptions,
  classOptionSpells,
  computeSheet,
  knownLanguages,
  magicInitiateSlots,
  proficiencyGroups,
  speciesSpellcasting,
} from '@/entities/character';
import type { AbilityId, Content } from '@/shared/content';
import {
  abilityAbbr,
  abilityName,
  byId,
  coinAbbr,
  COIN_ORDER,
  groupSkillsByAbility,
  itemName,
  nameOf,
  proficiencyName,
  sizeName,
  tr,
} from '@/shared/content';
import { currentLanguage, t } from '@/shared/i18n/model';
import { formatDamage, formatDice, formatDie, formatFeet, formatModifier } from '@/shared/lib/dice';

import { SLOT_FORM } from '../config/constants';
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
      add(id, t('pdf.feat'));
    }
  }
  const species = speciesSpellcasting(c, content);
  const speciesNote = [t('pdf.species'), species?.ability ? abilityAbbr(species.ability) : ''].filter(Boolean).join(', ');
  species?.spells.forEach((s) => add(s.spellId, speciesNote));
  classOptionSpells(c, content).forEach((s) => add(s.spellId, tr(byId.classOptions.get(s.optionId)?.name).text));
  return [...out.values()].sort(
    (a, b) => a.spell.level - b.spell.level || tr(a.spell.name).text.localeCompare(tr(b.spell.name).text, currentLanguage()),
  );
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
    return `${e(featureName(f))}${lvl ? ` <span class="muted">${lvl}</span>` : ''}`;
  };
  return {
    cls: list.filter((f) => f.source === 'class').map(withLevel),
    sub: list.filter((f) => f.source === 'subclass').map(withLevel),
    species: list.filter((f) => f.source === 'species').map((f) => e(featureName(f))),
    feats: list.filter((f) => f.source === 'feat').map((f) => e(featureName(f))),
  };
}

function proficiencyRows(sheet: CharacterSheet, c: Character, content: Content) {
  const g = proficiencyGroups(sheet);
  return [
    { label: t('pdf.armor'), text: g.armor.join(', ') },
    { label: t('pdf.weapons'), text: g.weapons.join(', ') },
    { label: t('pdf.tools'), text: g.tools.join(', ') },
    { label: t('pdf.languages'), text: knownLanguages(c, content).map((l) => nameOf('languages', l)).join(', ') },
  ];
}

// ---------------------------------------------------------------------------

function page1(c: Character, content: Content, sheet: CharacterSheet): string {
  const cls = c.classes.map((x) => `${nameOf('classes', x.classId)} ${x.level}`).join(' / ');
  const sub = c.classes.map((x) => (x.subclassId ? tr(byId.subclasses.get(x.subclassId)?.name).text : '')).filter(Boolean).join(', ');
  const species = [nameOf('species', c.speciesId), c.subspeciesId ? nameOf('subspecies', c.subspeciesId) : ''].filter(Boolean).join(': ');
  const alignment = c.alignment ? tr(byId.alignments.get(c.alignment)?.name).text : '';
  const size = c.size ?? byId.species.get(c.speciesId)?.sizes[0] ?? '';

  const header = `
    <header class="hdr">
      <div class="namebox">${field(c.name, t('pdf.name'), 'name')}</div>
      <div class="fields">
        ${field(cls, t('pdf.classLevel'))}${field(sub, t('pdf.subclass'))}${field(nameOf('backgrounds', c.backgroundId), t('pdf.background'))}
        ${field(species, t('pdf.species'))}${field(alignment, t('pdf.alignment'))}${field(c.player ?? '', t('pdf.player'))}
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
        <div class="row save">${circle(a.saveProficient)}<span class="num d">${formatModifier(a.save)}</span><span>${e(t('pdf.save'))}</span></div>
        ${skills}
      </section>`;
  };
  const left = `
    <div class="col left">
      ${ABILITY_IDS.map(abilityBox).join('')}
      <div class="legend">${circle(true)} ${e(t('pdf.proficiency'))} &nbsp; ${circle(true, ' x')} ${e(t('pdf.expertise'))}</div>
      <div class="pair">
        ${stat(c.state.heroicInspiration ? '★' : '', t('pdf.inspiration'))}
        ${stat(String(sheet.passivePerception), t('pdf.passivePerception'))}
      </div>
    </div>`;

  // --- Правая колонка ---
  const stats = `
    <div class="stats">
      ${stat(String(sheet.armorClass), t('pdf.ac'))}${stat(formatModifier(sheet.initiative), t('pdf.initiative'))}
      ${stat(formatFeet(sheet.speed), t('pdf.speed'))}${stat(sizeName(size), t('pdf.size'))}${stat(formatModifier(sheet.profBonus), t('pdf.profBonus'))}
    </div>`;

  const hitDice = sheet.hitDice.map((h) => formatDice({ count: h.total, sides: h.die })).join(' + ');
  const hp = `
    <div class="hp">
      ${box(
        t('pdf.hp'),
        `<div class="hpgrid">
          <div class="hpcell"><div class="big d">${sheet.maxHp}</div><div class="lbl">${e(t('pdf.max'))}</div></div>
          <div class="hpcell blank"><div class="big">&nbsp;</div><div class="lbl">${e(t('pdf.current'))}</div></div>
          <div class="hpcell blank"><div class="big">&nbsp;</div><div class="lbl">${e(t('pdf.temp'))}</div></div>
        </div>`,
        'grow',
      )}
      ${box(
        t('pdf.hitDice'),
        `<div class="big d">${e(hitDice)}</div><div class="lbl">${e(t('pdf.total'))}</div><div class="ln short"></div><div class="lbl">${e(t('pdf.spent'))}</div>`,
        'hd',
      )}
      ${box(
        t('pdf.deathSaves'),
        `<div class="row">${e(t('pdf.successes'))}&nbsp;${circles(3)}</div><div class="row">${e(t('pdf.failures'))}&nbsp;${circles(3)}</div>`,
        'ds',
      )}
    </div>`;

  const masteryOf = (itemId: string) => {
    if (!c.weaponMasteries.includes(itemId)) return '';
    const m = byId.equipment.get(itemId)?.weapon?.mastery;
    return m ? tr(byId.weaponMasteries.get(m)?.name).text : '';
  };
  const attackRows = sheet.attacks.map((a) => {
    const type = a.damageType ? tr(byId.damageTypes.get(a.damageType)?.name).text : '';
    const mastery = masteryOf(a.itemId);
    return `<tr><td class="d">${e(attackName(a))}</td><td class="d c">${formatModifier(a.toHit)}</td><td class="d">${e(
      `${formatDamage(a.damageDice, a.damageBonus)} ${type}`.trim(),
    )}</td><td class="d">${mastery ? e(t('pdf.mastery', { name: mastery })) : ''}</td></tr>`;
  });
  while (attackRows.length < 4) attackRows.push('<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>');
  const attacks = box(
    t('pdf.attacks'),
    `<table class="tbl"><thead><tr><th>${e(t('pdf.attackName'))}</th><th class="c">${e(t('pdf.attackBonus'))}</th><th>${e(t('pdf.damage'))}</th><th>${e(t('pdf.notes'))}</th></tr></thead><tbody>${attackRows.join('')}</tbody></table>`,
  );

  const resources = characterResources(c, content, sheet);
  const resourceBox = resources.length
    ? box(
        t('pdf.resources'),
        `<div class="cols2">${resources
          .map((r) => {
            const marks = r.max <= 10 ? circles(r.max) : `<span class="pool">___ / <span class="d">${r.max}</span></span>`;
            const recovery = t(r.recovery === 'long' ? 'pdf.recLong' : r.recovery === 'short' ? 'pdf.recShort' : 'pdf.recShortOne');
            return `<div class="res"><span>${e(tr(r.name).text)}${r.die ? ` <span class="d">${formatDie(r.die)}</span>` : ''} <span class="muted">${recovery}</span></span><span class="marks">${marks}</span></div>`;
          })
          .join('')}</div><div class="hint">${e(t('pdf.recHint'))}</div>`,
      )
    : '';

  const fg = featureGroups(sheet);
  const featureList = (items: string[], cols = 2) =>
    items.length ? `<ul class="flist d" style="column-count:${cols}">${items.map((x) => `<li>${x}</li>`).join('')}</ul>` : lines(2);
  // Воззвания и метамагия — в том же списке, что и умения класса.
  const optionItems = (['invocation', 'metamagic'] as const)
    .flatMap((kind) => chosenClassOptions(c, kind))
    .map((id) => e(tr(byId.classOptions.get(id)?.name).text || id));
  const classItems = [...fg.cls, ...fg.sub.map((x) => `${x} <span class="muted">${e(t('pdf.subclassMark'))}</span>`), ...optionItems];
  const features = `
    ${box(t('pdf.classFeatures'), featureList(classItems, classItems.length > 24 ? 3 : 2), 'grow')}
    <div class="pair">
      ${box(t('pdf.speciesTraits'), featureList(fg.species, 1))}
      ${box(t('pdf.feats'), featureList(fg.feats, 1))}
    </div>`;

  const profs = box(
    t('pdf.proficiencies'),
    proficiencyRows(sheet, c, content)
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
      ${stat(sc ? nameOf('classes', sc.classId) : '', t('pdf.casterClass'))}
      ${stat(sc ? abilityAbbr(sc.ability) : '', t('pdf.ability'))}
      ${stat(sc ? formatModifier(sheet.abilities[sc.ability].mod) : '', t('pdf.modifier'))}
      ${stat(sc ? String(sc.saveDC) : '', t('pdf.saveDC'))}
      ${stat(sc ? formatModifier(sc.attackBonus) : '', t('pdf.spellAttack'))}
    </div>`;

  const slotBoxes = SLOT_FORM.map((n, i) => {
    const have = slots[i] ?? 0;
    const marks = Array.from({ length: Math.max(n, have) }, (_, k) => circle(false, k < have ? ' have' : ' off')).join('');
    return `<div class="box slot"><div class="lbl">${e(t('spell.circle', { level: i + 1 }))}</div><div class="marks">${marks}</div></div>`;
  }).join('');
  const slotsBlock = `<div class="slots">${slotBoxes}</div>${
    pact ? `<div class="hint">${e(t('pdf.pactHint'))}</div>` : ''
  }`;

  const spells = sheetSpells(c, content);
  const spellRows = spells.map(({ spell: s, note }) => {
    const comps = s.components.map((x) => t(x === 'V' ? 'pdf.compV' : x === 'S' ? 'pdf.compS' : 'pdf.compM')).join('');
    return `<tr><td class="d c">${s.level === 0 ? e(t('pdf.cantripShort')) : s.level}</td><td class="d">${e(tr(s.name).text)}${
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
    t('pdf.spellTable'),
    `<table class="tbl sp${dense ? ' dense' : ''}"><thead><tr><th class="c">${e(t('pdf.level'))}</th><th>${e(t('pdf.attackName'))}</th><th>${e(t('pdf.time'))}</th><th>${e(t('pdf.range'))}</th><th>${e(t('pdf.duration'))}</th><th class="c">${e(t('pdf.components'))}</th><th class="c">${e(t('pdf.concentrationShort'))}</th><th class="c">${e(t('pdf.ritualShort'))}</th></tr></thead><tbody>${spellRows.join(
      '',
    )}</tbody></table><div class="hint">${e(t('pdf.spellHint'))}</div>`,
    'grow spells',
  );

  const items = c.equipment.map(
    (i) =>
      `<div class="item">${circle(!!i.equipped)}<span class="d">${e(itemName(i))}${i.quantity > 1 ? ` ×${i.quantity}` : ''}</span></div>`,
  );
  while (items.length < 14) items.push(`<div class="item">${circle()}<span class="ln inline"></span></div>`);
  const equipment = box(t('pdf.equipment'), `<div class="items">${items.join('')}</div><div class="hint">${circle(true)} ${e(t('pdf.equippedHint'))}</div>`, 'grow');

  const attune = box(t('pdf.attunement'), Array.from({ length: 3 }, () => `<div class="item">${circle()}<span class="ln inline"></span></div>`).join(''));
  const coins = box(
    t('pdf.coins'),
    `<div class="coins">${COIN_ORDER.map((id) => `<div class="coin"><div class="sv d">${c.coins[id] ?? ''}&nbsp;</div><div class="lbl">${coinAbbr(id).toUpperCase()}</div></div>`).join('')}</div>`,
  );

  const notes = c.notes?.trim();
  return `
    <div class="page">
      <header class="hdr2">
        <div class="d n2">${e(c.name)}</div>
        <h2>${e(t('pdf.spells'))}</h2>
      </header>
      ${castRow}
      ${slotsBlock}
      ${spellTable}
      <div class="bottom">
        <div class="col">
          ${box(t('pdf.appearance'), lines(4))}
          ${box(t('pdf.personality'), notes ? `<div class="notes d">${e(notes)}</div>` : lines(6), 'grow')}
        </div>
        <div class="col">${equipment}</div>
        <div class="col">${attune}${coins}${box(t('pdf.notes'), lines(5), 'grow')}</div>
      </div>
      <footer>${e(t('pdf.footer'))}</footer>
    </div>`;
}

/** HTML листа персонажа (две страницы A4). `fontCss` — встроенные шрифты (@font-face). */
export function characterSheetHtml(c: Character, content: Content, fontCss = ''): string {
  const sheet = computeSheet(c, content);
  return `<!doctype html>
<html lang="${currentLanguage()}"><head><meta charset="utf-8"><meta name="viewport" content="width=210mm">
<title>${e(c.name || t('pdf.untitled'))}</title>
<style>${fontCss}\n${SHEET_CSS}</style></head>
<body>${page1(c, content, sheet)}${page2(c, content, sheet)}</body></html>`;
}
