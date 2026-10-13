// Черновик персонажа, общий для всех шагов мастера создания.
// Загружается из базы по id из адреса; если такого нет — это новый персонаж (в базу попадёт после шага 1).

import type { DraftApi } from "./types";
import { router, useGlobalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Character } from '@/entities/character';
import { newDraftCharacter } from '@/entities/character';
import { getCharacter, newId, saveCharacter } from '@/entities/character/api';
import { content, useActiveEdition } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';

import { CREATE_STEPS } from '../config/steps';
import { draftIssues, finishCharacter } from './validation';

const DraftContext = createContext<DraftApi | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const { id: rawId } = useGlobalSearchParams<{ id?: string }>();
  const [id] = useState(() => rawId ?? newId());
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    let alive = true;
    getCharacter(db, id).then((c) => {
      if (alive) setCharacter(c ?? newDraftCharacter(id, new Date().toISOString()));
    });
    return () => {
      alive = false;
    };
  }, [db, id]);

  // Шаги мастера берут справочник редакции персонажа (content / byId).
  useActiveEdition(character?.edition ?? '2024');

  const update = useCallback((fn: (c: Character) => Character) => setCharacter((c) => (c ? fn(c) : c)), []);
  // Сообщения о проблемах — на текущем языке: при смене языка пересчитываем.
  const { i18n } = useTranslation();
  const issues = useMemo(() => (character ? draftIssues(character, content) : []), [character, i18n.language]);

  if (!character) return null;

  const reached = character.status.kind === 'draft' ? character.status.step : CREATE_STEPS.length;

  const api: DraftApi = {
    character,
    issues,
    update,
    next: async (step, prepare) => {
      const current = prepare ? prepare(character) : character;
      const prev = current.status.kind === 'draft' ? current.status.step : 1;
      const saved = await saveCharacter(db, { ...current, status: { kind: 'draft', step: Math.max(prev, step + 1) } });
      setCharacter(saved);
      const target = CREATE_STEPS[step];
      if (target) router.push({ pathname: target.route, params: { id } });
    },
    reached,
    canOpen: (step) => step <= reached && !issues.some((i) => i.blocking && i.step < step),
    goTo: (step, from) => {
      const href = { pathname: CREATE_STEPS[step - 1].route, params: { id } };
      // Назад: снимаем экраны до нужного шага; если черновик открыт сразу на позднем шаге
      // (из списка «Продолжить»), нужного экрана в истории нет — dismissTo заменит текущий.
      if (step < from) router.dismissTo(href);
      else if (step > from) router.push(href);
    },
    finish: async () => {
      await saveCharacter(db, finishCharacter(character, content));
      router.dismissTo('/');
      router.push({ pathname: '/character/[id]', params: { id } });
    },
  };

  return <DraftContext.Provider value={api}>{children}</DraftContext.Provider>;
}

export function useDraft(): DraftApi {
  const api = useContext(DraftContext);
  if (!api) throw new Error('useDraft вне DraftProvider');
  return api;
}
