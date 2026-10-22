export type AvatarLetterProps = {
  letter: string;
  /** 'sm' = 52×52 (карточка), 'lg' = 64×64 (экран проверки) */
  size?: 'sm' | 'lg';
  /** Приглушённый вид для черновика */
  dim?: boolean;
};
