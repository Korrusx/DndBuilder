import { AppText } from '../AppText/AppText';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import type { InfoSheetProps } from './InfoSheet.types';

/** Панель с описанием (умение, состояние, заклинание). */
export function InfoSheet({
  info,
  onClose,
  children,
}: InfoSheetProps) {
  return (
    <BottomSheet visible={!!info} title={info?.title} onClose={onClose}>
      {info?.subtitle ? <AppText variant="secondary">{info.subtitle}</AppText> : null}
      <AppText>{info?.text || 'Описание пока не переведено.'}</AppText>
      {children}
    </BottomSheet>
  );
}
