export type ClassRowProps = {
  name: string;
  /** «продолжить путь», «новый класс · мультикласс» или почему нельзя («нужна ИНТ 13, у вас 12»). */
  note: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};
