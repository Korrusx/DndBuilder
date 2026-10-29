import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { amountText, questProgress } from '@/entities/campaign';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { styles } from './QuestCard.styles';
import type { QuestCardProps } from './QuestCard.types';

/** Квест (Х4): шаги-галочки и «2 из 3» или личная линия со счётчиком и «Внести из кошелька». */
export function QuestCard({
  quest,
  steps,
  counter,
  entitiesById,
  staleSince,
  onOpen,
  onOpenEntity,
  onToggleStep,
  onPay,
}: QuestCardProps) {
  const { t } = useTranslation();
  const progress = questProgress(steps, counter);
  const giver = quest.givenById ? entitiesById.get(quest.givenById) : undefined;

  return (
    <Pressable onPress={onOpen} style={[styles.card, quest.personal && styles.personal]}>
      {quest.personal || quest.role ? (
        <View style={styles.top}>
          {quest.personal ? (
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>{t('chronicle.quest.personal').toLocaleUpperCase()}</AppText>
            </View>
          ) : (
            <View />
          )}
          {quest.role ? <AppText style={styles.role}>{quest.role}</AppText> : null}
        </View>
      ) : null}

      <View style={styles.titleRow}>
        <AppText style={styles.title}>{quest.name}</AppText>
        {progress && !counter ? <AppText style={styles.progress}>{progress.label}</AppText> : null}
      </View>

      {giver || quest.reward ? (
        <AppText style={styles.meta}>
          {giver ? (
            <>
              {t('chronicle.quest.from')}{' '}
              <AppText style={styles.mention} onPress={() => onOpenEntity(giver.id)}>
                @{giver.name}
              </AppText>
              {giver.role ? `, ${giver.role}` : ''}
            </>
          ) : null}
          {giver && quest.reward ? ' · ' : ''}
          {quest.reward ? t('chronicle.quest.reward', { reward: quest.reward }) : ''}
        </AppText>
      ) : null}

      {counter && progress ? (
        <>
          <View style={styles.counterRow}>
            <AppText style={styles.counterValue}>{counter.current}</AppText>
            <AppText style={styles.counterLabel}>
              {t('chronicle.quest.of', { target: amountText(counter.target, counter.unit) })}
            </AppText>
          </View>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${Math.round(progress.fraction * 100)}%` }]} />
          </View>
          {onPay ? (
            <Pressable accessibilityRole="button" onPress={onPay} style={styles.pay}>
              <AppText style={styles.payText}>{t('chronicle.pay.open')}</AppText>
            </Pressable>
          ) : null}
        </>
      ) : null}

      {steps.map((step) => (
        <Pressable
          key={step.id}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: step.done }}
          onPress={() => onToggleStep(step)}
          style={styles.step}
        >
          <View style={[styles.box, step.done && styles.boxDone]}>
            {step.done ? <MaterialCommunityIcons name="check" size={18} color={colors.onAccent} /> : null}
          </View>
          <AppText style={[styles.stepText, step.done && styles.stepDone]}>{step.text}</AppText>
        </Pressable>
      ))}

      {quest.description ? <AppText style={styles.meta}>{quest.description}</AppText> : null}
      {staleSince !== null ? (
        <AppText style={styles.stale}>{t('chronicle.quest.stale', { number: staleSince })}</AppText>
      ) : null}
    </Pressable>
  );
}
