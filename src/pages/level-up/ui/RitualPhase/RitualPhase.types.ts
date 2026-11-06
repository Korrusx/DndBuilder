export type RitualPhaseProps = {
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
  onOpen: () => void;
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
