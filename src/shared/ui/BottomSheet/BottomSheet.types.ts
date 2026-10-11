import type { ReactNode } from 'react';

export type BottomSheetProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};
