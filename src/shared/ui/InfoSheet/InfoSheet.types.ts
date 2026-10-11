import type { ReactNode } from 'react';

/** Что показывает панель с описанием: умение, состояние, заклинание. */
export type InfoContent = { title: string; text: string; subtitle?: string };

export type InfoSheetProps = {
  info: InfoContent | null;
  onClose: () => void;
  children?: ReactNode;
};
