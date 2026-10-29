import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buildRecap, lastEndedSession, openQuestLine, recapToText } from '@/entities/campaign';
import { useCampaign } from '@/entities/campaign/api';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { formatDayMonth } from '@/shared/lib/date';
import { AppText, Screen } from '@/shared/ui';

import { RECAP_TEXT } from '../../config/constants';
import { styles } from './RecapPage.styles';

/** «В прошлый раз…» (Х5): сводка прошлой сессии для чтения вслух — только записи игрока и события, без тайного. */
export function RecapPage() {
  const { id, sessionId } = useLocalSearchParams<{ id: string; sessionId?: string }>();
  const { t } = useTranslation();
  const { data } = useCampaign(id);
  const [large, setLarge] = useState(false);

  if (data === undefined) {
    return null;
  }
  const session = data
    ? (data.sessions.find((item) => item.id === sessionId) ?? lastEndedSession(data.sessions))
    : null;
  if (!data || !session) {
    return (
      <Screen>
        <AppText variant="heading">{t('chronicle.notFound')}</AppText>
      </Screen>
    );
  }

  const recap = buildRecap(session, data.entries, data.sessions, data.entities, data.steps, data.counters);
  const text = large ? RECAP_TEXT.large : RECAP_TEXT.normal;
  const reading = { fontSize: text.size, lineHeight: text.line };
  const empty = !recap.happened.length && !recap.whereWeStopped;
  const share = () => Share.share({ message: recapToText(recap, data.campaign.name) }).catch(() => undefined);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={() => router.back()}
          style={styles.icon}
        >
          <MaterialCommunityIcons name="close" size={26} color={colors.text} />
        </Pressable>
        <View style={styles.grow} />
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={t('chronicle.recap.bigText')}
          accessibilityState={{ checked: large }}
          onPress={() => setLarge((value) => !value)}
          style={[styles.aa, large && styles.aaOn]}
        >
          <AppText style={styles.aaText}>Aa</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('chronicle.recap.share')}
          onPress={share}
          style={styles.icon}
        >
          <MaterialCommunityIcons name="export-variant" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppText style={styles.kicker}>
          {t('chronicle.recap.sessionDate', {
            number: session.number,
            date: formatDayMonth(session.startedAt),
          }).toLocaleUpperCase()}
        </AppText>
        <AppText style={[styles.title, large && { fontSize: 42, lineHeight: 48 }]}>
          {t('chronicle.recap.title')}
        </AppText>

        {empty ? <AppText style={[styles.paragraph, reading]}>{t('chronicle.recap.empty')}</AppText> : null}
        {recap.happened.map((paragraph, i) => (
          <AppText key={i} style={[styles.paragraph, reading]}>
            {paragraph}
          </AppText>
        ))}

        {recap.met.length ? (
          <View style={styles.block}>
            <AppText style={styles.label}>{t('chronicle.recap.met').toLocaleUpperCase()}</AppText>
            <View style={styles.chips}>
              {recap.met.map((person) => (
                <Pressable
                  key={person.id}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({ pathname: '/campaign/[id]/entity/[entityId]', params: { id, entityId: person.id } })
                  }
                  style={styles.chip}
                >
                  <AppText style={styles.chipText}>{person.name}</AppText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {recap.found.length ? (
          <View style={styles.block}>
            <AppText style={styles.label}>{t('chronicle.recap.found').toLocaleUpperCase()}</AppText>
            {recap.found.map((line, i) => (
              <View key={i} style={styles.questRow}>
                <AppText style={styles.diamond}>◆</AppText>
                <AppText style={styles.questText}>{line}</AppText>
              </View>
            ))}
          </View>
        ) : null}

        {recap.openQuests.length ? (
          <View style={styles.block}>
            <AppText style={styles.label}>{t('chronicle.recap.quests').toLocaleUpperCase()}</AppText>
            {recap.openQuests.map((item) => (
              <View key={item.quest.id} style={styles.questRow}>
                <AppText style={styles.diamond}>◆</AppText>
                <AppText style={styles.questText}>{openQuestLine(item)}</AppText>
              </View>
            ))}
          </View>
        ) : null}

        {recap.whereWeStopped ? (
          <View style={styles.stopped}>
            <AppText style={styles.stoppedLabel}>{t('chronicle.recap.stopped').toLocaleUpperCase()}</AppText>
            <AppText style={[styles.stoppedText, reading]}>{recap.whereWeStopped}</AppText>
          </View>
        ) : null}

        <AppText style={styles.footer}>{t('chronicle.recap.footer')}</AppText>
      </ScrollView>
    </SafeAreaView>
  );
}
