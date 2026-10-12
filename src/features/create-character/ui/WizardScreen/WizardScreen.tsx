import { View } from 'react-native';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText, Button, Screen } from '@/shared/ui';

import { CREATE_STEPS } from '../../config/steps';
import { useDraft } from '../../model/DraftContext';
import { styles } from './WizardScreen.styles';
import type { WizardScreenProps } from './WizardScreen.types';

/** Каркас шага: прогресс из 6 сегментов, заголовок, нижняя панель с «Далее». */
export function WizardScreen({ step, children, summary, canContinue, footer, prepare }: WizardScreenProps) {
  const { next } = useDraft();
  const { t } = useTranslation();
  return (
    <Screen
      footer={
        footer ?? (
          <>
            {summary}
            <Button
              title={t('common.next')}
              disabled={!canContinue}
              onPress={() => next(step, prepare)}
            />
          </>
        )
      }
    >
      <View style={styles.progress}>
        {CREATE_STEPS.map((s, i) => (
          <View key={s.id} style={[styles.segment, { backgroundColor: i < step ? colors.accent : colors.surface2 }]} />
        ))}
      </View>
      <AppText variant="secondary">
        {t('wizard.stepOf', { step, total: CREATE_STEPS.length })}
      </AppText>
      <AppText variant="title">{t(`wizard.steps.${CREATE_STEPS[step - 1].id}`)}</AppText>
      {children}
    </Screen>
  );
}
