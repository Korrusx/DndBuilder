import { ReactNode } from 'react';
import { AppText } from '../AppText/AppText';
import { BottomSheet } from '../BottomSheet/BottomSheet';

/** Панель с описанием (умение, состояние, заклинание). */
export function InfoSheet({
  info,
  onClose,
  children,
}: {
  info: { title: string; text: string; subtitle?: string } | null;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <BottomSheet visible={!!info} title={info?.title} onClose={onClose}>
      {info?.subtitle ? <AppText variant="secondary">{info.subtitle}</AppText> : null}
      <AppText>{info?.text || 'Описание пока не переведено.'}</AppText>
      {children}
    </BottomSheet>
  );
}
