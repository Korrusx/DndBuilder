// Черновик персонажа, общий для всех шагов мастера создания.
// Загружается из базы по id из адреса; если такого нет — это новый персонаж (в базу попадёт после шага 1).

import type { DraftApi } from "./types";
import { router, useGlobalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import type { Character } from '@/entities/character';
import { newDraftCharacter } from '@/entities/character';
import { getCharacter, newId, saveCharacter } from '@/entities/character/api';
import { content } from '@/shared/content';

import { CREATE_STEPS } from '../config/steps';
import { finishCharacter } from './validation';

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

  const update = useCallback((fn: (c: Character) => Character) => setCharacter((c) => (c ? fn(c) : c)), []);

  if (!character) return null;

  const api: DraftApi = {
    character,
    update,
    next: async (step, prepare) => {
      const current = prepare ? prepare(character) : character;
      const prev = current.status.kind === 'draft' ? current.status.step : 1;
      const saved = await saveCharacter(db, { ...current, status: { kind: 'draft', step: Math.max(prev, step + 1) } });
      setCharacter(saved);
      const target = CREATE_STEPS[step];
      if (target) router.push({ pathname: target.route, params: { id } });
    },
    goTo: (step) => router.push({ pathname: CREATE_STEPS[step - 1].route, params: { id } }),
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
