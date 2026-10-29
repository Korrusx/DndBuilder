import type { Session } from '@/entities/campaign';

export type EndSessionSheetProps = {
  /** Какую сессию завершить; null — окно закрыто. */
  session: Session | null;
  onClose: () => void;
  onEnd: (whereWeStopped: string) => void;
};
