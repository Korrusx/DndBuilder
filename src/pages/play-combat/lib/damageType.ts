import { byId, localizeText } from '@/shared/content';

export function damageTypeName(id?: string): string | undefined {
  return id ? localizeText(byId.damageTypes.get(id)?.name).text || id : undefined;
}
