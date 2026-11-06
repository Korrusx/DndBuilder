import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n';

import { DECK_UI } from '../../config/deckColors';
import { styles } from './DeckHeader.styles';
import type { DeckHeaderProps } from './DeckHeader.types';

/** Шапка экрана карт и счётчик «Открыто 3 из 6 · выборов 0 из 1» (раздел 3). */
export function DeckHeader({ title, subtitle, progress, onBack, onRevealAll, children }: DeckHeaderProps) {
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
        <View style={styles.titles}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        {allOpen ? null : (
          <Pressable accessibilityRole="button" onPress={onRevealAll} style={styles.revealAll}>
            <Text style={styles.revealAllText}>{t('levelUpDeck.revealAll')}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.block}>
        <View style={styles.counter} accessible>
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
        </View>
        {children}
      </View>
    </>
  );
}
