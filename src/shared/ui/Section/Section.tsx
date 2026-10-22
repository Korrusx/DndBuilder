import { View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './Section.styles';
import type { SectionProps } from './Section.types';

/** Раздел шага: заголовок, счётчик «выбрано / нужно», подсказка. */
export function Section({
  title,
  hint,
  picked,
  need,
  children,
}: SectionProps) {
  const done = need !== undefined && picked === need;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <AppText variant="heading" style={styles.fill}>
          {title}
        </AppText>
        {need !== undefined ? (
          <AppText style={[styles.counter, done && styles.counterDone]}>
            {picked ?? 0} / {need}
          </AppText>
        ) : null}
      </View>
      {hint ? <AppText variant="secondary">{hint}</AppText> : null}
      {children}
    </View>
  );
}
