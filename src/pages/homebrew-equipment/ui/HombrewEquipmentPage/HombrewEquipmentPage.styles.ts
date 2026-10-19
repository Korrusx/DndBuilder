import { StyleSheet } from 'react-native';

import { colors } from '@/shared/config';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { padding: 24, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowMain: { flex: 1 },
  rowName: { fontSize: 16, color: colors.text },
  rowSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  rowDelete: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDeleteText: { fontSize: 20, color: colors.textSecondary, lineHeight: 24 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: colors.accent,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  fabText: { color: '#1A1406', fontSize: 16, fontWeight: '600' },

  // Form
  formLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 4, marginTop: 12 },
  formInput: {
    backgroundColor: colors.surface2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 16,
  },
  formRow: { flexDirection: 'row', gap: 8 },
  formRowItem: { flex: 1 },
  formSegRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  formUnitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    alignItems: 'center',
  },
  formUnitBtnActive: { backgroundColor: colors.accentBg },
  formUnitText: { color: colors.textSecondary, fontSize: 15 },
  formUnitTextActive: { color: colors.accent },
  formSave: { marginTop: 20 },
});
