import { colors } from '@/shared/config/theme';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '../AppText/AppText';
import { styles } from './Section.styles';

/** Раздел шага: заголовок, счётчик «выбрано / нужно», подсказка. */
export function Section({
  title,
  hint,
  picked,
  need,
  children,
}: {
  title: string;
  hint?: string;
  picked?: number;
  need?: number;
  children: ReactNode;
}) {
  const done = need !== undefined && picked === need;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <AppText variant="heading" style={{ flex: 1 }}>
          {title}
        </AppText>
        {need !== undefined ? (
          <AppText style={[styles.counter, { color: done ? colors.heal : colors.accent }]}>
            {picked ?? 0} / {need}
          </AppText>
        ) : null}
      </View>
      {hint ? <AppText variant="secondary">{hint}</AppText> : null}
      {children}
    </View>
  );
}
