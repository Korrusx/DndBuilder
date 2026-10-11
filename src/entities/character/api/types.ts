
export type CharacterRow = {
  id: string;
  name: string;
  status: 'draft' | 'ready';
  draft_step: number | null;
  data: string;
  created_at: string;
  updated_at: string;
};
