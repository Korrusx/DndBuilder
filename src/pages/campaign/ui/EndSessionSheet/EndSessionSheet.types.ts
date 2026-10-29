import type { Session } from '@/entities/campaign';

export type EndSessionSheetProps = {
  /** Какую сессию завершить (или, если уже завершена, поправить «Где остановились»); null — окно закрыто. */
  session: Session | null;
  onClose: () => void;
  onEnd: (whereWeStopped: string) => void;
};
