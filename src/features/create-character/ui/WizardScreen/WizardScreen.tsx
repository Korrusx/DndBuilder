import { Pressable, View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { AppText, Button, Screen } from '@/shared/ui';

import { CREATE_STEPS } from '../../config/steps';
import { useDraft } from '../../model/DraftContext';
import { styles } from './WizardScreen.styles';
import type { WizardScreenProps } from './WizardScreen.types';

/** Каркас шага: прогресс из 6 сегментов (по пройденным можно перейти), заголовок, нижняя панель «Назад» / «Далее». */
export function WizardScreen({ step, children, summary, canContinue, footer, prepare }: WizardScreenProps) {
  const { next, canOpen, goTo } = useDraft();
  const { t } = useTranslation();
  return (
    <Screen
      footer={
        footer ?? (
          <>
            {summary}
            <View style={styles.buttons}>
              {step > 1 ? (
                <Button title={t('common.back')} variant="secondary" onPress={() => goTo(step - 1, step)} />
              ) : null}
              <View style={styles.fill}>
                <Button title={t('common.next')} disabled={!canContinue} onPress={() => next(step, prepare)} />
              </View>
            </View>
          </>
        )
      }
    >
      <View style={styles.progress}>
        {CREATE_STEPS.map((s, i) => {
          const n = i + 1;
          const open = n !== step && canOpen(n);
          return (
            <Pressable
              key={s.id}
              disabled={!open}
              accessibilityRole="button"
              accessibilityLabel={t('wizard.goToStep', { step: n, title: t(`wizard.steps.${s.id}`) })}
              accessibilityState={{ disabled: !open, selected: n === step }}
              hitSlop={{ top: 12, bottom: 12 }}
              onPress={() => goTo(n, step)}
              style={({ pressed }) => [styles.segmentHit, pressed && { opacity: 0.6 }]}
            >
              <View style={[styles.segment, n <= step ? styles.segmentActive : open ? styles.segmentOpen : styles.segmentLocked]} />
            </Pressable>
          );
        })}
      </View>
      <AppText variant="secondary">
        {t('wizard.stepOf', { step, total: CREATE_STEPS.length })}
      </AppText>
      <AppText variant="title">{t(`wizard.steps.${CREATE_STEPS[step - 1].id}`)}</AppText>
      {children}
    </Screen>
  );
}
