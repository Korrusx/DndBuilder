import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n';

import { TRANSITION } from '../../config/constants';
import { DECK_UI } from '../../config/deckColors';
import { LevelBadge } from '../LevelBadge/LevelBadge';
import { styles } from './DeckHeader.styles';
import type { DeckHeaderProps } from './DeckHeader.types';

const TITLE_IN = FadeIn.delay(TRANSITION.titleStart).duration(TRANSITION.titleDuration);
const COUNTER_IN = FadeIn.delay(TRANSITION.chromeStart).duration(TRANSITION.chromeDuration);

/** Шапка колоды: «Назад» · значок уровня · заголовок; под ней счётчик и лента (разделы 3 и 4). */
export function DeckHeader(props: DeckHeaderProps) {
  const { title, subtitle, progress, onBack, onRevealAll, children, intro } = props;
  const insets = useSafeAreaInsets();
  const allOpen = progress.revealed === progress.total;
  return (
    <>
      <View style={[styles.head, { paddingTop: 10 + insets.top }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('levelUpDeck.back')}
          onPress={onBack}
          style={styles.back}
        >
          <Feather name="chevron-left" size={22} color={DECK_UI.text} />
        </Pressable>
        <LevelBadge
          level={props.level}
          capstone={props.capstone}
          hidden={props.badgeHidden}
          badgeRef={props.badgeRef}
          onLayout={props.onBadgeLayout}
        />
        <Animated.View style={styles.titles} entering={intro ? TITLE_IN : undefined}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </Animated.View>
        {allOpen ? null : (
          <Pressable accessibilityRole="button" onPress={onRevealAll} style={styles.revealAll}>
            <Text style={styles.revealAllText}>{t('levelUpDeck.revealAll')}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.block}>
        <Animated.View style={styles.counter} accessible entering={intro ? COUNTER_IN : undefined}>
          <Text style={styles.counterText}>
            {t('levelUpDeck.screen.opened')} <Text style={styles.counterNumber}>{progress.revealed}</Text>{' '}
            {t('levelUpDeck.screen.of')} {progress.total}
          </Text>
          {progress.choicesTotal > 0 ? (
            <>
              <Text style={styles.dot}>·</Text>
              {progress.choicesDone < progress.choicesTotal ? (
                <Text style={styles.choices}>
                  {t('levelUpDeck.screen.choicesProgress', {
                    done: progress.choicesDone,
                    total: progress.choicesTotal,
                  })}
                </Text>
              ) : (
                <View style={styles.done}>
                  <Feather name="check" size={13} color={DECK_UI.heal} />
                  <Text style={styles.doneText}>
                    {t('levelUpDeck.screen.choicesDone', { count: progress.choicesTotal })}
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </Animated.View>
        {children}
      </View>
    </>
  );
}
