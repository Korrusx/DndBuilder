import { Href, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Placeholder } from './Placeholder';
import { Screen } from './Screen';

export const CREATE_STEPS: { route: Href; title: string }[] = [
  { route: '/create/class', title: 'Класс' },
  { route: '/create/origin', title: 'Предыстория и вид' },
  { route: '/create/abilities', title: 'Характеристики' },
  { route: '/create/skills', title: 'Навыки и владения' },
  { route: '/create/equipment', title: 'Снаряжение' },
  { route: '/create/review', title: 'Проверка' },
];

/** Каркас шага мастера создания: прогресс из 6 сегментов и кнопка «Далее». */
export function CreateStep({ step }: { step: number }) {
  const current = CREATE_STEPS[step - 1];
  const next = CREATE_STEPS[step];

  return (
    <Screen
      footer={
        next ? (
          <Button title="Далее" onPress={() => router.push(next.route)} />
        ) : (
          <Button title="Начать игру" onPress={() => router.replace('/character/demo')} />
        )
      }
    >
      <View style={styles.progress}>
        {CREATE_STEPS.map((s, i) => (
          <View
            key={s.title}
            style={[styles.segment, { backgroundColor: i < step ? colors.accent : colors.surface2 }]}
          />
        ))}
      </View>
      <AppText variant="secondary">
        Шаг {step} из {CREATE_STEPS.length}
      </AppText>
      <AppText variant="title">{current.title}</AppText>
      <Placeholder title="В разработке" note="Этот шаг появится на этапе 5." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: 6, borderRadius: 3 },
});
