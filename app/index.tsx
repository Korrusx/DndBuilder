import { router } from 'expo-router';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';

export default function CharactersScreen() {
  return (
    <Screen
      footer={
        <>
          <Button title="Новый персонаж" onPress={() => router.push('/create/class')} />
          <Button title="Импорт" variant="secondary" />
        </>
      }
    >
      <Placeholder
        title="Пока пусто"
        note="Здесь будут карточки персонажей и черновики (этап 4)."
      />
      <Button
        title="Открыть режим игры (демо)"
        variant="secondary"
        onPress={() => router.push('/character/demo')}
      />
      <Button title="О приложении и лицензии" variant="secondary" onPress={() => router.push('/about')} />
      <AppText variant="secondary" style={{ textAlign: 'center' }}>
        Работает без интернета
      </AppText>
    </Screen>
  );
}
