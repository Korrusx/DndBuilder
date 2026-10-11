/** Запись с данным id из списка (или undefined, если id пустой или не найден). */
export const findById = <T extends { id: string }>(xs: T[], id: string | undefined) => (id ? xs.find((x) => x.id === id) : undefined);
