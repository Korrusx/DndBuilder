import {
  applyTextChange,
  findMentionQuery,
  firstSeenSession,
  fromMentionDoc,
  insertMention,
  mentionsOf,
  parseMentions,
  plainText,
  renderSegments,
  toMentionDoc,
} from '../mentions';
import type { MentionDoc } from '../types';
import { byId, entity, m, note, session } from './fixtures';

/** Игрок набирает текст в конце поля. */
const type = (doc: MentionDoc, text: string) => applyTextChange(doc, doc.text + text);

describe('упоминания', () => {
  test('«Хозяин таверны @Борис врёт про подвал»: создание, переименование, mentionsOf', () => {
    let doc: MentionDoc = { text: '', mentions: [] };
    doc = type(doc, 'Хозяин таверны @Бор');
    const query = findMentionQuery(doc, doc.text.length);
    expect(query).toEqual({ start: 15, query: 'Бор' });

    // Подходящих карточек нет — «Создать "Бор…" как человека», игрок дописал имя.
    const boris = entity('boris', 'Борис');
    const inserted = insertMention(doc, doc.text.length, query!, boris);
    expect(inserted.doc.text).toBe('Хозяин таверны @Борис ');
    expect(inserted.cursor).toBe(inserted.doc.text.length);
    doc = type(inserted.doc, 'врёт про подвал');

    const saved = fromMentionDoc(doc);
    expect(saved).toBe('Хозяин таверны @[Борис](e:boris) врёт про подвал');
    expect(parseMentions(saved)).toEqual([{ start: 15, end: 32, entityId: 'boris', name: 'Борис' }]);

    const renamed = byId([{ ...boris, name: 'Борис Кружка' }]);
    expect(renderSegments(saved, renamed)).toEqual([
      { kind: 'text', text: 'Хозяин таверны ' },
      { kind: 'mention', entityId: 'boris', name: 'Борис Кружка', missing: false },
      { kind: 'text', text: ' врёт про подвал' },
    ]);
    expect(toMentionDoc(saved, renamed).text).toBe('Хозяин таверны @Борис Кружка врёт про подвал');
    expect(plainText(saved, renamed)).toBe('Хозяин таверны Борис Кружка врёт про подвал');

    const entry = note('s12', '2026-10-29T19:20:00.000Z', saved);
    const other = note('s12', '2026-10-29T19:30:00.000Z', 'Про подвал ни слова');
    const hits = mentionsOf('boris', [other, entry], renamed);
    expect(hits).toHaveLength(1);
    expect(hits[0].snippet).toBe('Хозяин таверны Борис Кружка врёт про подвал');
  });

  test('удалённая карточка показывается по имени из записи', () => {
    expect(renderSegments(`${m(entity('mara', 'Мара'))}!`, new Map())).toEqual([
      { kind: 'mention', entityId: 'mara', name: 'Мара', missing: true },
      { kind: 'text', text: '!' },
    ]);
  });

  test('правка внутри упоминания превращает его в обычный текст, правка до — сдвигает', () => {
    const doc = toMentionDoc(`Ключ от ${m(entity('anchor', 'Пьяный якорь'))} у меня`, new Map());
    expect(doc.mentions).toEqual([{ start: 8, end: 21, entityId: 'anchor' }]);

    const shifted = applyTextChange(doc, `Наш к${doc.text.slice(1)}`);
    expect(shifted.mentions).toEqual([{ start: 12, end: 25, entityId: 'anchor' }]);

    const broken = applyTextChange(doc, doc.text.replace('якорь', 'якор'));
    expect(broken.mentions).toEqual([]);
    expect(fromMentionDoc(broken)).toBe('Ключ от @Пьяный якор у меня');
  });

  test('набираемый запрос: только после пробела или в начале, не внутри упоминания, до двух слов', () => {
    const plain = (text: string): MentionDoc => ({ text, mentions: [] });
    expect(findMentionQuery(plain('@'), 1)).toEqual({ start: 0, query: '' });
    expect(findMentionQuery(plain('с @Капитан О'), 12)).toEqual({ start: 2, query: 'Капитан О' });
    expect(findMentionQuery(plain('почта a@b'), 9)).toBeNull();
    expect(findMentionQuery(plain('@Бор врёт про'), 13)).toBeNull();
    const doc = toMentionDoc(`${m(entity('boris', 'Борис'))} тут`, new Map());
    expect(findMentionQuery(doc, 3)).toBeNull();
    expect(findMentionQuery(doc, doc.text.length)).toBeNull();
  });

  test('впервые: сессия первой записи с упоминанием (между сессиями не считается)', () => {
    const mara = entity('mara', 'Мара');
    const sessions = [session(10, '2026-10-15T18:00:00.000Z'), session(11, '2026-10-22T18:00:00.000Z')];
    const entries = [
      note(null, '2026-10-01T12:00:00.000Z', `Слышали про ${m(mara)}`),
      note('s11', '2026-10-22T19:00:00.000Z', `${m(mara)} снова здесь`),
      note('s10', '2026-10-15T19:00:00.000Z', `Встретили ${m(mara)}`),
    ];
    expect(firstSeenSession('mara', entries, sessions)?.number).toBe(10);
    expect(firstSeenSession('orso', entries, sessions)).toBeNull();
  });
});
