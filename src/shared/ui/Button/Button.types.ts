

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};
