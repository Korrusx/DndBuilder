import { Pressable, View } from 'react-native';

import type { EntityType } from '@/entities/campaign';
import { mentionsOf, searchEntities } from '@/entities/campaign';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { MENTION_SUGGESTIONS } from '../../config/constants';
import { styles } from './MentionSuggestions.styles';
import type { MentionSuggestionsProps } from './MentionSuggestions.types';

const TYPES: EntityType[] = ['person', 'place', 'faction', 'quest'];

/** Над клавиатурой: подходящие карточки и «Создать "Бор…" как: Человек · Место · Фракция · Квест». */
export function MentionSuggestions({ query, entities, entries, onPick, onCreate }: MentionSuggestionsProps) {
  const { t } = useTranslation();
  const hits = searchEntities(query, entities).slice(0, MENTION_SUGGESTIONS);
  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]));
  const name = query.trim();

  if (hits.length === 0 && !name) {
    return null;
  }

  return (
    <View style={styles.panel}>
      {hits.map((entity) => {
        const count = mentionsOf(entity.id, entries, entitiesById).length;
        const meta = [t(`chronicle.entityType.${entity.type}`), entity.role, t('chronicle.mentions', { count })]
          .filter(Boolean)
          .join(' · ');
        return (
          <Pressable key={entity.id} accessibilityRole="button" onPress={() => onPick(entity)} style={styles.hit}>
            <View style={styles.letter}>
              <AppText style={styles.letterText}>{entity.name.charAt(0).toLocaleUpperCase()}</AppText>
            </View>
            <View style={styles.hitInfo}>
              <AppText style={styles.hitName}>{entity.name}</AppText>
              <AppText style={styles.hitMeta} numberOfLines={1}>
                {meta}
              </AppText>
            </View>
          </Pressable>
        );
      })}
      {name ? (
        <View style={styles.create}>
          <AppText style={styles.createTitle}>{t('chronicle.createAs', { name })}</AppText>
          <View style={styles.types}>
            {TYPES.map((type) => (
              <Pressable key={type} accessibilityRole="button" onPress={() => onCreate(type)} style={styles.type}>
                <AppText style={styles.typeText}>{t(`chronicle.entityType.${type}`)}</AppText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
