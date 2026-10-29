import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Pressable, View } from 'react-native';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText, SmallButton } from '@/shared/ui';

import { ENTITY_ICONS } from '../../config/constants';
import { styles } from './LinksSection.styles';
import type { LinksSectionProps } from './LinksSection.types';

/** «Связи»: с кем и как связана карточка; нажатие открывает, долгое нажатие — удалить связь. */
export function LinksSection({ entity, links, entitiesById, onOpen, onAdd, onDelete }: LinksSectionProps) {
  const { t } = useTranslation();
  const rows = links.flatMap((link) => {
    const otherId = link.fromId === entity.id ? link.toId : link.fromId;
    const other = entitiesById.get(otherId);
    return other ? [{ link, other }] : [];
  });
  return (
    <View style={styles.wrap}>
      <AppText style={styles.title}>{t('chronicle.card.links').toLocaleUpperCase()}</AppText>
      {rows.length ? (
        <View style={styles.list}>
          {rows.map(({ link, other }, i) => (
            <View key={link.id}>
              {i > 0 ? <View style={styles.divider} /> : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => onOpen(other.id)}
                onLongPress={() =>
                  Alert.alert(t('chronicle.card.deleteLink'), other.name, [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('common.delete'), style: 'destructive', onPress: () => onDelete(link) },
                  ])
                }
                style={styles.row}
              >
                <View style={styles.icon}>
                  <MaterialCommunityIcons name={ENTITY_ICONS[other.type]} size={18} color={colors.textSecondary} />
                </View>
                <AppText style={styles.name} numberOfLines={1}>
                  {other.name}
                </AppText>
                <AppText
                  style={[styles.label, !link.label && other.type === 'quest' && styles.quest]}
                  numberOfLines={2}
                >
                  {link.label || (other.type === 'quest' ? t('chronicle.entityType.quest').toLocaleLowerCase() : '')}
                </AppText>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <SmallButton title={t('chronicle.card.addLink')} onPress={onAdd} />
    </View>
  );
}
