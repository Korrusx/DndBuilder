import { colors } from '@/shared/config/theme';
import { AppText } from '@/shared/ui/AppText/AppText';
import { Button } from '@/shared/ui/Button/Button';
import { Screen } from '@/shared/ui/Screen/Screen';
import { View } from 'react-native';
import { CREATE_STEPS } from '../../config/steps';
import { useDraft } from '../../model/DraftContext';
import { styles } from './WizardScreen.styles';
import type { WizardScreenProps } from './WizardScreen.types';

/** Каркас шага: прогресс из 6 сегментов, заголовок, нижняя панель с «Далее». */
export function WizardScreen({ step, children, summary, canContinue, footer, prepare }: WizardScreenProps) {
  const { next } = useDraft();
  return (
    <Screen
      footer={
        footer ?? (
          <>
            {summary}
            <Button
              title="Далее"
              disabled={!canContinue}
              onPress={() => next(step, prepare)}
            />
          </>
        )
      }
    >
      <View style={styles.progress}>
        {CREATE_STEPS.map((s, i) => (
          <View key={s.title} style={[styles.segment, { backgroundColor: i < step ? colors.accent : colors.surface2 }]} />
        ))}
      </View>
      <AppText variant="secondary">
        Шаг {step} из {CREATE_STEPS.length}
      </AppText>
      <AppText variant="title">{CREATE_STEPS[step - 1].title}</AppText>
      {children}
    </Screen>
  );
}
