import { Stack } from 'expo-router';

import { colors } from '@/shared/config';

export default function CampaignLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
