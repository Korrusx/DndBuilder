import { Fragment } from 'react';
import { View } from 'react-native';

import {
  CLASS_ICONS,
  DEFAULT_CLASS_ICON,
  describeClass,
  setClass,
  setEdition,
  setSubclass,
  subclassLevel,
} from '@/entities/character';
import { ClassCard } from '@/entities/character/ui';
import { useDraft, WizardScreen } from '@/features/create-character';
import type { Edition } from '@/shared/content';
import { abilityAbbr, byId, content, nameOf } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { chunk } from '@/shared/lib/chunk';
import { formatDie } from '@/shared/lib/dice';
import { AppText, FadeSwap, Hint, OptionCard, Section, Segmented, VariantPanel } from '@/shared/ui';

import { TILE_COLUMNS } from '../../config/constants';
import { subclassOptions } from '../../lib/subclassOptions';
import { styles } from './CreateClassPage.styles';

export function CreateClassPage() {
  const { character, update } = useDraft();
  const { t } = useTranslation();
  const selected = character.classes[0]?.classId;
  const cls = selected ? byId.classes.get(selected) : undefined;
  // 2014: жрец, чародей, колдун выбирают подкласс уже на 1-м уровне — в панели под плиткой класса.
  const subclassNow = cls && subclassLevel(cls.id, content) <= 1 ? cls.subclasses : [];
  const subclassId = character.classes[0]?.subclassId;
  const description = cls ? describeClass(cls.id, content, { subclassId }) : undefined;

  const editionOptions = [
    { value: '2024' as Edition, label: t('edition.v2024') },
    { value: '2014' as Edition, label: t('edition.v2014') },
  ];

  return (
    <WizardScreen
      step={1}
      canContinue={!!cls && (subclassNow.length === 0 || !!subclassId)}
      nextTitle={cls ? t('createClass.pick', { name: nameOf('classes', cls.id) }) : undefined}
    >
      <Section title={t('edition.title')}>
        <Segmented<Edition>
          value={character.edition}
          onChange={(e) => update((d) => setEdition(d, e))}
          options={editionOptions}
        />
        <Hint>{`${character.edition === '2014' ? t('edition.hint2014') : t('edition.hint2024')} ${t('edition.changeWarning')}`}</Hint>
      </Section>

      <View style={styles.grid}>
        {chunk(content.classes, TILE_COLUMNS).map((row) => (
          <Fragment key={row[0].id}>
            <View style={styles.row}>
              {row.map((c) => (
                <OptionCard
                  key={c.id}
                  compact
                  pattern
                  selected={c.id === selected}
                  onPress={() => update((d) => setClass(d, c.id))}
                  icon={CLASS_ICONS[c.id] ?? DEFAULT_CLASS_ICON}
                  title={
                    <AppText style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
                      {nameOf('classes', c.id)}
                    </AppText>
                  }
                  lines={[
                    t('createClass.hitDie', { die: formatDie(c.hitDie) }),
                    c.primaryAbilities
                      .map(abilityAbbr)
                      .join(` ${c.primaryAbilityChoice ? t('common.or') : t('common.and')} `),
                  ]}
                />
              ))}
              {Array.from({ length: TILE_COLUMNS - row.length }, (_, i) => (
                <View key={i} style={styles.fill} />
              ))}
            </View>
            {subclassNow.length && row.some((c) => c.id === selected) ? (
              <VariantPanel
                options={subclassOptions(subclassNow)}
                selectedId={subclassId}
                onSelect={(id) => update((d) => setSubclass(d, id))}
                hint={t('createClass.subclassHint')}
              />
            ) : null}
          </Fragment>
        ))}
      </View>

      <FadeSwap swapKey={`${selected ?? ''}:${subclassId ?? ''}`}>
        {description ? (
          <ClassCard description={description} />
        ) : (
          <View style={styles.empty}>
            <AppText variant="secondary" style={styles.emptyText}>
              {t('describe.emptyClass')}
            </AppText>
          </View>
        )}
      </FadeSwap>
    </WizardScreen>
  );
}
