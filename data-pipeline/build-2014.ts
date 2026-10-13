// Собирает справочник редакции 2014 (SRD 5.1) assets/content/content-2014.json из data-pipeline/raw-2014/*.json
// и перевода data-pipeline/translations-2014/*.csv.
// Запуск: npm run data:build:2014 (сырые данные — npm run data:fetch:2014)
//
// Структура та же, что у справочника 2024 (src/shared/content/types.ts); поля, которые есть только в 2014
// (прибавки расы, «известные» заклинания, умение предыстории), помечены там «2014».
// Перевод: если у ключа тот же английский текст, что в 2024, перевод берётся из data-pipeline/translations;
// названия, совпадающие по-английски, — черновиком.

import type {
  AbilityId,
  Choice,
  Background,
  ChoiceOption,
  ClassResource,
  Content,
  Feature,
  ProficiencyType,
  Species,
  Spell,
  Subspecies,
  Trait,
} from '../src/shared/content/types.ts';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  cleanText,
  convChoice,
  finish,
  ids,
  joinText,
  PROFICIENCY_TYPES,
  proficiencyId,
  raw,
  ROOT,
  seeded,
  setResourceList,
  slug,
  tx,
  useEdition,
  warn,
  type Raw,
} from './common.ts';

useEdition('2014');

/** Тексты и механика SRD 5.1, которых нет в API (ресурсы умений). */
const SRD_DIR = join(ROOT, 'srd-2014');

const SCHEMA_VERSION = 3;

/** Заклинатели 2014, у которых заклинания «известны» (число по таблице). Остальные готовят их каждый день. */
const KNOWN_CASTERS = new Set(['bard', 'ranger', 'sorcerer', 'warlock']);

/**
 * Ошибки таблиц классов в данных API, исправленные по SRD 5.1 (PDF SRD_CC_v5.1, таблицы классов):
 * класс → столбец class_specific → {уровень: значение}.
 */
const CLASS_TABLE_FIXES: Record<string, Record<string, Record<number, number>>> = {
  // Таблица колдуна: воззваний 3 с 5-го уровня и 4 с 7-го (в API — с 4-го и 6-го).
  warlock: { invocations_known: { 4: 2, 6: 3 } },
  // Таблица чародея: четвёртый вариант метамагии — с 17-го уровня (в API — с 16-го).
  sorcerer: { metamagic_known: { 16: 3 } },
  // Варвар 20-го уровня: ярость без ограничения (в API — 9999). 0 — счётчик ярости не показывается.
  barbarian: { rage_count: { 20: 0 } },
};

/** Текст из массива абзацев API. */
const paragraphs = (desc: string[] | string | undefined) => (Array.isArray(desc) ? joinText(desc) : (desc ?? ''));

/** Номер уровня из ссылки на уровень класса: cleric-3 → 3. */
const levelFromRef = (index: string) => Number(index.split('-').pop());

function fixTable(classId: string, level: number, specific: Record<string, unknown>): Record<string, unknown> {
  const fixes = CLASS_TABLE_FIXES[classId] ?? {};
  const out = { ...specific };
  for (const [column, byLevel] of Object.entries(fixes)) if (byLevel[level] !== undefined) out[column] = byLevel[level];
  return out;
}

