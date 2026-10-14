import { View } from 'react-native';

import { setClass, setEdition, setSubclass, subclassLevel } from '@/entities/character';
import { useDraft, WizardScreen } from '@/features/create-character';
import type { Edition } from '@/shared/content';
import { abilityAbbr, byId, content, nameOf, tr } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatDie } from '@/shared/lib/dice';
import { AppText, Chip, ChipRow, Hint, OptionCard, Section, Segmented } from '@/shared/ui';

import { CLASS_ICONS, DEFAULT_CLASS_ICON } from '../../config/icons';
import { styles } from './CreateClassPage.styles';

export function CreateClassPage() {
  const { character, update } = useDraft();
  const { t } = useTranslation();
  const selected = character.classes[0]?.classId;
  const cls = selected ? byId.classes.get(selected) : undefined;
  // 2014: жрец, чародей, колдун выбирают подкласс уже на 1-м уровне.
  const subclassNow = cls && subclassLevel(cls.id, content) <= 1 ? cls.subclasses : [];
  const subclassId = character.classes[0]?.subclassId;

  const rows: (typeof content.classes)[] = [];
  for (let i = 0; i < content.classes.length; i += 2) rows.push(content.classes.slice(i, i + 2));

  return (
    <WizardScreen
      step={1}
      canContinue={!!cls && (subclassNow.length === 0 || !!subclassId)}
      summary={
        cls ? (
          <AppText variant="secondary">
            {t('createClass.chosen')} <AppText style={styles.textText}>{nameOf('classes', cls.id)}</AppText> · {formatDie(cls.hitDie)}
          </AppText>
        ) : (
          <AppText variant="secondary">{t('createClass.choose')}</AppText>
        )
      }
    >
      <Section title={t('edition.title')}>
        <Segmented<Edition>
          value={character.edition}
          onChange={(e) => update((d) => setEdition(d, e))}
          options={[
            { value: '2024', label: t('edition.v2024') },
            { value: '2014', label: t('edition.v2014') },
          ]}
        />
        <Hint>{`${character.edition === '2014' ? t('edition.hint2014') : t('edition.hint2024')} ${t('edition.changeWarning')}`}</Hint>
      </Section>

      {rows.map((row) => (
        <View key={row[0].id} style={styles.row}>
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
                c.primaryAbilities.map(abilityAbbr).join(` ${c.primaryAbilityChoice ? t('common.or') : t('common.and')} `),
              ]}
            />
          ))}
        </View>
      ))}

      {subclassNow.length ? (
        <Section title={t('createClass.subclass')} hint={t('createClass.subclassHint')} picked={subclassId ? 1 : 0} need={1}>
          <ChipRow>
            {subclassNow.map((id) => {
              const sub = byId.subclasses.get(id);
              return (
                <Chip
                  key={id}
                  label={sub ? tr(sub.name).text : id}
                  selected={id === subclassId}
                  onPress={() => update((d) => setSubclass(d, id))}
                />
              );
            })}
          </ChipRow>
        </Section>
      ) : null}
    </WizardScreen>
  );
}
