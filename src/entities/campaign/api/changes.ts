// Сигнал «в летописи кампании что-то изменилось»: журнал пишет событие — открытый экран хроники перечитывает данные.

const listeners = new Set<(campaignId: string) => void>();

export function notifyCampaignChanged(campaignId: string): void {
  for (const listener of [...listeners]) {
    listener(campaignId);
  }
}

export function onCampaignChanged(listener: (campaignId: string) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
