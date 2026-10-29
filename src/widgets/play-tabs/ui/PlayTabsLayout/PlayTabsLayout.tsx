import { ChronicleJournal } from '@/features/chronicle-journal';
import { CharacterProvider } from '@/entities/character/ui';

import { PlayTabs } from '../PlayTabs/PlayTabs';

export function PlayTabsLayout() {
  return (
    <CharacterProvider>
      <ChronicleJournal />
      <PlayTabs />
    </CharacterProvider>
  );
}
