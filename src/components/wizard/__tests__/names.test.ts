import { content } from '@/content';
import { groupSkillsByAbility, nameOf } from '../names';

test('навыки сгруппированы по характеристикам, как на листе персонажа', () => {
  const groups = groupSkillsByAbility(content.skills).map((g) => [g.ability, g.skills.map((s) => nameOf('skills', s.id))]);
  expect(groups).toEqual([
    ['str', ['Атлетика']],
    ['dex', ['Акробатика', 'Ловкость рук', 'Скрытность']],
    ['con', []],
    ['int', ['Анализ', 'История', 'Магия', 'Природа', 'Религия']],
    ['wis', ['Восприятие', 'Выживание', 'Медицина', 'Проницательность', 'Уход за животными']],
    ['cha', ['Выступление', 'Запугивание', 'Обман', 'Убеждение']],
  ]);
});
