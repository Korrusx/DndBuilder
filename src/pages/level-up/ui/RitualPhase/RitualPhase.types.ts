import type { ScreenPoint } from '@/features/level-up';

export type RitualPhaseProps = {
  /**
   * Ритуал уходит: `flight` — тексты и кнопки гаснут за 200 мс, фон за 400, кольцо скрыто (его заменяет
   * летящее); `fade` — «уменьшение движения», весь ритуал растворяется за 200 мс.
   */
  leaving?: 'flight' | 'fade';
  name: string;
  /** «Паладин 5 → 6 · Клятва преданности» или «Волшебник 1». */
  subtitle: string;
  from: number;
  to: number;
  /** «Вас ждут 2 новинки и 1 выбор». */
  counts: string;
  capstone: boolean;
  animate: boolean;
  /** Меняется — анимация играет заново (новое повышение). */
  playKey: number;
  /** Кнопка мультикласса: подпись и доступность. */
  multiclass: { note: string; disabled: boolean };
  /** «Отложить»: отложенное повышение сохранено, экран закрывается. */
  onClose: () => void;
  /** «Открыть новинки»: центр кольца на экране — отсюда кольцо полетит в шапку колоды. */
  onOpen: (ring: ScreenPoint) => void;
  onOther: () => void;
  /**
   * Звук повышения с момента `atMs` таймлайна: начало заполнения, удар (пропуск) или 1450 мс
   * («уменьшение движения» — сразу конечное состояние).
   */
  onSound: (atMs: number) => void;
  /** Анимация прервана: остановить звук. */
  onCancel: () => void;
  /** Удар: вибрация. */
  onImpact: () => void;
};
