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

  // Кнопки-переключатели (единицы монет, тип, категория)
  btnRow: { flexDirection: 'row', gap: 6 },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    alignItems: 'center',
  },
  btnActive: { backgroundColor: colors.accentBg },
  btnText: { color: colors.textSecondary, fontSize: 14 },
  btnTextActive: { color: colors.accent, fontWeight: '600' },

  // Чекбоксы свойств оружия
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  checkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface2,
  },
  checkBtnActive: { backgroundColor: colors.accentBg },
  checkText: { fontSize: 14, color: colors.textSecondary },
  checkTextActive: { color: colors.accent, fontWeight: '600' },

  // Кубики урона
  diceRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  diceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface2,
    minWidth: 44,
    alignItems: 'center',
  },
  diceBtnActive: { backgroundColor: colors.accentBg },
  diceText: { fontSize: 14, color: colors.textSecondary },
  diceTextActive: { color: colors.accent, fontWeight: '600' },

  formSave: { marginTop: 20 },
});
