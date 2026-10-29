import { Pressable, View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { CAMPAIGN_TABS } from '../../config/constants';
import { styles } from './CampaignTabs.styles';
import type { CampaignTabsProps } from './CampaignTabs.types';

/** «Летопись · Люди 14 · Места 6 · Квесты 3». */
export function CampaignTabs({ value, onChange, counts }: CampaignTabsProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      {CAMPAIGN_TABS.map((tab) => {
        const label = t(`chronicle.tabs.${tab}`);
        const active = tab === value;
        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(tab)}
            style={[styles.tab, active && styles.active]}
          >
            <AppText style={[styles.label, active && styles.activeLabel]}>
              {tab === 'chronicle' ? label : `${label} ${counts[tab]}`}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
