export type PreviewOption = {
  id: string;
  title: string;
  /** Пояснение под названием («МДР · замечать засады»). */
  hint?: string;
  /** Предпросмотр: как изменится главное число («+4 → +7»). */
  before?: string;
  after?: string;
  disabled?: boolean;
};

export type PreviewPickProps = {
  options: PreviewOption[];
  selected: string[];
  max: number;
  onChange: (ids: string[]) => void;
};
