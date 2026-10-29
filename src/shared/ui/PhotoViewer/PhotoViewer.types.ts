export type PhotoViewerProps = {
  /** Фото (data-URI или адреса). */
  uris: string[];
  /** Какое открыть; null — просмотр закрыт. */
  index: number | null;
  onClose: () => void;
};
