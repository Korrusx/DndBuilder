import { StyleSheet } from 'react-native';

import { DECK_UI } from '@/features/level-up';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DECK_UI.screen },
  list: { flex: 1 },
  content: { paddingTop: 4, paddingHorizontal: 16, paddingBottom: 140, gap: 10 },
});
