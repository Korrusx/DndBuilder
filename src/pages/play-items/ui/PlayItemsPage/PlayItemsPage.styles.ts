import { Dimensions, StyleSheet } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/config';

const SCREEN_W = Dimensions.get('window').width;
const COLS = 4;
const GRID_GAP = 6;
export const CELL_SIZE = Math.floor((SCREEN_W - 2 * spacing.lg - (COLS - 1) * GRID_GAP) / COLS);

export const styles = StyleSheet.create({
  acRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  acBadge: {
    backgroundColor: colors.surface2,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  acText: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.accent,
  },
  // Слоты экипировки
  slotsRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  slot: {
    flex: 1,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    minHeight: 80,
    justifyContent: 'center',
  },
  slotFilled: {
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
  },
  slotLabel: {
    fontFamily: fonts.text,
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slotName: {
    fontFamily: fonts.textMedium,
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
  slotEmpty: {
    borderStyle: 'dashed',
  },
  // Сетка предметов
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE + 26,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    overflow: 'hidden',
  },
  cellEquipped: {
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
  },
  cellName: {
    fontFamily: fonts.text,
    fontSize: 10,
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 13,
  },
  cellQty: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.surface2,
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  cellQtyText: {
    fontFamily: fonts.display,
    fontSize: 9,
    color: colors.textSecondary,
  },
  // Монеты
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coinInput: {
    width: 96,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 16,
    textAlign: 'right',
    paddingHorizontal: spacing.md,
  },
  fill: { flex: 1 },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'nowrap',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.chip,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
  },
  filterText: {
    fontFamily: fonts.textMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.accent,
  },
});
