import { Pressable, View } from 'react-native';

import type { Entity } from '@/entities/campaign';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { firstLetter } from '../../lib/helpers';
import { styles } from './EntityListTab.styles';
import type { EntityListTabProps } from './EntityListTab.types';

/** Списки карточек на вкладках «Люди» (с фракциями отдельной группой) и «Места». */
export function EntityListTab({ tab, entities, onOpen }: EntityListTabProps) {
  const { t } = useTranslation();
  const ofType = (type: Entity['type']) => entities.filter((entity) => entity.type === type);
  const groups: { title?: string; list: Entity[] }[] =
    tab === 'people'
      ? [{ list: ofType('person') }, { title: t('chronicle.tabs.factions'), list: ofType('faction') }]
      : [{ list: ofType('place') }];

  if (groups.every((group) => group.list.length === 0)) {
    return <AppText style={styles.empty}>{t(`chronicle.emptyTab.${tab}`)}</AppText>;
  }

  return (
    <View style={styles.list}>
      {groups
        .filter((group) => group.list.length)
        .map((group) => (
          <View key={group.title ?? 'main'} style={styles.list}>
            {group.title ? <AppText style={styles.group}>{group.title.toLocaleUpperCase()}</AppText> : null}
            {group.list.map((entity) => (
              <Pressable
                key={entity.id}
                accessibilityRole="button"
                onPress={() => onOpen(entity.id)}
                style={styles.row}
              >
                <View style={styles.letter}>
                  <AppText style={styles.letterText}>{firstLetter(entity.name)}</AppText>
                </View>
                <View style={styles.info}>
                  <AppText style={styles.name}>{entity.name}</AppText>
                  {entity.role ? (
                    <AppText variant="secondary" numberOfLines={1}>
                      {entity.role}
                    </AppText>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        ))}
    </View>
  );
}
