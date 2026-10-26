import { Stack } from 'expo-router';

import { DraftProvider } from '@/features/create-character';
import { colors, fonts } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';

export default function CreateLayout() {
  const { t } = useTranslation();
  return (
    <DraftProvider>
      <Stack
        screenOptions={{
          title: t('nav.newCharacter'),
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.display },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
          // Шаги листаются как слайдер: новый выезжает справа, «Назад» — обратно (на iOS это и есть стандарт).
          animation: 'ios_from_right',
        }}
      />
    </DraftProvider>
  );
}
