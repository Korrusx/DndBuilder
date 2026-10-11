export type SmallButtonProps = {
  title: string;
  onPress: () => void;
  tone?: 'neutral' | 'damage' | 'heal' | 'accent';
  disabled?: boolean;
  flex?: number;
};
