import { CharacterProvider } from '@/entities/character/ui';
import { PlayTabs } from '../PlayTabs/PlayTabs';

export function PlayTabsLayout() {
  return (
    <CharacterProvider>
      <PlayTabs />
    </CharacterProvider>
  );
}
