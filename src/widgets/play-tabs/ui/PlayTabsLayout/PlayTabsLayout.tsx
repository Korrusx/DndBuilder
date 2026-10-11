import { CharacterProvider } from '@/entities/character/model/CharacterContext';
import { PlayTabs } from '../PlayTabs/PlayTabs';

export function PlayTabsLayout() {
  return (
    <CharacterProvider>
      <PlayTabs />
    </CharacterProvider>
  );
}
