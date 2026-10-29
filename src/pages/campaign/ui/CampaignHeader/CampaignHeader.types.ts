export type CampaignHeaderProps = {
  title: string;
  subtitle: string;
  /** Нажатие на название — изменить кампанию. */
  onTitlePress: () => void;
  /** Строка поиска открыта: её текст. null — показывается название. */
  query: string | null;
  onQueryChange: (query: string | null) => void;
};
