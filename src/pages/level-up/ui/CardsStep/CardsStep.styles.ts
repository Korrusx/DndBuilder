import { StyleSheet } from 'react-native';

import { DECK_UI } from '@/features/level-up';
import { fonts } from '@/shared/config';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DECK_UI.screen },
  list: { flex: 1 },
  content: { paddingTop: 4, paddingHorizontal: 16, paddingBottom: 140, gap: 10 },
  unchanged: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 4, paddingTop: 4 },
  unchangedText: { flex: 1, fontFamily: fonts.text, fontSize: 12, lineHeight: 17, color: DECK_UI.muted },
});
