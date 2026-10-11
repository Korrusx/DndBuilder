import { Stack } from 'expo-router';

import { DraftProvider } from '@/features/create-character/model/DraftContext';
import { colors, fonts } from '@/shared/config/theme';

export default function CreateLayout() {
  return (
    <DraftProvider>
      <Stack
        screenOptions={{
          title: 'Новый персонаж',
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.display },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </DraftProvider>
  );
}