async function build(): Promise<Omit<Content, 'version'>> {
  const abilities = (await raw('ability-scores')).map((a) => ({
    id: a.index as AbilityId,
    abbr: tx(`ability.${a.index}.abbr`, a.name),
    name: tx(`ability.${a.index}.name`, a.full_name),
    description: tx(`ability.${a.index}.description`, paragraphs(a.desc)),
  }));

  const skills = (await raw('skills')).map((s) => ({
    id: s.index,
    ability: s.ability_score.index as AbilityId,
    name: tx(`skill.${s.index}.name`, s.name),
    description: tx(`skill.${s.index}.description`, paragraphs(s.desc)),
  }));

  const alignments = (await raw('alignments')).map((a) => ({
    id: a.index,
    abbr: tx(`alignment.${a.index}.abbr`, a.abbreviation),
    name: tx(`alignment.${a.index}.name`, a.name),
    description: tx(`alignment.${a.index}.description`, paragraphs(a.desc)),
  }));

  const rawLanguages = await raw('languages');
  setResourceList('/api/2014/languages', ids(rawLanguages));
  const languages = rawLanguages.map((l) => ({
    id: l.index,
    name: tx(`language.${l.index}.name`, l.name),
    // В 2014 «экзотические» языки — аналог редких 2024.
    rare: l.type === 'Exotic',
    ...(l.desc ? { note: tx(`language.${l.index}.note`, paragraphs(l.desc)) } : {}),
  }));

  const simple = async (resource: string, prefix: string) =>
    (await raw(resource)).map((x) => ({
      id: x.index,
      name: tx(`${prefix}.${x.index}.name`, x.name),
      description: tx(`${prefix}.${x.index}.description`, paragraphs(x.desc)),
    }));

  const conditions = await simple('conditions', 'condition');
  const damageTypes = await simple('damage-types', 'damageType');
  const magicSchools = await simple('magic-schools', 'magicSchool');
  const weaponProperties = await simple('weapon-properties', 'weaponProperty');

  const proficiencies = (await raw('proficiencies')).map((p) => {
    if (!PROFICIENCY_TYPES[p.type]) warn(`Неизвестный тип владения ${p.type} (${p.index})`);
    const id = proficiencyId(p.index);
    // Воровские инструменты, наборы отравителя и навигатора в SRD 5.1 — «прочие»; в 2024 — инструменты.
    const type: ProficiencyType = p.type === 'Other' && id.startsWith('tool-') ? 'tool' : (PROFICIENCY_TYPES[p.type] ?? 'other');
    return {
      id,
      type,
      name: tx(`proficiency.${id}.name`, p.name),
      ...(p.reference ? { refId: p.reference.index } : {}),
    };
  });

  // --- Классы и умения ---
  const rawLevels = await raw('class-levels');
  const classes = (await raw('classes')).map((c) => {
    const key = `class.${c.index}`;
    const mc = c.multi_classing ?? {};
    const mcPrereq: Choice[] = [
      ...(mc.prerequisites ?? []).map((p: Raw) => ({
        choose: 1,
        options: [{ kind: 'minScore', ability: p.ability_score.index, min: p.minimum_score }],
      })),
      ...(mc.prerequisite_options ? [convChoice(mc.prerequisite_options, `${key}.multiclass.prerequisite`)] : []),
    ];
    // В 2014 у классов нет поля «основная характеристика» — берём требования мультикласса (воин: СИЛ или ЛОВ).
    const primaryAbilityChoice = Boolean(mc.prerequisite_options);
    const primaryAbilities: AbilityId[] = primaryAbilityChoice
      ? mc.prerequisite_options.from.options.map((o: Raw) => o.ability_score.index)
      : (mc.prerequisites ?? []).map((p: Raw) => p.ability_score.index);

    const levels = rawLevels
      .filter((l) => l.class.index === c.index && !l.subclass)
      .sort((a, b) => a.level - b.level)
      .map((l) => {
        const sc = l.spellcasting;
        return {
          level: l.level,
          profBonus: l.prof_bonus,
          features: ids(l.features),
          ...(l.class_specific ? { classSpecific: fixTable(c.index, l.level, l.class_specific) } : {}),
          ...(sc
            ? {
                spellcasting: {
                  cantrips: sc.cantrips_known ?? 0,
                  // Число подготовленных в 2014 считается по формуле (характеристика + уровень), а не по таблице.
                  prepared: 0,
                  ...(sc.spells_known !== undefined ? { known: sc.spells_known } : {}),
                  slots: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => sc[`spell_slots_level_${n}`] ?? 0),
                },
              }
            : {}),
        };
      });
    if (levels.length !== 20) warn(`У класса ${c.index} ${levels.length} уровней вместо 20`);

    // Снаряжение без выбора (книга волшебника, набор исследователя) — отдельным «выбором» из одного набора.
    const fixed: ChoiceOption[] = (c.starting_equipment ?? []).map((e: Raw) => ({ kind: 'item', id: e.equipment.index, count: e.quantity }));
    const startingEquipment: Choice[] = [
      ...(fixed.length ? [{ choose: 1, options: [{ kind: 'all', items: fixed } as ChoiceOption] }] : []),
      ...(c.starting_equipment_options ?? []).map((ch: Raw, i: number) => convChoice(ch, `${key}.equipment.${i}`)),
    ];

    return {
      id: c.index,
      name: tx(`${key}.name`, c.name),
      hitDie: c.hit_die,
      primaryAbilities,
      primaryAbilityChoice,
      savingThrows: ids(c.saving_throws) as AbilityId[],
      proficiencies: ids(c.proficiencies)
        .filter((id) => !id.startsWith('saving-throw-'))
        .map(proficiencyId),
      proficiencyChoices: (c.proficiency_choices ?? []).map((ch: Raw, i: number) => convChoice(ch, `${key}.proficiencyChoice.${i}`)),
      startingEquipment,
      multiclass: {
        prerequisites: mcPrereq,
        proficiencies: ids(mc.proficiencies).map(proficiencyId),
        proficiencyChoices: (mc.proficiency_choices ?? []).map((ch: Raw, i: number) =>
          convChoice(ch, `${key}.multiclass.proficiencyChoice.${i}`),
        ),
      },
      ...(c.spellcasting
        ? {
            spellcasting: {
              ability: c.spellcasting.spellcasting_ability.index,
              fromLevel: c.spellcasting.level,
              preparation: KNOWN_CASTERS.has(c.index) ? 'known' : 'prepared',
            },
          }
        : {}),
      subclasses: ids(c.subclasses),
      levels,
    };
  });

  const classOrder = new Map(classes.map((c, i) => [c.id, i]));
  const rawFeatures = (await raw('features')).sort(
    (a, b) =>
      (classOrder.get(a.class.index) ?? 99) - (classOrder.get(b.class.index) ?? 99) ||
      Number(Boolean(a.subclass)) - Number(Boolean(b.subclass)) ||
      a.level - b.level,
  );
  const features: Feature[] = rawFeatures.map((f) => {
    const fs = f.feature_specific ?? {};
    const key = `feature.${f.index}`;
    let optionChoice: Choice | undefined;
    if (fs.subfeature_options) optionChoice = convChoice(fs.subfeature_options, `${key}.option`);
    // Воззвания: число известных — столбец таблицы колдуна invocations_known; здесь — сколько на 2-м уровне.
    else if (fs.invocations?.length) optionChoice = { choose: 2, options: fs.invocations.map((r: Raw) => ({ kind: 'ref', id: r.index })) };
    return {
      id: f.index,
      classId: f.class.index,
      ...(f.subclass ? { subclassId: f.subclass.index } : {}),
      level: f.level,
      name: tx(`${key}.name`, f.name),
      description: tx(`${key}.description`, paragraphs(f.desc)),
      ...(f.parent ? { parent: f.parent.index } : {}),
      ...(optionChoice ? { optionChoice } : {}),
      ...(fs.expertise_options ? { expertiseChoice: convChoice(fs.expertise_options, `${key}.expertise`) } : {}),
    };
  });

  const subclasses = (await raw('subclasses')).map((s) => {
    const key = `subclass.${s.index}`;
    const own = features.filter((f) => f.subclassId === s.index).sort((a, b) => a.level - b.level);
    const description = paragraphs(s.desc);
    const spells = (s.spells ?? []).map((sp: Raw) => {
      const level = sp.prerequisites.find((p: Raw) => p.type === 'level');
      const feature = sp.prerequisites.find((p: Raw) => p.type === 'feature');
      return { id: sp.spell.index, level: level ? levelFromRef(level.index) : 1, ...(feature ? { feature: feature.index } : {}) };
    });
    return {
      id: s.index,
      classId: s.class.index,
      name: tx(`${key}.name`, s.name),
      // Короткого описания в SRD 5.1 нет: первое предложение полного.
      summary: tx(`${key}.summary`, description.split(/(?<=\.)\s/)[0] ?? ''),
      description: tx(`${key}.description`, description),
      features: own.map((f) => f.id),
      ...(spells.length ? { spells } : {}),
    };
  });

  // --- Расы (виды), подрасы, особенности, предыстории, черты ---
  const bonuses = (list: Raw[] | undefined) =>
    Object.fromEntries((list ?? []).map((b: Raw) => [b.ability_score.index, b.bonus])) as Partial<Record<AbilityId, number>>;

  const species: Species[] = (await raw('races')).map((r) => {
    const opt = r.ability_bonus_options;
    return {
      id: r.index,
      name: tx(`species.${r.index}.name`, r.name),
      creatureType: 'humanoid',
      sizes: [r.size],
      speed: r.speed,
      traits: ids(r.traits),
      subspecies: ids(r.subraces),
      abilityBonuses: bonuses(r.ability_bonuses),
      ...(opt
        ? {
            abilityBonusChoice: {
              choose: opt.choose,
              bonus: opt.from.options[0].bonus,
              options: opt.from.options.map((o: Raw) => o.ability_score.index),
            },
          }
        : {}),
      languages: ids(r.languages),
      ...(r.language_options ? { languageChoice: convChoice(r.language_options, `species.${r.index}.languageChoice`) } : {}),
    };
  });

  const subspecies: Subspecies[] = (await raw('subraces')).map((s) => ({
    id: s.index,
    speciesId: s.race.index,
    name: tx(`subspecies.${s.index}.name`, s.name),
    traits: ids(s.racial_traits).map((id) => ({ id, level: 1 })),
    abilityBonuses: bonuses(s.ability_bonuses),
  }));

  const traits: Trait[] = (await raw('traits')).map((t) => {
    const ts = t.trait_specific ?? {};
    const key = `trait.${t.index}`;
    return {
      id: t.index,
      name: tx(`${key}.name`, t.name),
      description: tx(`${key}.description`, paragraphs(t.desc)),
      species: ids(t.races),
      subspecies: ids(t.subraces),
      ...(t.proficiencies?.length ? { proficiencies: ids(t.proficiencies).map(proficiencyId) } : {}),
      ...(t.proficiency_choices
        ? {
            proficiencyChoices: [t.proficiency_choices]
              .flat()
              .map((ch: Raw, i: number) => convChoice(ch, `${key}.proficiencyChoice.${i}`)),
          }
        : {}),
      ...(t.language_options ? { languageChoice: convChoice(t.language_options, `${key}.languageChoice`) } : {}),
      ...(ts.spell_options ? { spellChoice: convChoice(ts.spell_options, `${key}.spellChoice`) } : {}),
      ...(ts.subtrait_options ? { subtraits: ts.subtrait_options.from.options.map((o: Raw) => o.item.index) } : {}),
      ...(t.parent ? { parent: t.parent.index } : {}),
      ...(ts.damage_type ? { damageType: ts.damage_type.index } : {}),
    };
  });

  const equipmentCategoriesRaw = await raw('equipment-categories');
  const backgrounds: Background[] = (await raw('backgrounds')).map((b) => {
    const key = `background.${b.index}`;
    const fixed: ChoiceOption[] = [
      ...(b.starting_equipment ?? []).map((e: Raw): ChoiceOption => ({ kind: 'item', id: e.equipment.index, count: e.quantity })),
      ...(b.starting_gold ? [{ kind: 'money', amount: b.starting_gold.quantity, unit: b.starting_gold.unit } as ChoiceOption] : []),
    ];
    return {
      id: b.index,
      name: tx(`${key}.name`, b.name),
      // В 2014 прибавки к характеристикам даёт раса, а не предыстория; черты у предыстории нет.
      abilities: [] as AbilityId[],
      proficiencies: ids(b.starting_proficiencies).map(proficiencyId),
      proficiencyChoices: (b.starting_proficiency_options ? [b.starting_proficiency_options] : []).map((ch: Raw, i: number) =>
        convChoice(ch, `${key}.proficiencyChoice.${i}`),
      ),
      equipment: [
        { choose: 1, options: [{ kind: 'all', items: fixed } as ChoiceOption] },
        ...(b.starting_equipment_options ?? []).map((ch: Raw, i: number) => convChoice(ch, `${key}.equipment.${i}`)),
      ],
      ...(b.language_options ? { languageChoice: convChoice(b.language_options, `${key}.languageChoice`) } : {}),
      ...(b.feature
        ? { feature: { name: tx(`${key}.feature.name`, b.feature.name), description: tx(`${key}.feature.description`, paragraphs(b.feature.desc)) } }
        : {}),
    };
  });

  const feats = (await raw('feats')).map((f) => {
    const prereq = (f.prerequisites ?? []) as Raw[];
    return {
      id: f.index,
      name: tx(`feat.${f.index}.name`, f.name),
      type: 'general' as const,
      description: tx(`feat.${f.index}.description`, paragraphs(f.desc)),
      ...(prereq.length
        ? {
            prerequisites: {
              abilityOptions: {
                choose: 1,
                options: prereq.map((p): ChoiceOption => ({ kind: 'minScore', ability: p.ability_score.index, min: p.minimum_score })),
              },
            },
          }
        : {}),
    };
  });

  // --- Механика PHB 2014 (data-pipeline/extra-2014) ---
  const extra = await readExtra(proficiencies, equipmentCategoriesRaw, languages.map((l) => l.id));
  backgrounds.push(...extra.backgrounds);
  species.push(...extra.species);
  for (const sub of extra.subspecies) {
    subspecies.push(sub);
    species.find((s) => s.id === sub.speciesId)?.subspecies.push(sub.id);
  }
  traits.push(...extra.traits);
  for (const [id, patch] of extra.traitPatches) {
    const t = traits.find((x) => x.id === id);
    if (!t) warn(`extra-2014: нет особенности ${id}`);
    else {
      t.species.push(...patch.species);
      t.subspecies.push(...patch.subspecies);
      if (patch.spells) Object.assign(t, { spells: patch.spells, ...(patch.spellLevels ? { spellLevels: patch.spellLevels } : {}) });
    }
  }

  // «Увеличение характеристик» — в SRD 5.1 умение класса (+2 к одной или +1 к двум). Приложение хранит его как черту
  // (FeatChoice с прибавками), как и в 2024; текст — из умения варвара (у всех классов одинаковый).
  const asi = rawFeatures.find((f) => f.index === 'barbarian-ability-score-improvement-1');
  feats.push({
    id: 'ability-score-improvement',
    name: tx('feat.ability-score-improvement.name', 'Ability Score Improvement'),
    type: 'general' as const,
    description: tx('feat.ability-score-improvement.description', paragraphs(asi?.desc)),
  });

  // --- Снаряжение ---
  const ARMOR_CATEGORIES: Record<string, 'light' | 'medium' | 'heavy' | 'shield'> = {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
    Shield: 'shield',
  };
  const equipment = (await raw('equipment')).map((e) => {
    const key = `equipment.${e.index}`;
    const description = joinText(e.desc, e.special);
    const item: Raw = {
      id: e.index,
      name: tx(`${key}.name`, e.name),
      categories: ids(e.equipment_categories),
      cost: { amount: e.cost.quantity, unit: e.cost.unit },
      ...(e.weight !== undefined ? { weight: e.weight } : {}),
      ...(e.quantity ? { quantity: e.quantity } : {}),
      ...(description ? { description: tx(`${key}.description`, description) } : {}),
    };
    if (e.weapon_category) {
      const dmg = (d: Raw) => d && { dice: d.damage_dice, type: d.damage_type.index };
      item.weapon = {
        category: e.weapon_category === 'Martial' ? 'martial' : 'simple',
        range: e.weapon_range === 'Ranged' ? 'ranged' : 'melee',
        ...(e.damage ? { damage: dmg(e.damage) } : {}),
        ...(e.two_handed_damage ? { twoHandedDamage: dmg(e.two_handed_damage) } : {}),
        reach: e.range ?? { normal: 5 },
        ...(e.throw_range ? { throwRange: e.throw_range } : {}),
        properties: ids(e.properties),
      };
    }
    if (e.armor_class) {
      const ac = e.armor_class;
      item.armor = {
        category: ARMOR_CATEGORIES[e.armor_category] ?? 'light',
        base: ac.base,
        dexBonus: Boolean(ac.dex_bonus),
        ...(ac.dex_bonus && ac.max_bonus != null ? { maxDex: ac.max_bonus } : {}),
        strMinimum: e.str_minimum ?? 0,
        stealthDisadvantage: Boolean(e.stealth_disadvantage),
      };
    }
    if (e.tool_category) item.tool = { utilize: [], craft: [] };
    if (e.contents?.length) item.contents = e.contents.map((c: Raw) => ({ id: c.item.index, count: c.quantity }));
    return item;
  });

  const equipmentCategories = equipmentCategoriesRaw.map((c) => ({
    id: c.index,
    name: tx(`equipmentCategory.${c.index}.name`, c.name),
    equipment: ids(c.equipment),
  }));

  // --- Заклинания и магические предметы ---
  const spellText = (en: string) => {
    en = en.charAt(0).toUpperCase() + en.slice(1);
    return tx(`spellText.${slug(en)}`, en);
  };
  // Лечение «1d8 + MOD», временные хиты «1d4 + 4». Числа без костей («Подмога», «Исцеление») — без кнопки.
  const HEAL_KIND: Record<string, 'heal' | 'tempHp'> = { 'false-life': 'tempHp' };
  const heal = (s: Raw): Spell['damage'] | undefined => {
    const table: Record<string, string> = s.heal_at_slot_level;
    const parsed = Object.entries(table).map(([lvl, v]) => [lvl, v.match(/^(\d+d\d+)(?: \+ (MOD|\d+))?$/)] as const);
    if (parsed.some(([, m]) => !m)) return undefined;
    const addModifier = parsed.some(([, m]) => m![2] === 'MOD');
    const bonus = parsed.filter(([, m]) => m![2] && m![2] !== 'MOD').map(([lvl, m]) => [lvl, Number(m![2])]);
    return {
      kind: HEAL_KIND[s.index] ?? 'heal',
      bySlotLevel: Object.fromEntries(parsed.map(([lvl, m]) => [lvl, m![1]])),
      ...(addModifier ? { addModifier: true } : {}),
      ...(bonus.length ? { bonusBySlotLevel: Object.fromEntries(bonus) } : {}),
    };
  };
  const spells = (await raw('spells')).map((s) => {
    const key = `spell.${s.index}`;
    const description = paragraphs(s.desc);
    // Урон: у заклинаний с двумя видами урона («Небесный огонь») — только первый, как и в 2024.
    const d = (s.damage as Raw[])[0];
    let damage: Spell['damage'] | undefined;
    if (d) {
      damage = {
        ...(d.damage_type ? { type: d.damage_type.index } : {}),
        ...(d.damage_at_slot_level ? { bySlotLevel: d.damage_at_slot_level } : {}),
        ...(d.damage_at_character_level ? { byCharacterLevel: d.damage_at_character_level } : {}),
        ...(/two beams at 5th level/.test(description) ? { beams: true } : {}),
      };
    } else if (s.heal_at_slot_level) damage = heal(s);
    return {
      id: s.index,
      name: tx(`${key}.name`, s.name),
      level: s.level,
      school: s.school.index,
      castingTime: spellText(s.casting_time),
      range: spellText(s.range),
      duration: spellText(s.duration),
      components: s.components ?? [],
      ...(s.material ? { material: tx(`${key}.material`, s.material) } : {}),
      concentration: Boolean(s.concentration),
      ritual: Boolean(s.ritual),
      ...(s.attack_type ? { attackType: s.attack_type } : {}),
      ...(damage ? { damage } : {}),
      description: tx(`${key}.description`, description),
      ...(s.higher_level?.length ? { higherLevel: tx(`${key}.higherLevel`, paragraphs(s.higher_level)) } : {}),
      classes: ids(s.classes),
      subclasses: ids(s.subclasses),
    };
  });

  const itemText = (en: string) => tx(`magicItemText.${slug(en)}`, en);
  const magicItems = (await raw('magic-items')).map((m) => {
    const key = `magicItem.${m.index}`;
    const [kind = '', ...rest] = m.desc ?? [];
    return {
      id: m.index,
      name: tx(`${key}.name`, m.name),
      category: m.equipment_category?.index ?? '',
      kind: itemText(cleanText(kind)),
      rarity: itemText(m.rarity?.name ?? ''),
      attunement: /requires attunement/i.test(kind),
      description: tx(`${key}.description`, joinText(rest)),
      variants: ids(m.variants),
      isVariant: Boolean(m.variant),
    };
  });

  return {
    schemaVersion: SCHEMA_VERSION,
    edition: '2014',
    source: 'SRD 5.1 (CC BY 4.0) via dnd5eapi.co/api/2014',
    abilities,
    skills,
    alignments,
    languages,
    conditions,
    damageTypes,
    magicSchools,
    weaponProperties,
    // Приёмов оружия в 2014 нет.
    weaponMasteries: [],
    proficiencies,
    classes,
    features,
    subclasses,
    species,
    subspecies,
    traits,
    backgrounds,
    feats,
    equipment,
    equipmentCategories,
    spells,
    magicItems,
    resources: await readResources(),
    // Воззвания и метамагия 2014 — умения-варианты (Feature.parent / optionChoice), а не classOptions.
    classOptions: [],
  } as Omit<Content, 'version'>;
}

