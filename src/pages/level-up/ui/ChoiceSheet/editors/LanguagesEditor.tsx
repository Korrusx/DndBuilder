import { featureLanguageSlots, knownLanguages } from '@/entities/character';
import { content, nameOf } from '@/shared/content';
import { MultiPick } from '@/shared/ui';

import type { EditorProps } from './editors.types';

/** Языки: от умения нового уровня («Воровской жаргон») или новые языки («Ловкий исследователь»). */
export function LanguagesEditor({ choice, prev, next, set }: EditorProps) {
  const label = (id: string) => nameOf('languages', id);
  if (choice.kind === 'featureLanguages') {
    const slot = featureLanguageSlots(next, content).find((s) => s.key === choice.key);
    return slot ? (
      <MultiPick
        options={slot.options}
        selected={next.choices[slot.key] ?? []}
        max={slot.choose}
        label={label}
        onChange={(ids) => set((c) => ({ ...c, choices: { ...c.choices, [slot.key]: ids } }))}
      />
    ) : null;
  }
  return (
    <MultiPick
      options={content.languages.map((l) => l.id).filter((id) => !knownLanguages(prev, content).includes(id))}
      selected={next.languages.filter((l) => !prev.languages.includes(l))}
      max={choice.count}
      label={label}
      onChange={(ids) => set((c) => ({ ...c, languages: [...prev.languages, ...ids] }))}
    />
  );
}
