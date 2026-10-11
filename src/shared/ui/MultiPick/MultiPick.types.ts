export type MultiPickProps = {
  options: string[];
  selected: string[];
  max: number;
  label: (id: string) => string;
  blocked?: Map<string, string>;
  onChange: (next: string[]) => void;
};