// ---------------------------------------------------------------------------
// Механика Player's Handbook 2014: data-pipeline/extra-2014/*.json (формат — data-pipeline/README.md).
// ---------------------------------------------------------------------------

const EXTRA_DIR = join(ROOT, 'extra-2014');

type ExtraProfChoice = {
  choose: number;
  options?: string[];
  fromProficiencyType?: 'artisanTool' | 'instrument' | 'gamingSet' | 'skill';
  desc?: string;
  descEn?: string;
};

async function readExtra(proficiencies: { id: string; type: ProficiencyType; refId?: string }[], categories: Raw[], languageIds: string[]) {
  const read = async (name: string) => JSON.parse(await readFile(join(EXTRA_DIR, `${name}.json`), 'utf8'));
  const gamingSets = new Set(ids(categories.find((c) => c.index === 'gaming-sets')?.equipment));
  const anyLanguage = (choose: number): Choice => ({ choose, options: languageIds.map((id) => ({ kind: 'ref', id })) });

  const profChoice = (c: ExtraProfChoice, where: string, key: string): Choice => {
    let options = c.options ?? [];
    if (c.fromProficiencyType === 'gamingSet') options = proficiencies.filter((p) => p.refId && gamingSets.has(p.refId)).map((p) => p.id);
    else if (c.fromProficiencyType) options = proficiencies.filter((p) => p.type === c.fromProficiencyType).map((p) => p.id);
    if (!options.length) warn(`${where}: пустой выбор владений`);
    return {
      choose: c.choose,
      ...(c.desc ? { desc: seeded(`${key}.desc`, c.descEn ?? c.desc, c.desc) } : {}),
      options: options.map((id) => ({ kind: 'ref', id })),
    };
  };

  const backgrounds: Background[] = (await read('backgrounds')).backgrounds.map((b: Raw) => ({
    id: b.id,
    name: seeded(`background.${b.id}.name`, b.name.en, b.name.ru),
    abilities: [],
    proficiencies: b.proficiencies,
    proficiencyChoices: (b.proficiencyChoices ?? []).map((c: ExtraProfChoice, i: number) =>
      profChoice(c, `предыстория ${b.id}`, `background.${b.id}.proficiencyChoice.${i}`),
    ),
    equipment: [
      {
        choose: 1,
        options: [
          {
            kind: 'all',
            items: [
              ...b.equipment.items.map(([id, count]: [string, number]): ChoiceOption => ({ kind: 'item', id, count })),
              ...(b.equipment.pickFromCategory ?? []).map((cat: string): ChoiceOption => ({ kind: 'choice', choice: { choose: 1, fromCategory: cat } })),
              { kind: 'money', amount: b.equipment.gp, unit: 'gp' },
            ],
          },
        ],
      },
    ],
    ...(b.languages ? { languageChoice: anyLanguage(b.languages) } : {}),
    feature: {
      name: seeded(`background.${b.id}.feature.name`, b.feature.name.en, b.feature.name.ru),
      description: seeded(`background.${b.id}.feature.description`, b.feature.textEn, b.feature.text),
    },
    extra: true,
  }));

  const data = await read('species');
  const traits: Trait[] = [];
  /** Особенности SRD, которые получают новые расы и подрасы, и заклинания для особенностей SRD. */
  const traitPatches = new Map<string, { species: string[]; subspecies: string[]; spells?: string[]; spellLevels?: Record<string, number> }>();
  const patch = (id: string) => {
    if (!traitPatches.has(id)) traitPatches.set(id, { species: [], subspecies: [] });
    return traitPatches.get(id)!;
  };
  const trait = (t: Raw, speciesId: string, subspeciesId?: string): string => {
    if (typeof t === 'string') {
      if (subspeciesId) patch(t).subspecies.push(subspeciesId);
      else patch(t).species.push(speciesId);
      return t;
    }
    traits.push({
      id: t.id,
      name: seeded(`trait.${t.id}.name`, t.name.en, t.name.ru),
      description: seeded(`trait.${t.id}.description`, t.textEn, t.text),
      species: subspeciesId ? [] : [speciesId],
      subspecies: subspeciesId ? [subspeciesId] : [],
      ...(t.proficiencies ? { proficiencies: t.proficiencies } : {}),
      ...(t.proficiencyChoices
        ? { proficiencyChoices: t.proficiencyChoices.map((c: ExtraProfChoice, i: number) => profChoice(c, `особенность ${t.id}`, `trait.${t.id}.proficiencyChoice.${i}`)) }
        : {}),
      ...(t.spells ? { spells: t.spells } : {}),
      ...(t.spellLevels ? { spellLevels: t.spellLevels } : {}),
      ...(t.speed ? { speed: t.speed } : {}),
      extra: true,
    });
    return t.id;
  };

  const subspecies: Subspecies[] = (data.subraces as Raw[]).map((s) => ({
    id: s.id,
    speciesId: s.raceId,
    name: seeded(`subspecies.${s.id}.name`, s.name.en, s.name.ru),
    abilityBonuses: s.abilityBonuses,
    traits: (s.traits as Raw[]).map((t) => ({ id: trait(t, s.raceId, s.id), level: 1 })),
    extra: true,
  }));

  const species: Species[] = (data.species as Raw[]).map((s) => ({
    id: s.id,
    name: seeded(`species.${s.id}.name`, s.name.en, s.name.ru),
    creatureType: 'humanoid',
    sizes: s.sizes,
    speed: s.speed,
    traits: (s.traits as Raw[]).map((t) => trait(t, s.id)),
    subspecies: [],
    ...(s.abilityBonuses ? { abilityBonuses: s.abilityBonuses } : {}),
    ...(s.abilityBonusChoice ? { abilityBonusChoice: s.abilityBonusChoice } : {}),
    languages: s.languages ?? [],
    ...(s.languageChoice ? { languageChoice: anyLanguage(s.languageChoice) } : {}),
    extra: true,
  }));

  for (const [id, sp] of Object.entries(data.traitSpells ?? {}) as [string, Raw][]) Object.assign(patch(id), sp);

  return { backgrounds, species, subspecies, traits, traitPatches };
}

/** Ресурсы умений (ярость, ки, вдохновение…): srd-2014/resources.json. */
async function readResources(): Promise<ClassResource[]> {
  const data = JSON.parse(await readFile(join(SRD_DIR, 'resources.json'), 'utf8'));
  return (data.resources as Raw[]).map((r) => ({
    ...r,
    name: seeded(`resource.${r.id}.name`, r.name.en, r.name.ru),
    features: Array.isArray(r.features) ? r.features : [r.features],
  }));
}

finish(build).catch((err) => {
  console.error(err);
  process.exit(1);
});
