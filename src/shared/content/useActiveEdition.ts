import { useEffect, useState } from 'react';

import { releaseEdition, setActiveEdition } from './content';
import type { Edition } from './types';

/**
 * Делает редакцию персонажа активной для экранов внутри провайдера (мастер создания, режим игры).
 * Переключение — сразу при отрисовке, чтобы дочерние экраны уже видели нужный справочник;
 * при закрытии провайдера — обратно 2024 (если за это время редакцию не взял другой провайдер).
 */
export function useActiveEdition(edition: Edition) {
  const [owner] = useState(() => Symbol('edition'));
  setActiveEdition(edition, owner);
  useEffect(() => () => releaseEdition(owner), [owner]);
}
