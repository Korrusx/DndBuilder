import { StyleSheet } from 'react-native';

import { fonts, sizes } from '@/shared/config';

export const RITUAL = {
  closeIcon: '#9AA3AE',
  subtitle: '#C9BFA9',
  counts: '#9AA3AE',
  accent: '#F2B14A',
  onAccent: '#1A1406',
  otherBorder: '#3A3222',
  otherFill: 'rgba(26,29,34,0.7)',
  plate: '#2B2416',
  text: '#F1ECE2',
  secondary: '#9AA3AE',
  arrow: '#6B737D',
} as const;

export const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  close: { width: sizes.touchMin, height: sizes.touchMin, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26, paddingBottom: 30 },
  who: { alignItems: 'center', gap: 8 },
  name: { fontFamily: fonts.display, fontSize: 26, color: RITUAL.text, textAlign: 'center' },
  subtitle: { fontFamily: fonts.text, fontSize: 15, color: RITUAL.subtitle, textAlign: 'center' },
  actions: { gap: 10 },
  counts: { fontFamily: fonts.text, fontSize: 13, color: RITUAL.counts, textAlign: 'center' },
  open: {
    height: 56,
    borderRadius: 16,
    backgroundColor: RITUAL.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openText: { fontFamily: fonts.display, fontSize: 15, color: RITUAL.onAccent },
  other: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: RITUAL.otherBorder,
    backgroundColor: RITUAL.otherFill,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  otherOff: { opacity: 0.5 },
  plate: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: RITUAL.plate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherLines: { flex: 1, minWidth: 0, gap: 2 },
  otherTitle: { fontFamily: fonts.textBold, fontSize: 15, color: RITUAL.text },
  otherNote: { fontFamily: fonts.text, fontSize: 12, color: RITUAL.secondary },
});
