import type { PickFilter, PickItem } from './PickerScreen.types';

/** Варианты под поиск и включённые фильтры (внутри группы — «или», между группами — «и»). */
export function filterPickItems(items: PickItem[], query: string, active: string[], filters: PickFilter[]): PickItem[] {
  const needle = query.trim().toLowerCase();
  const groups = new Map<string, string[]>();
  for (const filter of filters) {
    if (active.includes(filter.key)) {
      groups.set(filter.group, [...(groups.get(filter.group) ?? []), filter.key]);
    }
  }
  return items.filter((item) => {
    if (needle && !`${item.title} ${item.search ?? ''}`.toLowerCase().includes(needle)) {
      return false;
    }
    return [...groups.values()].every((keys) => keys.some((key) => item.filters?.includes(key)));
  });
}

/** Нажатие на вариант: снять выбор; выбрать (один — заменяет прежний); при исчерпанном лимите — ничего. */
export function togglePick(selected: string[], id: string, max: number): string[] {
  if (selected.includes(id)) {
    return selected.filter((x) => x !== id);
  }
  if (max === 1) {
    return [id];
  }
  return selected.length < max ? [...selected, id] : selected;
}
