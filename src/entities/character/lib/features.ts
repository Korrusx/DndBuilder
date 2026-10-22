// Названия и описания умений персонажа: класс, подкласс, особенности вида, черты.

import { byId, nameOf, plain } from '@/shared/content';
import type { InfoContent } from '@/shared/ui';

import { featureSourceLabel } from '../config/featureSource';
import type { SourcedId } from '../model/types';

export function featureName(f: SourcedId): string {
  if (f.source === 'species') {
    return nameOf('traits', f.id);
  }
  if (f.source === 'feat') {
    return nameOf('feats', f.id);
  }
  return nameOf('features', f.id);
}

/** Название, описание и источник умения — для панели с описанием. */
export function featureInfo(f: SourcedId): InfoContent {
  const entry =
    f.source === 'species'
      ? byId.traits.get(f.id)
      : f.source === 'feat'
        ? byId.feats.get(f.id)
        : byId.features.get(f.id);
  return { title: featureName(f), text: plain(entry?.description), subtitle: featureSourceLabel(f.source) };
}
