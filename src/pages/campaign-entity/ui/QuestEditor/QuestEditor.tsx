import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import type { QuestStatus } from '@/entities/campaign';
import { questProgress } from '@/entities/campaign';
import { deleteQuestCounter, deleteQuestStep, saveQuestCounter, saveQuestStep } from '@/entities/campaign/api';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { newId } from '@/shared/lib/id';
import { useResetState } from '@/shared/lib/reset-state';
import { AppText, Chip, ChipRow, Segmented, SmallButton } from '@/shared/ui';

import { inputStyles } from '../../lib/inputStyle';
import { styles } from './QuestEditor.styles';
import type { QuestEditorProps } from './QuestEditor.types';

const number = (text: string) => Math.max(0, Math.floor(Number(text.replace(/[^0-9]/g, '')) || 0));

/** Квест: статус, личная линия, кто дал, награда, шаги-галочки и счётчик (долг, сбор). */
export function QuestEditor({
  quest,
  steps,
  counter,
  entitiesById,
  onPatch,
  onStatus,
  onPickGiver,
  onOpen,
  onChanged,
}: QuestEditorProps) {
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const [reward, setReward] = useResetState(quest.reward ?? '', quest.id);
  const [newStep, setNewStep] = useState('');
  const [current, setCurrent] = useResetState(String(counter?.current ?? 0), counter?.updatedAt);
  const [target, setTarget] = useResetState(String(counter?.target ?? 0), counter?.updatedAt);
  const [unit, setUnit] = useResetState(counter?.unit === 'gp' ? '' : (counter?.unit ?? ''), counter?.updatedAt);
  const giver = quest.givenById ? entitiesById.get(quest.givenById) : undefined;
  const progress = questProgress(steps, counter);
  const changed = (task: Promise<unknown>) => task.then(onChanged).catch(() => undefined);

  const statusOptions = (['active', 'done', 'failed'] as QuestStatus[]).map((status) => ({
    value: status,
    label: t(`chronicle.questStatus.${status}`),
  }));

  const saveCounter = (patch: Partial<NonNullable<typeof counter>>) => {
    if (counter) {
      changed(saveQuestCounter(db, { ...counter, ...patch }));
    }
  };

  return (
    <View style={styles.wrap}>
      <Segmented<QuestStatus>
        value={(quest.status as QuestStatus | undefined) ?? 'active'}
        onChange={onStatus}
        options={statusOptions}
      />
      <ChipRow>
        <Chip
          label={t('chronicle.quest.personal')}
          selected={quest.personal}
          onPress={() => onPatch({ personal: !quest.personal })}
        />
      </ChipRow>

      <AppText style={styles.title}>{t('chronicle.quest.givenBy').toLocaleUpperCase()}</AppText>
      <Pressable
        accessibilityRole="button"
        onPress={onPickGiver}
        onLongPress={giver ? () => onOpen(giver.id) : undefined}
        style={styles.giver}
      >
        <AppText style={[styles.giverText, !giver && styles.placeholder]}>
          {giver ? `@${giver.name}${giver.role ? `, ${giver.role}` : ''}` : t('chronicle.quest.pickGiver')}
        </AppText>
      </Pressable>

      <AppText style={styles.title}>{t('chronicle.quest.rewardTitle').toLocaleUpperCase()}</AppText>
      <TextInput
        value={reward}
        onChangeText={setReward}
        onEndEditing={() => onPatch({ reward: reward.trim() || undefined })}
        placeholder={t('chronicle.quest.rewardPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={inputStyles.input}
      />

      <AppText style={styles.title}>
        {[t('chronicle.quest.stepsTitle').toLocaleUpperCase(), progress && !counter ? progress.label : '']
          .filter(Boolean)
          .join(' · ')}
      </AppText>
      {steps.map((step) => (
        <View key={step.id} style={styles.step}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: step.done }}
            onPress={() => changed(saveQuestStep(db, { ...step, done: !step.done }))}
            style={[styles.box, step.done && styles.boxDone]}
          >
            {step.done ? <MaterialCommunityIcons name="check" size={18} color={colors.onAccent} /> : null}
          </Pressable>
          <AppText style={[styles.stepText, step.done && styles.stepDone]}>{step.text}</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.delete')}
            onPress={() => changed(deleteQuestStep(db, step.id))}
            style={styles.remove}
          >
            <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      ))}
      <View style={styles.row}>
        <TextInput
          value={newStep}
          onChangeText={setNewStep}
          placeholder={t('chronicle.quest.stepPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          style={[inputStyles.input, styles.grow]}
        />
        <SmallButton
          title={t('chronicle.quest.addStep')}
          disabled={!newStep.trim()}
          onPress={() => {
            const text = newStep.trim();
            setNewStep('');
            changed(
              saveQuestStep(db, {
                id: newId(),
                questId: quest.id,
                text,
                done: false,
                order: Math.max(-1, ...steps.map((step) => step.order)) + 1,
                updatedAt: '',
              }),
            );
          }}
        />
      </View>

      <AppText style={styles.title}>{t('chronicle.quest.counterTitle').toLocaleUpperCase()}</AppText>
      {counter ? (
        <>
          <View style={styles.row}>
            <TextInput
              value={current}
              onChangeText={setCurrent}
              onEndEditing={() => saveCounter({ current: number(current) })}
              keyboardType="number-pad"
              style={[inputStyles.input, styles.grow]}
            />
            <AppText variant="secondary">{t('chronicle.quest.ofWord')}</AppText>
            <TextInput
              value={target}
              onChangeText={setTarget}
              onEndEditing={() => saveCounter({ target: number(target) })}
              keyboardType="number-pad"
              style={[inputStyles.input, styles.grow]}
            />
          </View>
          <TextInput
            value={unit}
            onChangeText={setUnit}
            onEndEditing={() =>
              saveCounter({ unit: unit.trim() || 'gp', linkedToWallet: !unit.trim() && counter.linkedToWallet })
            }
            placeholder={t('chronicle.quest.unitPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={inputStyles.input}
          />
          <ChipRow>
            {counter.unit === 'gp' ? (
              <Chip
                label={t('chronicle.quest.linkedToWallet')}
                selected={counter.linkedToWallet}
                onPress={() => saveCounter({ linkedToWallet: !counter.linkedToWallet })}
              />
            ) : null}
            <Chip
              label={t('chronicle.quest.removeCounter')}
              onPress={() => changed(deleteQuestCounter(db, quest.id))}
            />
          </ChipRow>
        </>
      ) : (
        <SmallButton
          title={t('chronicle.quest.addCounter')}
          onPress={() =>
            changed(
              saveQuestCounter(db, {
                questId: quest.id,
                current: 0,
                target: 100,
                unit: 'gp',
                linkedToWallet: quest.personal,
                updatedAt: '',
              }),
            )
          }
        />
      )}
    </View>
  );
}
