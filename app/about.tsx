import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { LText } from '@/components/LText';
import { Screen } from '@/components/Screen';
import { content, translationProgress } from '@/content';
import { colors, radius, spacing } from '@/theme';

export default function AboutScreen() {
  const { done, total } = translationProgress();
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <Screen>
      <AppText variant="heading">Справочник</AppText>
      <View style={styles.card}>
        <AppText>Версия: {content.version}</AppText>
        <AppText variant="secondary">
          Классов {content.classes.length}, видов {content.species.length}, предысторий{' '}
          {content.backgrounds.length}, заклинаний {content.spells.length}, предметов{' '}
          {content.equipment.length}
        </AppText>
        <AppText variant="secondary">
          Переведено {done} из {total} текстов ({percent}%)
        </AppText>
        <AppText variant="secondary">Навыки:</AppText>
        {content.skills.slice(0, 4).map((s) => (
          <LText key={s.id} text={s.name} variant="secondary" />
        ))}
        <AppText variant="secondary">Классы (пока без перевода):</AppText>
        {content.classes.slice(0, 3).map((c) => (
          <LText key={c.id} text={c.name} variant="secondary" />
        ))}
      </View>

      <AppText variant="heading">Атрибуция</AppText>
      <AppText>
        Это приложение использует материалы System Reference Document 5.2 («SRD 5.2») от Wizards of
        the Coast LLC, доступные по адресу https://www.dndbeyond.com/srd. SRD 5.2 распространяется
        по лицензии Creative Commons Attribution 4.0 International (CC BY 4.0):
        https://creativecommons.org/licenses/by/4.0/legalcode.
      </AppText>
      <AppText variant="secondary">
        Тексты SRD приведены в собственном переводе и могут быть изменены по сравнению с оригиналом.
        Приложение не является официальным продуктом Wizards of the Coast.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.xs,
  },
});
