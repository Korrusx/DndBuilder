import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { View } from 'react-native';

import type { Entity, QuestStatus } from '@/entities/campaign';
import { staleQuests } from '@/entities/campaign';
import { saveQuestStep } from '@/entities/campaign/api';
import { PayFromWalletSheet } from '@/features/pay-quest';
import { useTranslation } from '@/shared/i18n';
import { AppText, Button, Segmented } from '@/shared/ui';

import { QuestCard } from '../QuestCard/QuestCard';
import { styles } from './QuestBoard.styles';
import type { QuestBoardProps } from './QuestBoard.types';

const statusOf = (quest: Entity): QuestStatus => (quest.status as QuestStatus | undefined) ?? 'active';

/** Квесты кампании (Х4): «Активные · Выполнены · Провалены», личные линии сверху. */
export function QuestBoard({ data, heroes, onOpenEntity, onCreate, onChanged }: QuestBoardProps) {
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const [tab, setTab] = useState<QuestStatus>('active');
  const [paying, setPaying] = useState<Entity | null>(null);

  const quests = data.entities.filter((entity) => entity.type === 'quest');
  const count = (status: QuestStatus) => quests.filter((quest) => statusOf(quest) === status).length;
  const shown = quests
    .filter((quest) => statusOf(quest) === tab)
    .sort((a, b) => Number(b.personal) - Number(a.personal) || b.updatedAt.localeCompare(a.updatedAt));
  const entitiesById = new Map(data.entities.map((entity) => [entity.id, entity]));
  const current = Math.max(0, ...data.sessions.map((session) => session.number));
  const stale = new Map(
    staleQuests(quests, data.entries, data.sessions, current, data.steps, data.counters).map((item) => [
      item.quest.id,
      item.lastSessionNumber,
    ]),
  );
  const counterOf = (questId: string) => data.counters.find((counter) => counter.questId === questId) ?? null;

  const tabs = (['active', 'done', 'failed'] as QuestStatus[]).map((status) => ({
    value: status,
    label: `${t(`chronicle.questTabs.${status}`)} ${count(status)}`,
  }));

  return (
    <View style={styles.board}>
      <Segmented<QuestStatus> value={tab} onChange={setTab} options={tabs} />
      {shown.length === 0 ? <AppText variant="secondary">{t(`chronicle.questEmpty.${tab}`)}</AppText> : null}
      {shown.map((quest) => {
        const counter = counterOf(quest.id);
        return (
          <QuestCard
            key={quest.id}
            quest={quest}
            steps={data.steps.filter((step) => step.questId === quest.id)}
            counter={counter}
            entitiesById={entitiesById}
            staleSince={stale.get(quest.id) ?? null}
            onOpen={() => onOpenEntity(quest.id)}
            onOpenEntity={onOpenEntity}
            onToggleStep={(step) =>
              saveQuestStep(db, { ...step, done: !step.done })
                .then(onChanged)
                .catch(() => undefined)
            }
            onPay={counter?.linkedToWallet && statusOf(quest) === 'active' ? () => setPaying(quest) : undefined}
          />
        );
      })}
      <Button title={t('chronicle.quest.add')} variant="secondary" onPress={onCreate} />
      <PayFromWalletSheet
        quest={paying}
        counter={paying ? counterOf(paying.id) : null}
        heroes={heroes}
        onClose={() => setPaying(null)}
        onPaid={() => {
          setPaying(null);
          onChanged();
        }}
      />
    </View>
  );
}
